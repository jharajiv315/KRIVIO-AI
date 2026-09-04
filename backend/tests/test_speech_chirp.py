import unittest
from backend.services.speech.chirp import GoogleChirpSpeechProvider
from backend.services.speech.base import SpeechProviderUnconfiguredError
from backend.services.speech.types import TranscriptionOptions

class TestGoogleChirpSpeechProvider(unittest.TestCase):
    def test_model_name_and_provider_identity(self):
        provider = GoogleChirpSpeechProvider(project_id="test-proj")
        self.assertEqual(provider.model_name, "chirp_2")
        self.assertEqual(provider.provider_name, "Google Cloud Speech-to-Text V2")

    def test_language_capability_map(self):
        provider = GoogleChirpSpeechProvider()
        expected = ["hi-IN", "mr-IN", "gu-IN", "ta-IN", "bn-IN", "as-IN", "en-IN"]
        for lang in expected:
            self.assertIn(lang, provider.supported_languages)
            self.assertTrue(provider.is_language_supported(lang))

        self.assertFalse(provider.is_language_supported("fr-FR"))

    def test_unconfigured_behavior_raises_error(self):
        # Empty credentials must NOT claim configured or fake results
        unconfigured = GoogleChirpSpeechProvider(
            project_id="",
            credentials_path="",
            api_key=""
        )
        self.assertFalse(unconfigured.is_configured)

        status = unconfigured.get_status()
        self.assertEqual(status.status, "unconfigured")
        self.assertFalse(status.is_configured)

        # Transcribe call must fail with SpeechProviderUnconfiguredError, never faking success
        options = TranscriptionOptions(language_code="hi-IN")
        with self.assertRaises(SpeechProviderUnconfiguredError):
            unconfigured.transcribe(b"fake_bytes", "audio/ogg", options)

if __name__ == "__main__":
    unittest.main()
