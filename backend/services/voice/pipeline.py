import uuid
import logging
import datetime
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from backend.models.voice import VoiceAsset
from backend.services.whatsapp.types import InboundMessageData
from backend.services.whatsapp.client import WhatsAppClient
from backend.services.speech.registry import SpeechService
from backend.services.speech.types import TranscriptionOptions
from backend.services.voice.types import ProcessingState
from backend.services.voice.validation import validate_audio_payload
from backend.services.voice.language import LanguageManager
from backend.services.voice.intent import IntentUnderstandingService
from backend.services.voice.response import ResponseGenerationService

logger = logging.getLogger("krivio.voice.pipeline")

class WhatsAppVoicePipeline:
    """
    End-to-end WhatsApp Voice Note Processing Pipeline.
    Manages state machine transitions, idempotency, media download,
    transcription, intent extraction, context grounding, and outbound messaging.
    """
    def __init__(
        self,
        whatsapp_client: Optional[WhatsAppClient] = None,
        speech_service: Optional[SpeechService] = None,
        intent_service: Optional[IntentUnderstandingService] = None,
        response_service: Optional[ResponseGenerationService] = None
    ):
        self.whatsapp = whatsapp_client or WhatsAppClient()
        self.speech = speech_service or SpeechService()
        self.intent = intent_service or IntentUnderstandingService()
        self.response_gen = response_service or ResponseGenerationService()

    def process_message(self, db: Session, msg: InboundMessageData) -> Optional[VoiceAsset]:
        """
        Processes an incoming WhatsApp message with full idempotency and state safety.
        """
        # 1. Idempotency Check
        existing = db.query(VoiceAsset).filter(
            VoiceAsset.whatsapp_message_id == msg.message_id
        ).first()

        if existing:
            logger.info(f"Duplicate WhatsApp message {msg.message_id} ignored (status={existing.processing_status})")
            return existing

        asset_id = f"vast_wa_{uuid.uuid4().hex[:10]}"
        now = datetime.datetime.utcnow()

        # 2. Resolve sender context (linked user vs unlinked)
        context = self.response_gen.resolve_sender_context(
            db=db,
            sender_phone=msg.sender_id,
            whatsapp_message_id=msg.message_id
        )

        lang_code = LanguageManager.normalize_code(context.preferred_language)
        lang_name = LanguageManager.get_language_name(lang_code)

        voice_asset = VoiceAsset(
            id=asset_id,
            user_id=context.user_id,
            whatsapp_message_id=msg.message_id,
            whatsapp_sender_id=msg.sender_id,
            phone_number=msg.sender_id,
            input_type="voice" if msg.message_type in ("audio", "voice") else "text",
            language=lang_code,
            transcript=msg.text_body or "",
            processing_status=ProcessingState.RECEIVED.value,
            provider_metadata={
                "sender_name": msg.sender_name,
                "is_linked_user": context.is_linked_user
            },
            created_at=now,
            updated_at=now
        )
        db.add(voice_asset)
        db.commit()

        try:
            # 3. Handle Voice vs Text
            transcript = ""
            if msg.message_type in ("audio", "voice"):
                transcript = self._handle_audio_pipeline(db, voice_asset, msg, lang_code)
            elif msg.message_type == "text":
                transcript = msg.text_body or ""
                voice_asset.transcript = transcript
                voice_asset.processing_status = ProcessingState.TRANSCRIBED.value
                db.commit()
            else:
                # Unsupported message type (image, video, document, etc.)
                logger.info(f"WhatsApp message type '{msg.message_type}' received - replying with guide")
                reply = (
                    f"नमस्ते {context.business_name or 'कारीगर साथी'}! KRIVIO AI WhatsApp पर आपकी आवाज (Voice Note) या सवाल का उत्तर दे सकता है। कृपया अपना सवाल बोलकर या लिखकर भेजें।"
                )
                self.whatsapp.send_text(msg.sender_id, reply)
                voice_asset.response_text = reply
                voice_asset.processing_status = ProcessingState.COMPLETED.value
                db.commit()
                return voice_asset

            if not transcript or not transcript.strip():
                logger.warning(f"Empty transcript for message {msg.message_id}")
                return voice_asset

            # 4. Understanding & Intent / Entity Analysis
            voice_asset.processing_status = ProcessingState.UNDERSTANDING.value
            db.commit()

            analysis = self.intent.analyze(transcript, language_name=lang_name)
            voice_asset.intent = analysis.intent
            voice_asset.entities = analysis.entities.model_dump()
            db.commit()

            # 5. Response Formulation
            voice_asset.processing_status = ProcessingState.PROCESSING.value
            db.commit()

            reply_text = self.response_gen.generate_response(
                transcript=transcript,
                analysis=analysis,
                context=context,
                language_name=lang_name
            )
            voice_asset.response_text = reply_text
            voice_asset.processing_status = ProcessingState.RESPONSE_READY.value
            db.commit()

            # 6. Outbound WhatsApp Reply
            voice_asset.processing_status = ProcessingState.REPLYING.value
            db.commit()

            send_res = self.whatsapp.send_text(
                recipient_id=msg.sender_id,
                text=reply_text
            )

            if send_res.success:
                voice_asset.processing_status = ProcessingState.COMPLETED.value
            else:
                voice_asset.processing_status = ProcessingState.REPLY_FAILED.value
                voice_asset.error_code = send_res.error_code
                voice_asset.error_message = send_res.error_message

            db.commit()
            return voice_asset

        except Exception as e:
            logger.error(f"Error in WhatsApp voice pipeline for msg {msg.message_id}: {str(e)}")
            voice_asset.processing_status = ProcessingState.PROCESSING_FAILED.value
            voice_asset.error_message = str(e)
            db.commit()
            return voice_asset

    def _handle_audio_pipeline(
        self,
        db: Session,
        voice_asset: VoiceAsset,
        msg: InboundMessageData,
        lang_code: str
    ) -> str:
        """
        Manages voice note media download, validation, transcription, and cleanup.
        """
        if not msg.audio or not msg.audio.id:
            voice_asset.processing_status = ProcessingState.MEDIA_FAILED.value
            voice_asset.error_code = "MISSING_MEDIA_ID"
            db.commit()
            return ""

        # Step A: Media Retrieval
        voice_asset.processing_status = ProcessingState.MEDIA_REQUESTED.value
        db.commit()

        try:
            download_url, mime_type, _ = self.whatsapp.media.get_media_url(msg.audio.id)
            audio_bytes = self.whatsapp.media.download_audio_bytes(download_url)
            voice_asset.processing_status = ProcessingState.MEDIA_DOWNLOADED.value
            db.commit()
        except Exception as err:
            logger.error(f"WhatsApp media download failed: {str(err)}")
            voice_asset.processing_status = ProcessingState.MEDIA_FAILED.value
            voice_asset.error_message = str(err)
            db.commit()
            return ""

        # Step B: Audio Validation
        is_valid, detected_format, err_msg = validate_audio_payload(
            audio_bytes=audio_bytes,
            declared_mime_type=msg.audio.mime_type
        )

        if not is_valid:
            logger.warning(f"WhatsApp audio payload invalid: {err_msg}")
            voice_asset.processing_status = ProcessingState.AUDIO_INVALID.value
            voice_asset.error_message = err_msg
            db.commit()
            self.whatsapp.send_text(
                msg.sender_id,
                "क्षमा करें, आपकी ऑडियो फाइल को पढ़ा नहीं जा सका। कृपया स्पष्ट आवाज में दोबारा वॉइस नोट भेजें।"
            )
            return ""

        voice_asset.processing_status = ProcessingState.AUDIO_VALIDATED.value
        db.commit()

        # Step C: Speech Transcription
        voice_asset.processing_status = ProcessingState.TRANSCRIBING.value
        db.commit()

        try:
            options = TranscriptionOptions(language_code=lang_code, model="chirp_2")
            trans_res = self.speech.transcribe(
                audio_bytes=audio_bytes,
                mime_type=detected_format,
                options=options
            )
            transcript = trans_res.transcript.strip()
            voice_asset.transcript = transcript
            voice_asset.processing_status = ProcessingState.TRANSCRIBED.value
            db.commit()
            return transcript
        except Exception as trans_err:
            logger.error(f"Speech transcription failed: {str(trans_err)}")
            voice_asset.processing_status = ProcessingState.TRANSCRIPTION_FAILED.value
            voice_asset.error_message = str(trans_err)
            db.commit()
            return ""
