import os
import json
import logging
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from backend.models.user import User
from backend.models.business_profile import BusinessProfile
from backend.models.product import Product
from backend.services.voice.types import VoicePipelineContext, IntentAnalysisResult

logger = logging.getLogger("krivio.voice.response")

class ResponseGenerationService:
    """
    Formulates safe, context-grounded business mentor advice for WhatsApp users.
    Enforces user isolation, pricing explanation safety, and destructive action blocks.
    """
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("VITE_GEMINI_API_KEY")

    def resolve_sender_context(
        self,
        db: Session,
        sender_phone: str,
        whatsapp_message_id: str
    ) -> VoicePipelineContext:
        """
        Safely identifies sender by phone number.
        If matched, loads user's business profile & products.
        If unlinked, initializes safe unlinked context without exposing any other user's data.
        """
        # Normalize phone: extract digits (last 10 digits for Indian numbers)
        digits = "".join(filter(str.isdigit, sender_phone))
        last_10 = digits[-10:] if len(digits) >= 10 else digits

        user = None
        if last_10:
            user = db.query(User).filter(
                (User.phone_number.like(f"%{last_10}")) |
                (User.phone_number == sender_phone)
            ).first()

        if user:
            # Linked user found
            profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == user.id).first()
            products = db.query(Product).filter(Product.user_id == user.id).limit(5).all()

            biz_name = profile.business_name if profile else user.full_name
            craft_type = profile.craft_type if profile and hasattr(profile, "craft_type") else (profile.business_type if profile else "Handicrafts")
            prod_summary = [{"title": p.title, "price": p.price, "category": p.category} for p in products]

            return VoicePipelineContext(
                whatsapp_message_id=whatsapp_message_id,
                sender_id=sender_phone,
                phone_number=sender_phone,
                is_linked_user=True,
                user_id=user.id,
                user_name=user.full_name,
                business_name=biz_name,
                craft_type=craft_type,
                products=prod_summary,
                preferred_language=getattr(user, "preferred_language", "hi-IN") or "hi-IN"
            )
        else:
            # Unlinked sender: clean, isolated sandbox
            return VoicePipelineContext(
                whatsapp_message_id=whatsapp_message_id,
                sender_id=sender_phone,
                phone_number=sender_phone,
                is_linked_user=False,
                user_id=None,
                user_name="Artisan",
                business_name=None,
                craft_type="Rural Enterprise & Craft",
                products=[],
                preferred_language="hi-IN"
            )

    def generate_response(
        self,
        transcript: str,
        analysis: IntentAnalysisResult,
        context: VoicePipelineContext,
        language_name: str = "Hindi"
    ) -> str:
        """
        Generates mentor guidance complying with KRIVIO safety rules:
        - Transparent estimates with assumptions (no fake absolute pricing)
        - Action confirmation for high-consequence intents
        - Unlinked onboarding guidance when appropriate
        """
        # 1. High-consequence confirmation block
        if analysis.requires_confirmation and analysis.confirmation_prompt:
            return f"⚠️ {analysis.confirmation_prompt}"

        # 2. AI formulation via Gemini if configured
        if self.api_key:
            try:
                return self._generate_with_gemini(transcript, analysis, context, language_name)
            except Exception as e:
                logger.warning(f"AI response formulation note: {str(e)}, using verified fallback response")

        # 3. Verified safe rule-based response
        return self._generate_fallback(transcript, analysis, context, language_name)

    def _generate_with_gemini(
        self,
        transcript: str,
        analysis: IntentAnalysisResult,
        context: VoicePipelineContext,
        language_name: str
    ) -> str:
        from google import genai
        client = genai.Client(api_key=self.api_key)

        prods_text = ", ".join([f"{p['title']} (₹{p.get('price', 0)})" for p in context.products]) if context.products else "None yet"
        user_status = f"Registered KRIVIO Artisan: {context.business_name} ({context.craft_type})" if context.is_linked_user else "New WhatsApp Artisan (Unlinked)"

        sys_prompt = f"""You are KRIVIO AI, a voice-first business mentor for Indian rural artisans and weavers on WhatsApp.
User Status: {user_status}
Catalog Sample: {prods_text}
Language: Respond directly in {language_name}.

CRITICAL SAFETY RULES:
1. For pricing questions, NEVER say "Your exact price is ₹X". Instead, provide a realistic ESTIMATED RANGE based on typical raw material, labor time, and market margin. Explain assumptions.
2. If the user mentions quantity (e.g. 10 lamps), calculate total estimated revenue and per-unit range.
3. Keep the reply warm, respectful, concise (2 to 4 sentences maximum), and immediately actionable for WhatsApp.
4. If unlinked user, warmly invite them to link their phone number on the KRIVIO web dashboard (https://krivio-ai.vercel.app).

User Query:
"{transcript}"

Classified Intent: {analysis.intent}
Extracted Entities: {analysis.entities.model_dump_json()}"""

        res = client.models.generate_content(
            model="gemini-2.5-flash-image",
            contents=[{"text": sys_prompt}]
        )
        return (res.text or "").strip()

    def _generate_fallback(
        self,
        transcript: str,
        analysis: IntentAnalysisResult,
        context: VoicePipelineContext,
        language_name: str
    ) -> str:
        name = context.business_name or "कारीगर साथी"
        intent = analysis.intent
        qty = analysis.entities.quantity or 10

        if intent == "PricingQuery":
            return (
                f"नमस्ते {name}! आपके {qty} हस्तशिल्प उत्पादों के लिए, यदि कच्चा माल ₹150 और कारीगरी समय 2 घंटे है, तो ONDC व स्थानीय बाजार में ₹450 - ₹550 प्रति पीस का अनुमानित दाम सही रहेगा। अपनी सटीक लागत जांचने के लिए KRIVIO डैशबोर्ड पर देखें।"
            )
        elif intent == "MarketingAdvice":
            return (
                f"नमस्ते {name}! हस्तशिल्प को ONDC और WhatsApp कैटलॉग के जरिए बेचने से 30% अधिक ग्राहक मिलते हैं। उत्पाद की साफ रोशनी में फोटो लें और 2-3 प्रमुख विशेषताओं का विवरण लिखें।"
            )
        elif intent == "SchemeInquiry":
            return (
                f"नमस्ते {name}! कारीगरों के लिए पीएम विश्वकर्मा (PM Vishwakarma) और मुद्रा (Mudra) योजना में ₹1 लाख से ₹3 लाख तक की सहायता व टूलकिट प्रोत्साहन मिलता है। अधिक जानकारी KRIVIO पर उपलब्ध है।"
            )
        else:
            return (
                f"नमस्ते {name}! KRIVIO AI आपके {context.craft_type} व्यवसाय को आगे बढ़ाने के लिए तैयार है। आप हमसे मूल्य निर्धारण, सरकारी योजनाओं या ऑनलाइन कैटलॉग के बारे में पूछ सकते हैं।"
            )
