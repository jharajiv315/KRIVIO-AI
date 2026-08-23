from backend.routes.auth import router as auth_router
from backend.routes.user import router as user_router
from backend.routes.product import router as product_router
from backend.routes.conversation import router as conversation_router
from backend.routes.scheme import router as scheme_router
from backend.routes.subscription import router as subscription_router

__all__ = [
    "auth_router",
    "user_router",
    "product_router",
    "conversation_router",
    "scheme_router",
    "subscription_router",
]
