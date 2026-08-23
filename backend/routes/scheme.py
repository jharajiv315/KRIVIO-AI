from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.session import get_db
from backend.crud.crud_scheme import crud_scheme
from backend.schemas.government_scheme import GovernmentSchemeCreate, GovernmentSchemeResponse

router = APIRouter(prefix="/api/schemes", tags=["schemes"])

@router.get("/", response_model=List[GovernmentSchemeResponse])
def read_schemes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_scheme.get_multi(db, skip=skip, limit=limit)

@router.post("/", response_model=GovernmentSchemeResponse)
def create_scheme(scheme_in: GovernmentSchemeCreate, db: Session = Depends(get_db)):
    return crud_scheme.create(db, obj_in=scheme_in)
