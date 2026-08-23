from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.session import get_db
from backend.crud.crud_conversation import crud_conversation
from backend.schemas.conversation import ConversationCreate, ConversationUpdate, ConversationResponse

router = APIRouter(prefix="/api/conversations", tags=["conversations"])

@router.get("/user/{user_id}", response_model=List[ConversationResponse])
def read_user_conversations(user_id: str, db: Session = Depends(get_db)):
    return crud_conversation.get_by_user_id(db, user_id=user_id)

@router.post("/", response_model=ConversationResponse)
def create_conversation(conv_in: ConversationCreate, db: Session = Depends(get_db)):
    return crud_conversation.create(db, obj_in=conv_in)

@router.put("/{conversation_id}", response_model=ConversationResponse)
def update_conversation(conversation_id: str, conv_in: ConversationUpdate, db: Session = Depends(get_db)):
    db_conv = crud_conversation.get_by_id(db, conversation_id=conversation_id)
    if not db_conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    return crud_conversation.update(db, db_obj=db_conv, obj_in=conv_in)
