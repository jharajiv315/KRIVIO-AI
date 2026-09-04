import logging
from typing import Tuple, Optional

logger = logging.getLogger("krivio.voice.validation")

class AudioValidationError(Exception):
    def __init__(self, message: str, error_code: str = "AUDIO_VALIDATION_FAILED"):
        super().__init__(message)
        self.error_code = error_code

def detect_audio_magic_bytes(header: bytes) -> Optional[str]:
    """
    Inspects header bytes to detect actual audio container/format.
    Does not trust HTTP MIME type alone.
    """
    if len(header) < 4:
        return None

    # OGG / Opus (Common for WhatsApp voice notes: "OggS")
    if header.startswith(b"OggS"):
        return "audio/ogg"

    # RIFF / WAV
    if header.startswith(b"RIFF") and len(header) >= 12 and header[8:12] == b"WAVE":
        return "audio/wav"

    # MP3 (ID3 tag or MPEG frame sync)
    if header.startswith(b"ID3"):
        return "audio/mp3"
    if header[0] == 0xFF and (header[1] & 0xE0) == 0xE0:
        return "audio/mp3"

    # WebM (EBML: 0x1A 0x45 0xDF 0xA3)
    if header.startswith(b"\x1a\x45\xdf\xa3"):
        return "audio/webm"

    # MP4 / M4A / AAC (ftyp box)
    if len(header) >= 8 and (b"ftyp" in header[:12] or b"M4A" in header[:12]):
        return "audio/mp4"

    # FLAC ("fLaC")
    if header.startswith(b"fLaC"):
        return "audio/flac"

    # AMR ("#!AMR")
    if header.startswith(b"#!AMR"):
        return "audio/amr"

    return None

def validate_audio_payload(
    audio_bytes: bytes,
    declared_mime_type: Optional[str] = None,
    max_mb: int = 16
) -> Tuple[bool, str, Optional[str]]:
    """
    Validates audio data before sending to speech transcription.
    Returns: (is_valid, detected_format, error_message)
    """
    if not audio_bytes or len(audio_bytes) < 32:
        return False, "unknown", "Audio file is empty or too short (< 32 bytes)."

    max_bytes = max_mb * 1024 * 1024
    if len(audio_bytes) > max_bytes:
        return False, "unknown", f"Audio exceeds maximum permitted size of {max_mb}MB ({len(audio_bytes)} bytes)."

    header = audio_bytes[:32]
    detected_format = detect_audio_magic_bytes(header)

    if not detected_format:
        # Check if declared mime-type matches any supported audio format
        if declared_mime_type and ("audio/" in declared_mime_type or "ogg" in declared_mime_type):
            logger.warning(f"Audio magic bytes unknown, falling back to declared type: {declared_mime_type}")
            return True, declared_mime_type.split(";")[0].strip(), None

        logger.error(f"Unsupported or corrupted audio payload (header={header[:8].hex()})")
        return False, "unsupported", "Audio file format is corrupted or unsupported."

    return True, detected_format, None
