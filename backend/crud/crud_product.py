import uuid
from typing import Optional, List
from sqlalchemy.orm import Session
from backend.models.product import Product
from backend.schemas.product import ProductCreate, ProductUpdate

class CRUDProduct:
    def get_by_id(self, db: Session, product_id: str) -> Optional[Product]:
        return db.query(Product).filter(Product.id == product_id).first()

    def get_by_user_id(
        self,
        db: Session,
        user_id: str,
        search: Optional[str] = None,
        category: Optional[str] = None,
        status: Optional[str] = None,
        sort: Optional[str] = "newest",
        skip: int = 0,
        limit: int = 100
    ) -> List[Product]:
        query = db.query(Product).filter(Product.user_id == user_id)
        if status and status != "all":
            query = query.filter(Product.status == status)
        if category and category != "all":
            query = query.filter(Product.category.ilike(f"%{category}%"))
        if search:
            q = f"%{search.strip()}%"
            query = query.filter(
                Product.title.ilike(q) | Product.description.ilike(q) | Product.category.ilike(q)
            )

        if sort == "price_asc":
            query = query.order_by(Product.price.asc())
        elif sort == "price_desc":
            query = query.order_by(Product.price.desc())
        elif sort == "oldest":
            query = query.order_by(Product.created_at.asc())
        else:
            query = query.order_by(Product.created_at.desc())

        return query.offset(skip).limit(limit).all()

    def count_by_user_id(self, db: Session, user_id: str) -> int:
        return db.query(Product).filter(Product.user_id == user_id).count()

    def count_marketplace_ready_by_user_id(self, db: Session, user_id: str) -> int:
        return db.query(Product).filter(
            Product.user_id == user_id,
            Product.is_marketplace_ready == True
        ).count()

    def create_for_user(self, db: Session, user_id: str, obj_in: ProductCreate) -> Product:
        product_id = f"prod_{uuid.uuid4().hex[:12]}"
        data = obj_in.model_dump() if hasattr(obj_in, 'model_dump') else obj_in.dict()
        data["id"] = product_id
        data["user_id"] = user_id

        # Normalize field names
        if "imageUrls" in data:
            data["image_urls"] = data.pop("imageUrls")
        if "isMarketplaceReady" in data:
            data["is_marketplace_ready"] = data.pop("isMarketplaceReady")
        if "readinessScore" in data:
            data["readiness_score"] = data.pop("readinessScore")

        db_obj = Product(**data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, db_obj: Product, obj_in: ProductUpdate) -> Product:
        update_data = obj_in.model_dump(exclude_unset=True) if hasattr(obj_in, 'model_dump') else obj_in.dict(exclude_unset=True)
        if "imageUrls" in update_data:
            update_data["image_urls"] = update_data.pop("imageUrls")
        if "isMarketplaceReady" in update_data:
            update_data["is_marketplace_ready"] = update_data.pop("isMarketplaceReady")
        if "readinessScore" in update_data:
            update_data["readiness_score"] = update_data.pop("readinessScore")

        for field, value in update_data.items():
            if value is not None and hasattr(db_obj, field):
                setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def duplicate_for_user(self, db: Session, original: Product, user_id: str) -> Product:
        new_id = f"prod_{uuid.uuid4().hex[:12]}"
        dup = Product(
            id=new_id,
            user_id=user_id,
            title=f"{original.title} (Copy)",
            description=original.description,
            category=original.category,
            price=original.price,
            currency=original.currency,
            stock=original.stock,
            sku=f"{original.sku}-copy" if original.sku else None,
            weight=original.weight,
            dimensions=original.dimensions,
            status=original.status,
            keywords=list(original.keywords or []),
            image_urls=list(original.image_urls or []),
            is_marketplace_ready=original.is_marketplace_ready,
            readiness_score=original.readiness_score,
            marketplaces=list(original.marketplaces or [])
        )
        db.add(dup)
        db.commit()
        db.refresh(dup)
        return dup

    def remove(self, db: Session, product_id: str) -> Optional[Product]:
        obj = db.query(Product).filter(Product.id == product_id).first()
        if obj:
            db.delete(obj)
            db.commit()
        return obj

crud_product = CRUDProduct()
