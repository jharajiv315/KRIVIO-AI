import os
import tempfile
import logging
from contextlib import contextmanager
from typing import Generator

logger = logging.getLogger("krivio.voice.retention")

@contextmanager
def temporary_audio_file(audio_bytes: bytes, suffix: str = ".ogg") -> Generator[str, None, None]:
    """
    Creates a temporary audio file on disk for processing and GUARANTEES
    its deletion immediately upon exiting the context.
    Never retains raw audio.
    """
    fd, path = tempfile.mkstemp(suffix=suffix, prefix="krivio_voice_")
    try:
        with os.fdopen(fd, "wb") as f:
            f.write(audio_bytes)
        logger.info(f"Temporary audio allocated at {path} ({len(audio_bytes)} bytes)")
        yield path
    finally:
        try:
            if os.path.exists(path):
                os.remove(path)
                logger.info(f"Temporary audio safely deleted: {path}")
        except Exception as e:
            logger.warning(f"Notice cleaning up temp audio file {path}: {str(e)}")

def purge_temporary_file(path: str) -> bool:
    """
    Explicitly deletes a temporary file.
    """
    try:
        if path and os.path.exists(path):
            os.remove(path)
            return True
    except Exception as e:
        logger.warning(f"Error purging file {path}: {str(e)}")
    return False
