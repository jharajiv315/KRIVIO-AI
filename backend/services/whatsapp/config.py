import os
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

class WhatsAppConfig(BaseModel):
    """
    Validated configuration for Meta WhatsApp Cloud API.
    Does NOT leak secrets in string representations or logs.
    """
    access_token: str = Field(default="")
    phone_number_id: str = Field(default="")
    business_account_id: str = Field(default="")
    verify_token: str = Field(default="")
    app_secret: str = Field(default="")
    graph_api_version: str = Field(default="v21.0")
    graph_api_base_url: str = Field(default="https://graph.facebook.com")
    api_timeout_seconds: int = Field(default=15)
    max_audio_mb: int = Field(default=16)
    max_audio_duration_seconds: int = Field(default=120)

    @classmethod
    def from_env(cls) -> "WhatsAppConfig":
        return cls(
            access_token=os.getenv("WHATSAPP_ACCESS_TOKEN", "").strip(),
            phone_number_id=os.getenv("WHATSAPP_PHONE_NUMBER_ID", "").strip(),
            business_account_id=os.getenv("WHATSAPP_BUSINESS_ACCOUNT_ID", "").strip(),
            verify_token=os.getenv("WHATSAPP_VERIFY_TOKEN", "").strip(),
            app_secret=os.getenv("WHATSAPP_APP_SECRET", "").strip(),
            graph_api_version=os.getenv("WHATSAPP_GRAPH_API_VERSION", "v21.0").strip(),
            graph_api_base_url=os.getenv("WHATSAPP_GRAPH_API_BASE_URL", "https://graph.facebook.com").strip().rstrip("/"),
            api_timeout_seconds=int(os.getenv("WHATSAPP_API_TIMEOUT_SECONDS", "15")),
            max_audio_mb=int(os.getenv("WHATSAPP_MAX_AUDIO_MB", "16")),
            max_audio_duration_seconds=int(os.getenv("WHATSAPP_MAX_AUDIO_DURATION_SECONDS", "120")),
        )

    @property
    def is_configured(self) -> bool:
        """Returns True only when all mandatory WhatsApp credentials are present."""
        return bool(self.access_token and self.phone_number_id and self.verify_token)

    def get_diagnostics(self) -> Dict[str, Any]:
        """
        Returns safe configuration status for health checks.
        NEVER returns tokens, keys, or secrets.
        """
        return {
            "is_configured": self.is_configured,
            "status": "configured" if self.is_configured else "unconfigured",
            "has_access_token": bool(self.access_token),
            "has_phone_number_id": bool(self.phone_number_id),
            "has_business_account_id": bool(self.business_account_id),
            "has_verify_token": bool(self.verify_token),
            "has_app_secret": bool(self.app_secret),
            "graph_api_version": self.graph_api_version,
            "max_audio_mb": self.max_audio_mb,
        }

    def __repr__(self) -> str:
        return f"<WhatsAppConfig configured={self.is_configured} phone_id={self.phone_number_id[:4]}***>"
