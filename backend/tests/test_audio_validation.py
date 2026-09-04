import unittest
from backend.services.voice.validation import validate_audio_payload, detect_audio_magic_bytes

class TestAudioValidation(unittest.TestCase):
    def test_valid_ogg_opus_detection(self):
        ogg_bytes = b"OggS\x00\x02\x00\x00\x00\x00\x00\x00\x00\x00" + b"\x00" * 40
        detected = detect_audio_magic_bytes(ogg_bytes)
        self.assertEqual(detected, "audio/ogg")

        is_valid, fmt, err = validate_audio_payload(ogg_bytes, declared_mime_type="audio/ogg")
        self.assertTrue(is_valid)
        self.assertEqual(fmt, "audio/ogg")
        self.assertIsNone(err)

    def test_valid_wav_detection(self):
        wav_bytes = b"RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00" + b"\x00" * 30
        detected = detect_audio_magic_bytes(wav_bytes)
        self.assertEqual(detected, "audio/wav")

        is_valid, fmt, err = validate_audio_payload(wav_bytes)
        self.assertTrue(is_valid)
        self.assertEqual(fmt, "audio/wav")

    def test_valid_mp3_detection(self):
        mp3_bytes = b"ID3\x03\x00\x00\x00\x00\x00\x00" + b"\x00" * 40
        detected = detect_audio_magic_bytes(mp3_bytes)
        self.assertEqual(detected, "audio/mp3")

        is_valid, fmt, err = validate_audio_payload(mp3_bytes)
        self.assertTrue(is_valid)

    def test_empty_or_tiny_payload_rejected(self):
        is_valid, fmt, err = validate_audio_payload(b"")
        self.assertFalse(is_valid)
        self.assertIn("empty", err.lower())

        is_valid2, fmt2, err2 = validate_audio_payload(b"short")
        self.assertFalse(is_valid2)
        self.assertIn("short", err2.lower())

    def test_oversized_audio_rejected(self):
        # 2MB limit test with 3MB buffer
        oversized = b"OggS" + b"\x00" * (3 * 1024 * 1024)
        is_valid, fmt, err = validate_audio_payload(oversized, max_mb=2)
        self.assertFalse(is_valid)
        self.assertIn("exceeds", err.lower())

    def test_corrupted_payload_rejected(self):
        corrupted = b"NOT_AN_AUDIO_FILE_JUST_RANDOM_TEXT_DATA_12345"
        is_valid, fmt, err = validate_audio_payload(corrupted)
        self.assertFalse(is_valid)
        self.assertEqual(fmt, "unsupported")

if __name__ == "__main__":
    unittest.main()
