import os
import json
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from backend.session import get_db
from backend.crud.crud_product import crud_product
from backend.crud.crud_activity import crud_activity
from backend.models.user import User
from backend.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductListResponse
)
from backend.security import get_current_user

router = APIRouter(prefix="/api/products", tags=["products"])

@router.get("", response_model=Dict[str, List[ProductResponse]])
@router.get("/", response_model=Dict[str, List[ProductResponse]])
def read_my_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    sort: Optional[str] = "newest",
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    CRITICAL USER DATA ISOLATION:
    Returns ONLY products belonging to the currently authenticated user.
    """
    products = crud_product.get_by_user_id(
        db,
        user_id=current_user.id,
        search=search,
        category=category,
        status=status_filter,
        sort=sort,
        skip=skip,
        limit=limit
    )
    return {
        "products": [
            ProductResponse.model_validate(p) if hasattr(ProductResponse, 'model_validate') else ProductResponse.from_orm(p)
            for p in products
        ]
    }

@router.get("/{product_id}", response_model=Dict[str, ProductResponse])
def read_single_product(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Verifies that the product belongs to the authenticated user before returning.
    """
    product = crud_product.get_by_id(db, product_id=product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    if product.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. You do not own this product.")
    
    resp = ProductResponse.model_validate(product) if hasattr(ProductResponse, 'model_validate') else ProductResponse.from_orm(product)
    return {"product": resp}

@router.post("", response_model=Dict[str, Any])
@router.post("/", response_model=Dict[str, Any])
def create_product(
    product_in: ProductCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Creates a new product record in PostgreSQL strictly belonging to current_user.id.
    """
    new_product = crud_product.create_for_user(db, user_id=current_user.id, obj_in=product_in)
    
    crud_activity.log_activity(
        db,
        user_id=current_user.id,
        title=f"Added product: {new_product.title}",
        description=f"Cataloged {new_product.title} under {new_product.category} at ₹{new_product.price}.",
        event_type="product_created"
    )

    resp = ProductResponse.model_validate(new_product) if hasattr(ProductResponse, 'model_validate') else ProductResponse.from_orm(new_product)
    return {"product": resp, "message": "Product created successfully."}

@router.put("/{product_id}", response_model=Dict[str, Any])
def update_product(
    product_id: str,
    product_in: ProductUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates an existing product after verifying ownership.
    """
    db_product = crud_product.get_by_id(db, product_id=product_id)
    if not db_product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    if db_product.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. You do not own this product.")

    updated = crud_product.update(db, db_obj=db_product, obj_in=product_in)
    
    crud_activity.log_activity(
        db,
        user_id=current_user.id,
        title=f"Updated product: {updated.title}",
        description=f"Product specifications and pricing updated.",
        event_type="product_updated"
    )

    resp = ProductResponse.model_validate(updated) if hasattr(ProductResponse, 'model_validate') else ProductResponse.from_orm(updated)
    return {"product": resp, "message": "Product updated successfully."}

@router.delete("/{product_id}", response_model=Dict[str, Any])
def delete_product(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Deletes a product after verifying ownership.
    """
    db_product = crud_product.get_by_id(db, product_id=product_id)
    if not db_product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    if db_product.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. You do not own this product.")

    title = db_product.title
    crud_product.remove(db, product_id=product_id)
    
    crud_activity.log_activity(
        db,
        user_id=current_user.id,
        title=f"Removed product: {title}",
        description=f"Product listing removed from catalog.",
        event_type="product_deleted"
    )

    return {"success": True, "message": "Product deleted successfully."}

@router.post("/{product_id}/duplicate", response_model=Dict[str, Any])
def duplicate_product(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Duplicates a product for the authenticated user.
    """
    db_product = crud_product.get_by_id(db, product_id=product_id)
    if not db_product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    if db_product.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. You do not own this product.")

    dup = crud_product.duplicate_for_user(db, original=db_product, user_id=current_user.id)
    resp = ProductResponse.model_validate(dup) if hasattr(ProductResponse, 'model_validate') else ProductResponse.from_orm(dup)
    return {"product": resp, "message": "Product duplicated successfully."}

@router.post("/{product_id}/archive", response_model=Dict[str, Any])
def archive_product(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Archives a product for the authenticated user.
    """
    db_product = crud_product.get_by_id(db, product_id=product_id)
    if not db_product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    if db_product.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. You do not own this product.")

    db_product.status = "archived" if db_product.status != "archived" else "published"
    db.commit()
    db.refresh(db_product)
    
    return {"success": True, "message": f"Product status updated to {db_product.status}."}

@router.post("/generate-details")
def generate_product_details(
    payload: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """
    AI Generation Helper for Product Studio:
    Uses Gemini AI if API key is present, otherwise produces structured fallback draft.
    Does NOT save automatically to database until user reviews and clicks Save.
    """
    raw_name = payload.get("rawName", "Handcrafted Craft Piece")
    craft_type = payload.get("craftType", "Handicrafts & Art")
    materials = payload.get("materials", "Natural materials")
    target_price = payload.get("targetPrice", 850)

    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        try:
            from google import genai
            client = genai.Client(api_key=gemini_key)
            prompt = f"""Act as an e-commerce marketing specialist for Indian rural artisans and SHGs.
Input Product details:
- Name/Concept: {raw_name}
- Craft Type: {craft_type}
- Materials used: {materials}
- Target Price: ₹{target_price}

Generate JSON with:
1. "title": High-converting descriptive title suitable for Amazon/ONDC (max 80 chars)
2. "description": Engaging narrative highlighting artisan heritage and craft story (120-180 words)
3. "category": Best fitting category name
4. "suggestedPrice": Integer in INR
5. "keywords": Array of 5-8 search tags
6. "readinessScore": Integer 80-98"""

            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config={"response_mime_type": "application/json"}
            )
            data = json.loads(response.text)
            return {"data": data}
        except Exception as e:
            pass

    return {
        "data": {
            "title": f"Authentic Handcrafted {raw_name}",
            "description": f"Lovingly handcrafted by skilled rural artisans using authentic traditional techniques and sustainably sourced {materials}. Each piece reflects generations of cultural heritage, offering timeless aesthetic charm.",
            "category": craft_type,
            "suggestedPrice": int(target_price) if target_price else 850,
            "keywords": ["handmade", "rural craft", "artisan made", "eco friendly", "traditional"],
            "readinessScore": 92
        }
    }

@router.post("/suggest-brand")
def suggest_brand(
    payload: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    return {
        "suggestions": [
            {"name": "KalaGram", "meaning": "Village of Art", "whyItFits": "Connects traditional craft with rural roots", "personality": "Cultural & Authentic", "tagline": "Every piece tells a story"},
            {"name": "HastKraft", "meaning": "Handmade Craft", "whyItFits": "Simple, memorable, and highlights handmade origin", "personality": "Traditional & Handmade", "tagline": "Made with hands, made with heart"},
            {"name": "MittiMool", "meaning": "Earth Root", "whyItFits": "Reflects natural materials and rural heritage", "personality": "Natural & Earthy", "tagline": "Rooted in tradition"},
            {"name": "BharatHast", "meaning": "India's Hands", "whyItFits": "Artisan focused identity", "personality": "Authentic & Artisan", "tagline": "Crafted for India, loved by the world"}
        ]
    }

@router.post("/generate-identity")
def generate_identity(
    payload: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    title = payload.get("productName") or payload.get("detectedSubject") or "Handcrafted Artisan Product"
    materials = payload.get("materials", "Natural traditional materials")
    region = payload.get("region", "Rural India")
    brand_name = payload.get("brandName", "Artisan Collective")

    return {
        "data": {
            "productTitle": f"Authentic Handmade {title}",
            "shortDescription": f"A beautifully crafted {title.lower()} made by skilled rural artisans using traditional techniques.",
            "detailedDescription": f"This {title.lower()} is lovingly handcrafted by rural artisans. Made using {materials}, each piece carries the unique touch of its maker. Sourced from {region}, supporting sustainable livelihoods.",
            "keyFeatures": [
                "100% handmade by rural artisans",
                f"Made from {materials}",
                "Each piece is unique — no two alike",
                "Supports rural artisan livelihoods"
            ],
            "materials": materials,
            "craftMethod": "Traditional handcraft techniques",
            "idealFor": payload.get("targetAudience", "Home décor enthusiasts & conscious buyers"),
            "productStory": f"Every {title.lower()} from {brand_name} carries the story of rural heritage.",
            "careInstructions": "Handle with care. Store in a dry place.",
            "suggestedTags": ["handmade", "artisan", "rural craft", "authentic", "traditional"],
            "suggestedKeywords": ["handmade", "rural artisan", "authentic craft", "traditional"],
            "suggestedPrice": 850,
            "category": "Handicrafts & Art"
        }
    }
