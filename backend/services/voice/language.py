from typing import Optional, Dict

class LanguageManager:
    """
    Manages KRIVIO supported Indic vernacular languages.
    Ensures safe, provider-compatible BCP-47 language tags.
    """
    SUPPORTED_LANGUAGES: Dict[str, Dict[str, str]] = {
        "hi-IN": {"name": "Hindi", "native_name": "हिन्दी", "flag": "🇮🇳"},
        "mr-IN": {"name": "Marathi", "native_name": "मराठी", "flag": "🇮🇳"},
        "gu-IN": {"name": "Gujarati", "native_name": "ગુજરાતી", "flag": "🇮🇳"},
        "ta-IN": {"name": "Tamil", "native_name": "தமிழ்", "flag": "🇮🇳"},
        "bn-IN": {"name": "Bengali", "native_name": "বাংলা", "flag": "🇮🇳"},
        "as-IN": {"name": "Assamese", "native_name": "অসমীয়া", "flag": "🇮🇳"},
        "en-IN": {"name": "English", "native_name": "English (India)", "flag": "🇮🇳"},
    }

    ALIAS_MAP: Dict[str, str] = {
        "hi": "hi-IN",
        "hindi": "hi-IN",
        "mr": "mr-IN",
        "marathi": "mr-IN",
        "gu": "gu-IN",
        "gujarati": "gu-IN",
        "ta": "ta-IN",
        "tamil": "ta-IN",
        "bn": "bn-IN",
        "bengali": "bn-IN",
        "bangla": "bn-IN",
        "as": "as-IN",
        "assamese": "as-IN",
        "en": "en-IN",
        "english": "en-IN",
    }

    @classmethod
    def normalize_code(cls, lang_input: Optional[str]) -> str:
        if not lang_input:
            return "hi-IN"

        cleaned = lang_input.strip().lower()
        if cleaned in cls.ALIAS_MAP:
            return cls.ALIAS_MAP[cleaned]

        for code in cls.SUPPORTED_LANGUAGES:
            if code.lower() == cleaned:
                return code

        return "hi-IN"

    @classmethod
    def get_language_name(cls, code: str) -> str:
        normalized = cls.normalize_code(code)
        return cls.SUPPORTED_LANGUAGES.get(normalized, {}).get("name", "Hindi")
