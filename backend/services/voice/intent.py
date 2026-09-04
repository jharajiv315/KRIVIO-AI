import re
import json
import logging
import os
from typing import Optional
from backend.services.voice.types import IntentAnalysisResult, ExtractedEntities

logger = logging.getLogger("krivio.voice.intent")

class IntentUnderstandingService:
    """
    Classifies user intent, extracts structured commerce entities (product, quantity, weight, price),
    and enforces numerical confirmation checks for consequential business reasoning.
    """
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("VITE_GEMINI_API_KEY")

    def analyze(self, transcript: str, language_name: str = "Hindi") -> IntentAnalysisResult:
        if not transcript or not transcript.strip():
            return IntentAnalysisResult(
                intent="GeneralMentorship",
                confidence=0.5,
                entities=ExtractedEntities()
            )

        # 1. AI-powered extraction if Gemini client is available
        if self.api_key:
            try:
                return self._analyze_with_gemini(transcript, language_name)
            except Exception as e:
                logger.warning(f"AI intent extraction note: {str(e)}, using heuristic analyzer")

        # 2. Heuristic fallback analyzer
        return self._analyze_heuristically(transcript)

    def _analyze_with_gemini(self, transcript: str, language_name: str) -> IntentAnalysisResult:
        from google import genai
        client = genai.Client(api_key=self.api_key)

        prompt = f"""You are KRIVIO AI intent and entity analyzer for rural Indian business entrepreneurs.
Analyze this voice transcript spoken in {language_name}:
"{transcript}"

Extract structured entities and detect any high-risk numerical ambiguity (e.g., confusing 10 with 100, 2kg with 20kg).

Return JSON with this exact schema:
{{
  "intent": "PricingQuery" | "MarketingAdvice" | "CatalogHelp" | "SchemeInquiry" | "GeneralMentorship",
  "confidence": 0.95,
  "entities": {{
    "product": string or null,
    "quantity": number or string or null,
    "price_mentioned": number or string or null,
    "material": string or null,
    "weight": number or string or null,
    "weight_unit": "kg" | "g" | "piece" | "meter" | null,
    "location": string or null,
    "has_numerical_ambiguity": boolean,
    "ambiguity_reason": string or null
  }},
  "requires_confirmation": boolean,
  "confirmation_prompt": string or null
}}"""

        res = client.models.generate_content(
            model="gemini-2.5-flash-image",
            contents=[{"text": prompt}],
            config={"response_mime_type": "application/json"}
        )

        data = json.loads(res.text or "{}")
        ent_data = data.get("entities", {})

        entities = ExtractedEntities(
            product=ent_data.get("product"),
            quantity=ent_data.get("quantity"),
            price_mentioned=ent_data.get("price_mentioned"),
            material=ent_data.get("material"),
            weight=ent_data.get("weight"),
            weight_unit=ent_data.get("weight_unit"),
            location=ent_data.get("location"),
            has_numerical_ambiguity=bool(ent_data.get("has_numerical_ambiguity")),
            ambiguity_reason=ent_data.get("ambiguity_reason")
        )

        # Destructive action safety guard
        requires_conf = bool(data.get("requires_confirmation") or entities.has_numerical_ambiguity)
        conf_prompt = data.get("confirmation_prompt")

        if self._detect_destructive_action(transcript):
            requires_conf = True
            conf_prompt = "Voice commands cannot directly delete products, change payment details, or alter account settings. Please confirm in the KRIVIO dashboard."

        return IntentAnalysisResult(
            intent=data.get("intent", "GeneralMentorship"),
            confidence=float(data.get("confidence", 0.95)),
            entities=entities,
            requires_confirmation=requires_conf,
            confirmation_prompt=conf_prompt
        )

    def _analyze_heuristically(self, transcript: str) -> IntentAnalysisResult:
        text = transcript.lower()

        # Intent heuristic
        intent = "GeneralMentorship"
        if any(w in text for w in ["price", "cost", "कीमत", "दाम", "भाव", "दर", "rate", "rupee", "रुपए"]):
            intent = "PricingQuery"
        elif any(w in text for w in ["market", "sell", "ondc", "amazon", "meesho", "ग्राहक", "बिक्री", "ग्राहक"]):
            intent = "MarketingAdvice"
        elif any(w in text for w in ["scheme", "loan", "subsidy", "mudra", "योजना", "सब्सिडी", "ऋण"]):
            intent = "SchemeInquiry"
        elif any(w in text for w in ["photo", "catalog", "listing", "title", "विवरण"]):
            intent = "CatalogHelp"

        # Quantity and weight regex extraction
        quantity = None
        qty_match = re.search(r'(\d+)\s*(piece|pcs|पीस|नग|units|items)?', text)
        if qty_match:
            try:
                quantity = int(qty_match.group(1))
            except ValueError:
                pass

        weight = None
        weight_unit = None
        weight_match = re.search(r'(\d+(?:\.\d+)?)\s*(kg|kilo|किलो|gram|ग्राम|g)', text)
        if weight_match:
            weight = weight_match.group(1)
            weight_unit = "kg" if "k" in weight_match.group(2) else "g"

        has_ambiguity = False
        ambiguity_reason = None
        if quantity and quantity > 500:
            has_ambiguity = True
            ambiguity_reason = f"Unusually large quantity detected ({quantity} units). Confirmation recommended."

        entities = ExtractedEntities(
            quantity=quantity,
            weight=weight,
            weight_unit=weight_unit,
            has_numerical_ambiguity=has_ambiguity,
            ambiguity_reason=ambiguity_reason
        )

        requires_conf = has_ambiguity or self._detect_destructive_action(transcript)

        return IntentAnalysisResult(
            intent=intent,
            confidence=0.85,
            entities=entities,
            requires_confirmation=requires_conf,
            confirmation_prompt=ambiguity_reason
        )

    def _detect_destructive_action(self, transcript: str) -> bool:
        """
        Detects if voice prompt attempts destructive operations (e.g. deletion, banking, payments).
        """
        text = transcript.lower()
        destructive_keywords = [
            "delete", "remove", "हटाएं", "डिलीट",
            "bank account", "बैंक खाता",
            "send money", "transfer money", "पैसे भेजो", "भुगतान करो"
        ]
        if any(kw in text for kw in destructive_keywords):
            return True

        if "cancel" in text and ("sub" in text or "plan" in text):
            return True

        return False
