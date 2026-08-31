from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.session import get_db
from backend.crud.crud_product import crud_product
from backend.crud.crud_business_profile import crud_business_profile
from backend.models.user import User
from backend.security import get_current_user

router = APIRouter(prefix="/api/marketplace", tags=["marketplace"])

@router.get("/recommendations")
def get_marketplace_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = crud_business_profile.get_by_user_id(db, user_id=current_user.id)
    products = crud_product.get_by_user_id(db, user_id=current_user.id)
    has_reg = bool(profile and (profile.business_registration or profile.gst_number))
    prod_count = len(products)

    channels = [
        {
            "channelId": "ondc",
            "channelName": "ONDC (Open Network for Digital Commerce)",
            "logo": "🌐",
            "fitScore": 96 if (has_reg and prod_count > 0) else 82,
            "description": "Government-backed open commerce network connecting rural artisans directly to buyers nationwide.",
            "benefits": ["0% platform lock-in fees", "Direct daily bank payouts", "National discovery via Paytm & Mystore"],
            "requirements": ["Udyam / GST registration", "Bank account details", "At least 1 listed product with SKU"],
            "isEligible": bool(has_reg and prod_count > 0)
        },
        {
            "channelId": "amazon_karigar",
            "channelName": "Amazon Karigar",
            "logo": "📦",
            "fitScore": 92 if prod_count >= 3 else 75,
            "description": "Dedicated storefront highlighting authentic handmade Indian crafts with subsidized fees.",
            "benefits": ["Karigar verified badge", "Free onboarding assistance", "Pan-India Prime delivery"],
            "requirements": ["Artisan ID / Craft Certificate", "GST details", "3 product listings with photos"],
            "isEligible": bool(prod_count >= 3)
        },
        {
            "channelId": "flipkart_samarth",
            "channelName": "Flipkart Samarth",
            "logo": "🛍️",
            "fitScore": 89,
            "description": "Program empowering weavers and rural SHGs with 0% commission waivers for 6 months.",
            "benefits": ["0% commission for 6 months", "Dedicated onboarding manager", "Fulfillment support"],
            "requirements": ["SHG certificate / Udyam ID", "Clean white-background photos", "Stock count > 0"],
            "isEligible": bool(has_reg and prod_count > 0)
        },
        {
            "channelId": "meesho",
            "channelName": "Meesho Micro-Seller",
            "logo": "🏷️",
            "fitScore": 94,
            "description": "High-volume zero-commission platform ideal for mass-selling rural crafts across Tier-2/3 cities.",
            "benefits": ["0% commission fee", "Zero penalty on cancellations", "Massive regional buyer reach"],
            "requirements": ["GSTIN or Enrolment ID", "Active bank account", "Basic product dimensions"],
            "isEligible": bool(prod_count > 0)
        },
        {
            "channelId": "etsy_india",
            "channelName": "Etsy Global & India",
            "logo": "🎨",
            "fitScore": 87,
            "description": "Premier global marketplace for authentic handmade art commanding premium export prices.",
            "benefits": ["International buyers in USD/EUR", "Higher profit margins", "Artisan story-first storefront"],
            "requirements": ["PayPal / Razorpay for payouts", "English craft story", "Safe international packaging"],
            "isEligible": bool(prod_count > 0 and bool(profile and profile.description))
        },
        {
            "channelId": "gem",
            "channelName": "Government e-Marketplace (GeM)",
            "logo": "🏛️",
            "fitScore": 80,
            "description": "Official procurement portal for supplying handmade goods directly to government departments.",
            "benefits": ["Direct bulk government orders", "Guaranteed milestone payments", "MSME reservations"],
            "requirements": ["Udyam Certificate", "GST registration", "Artisan Guild ID"],
            "isEligible": bool(has_reg)
        }
    ]

    return {"channels": channels}
