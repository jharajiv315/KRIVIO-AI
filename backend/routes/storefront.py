from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.session import get_db
from backend.crud.crud_user import crud_user
from backend.crud.crud_business_profile import crud_business_profile
from backend.crud.crud_product import crud_product
from backend.schemas.product import ProductResponse

router = APIRouter(prefix="/api/storefront", tags=["storefront"])

@router.get("/{user_id}", response_model=Dict[str, Any])
def get_public_storefront(user_id: str, db: Session = Depends(get_db)):
    """
    Returns public digital showcase for the requested artisan ID.
    Loads real user profile and published products from PostgreSQL.
    """
    user = crud_user.get_by_id(db, user_id=user_id)
    profile = crud_business_profile.get_by_user_id(db, user_id=user_id)
    products = crud_product.get_by_user_id(db, user_id=user_id, status="published")

    artisan_name = user.full_name if user else "Artisan"
    biz_name = profile.business_name if (profile and profile.business_name) else f"{artisan_name}'s Craft Showcase"
    craft_type = profile.business_type if (profile and profile.business_type) else "Handicrafts & Art"
    location = f"{profile.district}, {profile.state}" if (profile and profile.district) else "India"
    story = profile.description if (profile and profile.description) else f"Authentic handcrafted creations from {location}."
    phone = profile.phone_number if (profile and profile.phone_number) else (user.phone_number if user else "")

    product_resps = [
        ProductResponse.model_validate(p) if hasattr(ProductResponse, 'model_validate') else ProductResponse.from_orm(p)
        for p in products
    ]

    return {
        "artisan": {
            "id": user_id,
            "name": artisan_name,
            "businessName": biz_name,
            "location": location,
            "craftType": craft_type,
            "story": story,
            "phone": phone,
            "isVerified": user.is_verified if user else False,
            "joinedDate": user.created_at.strftime("%Y-%m-%d") if user else "2026-01-01"
        },
        "products": product_resps,
        "totalProducts": len(product_resps)
    }
