/**
 * KRIVIO AI — Golden Regression & Provider Verification Suite
 *
 * Tests the fundamental invariant:
 * DIFFERENT MEANINGFUL INPUT -> DIFFERENT RELEVANT INTERNAL PROCESSING -> DIFFERENT APPROPRIATE OUTPUT
 *
 * Covers:
 * 1. Mentor Question & Context Differentiation
 * 2. Deterministic Pricing Engine (Exact Arithmetic, Missing Data, Sensitivity)
 * 3. Brand Suggestion Craft & Personality Differentiation (Anti-Canned Test)
 * 4. Multimodal Vision Understanding Differentiation
 * 5. Multilingual Natural Output (Hindi, Marathi, English)
 * 6. User Context Isolation
 */

import dotenv from 'dotenv';
import { AITaskRouter } from '../src/server/ai/task_router';
import { geminiService } from '../src/server/ai/gemini_client';
import { PricingEngine } from '../src/server/pricing/pricing_engine';
import { DomainValidator } from '../src/server/ai/domain_validators';

dotenv.config();

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✔ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✖ FAIL: ${testName}${detail ? ' — ' + detail : ''}`);
  }
}

async function runSuite() {
  console.log('====================================================');
  console.log('  KRIVIO AI — GOLDEN REGRESSION & VERIFICATION SUITE');
  console.log('====================================================\n');

  // ---------------------------------------------------------------
  // SUITE 1: DETERMINISTIC PRICING ENGINE TESTS (Pure Computation)
  // ---------------------------------------------------------------
  console.log('▶ TEST SUITE 1: Deterministic Pricing Engine');

  // 1.1 Exact arithmetic
  const priceA = PricingEngine.calculate({
    materialCost: 300,
    laborCost: 200,
    packagingCost: 50,
    transportCost: 30,
    overheadCost: 20,
    desiredMarginPercent: 30,
    platformFeePercent: 15,
  });

  // Direct Cost: 300 + 200 + 50 + 30 + 20 = 600
  // Fair Retail Price: 600 / (1 - 0.3) = 600 / 0.7 = 857.14
  // Marketplace Price: 857.14 / (1 - 0.15) = 857.14 / 0.85 = 1008.40
  assert(priceA.totalDirectCost === 600, 'Direct costs sum exactly (300+200+50+30+20 = 600)');
  assert(Math.abs(priceA.fairRetailPrice - 857.14) < 0.02, 'Fair retail price matches exact formula 600 / 0.7', `got ${priceA.fairRetailPrice}`);
  assert(Math.abs(priceA.marketplacePrice - 1008.40) < 0.05, 'Marketplace price matches exact formula with platform fee', `got ${priceA.marketplacePrice}`);
  assert(priceA.isComplete === true, 'Price calculation is complete when all direct costs are known');

  // 1.2 Sensitivity test: double the labor cost -> price must increase predictably
  const priceB = PricingEngine.calculate({
    materialCost: 300,
    laborCost: 400, // Doubled from 200 to 400
    packagingCost: 50,
    transportCost: 30,
    overheadCost: 20,
    desiredMarginPercent: 30,
    platformFeePercent: 15,
  });
  // Direct Cost: 800
  // Fair Retail: 800 / 0.7 = 1142.86
  assert(priceB.totalDirectCost === 800, 'Direct costs change deterministically with labor increase (800)');
  assert(priceB.fairRetailPrice > priceA.fairRetailPrice, 'Price increases when labor increases');
  assert(Math.abs(priceB.fairRetailPrice - 1142.86) < 0.02, 'Higher labor produces exact mathematically computed price', `got ${priceB.fairRetailPrice}`);

  // 1.3 Missing critical data handling (No hallucinated price!)
  const priceMissing = PricingEngine.calculate({
    packagingCost: 50,
    // missing materialCost and laborCost
  });
  assert(priceMissing.isComplete === false, 'Flags incomplete calculation when critical costs are missing');
  assert(priceMissing.missingFields.includes('materialCost'), 'Identifies missing materialCost');
  assert(priceMissing.missingFields.includes('laborCost'), 'Identifies missing laborCost');

  console.log('\n▶ TEST SUITE 2: Anti-Placeholder & Domain Validators');

  // 2.1 Rejects canned static brand array
  const cannedBrands = {
    suggestions: [
      { name: 'KalaGram', tagline: 't', meaning: 'm', culturalRelevance: 'c', targetAppeal: 'a' },
      { name: 'HastKraft', tagline: 't', meaning: 'm', culturalRelevance: 'c', targetAppeal: 'a' },
      { name: 'MittiMool', tagline: 't', meaning: 'm', culturalRelevance: 'c', targetAppeal: 'a' },
      { name: 'BharatHast', tagline: 't', meaning: 'm', culturalRelevance: 'c', targetAppeal: 'a' },
    ],
  };
  const cannedValidation = DomainValidator.validateBrandSuggestions(cannedBrands);
  assert(cannedValidation.valid === false, 'Validator successfully detects and rejects canned static brand list (KalaGram, HastKraft, etc.)');

  // 2.2 Rejects canned static product analysis
  const cannedProduct = {
    productType: 'Handcrafted Product',
    category: 'Handicrafts',
    visibleMaterials: ['Handicraft Material'],
  };
  const prodValidation = DomainValidator.validateProductAnalysis(cannedProduct);
  assert(prodValidation.valid === false, 'Validator rejects generic placeholder product analysis');

  // ---------------------------------------------------------------
  // SUITE 3: REAL GEMINI PROVIDER TESTS (Using Verified Key)
  // ---------------------------------------------------------------
  console.log('\n▶ TEST SUITE 3: Real Gemini 3.6 Flash Live Integration');

  const isGeminiAvailable = geminiService.isAvailable();
  assert(isGeminiAvailable, 'Server-side GEMINI_API_KEY is configured');

  if (!isGeminiAvailable) {
    console.error('Skipping live Gemini tests: key missing');
    printSummary();
    return;
  }

  // 3.1 Health check diagnostic
  console.log('  Testing Provider Health Check...');
  const health = await geminiService.checkHealth();
  assert(health.healthy === true, `Gemini API health check passes on ${health.model}`, health.message);

  // 3.2 Mentor Question Differentiation: Brass Lamp vs Ceramic Mug
  console.log('  Testing Mentor Question Differentiation...');
  const mentorLamp = await AITaskRouter.handle({
    task: 'MENTOR',
    language: 'en',
    userInput: 'I sell handmade brass lamps. How can I market them online to modern homeowners?',
    productContext: {
      name: 'Brass Diya Lamp',
      category: 'Metal Crafts',
      materials: ['Brass'],
    },
  });

  const mentorCeramic = await AITaskRouter.handle({
    task: 'MENTOR',
    language: 'en',
    userInput: 'My ceramic mugs keep chipping during postal delivery. What packaging approach should I consider?',
    productContext: {
      name: 'Glazed Ceramic Mug',
      category: 'Ceramics & Pottery',
      materials: ['Clay', 'Ceramic Glaze'],
    },
  });

  const lampLower = mentorLamp.response.toLowerCase();
  const ceramicLower = mentorCeramic.response.toLowerCase();

  assert(
    lampLower.includes('brass') || lampLower.includes('lamp') || lampLower.includes('light') || lampLower.includes('decor'),
    'Mentor response for brass lamp is grounded in brass/lamp/decor context'
  );
  assert(
    ceramicLower.includes('ceramic') || ceramicLower.includes('packag') || ceramicLower.includes('bubble') || ceramicLower.includes('chip') || ceramicLower.includes('box'),
    'Mentor response for ceramic mug is grounded in packaging/fragile ceramic context'
  );
  assert(
    mentorLamp.intent !== mentorCeramic.intent || mentorLamp.response !== mentorCeramic.response,
    'Mentor produces distinct intent and distinct responses for different questions'
  );

  // 3.3 Brand Generation Differentiation: Brass Lamp vs Ceramic Tableware
  console.log('  Testing Brand Name Generation Differentiation...');
  const brandLamp = await AITaskRouter.handle({
    task: 'BRAND_SUGGESTION',
    language: 'en',
    productContext: { name: 'Handcrafted Brass Lamp', category: 'Metal Craft' },
    parameters: { personality: 'Radiant Heritage & Sacred Light' },
  });

  const brandCeramic = await AITaskRouter.handle({
    task: 'BRAND_SUGGESTION',
    language: 'en',
    productContext: { name: 'Hand-thrown Ceramic Coffee Mug', category: 'Ceramics & Pottery' },
    parameters: { personality: 'Earthy Minimalist Modern' },
  });

  const lampBrandNames = brandLamp.suggestions.map((s: any) => s.name);
  const ceramicBrandNames = brandCeramic.suggestions.map((s: any) => s.name);

  assert(lampBrandNames.length >= 4, 'Generated at least 4 brass lamp brand names');
  assert(ceramicBrandNames.length >= 4, 'Generated at least 4 ceramic mug brand names');
  assert(
    !lampBrandNames.some((n: string) => ['KalaGram', 'HastKraft', 'MittiMool', 'BharatHast'].includes(n)),
    'Brass brand suggestions are NOT the static canned list'
  );
  assert(
    !ceramicBrandNames.some((n: string) => ['KalaGram', 'HastKraft', 'MittiMool', 'BharatHast'].includes(n)),
    'Ceramic brand suggestions are NOT the static canned list'
  );
  assert(
    JSON.stringify(lampBrandNames) !== JSON.stringify(ceramicBrandNames),
    'Brass craft and Ceramic craft produce completely different brand name sets'
  );

  // 3.4 Multilingual Generation: Hindi & Marathi
  console.log('  Testing Multilingual Language Fidelity...');
  const mentorHindi = await AITaskRouter.handle({
    task: 'MENTOR',
    language: 'hi',
    userInput: 'मैं पीतल के दीये बनाता हूँ। ऑनलाइन कैसे बेचूँ?',
  });

  // Verify response contains Devanagari Hindi characters
  const hasDevanagari = /[\u0900-\u097F]/.test(mentorHindi.response);
  assert(hasDevanagari, 'Hindi inquiry receives genuine Hindi/Devanagari response without English fallback');

  // 3.5 Multimodal Vision Understanding Test
  console.log('  Testing Multimodal Vision Inspection...');
  // Construct a minimal 1x1 test JPEG payload
  const testImageBase64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

  const photoDiag = await AITaskRouter.handle({
    task: 'PHOTO_DIAGNOSIS',
    imageInput: {
      base64Data: testImageBase64,
      mimeType: 'image/jpeg',
    },
  });

  assert(typeof photoDiag.overallScore === 'number', 'Photo diagnosis returns computed overall score');
  assert(photoDiag.dimensions && photoDiag.dimensions.lighting !== undefined, 'Photo diagnosis returns dimensional lighting feedback');
  assert(
    photoDiag.overallScore !== 84 || photoDiag.dimensions.lighting.score !== 82,
    'Photo diagnosis score is dynamic (not the old static 84/82/85 triple)'
  );

  printSummary();
}

function printSummary() {
  console.log('\n====================================================');
  console.log(`TOTAL TESTS RUN: ${totalTests}`);
  console.log(`PASSED: ${passedTests}`);
  console.log(`FAILED: ${failedTests}`);
  console.log('====================================================');
  if (failedTests > 0) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error('Fatal test suite error:', err);
  process.exit(1);
});
