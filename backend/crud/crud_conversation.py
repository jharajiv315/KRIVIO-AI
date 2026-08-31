import uuid
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from backend.models.conversation import Conversation
from backend.schemas.conversation import ConversationCreate, ConversationUpdate

class CRUDConversation:
    def get_by_id(self, db: Session, conversation_id: str) -> Optional[Conversation]:
        return db.query(Conversation).filter(Conversation.id == conversation_id).first()

    def get_by_user_id(self, db: Session, user_id: str, limit: int = 20) -> List[Conversation]:
        return db.query(Conversation).filter(Conversation.user_id == user_id).order_by(Conversation.updated_at.desc()).limit(limit).all()

    def get_or_create_latest_for_user(self, db: Session, user_id: str, language: str = "English") -> Conversation:
        latest = db.query(Conversation).filter(Conversation.user_id == user_id).order_by(Conversation.updated_at.desc()).first()
        if latest:
            return latest
        conv_id = f"conv_{uuid.uuid4().hex[:12]}"
        new_conv = Conversation(
            id=conv_id,
            user_id=user_id,
            title="AI Business Mentorship",
            language=language,
            messages=[]
        )
        db.add(new_conv)
        db.commit()
        db.refresh(new_conv)
        return new_conv

    def append_message_for_user(
        self,
        db: Session,
        user_id: str,
        user_msg: str,
        ai_reply: str,
        language: str = "English"
    ) -> Conversation:
        conv = self.get_or_create_latest_for_user(db, user_id=user_id, language=language)
        messages = list(conv.messages or [])

        import datetime
        now_str = datetime.datetime.now().strftime("%I:%M %p")
        messages.append({
            "id": f"msg_{uuid.uuid4().hex[:8]}",
            "sender": "user",
            "text": user_msg,
            "timestamp": now_str,
            "language": language
        })
        messages.append({
            "id": f"msg_{uuid.uuid4().hex[:8]}",
            "sender": "assistant",
            "text": ai_reply,
            "timestamp": now_str,
            "language": language
        })

        conv.messages = messages
        conv.language = language
        db.add(conv)
        db.commit()
        db.refresh(conv)
        return conv

    def remove(self, db: Session, conversation_id: str) -> Optional[Conversation]:
        obj = self.get_by_id(db, conversation_id=conversation_id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj

crud_conversation = CRUDConversation()
