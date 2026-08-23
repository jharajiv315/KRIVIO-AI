import uuid
from typing import Optional, List
from sqlalchemy.orm import Session
from backend.models.conversation import Conversation
from backend.schemas.conversation import ConversationCreate, ConversationUpdate

class CRUDConversation:
    def get_by_id(self, db: Session, conversation_id: str) -> Optional[Conversation]:
        return db.query(Conversation).filter(Conversation.id == conversation_id).first()

    def get_by_user_id(self, db: Session, user_id: str) -> List[Conversation]:
        return db.query(Conversation).filter(Conversation.user_id == user_id).order_by(Conversation.created_at.desc()).all()

    def create(self, db: Session, obj_in: ConversationCreate) -> Conversation:
        conv_id = f"conv_{uuid.uuid4().hex[:12]}"
        db_obj = Conversation(
            id=conv_id,
            user_id=obj_in.user_id,
            title=obj_in.title or "Business Advice Session",
            messages=obj_in.messages or []
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, db_obj: Conversation, obj_in: ConversationUpdate) -> Conversation:
        update_data = obj_in.model_dump(exclude_unset=True) if hasattr(obj_in, 'model_dump') else obj_in.dict(exclude_unset=True)
        for field, value in update_data.items():
            if value is not None:
                setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

crud_conversation = CRUDConversation()
