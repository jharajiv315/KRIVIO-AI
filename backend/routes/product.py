from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.session import get_db
from backend.crud.crud_product import crud_product
from backend.schemas.product import ProductCreate, ProductUpdate, ProductResponse

router = APIRouter(prefix="/api/products", tags=["products"])

@router.get("/user/{user_id}", response_model=List[ProductResponse])
def read_user_products(user_id: str, db: Session = Depends(get_db)):
    return crud_product.get_by_user_id(db, user_id=user_id)

@router.post("/", response_model=ProductResponse)
def create_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    return crud_product.create(db, obj_in=product_in)

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: str, product_in: ProductUpdate, db: Session = Depends(get_db)):
    db_product = crud_product.get_by_id(db, product_id=product_id)
    if not db_product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return crud_product.update(db, db_obj=db_product, obj_in=product_in)

@router.delete("/{product_id}", response_model=ProductResponse)
def delete_product(product_id: str, db: Session = Depends(get_db)):
    db_product = crud_product.get_by_id(db, product_id=product_id)
    if not db_product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return crud_product.remove(db, product_id=product_id)
