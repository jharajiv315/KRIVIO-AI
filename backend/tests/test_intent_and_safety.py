import unittest
from backend.services.voice.intent import IntentUnderstandingService
from backend.services.voice.response import ResponseGenerationService
from backend.services.voice.types import VoicePipelineContext, IntentAnalysisResult, ExtractedEntities

class TestIntentAndSafety(unittest.TestCase):
    def setUp(self):
        self.intent_service = IntentUnderstandingService()
        self.response_service = ResponseGenerationService()

    def test_intent_classification(self):
        # Pricing Query
        res1 = self.intent_service._analyze_heuristically("Maine 10 brass lamps banaye hain, inka price kya hona chahiye?")
        self.assertEqual(res1.intent, "PricingQuery")
        self.assertEqual(res1.entities.quantity, 10)

        # Marketing Advice
        res2 = self.intent_service._analyze_heuristically("ONDC aur Meesho par selling kaise badhaye?")
        self.assertEqual(res2.intent, "MarketingAdvice")

        # Scheme Inquiry
        res3 = self.intent_service._analyze_heuristically("Pradhan Mantri Vishwakarma yojana me loan aur subsidy kaise milegi?")
        self.assertEqual(res3.intent, "SchemeInquiry")

    def test_destructive_action_is_blocked(self):
        # Destructive action request must require confirmation and cannot directly execute
        res = self.intent_service._analyze_heuristically("Mera pehla product catalog se delete kar do")
        self.assertTrue(res.requires_confirmation)
        self.assertTrue(self.intent_service._detect_destructive_action("Mera bank account change kar do"))
        self.assertTrue(self.intent_service._detect_destructive_action("Cancel my subscription immediately"))

    def test_numerical_entity_extraction(self):
        res = self.intent_service._analyze_heuristically("Humne 25 piece wooden toys banaye hain 5 kg lakdi se")
        self.assertEqual(res.entities.quantity, 25)
        self.assertEqual(res.entities.weight, "5")
        self.assertEqual(res.entities.weight_unit, "kg")

    def test_safe_pricing_response_explains_assumptions(self):
        context = VoicePipelineContext(
            whatsapp_message_id="wa_1",
            sender_id="919876543210",
            phone_number="919876543210",
            is_linked_user=True,
            user_name="Ramesh",
            business_name="Ramesh Brass Crafts",
            craft_type="Brass Handicrafts",
            preferred_language="hi-IN"
        )
        analysis = IntentAnalysisResult(
            intent="PricingQuery",
            entities=ExtractedEntities(quantity=10, product="Brass Lamps")
        )
        reply = self.response_service._generate_fallback(
            transcript="10 diya lamps ka price kya rakhe?",
            analysis=analysis,
            context=context,
            language_name="Hindi"
        )

        # Must mention estimated range and assumptions, not absolute assertion
        self.assertIn("अनुमानित", reply)
        self.assertIn("कच्चा माल", reply)

    def test_unlinked_sender_sandbox_isolation(self):
        context = VoicePipelineContext(
            whatsapp_message_id="wa_2",
            sender_id="919800000000",
            phone_number="919800000000",
            is_linked_user=False,
            user_name="Artisan",
            business_name=None,
            craft_type="Crafts",
            preferred_language="hi-IN"
        )
        self.assertIsNone(context.user_id)
        self.assertFalse(context.is_linked_user)
        self.assertEqual(context.products, [])

if __name__ == "__main__":
    unittest.main()
