import unittest
import os
from unittest.mock import MagicMock
from backend.services.whatsapp.config import WhatsAppConfig
from backend.services.whatsapp.messages import WhatsAppMessageClient
from backend.services.whatsapp.types import InboundMessageData
from backend.services.voice.pipeline import WhatsAppVoicePipeline
from backend.services.voice.retention import temporary_audio_file, purge_temporary_file
from backend.services.voice.types import ProcessingState
from backend.models.voice import VoiceAsset

class TestWhatsAppPipeline(unittest.TestCase):
    def test_outbound_client_unconfigured_safety(self):
        # Must report unconfigured, never pretend successful delivery
        unconfigured_client = WhatsAppMessageClient(WhatsAppConfig())
        res = unconfigured_client.send_text_message("919876543210", "Hello")
        self.assertFalse(res.success)
        self.assertEqual(res.status, "unconfigured")
        self.assertEqual(res.error_code, "WHATSAPP_UNCONFIGURED")

    def test_temporary_audio_zero_retention_cleanup(self):
        temp_path = None
        data = b"OggS\x00\x02" + b"\x00" * 50

        with temporary_audio_file(data, suffix=".ogg") as path:
            temp_path = path
            self.assertTrue(os.path.exists(temp_path))
            with open(temp_path, "rb") as f:
                self.assertEqual(f.read(), data)

        # File MUST be deleted upon context exit
        self.assertFalse(os.path.exists(temp_path))

    def test_pipeline_idempotency_ignores_duplicates(self):
        # Mock DB session
        mock_db = MagicMock()
        existing_asset = VoiceAsset(
            id="vast_wa_existing",
            whatsapp_message_id="wamid.DUPLICATE123",
            processing_status=ProcessingState.COMPLETED.value
        )
        # Query filter returns existing record
        mock_db.query().filter().first.return_value = existing_asset

        pipeline = WhatsAppVoicePipeline()
        msg = InboundMessageData(
            message_id="wamid.DUPLICATE123",
            sender_id="919876543210",
            timestamp="1720000000",
            message_type="text",
            text_body="Repeated query"
        )

        result = pipeline.process_message(mock_db, msg)
        self.assertEqual(result.id, "vast_wa_existing")
        self.assertEqual(result.processing_status, ProcessingState.COMPLETED.value)
        # Verify no duplicate add() call
        mock_db.add.assert_not_called()

if __name__ == "__main__":
    unittest.main()
