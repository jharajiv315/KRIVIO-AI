import logging
from typing import Optional
from fastapi import APIRouter, Request, Response, BackgroundTasks, Depends, Query, status
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from backend.session import get_db
from backend.services.whatsapp.config import WhatsAppConfig
from backend.services.whatsapp.webhook import (
    verify_webhook_challenge,
    verify_webhook_signature,
    parse_webhook_payload
)
from backend.services.whatsapp.client import WhatsAppClient
from backend.services.speech.registry import SpeechService
from backend.services.voice.pipeline import WhatsAppVoicePipeline

logger = logging.getLogger("krivio.routes.whatsapp")

router = APIRouter(tags=["whatsapp"])

# Singleton services
whatsapp_config = WhatsAppConfig.from_env()
whatsapp_client = WhatsAppClient(whatsapp_config)
speech_service = SpeechService()
voice_pipeline = WhatsAppVoicePipeline(
    whatsapp_client=whatsapp_client,
    speech_service=speech_service
)

def process_messages_background(messages, db_factory):
    """
    Asynchronously processes webhook messages so Meta HTTP request acknowledges within milliseconds.
    """
    db = db_factory()
    try:
        for msg in messages:
            logger.info(f"Background processing inbound message id={msg.message_id} type={msg.message_type}")
            voice_pipeline.process_message(db, msg)
    except Exception as e:
        logger.error(f"Background webhook processing error: {str(e)}")
    finally:
        db.close()

@router.get("/webhook/whatsapp")
def verify_whatsapp_webhook(
    hub_mode: Optional[str] = Query(None, alias="hub.mode"),
    hub_challenge: Optional[str] = Query(None, alias="hub.challenge"),
    hub_verify_token: Optional[str] = Query(None, alias="hub.verify_token")
):
    """
    Meta Webhook Verification Endpoint.
    GET /webhook/whatsapp
    Meta expects HTTP 200 and the plain text challenge string when verify_token matches.
    """
    is_valid, challenge, status_code = verify_webhook_challenge(
        mode=hub_mode,
        token=hub_verify_token,
        challenge=hub_challenge,
        config=whatsapp_config
    )

    if is_valid:
        return PlainTextResponse(content=challenge, status_code=200)

    return PlainTextResponse(content=challenge, status_code=status_code)

@router.post("/webhook/whatsapp")
async def receive_whatsapp_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Meta Webhook Inbound Message Endpoint.
    POST /webhook/whatsapp
    Apopts fast acknowledgment and offloads media processing to background task.
    """
    raw_body = await request.body()
    sig_header = request.headers.get("X-Hub-Signature-256")

    # 1. Validate signature if app secret is configured
    if whatsapp_config.app_secret:
        if not verify_webhook_signature(raw_body, sig_header, whatsapp_config.app_secret):
            logger.warning("WhatsApp webhook signature verification failed")
            return Response(content="Invalid signature", status_code=403)

    try:
        payload = await request.json()
    except Exception:
        logger.warning("Received invalid non-JSON WhatsApp webhook payload")
        return {"status": "ignored", "reason": "invalid_json"}

    # 2. Parse incoming messages (tolerant of status updates, unknown events)
    messages = parse_webhook_payload(payload)

    if not messages:
        # Acknowledge status receipts (sent, delivered, read) without further processing
        return {"status": "acknowledged", "processed_count": 0}

    logger.info(f"WhatsApp webhook received {len(messages)} actionable messages")

    # 3. Offload to background execution for instant HTTP 200 response to Meta
    from backend.session import SessionLocal
    background_tasks.add_task(process_messages_background, messages, SessionLocal)

    return {"status": "received", "processed_count": len(messages)}

@router.get("/api/whatsapp/status")
def whatsapp_system_status():
    """
    Safe Health Diagnostics for WhatsApp & Speech Services.
    NEVER exposes secrets, tokens, or private keys.
    """
    return {
        "whatsapp": whatsapp_config.get_diagnostics(),
        "speech": speech_service.get_diagnostics(),
        "webhook_endpoint": "/webhook/whatsapp",
        "ready_for_credentials": True
    }
