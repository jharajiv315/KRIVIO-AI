import uuid
from typing import Optional, List
from sqlalchemy.orm import Session
from backend.models.product import Product
from backend.schemas.product import ProductCreate, ProductUpdate

class CRUDProduct:
    def get_by_id(self, db: Session, product_id: str) -> Optional[Product]:
        return db.query(Product).filter(Product.id == product_id).first()

    def get_by_user_id(self, db: Session, user_id: str) -> List[Product]:
        return db.query(Product).filter(Product.user_id == user_id).all()

    def create(self, db: Session, obj_in: ProductCreate) -> Product:
        product_id = f"prod_{uuid.uuid4().hex[:12]}"
        db_obj = Product(
            id=product_id,
            user_id=obj_in.user_id,
            title=obj_in.title,
            description=obj_in.description,
            category=obj_in.category,
            price=obj_in.price,
            status=obj_in.status or "active",
            image_url=obj_in.image_url
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, db_obj: Product, obj_in: ProductUpdate) -> Product:
        update_data = obj_in.model_dump(exclude_unset=True) if hasattr(obj_in, 'model_dump') else obj_in.dict(exclude_unset=True)
        for field, value in update_data.items():
            if value is not None:
                setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, product_id: str) -> Optional[Product]:
        obj = db.query(Product).filter(Product.id == product_id).first()
        if obj:
            db.delete(obj)
            db.commit()
        return obj

crud_product = CRUDProduct()
