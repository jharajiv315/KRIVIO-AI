from backend.routes.auth import router as auth_router
from backend.routes.user import router as user_router
from backend.routes.business_profile import router as business_profile_router
from backend.routes.product import router as product_router
from backend.routes.conversation import router as conversation_router
from backend.routes.scheme import router as scheme_router
from backend.routes.subscription import router as subscription_router
from backend.routes.dashboard import router as dashboard_router
from backend.routes.storefront import router as storefront_router
from backend.routes.images import router as images_router
from backend.routes.marketplace import router as marketplace_router
from backend.routes.voice import router as voice_router
from backend.routes.whatsapp import router as whatsapp_router

__all__ = [
    "auth_router",
    "user_router",
    "business_profile_router",
    "product_router",
    "conversation_router",
    "scheme_router",
    "subscription_router",
    "dashboard_router",
    "storefront_router",
    "images_router",
    "marketplace_router",
    "voice_router",
    "whatsapp_router",
]
