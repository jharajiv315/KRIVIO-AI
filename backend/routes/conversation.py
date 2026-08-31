import os
import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.session import get_db
from backend.crud.crud_conversation import crud_conversation
from backend.crud.crud_business_profile import crud_business_profile
from backend.crud.crud_product import crud_product
from backend.crud.crud_activity import crud_activity
from backend.models.user import User
from backend.schemas.conversation import (
    ConversationCreate,
    ConversationUpdate,
    ConversationResponse,
    AIMentorRequest,
    AIMentorResponse
)
from backend.security import get_current_user

router = APIRouter(tags=["conversations"])

@router.get("/api/conversations", response_model=List[ConversationResponse])
def get_user_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns ONLY conversations belonging to the authenticated user.
    """
    convs = crud_conversation.get_by_user_id(db, user_id=current_user.id)
    return [
        ConversationResponse.model_validate(c) if hasattr(ConversationResponse, 'model_validate') else ConversationResponse.from_orm(c)
        for c in convs
    ]

@router.post("/api/ai/mentor", response_model=AIMentorResponse)
def chat_with_ai_mentor(
    req: AIMentorRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    AI Mentor Conversation Endpoint:
    Uses the authenticated user's real business profile & products for grounded memory,
    generates an insightful mentor response using Gemini AI,
    and persists the message exchange into PostgreSQL for the user.
    """
    user_msg = req.message
    language = req.language or "English"

    # 1. Retrieve user's business context for grounded memory
    profile = crud_business_profile.get_by_user_id(db, user_id=current_user.id)
    products = crud_product.get_by_user_id(db, user_id=current_user.id, limit=5)
    
    prod_names = ", ".join([p.title for p in products]) if products else "None added yet"
    biz_name = profile.business_name if profile else current_user.full_name
    craft_type = profile.business_type if profile else "Handicrafts & Rural Enterprise"
    location = f"{profile.district}, {profile.state}" if (profile and profile.district) else "India"

    system_prompt = f"""You are KRIVIO AI, a friendly, highly practical voice-first AI business mentor for rural entrepreneurs in India (artisans, SHGs, weavers, potters, farmers, and micro-enterprises).
User Profile:
- Enterprise: {biz_name}
- Craft/Domain: {craft_type}
- Location: {location}
- Listed Products: {prod_names}

Core Expertise: pricing formulas, listing on ONDC/Amazon Karigar/Meesho/Etsy, government schemes (PM Vishwakarma, MUDRA, NABARD), taking clear smartphone photos with natural light.
Language: Respond in {language}. Keep the response warm, encouraging, practical, and concise (under 180 words) for voice output."""

    reply_text = ""
    gemini_key = os.getenv("GEMINI_API_KEY")

    if gemini_key:
        try:
            from google import genai
            client = genai.Client(api_key=gemini_key)
            contents = [
                {"role": "user", "parts": [{"text": f"Context: {system_prompt}\n\nUser question: {user_msg}"}]}
            ]
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=contents
            )
            reply_text = response.text or ""
        except Exception as e:
            pass

    if not reply_text:
        lower = user_msg.lower()
        if "ondc" in lower or "market" in lower or "sell" in lower:
            reply_text = f"Namaste {current_user.full_name}! To sell on ONDC: 1. Keep your Udyam or SHG ID ready in your Business Profile, 2. Add product dimensions and photos in Product Studio, 3. Connect via buyer apps like Paytm or Mystore!"
        elif "price" in lower or "cost" in lower or "margin" in lower:
            reply_text = f"For fair pricing in {craft_type}: Calculate (Raw Material Cost) + (Labor Hours × Fair Daily Wage) + 20% Profit Margin. For example: ₹400 material + ₹600 labor = ₹1,200 to ₹1,400 retail price."
        elif "scheme" in lower or "loan" in lower or "grant" in lower:
            reply_text = f"Key government support for artisans: 1. PM Vishwakarma (₹15,000 toolkit voucher + 5% subsidized loan up to ₹3 Lakh), 2. MUDRA loan (up to ₹10 Lakh), 3. NABARD SHG grants."
        else:
            reply_text = f"Namaste {current_user.full_name}! I am your KRIVIO AI mentor. How can I help grow your rural business '{biz_name}' today? Ask me about fair pricing, taking product photos, or listing on ONDC."

    now_str = datetime.datetime.now().strftime("%I:%M %p")

    # 2. Persist message exchange to PostgreSQL
    crud_conversation.append_message_for_user(
        db,
        user_id=current_user.id,
        user_msg=user_msg,
        ai_reply=reply_text,
        language=language
    )

    # 3. Log activity
    crud_activity.log_activity(
        db,
        user_id=current_user.id,
        title="Consulted AI Voice Mentor",
        description=f"Asked: \"{user_msg[:60]}...\"",
        event_type="ai_mentor"
    )

    return AIMentorResponse(
        reply=reply_text,
        language=language,
        timestamp=now_str
    )
