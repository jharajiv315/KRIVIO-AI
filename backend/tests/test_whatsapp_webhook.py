import unittest
import hmac
import hashlib
from backend.services.whatsapp.config import WhatsAppConfig
from backend.services.whatsapp.webhook import (
    verify_webhook_challenge,
    verify_webhook_signature,
    parse_webhook_payload
)

class TestWhatsAppWebhook(unittest.TestCase):
    def setUp(self):
        self.config = WhatsAppConfig(
            access_token="test_access_token",
            phone_number_id="1234567890",
            business_account_id="0987654321",
            verify_token="krivio_secure_verify_token_123",
            app_secret="test_app_secret_abc"
        )

    def test_valid_get_verification(self):
        is_valid, challenge, code = verify_webhook_challenge(
            mode="subscribe",
            token="krivio_secure_verify_token_123",
            challenge="1158201444",
            config=self.config
        )
        self.assertTrue(is_valid)
        self.assertEqual(challenge, "1158201444")
        self.assertEqual(code, 200)

    def test_invalid_get_verification_token(self):
        is_valid, challenge, code = verify_webhook_challenge(
            mode="subscribe",
            token="wrong_token_attempt",
            challenge="1158201444",
            config=self.config
        )
        self.assertFalse(is_valid)
        self.assertEqual(code, 403)
        self.assertNotIn("krivio_secure_verify_token_123", challenge)

    def test_missing_token_or_mode(self):
        is_valid, _, code = verify_webhook_challenge(
            mode=None,
            token="token",
            challenge="123",
            config=self.config
        )
        self.assertFalse(is_valid)
        self.assertEqual(code, 400)

        is_valid2, _, code2 = verify_webhook_challenge(
            mode="subscribe",
            token=None,
            challenge="123",
            config=self.config
        )
        self.assertFalse(is_valid2)
        self.assertEqual(code2, 400)

    def test_missing_challenge(self):
        is_valid, _, code = verify_webhook_challenge(
            mode="subscribe",
            token="krivio_secure_verify_token_123",
            challenge=None,
            config=self.config
        )
        self.assertFalse(is_valid)
        self.assertEqual(code, 400)

    def test_unconfigured_verify_token(self):
        empty_config = WhatsAppConfig(verify_token="")
        is_valid, _, code = verify_webhook_challenge(
            mode="subscribe",
            token="any_token",
            challenge="123",
            config=empty_config
        )
        self.assertFalse(is_valid)
        self.assertEqual(code, 500)

    def test_webhook_signature_verification(self):
        raw_payload = b'{"object":"whatsapp_business_account"}'
        secret = "my_secret_key"

        expected_hash = hmac.new(secret.encode(), raw_payload, hashlib.sha256).hexdigest()
        valid_header = f"sha256={expected_hash}"

        self.assertTrue(verify_webhook_signature(raw_payload, valid_header, secret))
        self.assertFalse(verify_webhook_signature(raw_payload, "sha256=invalid_hash", secret))
        self.assertFalse(verify_webhook_signature(raw_payload, None, secret))

    def test_parse_inbound_voice_and_text_messages(self):
        sample_payload = {
            "object": "whatsapp_business_account",
            "entry": [
                {
                    "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
                    "changes": [
                        {
                            "value": {
                                "messaging_product": "whatsapp",
                                "metadata": {"display_phone_number": "919876543210"},
                                "contacts": [{"profile": {"name": "Ramesh Artisan"}, "wa_id": "919876543210"}],
                                "messages": [
                                    {
                                        "from": "919876543210",
                                        "id": "wamid.HBgLMTE1",
                                        "timestamp": "1720000000",
                                        "type": "audio",
                                        "audio": {
                                            "id": "media_audio_id_123",
                                            "mime_type": "audio/ogg; codecs=opus"
                                        }
                                    },
                                    {
                                        "from": "919876543210",
                                        "id": "wamid.HBgLMTE2",
                                        "timestamp": "1720000001",
                                        "type": "text",
                                        "text": {"body": "Mujhe 10 diya lamps ka price janna hai"}
                                    }
                                ]
                            },
                            "field": "messages"
                        }
                    ]
                }
            ]
        }

        messages = parse_webhook_payload(sample_payload)
        self.assertEqual(len(messages), 2)

        voice_msg = messages[0]
        self.assertEqual(voice_msg.message_id, "wamid.HBgLMTE1")
        self.assertEqual(voice_msg.message_type, "audio")
        self.assertEqual(voice_msg.sender_name, "Ramesh Artisan")
        self.assertIsNotNone(voice_msg.audio)
        self.assertEqual(voice_msg.audio.id, "media_audio_id_123")

        text_msg = messages[1]
        self.assertEqual(text_msg.message_id, "wamid.HBgLMTE2")
        self.assertEqual(text_msg.message_type, "text")
        self.assertEqual(text_msg.text_body, "Mujhe 10 diya lamps ka price janna hai")

    def test_parse_ignores_status_and_unknown_events_safely(self):
        status_payload = {
            "object": "whatsapp_business_account",
            "entry": [
                {
                    "changes": [
                        {
                            "value": {
                                "statuses": [
                                    {"id": "wamid.123", "status": "delivered", "timestamp": "1720000000"}
                                ]
                            }
                        }
                    ]
                }
            ]
        }
        messages = parse_webhook_payload(status_payload)
        self.assertEqual(messages, [])

if __name__ == "__main__":
    unittest.main()
