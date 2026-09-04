# KRIVIO AI — Features Reference

This document details the functional specifications, user workflows, technical operations, and operational limitations for all features implemented in KRIVIO AI.

For architecture details, see [ARCHITECTURE.md](ARCHITECTURE.md). For security policies, see [SECURITY.md](SECURITY.md).

---

## 1. Voice & Vernacular Business Mentor (Phase 1)

### Purpose
Enables non-literate or vernacular-speaking rural entrepreneurs to interact with KRIVIO AI using natural speech in their native regional language.

### How It Works
1. **Audio Recording:** The user taps the microphone button in `VoiceMentor.tsx`, capturing speech via the browser's Web Audio API.
2. **Audio Transcription:** The raw audio buffer is submitted to `/api/voice/transcribe`, which utilizes Gemini multimodal audio ingestion to transcribe verbatim regional speech.
3. **Interactive Confirmation:** The transcription is displayed on a confirmation card, allowing the entrepreneur to edit or re-record before sending.
4. **Context-Aware Guidance:** On confirmation, `/api/voice/respond` loads the user's business profile and catalog, classifies the intent (`PricingQuery`, `MarketingAdvice`, `CatalogHelp`, `SchemeInquiry`), and generates an actionable response.
5. **Speech Playback (TTS):** The response is synthesized into spoken audio via the Web Speech API or `/api/voice/listen` endpoint.
6. **Persistence & Privacy:** Every interaction is recorded in the PostgreSQL `voice_assets` table. Users can review their history or permanently delete all voice logs at any time.

- **Status:** ✅ Implemented
- **Supported Spoken Languages:** Hindi, Marathi, Tamil, Gujarati, Bengali, Assamese, English.
- **Limitations:** Audio transcription accuracy depends on background noise levels and client microphone quality.

---

## 2. WhatsApp Inbound Voice Pipeline (Phase 2)

### Purpose
Allows artisans to query KRIVIO AI directly through WhatsApp voice notes without opening a web browser.

### How It Works
1. **Webhook Ingestion:** Meta WhatsApp Cloud API sends incoming webhook events to `GET/POST /webhook/whatsapp`.
2. **Signature Verification:** Validates `X-Hub-Signature-256` headers using HMAC-SHA256 and the configured `WHATSAPP_APP_SECRET`.
3. **Async Queue:** Offloads media processing to FastAPI background tasks, acknowledging Meta servers with an immediate HTTP 200.
4. **Media Download:** Downloads encrypted OGG/Opus voice notes from Meta Graph API endpoints (`backend/services/whatsapp/media.py`).
5. **Speech Engine Adaptation:** Routes audio through Google Cloud Speech (Chirp 2) or Gemini Audio models.
6. **Outbound Dispatch:** Formulates advice and sends a formatted WhatsApp message back to the artisan's phone number.

- **Status:** 🟡 Partially Implemented / Configuration-Dependent
- **Requirements:** Requires Meta Business Account credentials (`WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`).

---

## 3. AI Image & Creative Studio

### Purpose
Transforms unpolished smartphone product photos into high-converting e-commerce assets, marketing banners, and lifestyle mockups without third-party design software.

### Operational Categories (`src/server/image_operations/`)
| Category | ID | Description | Default Aspect Ratio |
|---|---|---|---|
| **Photo Cleanup** | `white_background` / `shadow_enhancement` | Removes cluttered backgrounds, adds soft studio drop shadows, corrects lighting. | 1:1 (Square) |
| **Image Quality** | `detail_sharpening` / `texture_enhancement` | Enhances intricate textile weaves, embroidery threads, and pottery textures. | 1:1 (Square) |
| **Lifestyle Context** | `living_room_staging` / `kitchen_context` | Places handcrafted items into realistic Indian domestic and luxury home contexts. | 4:5 (Portrait) |
| **Marketing Assets** | `festival_banner` / `discount_promo` | Generates promotional banners with regional festive themes (Diwali, Pongal, Eid, Durga Puja). | 16:9 / 9:16 |
| **Branding** | `logo_overlay` / `artisan_seal` | Adds authentic "Handmade in India" seals, artisan signatures, and brand watermarks. | 1:1 (Square) |
| **Catalog Pages** | `specs_card` / `dimension_grid` | Generates multi-angle spec sheets with dimensions and craft storytelling text. | 4:3 (Grid) |
| **Seasonal & Cultural** | `wedding_collection` / `heritage_edition` | Styles products with cultural aesthetic motifs and seasonal color palettes. | 4:5 (Portrait) |
| **Advanced Editing** | `custom_instruction` | Natural language image editing guided by custom artisan instructions. | Dynamic |

- **Status:** ✅ Implemented
- **Key Features:** Canvas-based interactive comparison slider (`StudioWorkspace.tsx`), layer adjustments, lossless WebP export, and "Save to Catalog" workflow.

---

## 4. Product Identity Wizard

### Purpose
Converts a single product photograph into a comprehensive, marketplace-ready digital product listing in under 60 seconds.

### How It Works
1. **Visual Auto-Tagging:** Gemini Vision analyzes the uploaded photo to identify primary materials, craft category, colors, and design patterns.
2. **Heritage Storytelling:** Generates culturally rich product narratives emphasizing traditional artisan techniques and origins.
3. **Technical Specs:** Proposes accurate dimensions, estimated weight, care instructions, and SKU formats.
4. **Smart Pricing Calculator:** Suggests optimal pricing brackets for direct-to-consumer (D2C), wholesale, and open network (ONDC) channels.
5. **SEO & Keywords:** Compiles high-intent search keywords and category tags in English and Hindi.

- **Status:** ✅ Implemented
- **Output Formats:** JSON metadata, direct PostgreSQL catalog insertion, downloadable product spec cards.

---

## 5. Product Studio & Catalog Management

### Purpose
Provides a centralized inventory management system tailored for micro-producers.

### Capabilities
- **Inventory Overview:** Filter products by status (`draft`, `published`, `archived`), category, or search query.
- **Single-Click Duplication:** Duplicate existing product listings to quickly add variants (e.g., color or size changes).
- **Batch Export:** Export catalog listings formatted for ONDC, Amazon, or CSV spreadsheets.
- **Stock Tracking:** Real-time stock level counters and low-inventory indicators.
- **Direct Store Publishing:** Instantly toggle public visibility on the artisan's public storefront.

- **Status:** ✅ Implemented

---

## 6. Marketplace Readiness Engine

### Purpose
Audits product listings against strict e-commerce compliance guidelines before publishing, preventing listing rejections on major platforms.

### Evaluation Criteria
```
Overall Readiness Score (0–100%)
├── Image Compliance (Resolution >= 1000px, Clean Background, Multi-angle)
├── Title & Description Quality (Keywords, Material disclosure, Craft origin)
├── Pricing & Tax Transparency (Fair pricing, GST/HSN applicability)
└── Specification Completeness (Dimensions, Weight, Return policy, Stock)
```

### Supported Marketplace Profiles
- **ONDC (Open Network for Digital Commerce):** Audits schema compliance for Beckn protocol integration.
- **Amazon Saheli / Karigar:** Validates authenticity disclosures, white-background requirements, and brand registry readiness.
- **Meesho:** Optimizes keywords and price points for high-volume rural/semi-urban consumer bases.
- **Etsy:** Emphasizes heritage craft storytelling, artisan bio, and international shipping dimensions.

- **Status:** ✅ Implemented

---

## 7. AI Business Mentor Chat

### Purpose
Provides 24/7 strategic and tactical business advice tailored to the entrepreneur's specific craft, location, and sales history.

### Capabilities
- **Grounded Context:** Automatically ingests the artisan's business profile (`craft_type`, `state`, `district`) and active products into the LLM system prompt.
- **Topic Coverage:** Pricing strategy, raw material sourcing, packaging advice, seasonal demand forecasting, and logistics guidance.
- **Persistent Conversation:** Chat histories are stored in PostgreSQL (`conversations` table) with multi-turn continuity.
- **Multilingual Responses:** Mentorship answers are delivered in the entrepreneur's chosen interface language.

- **Status:** ✅ Implemented

---

## 8. Government Schemes Advisor

### Purpose
Demystifies government subsidies, grants, credit support, and training programs available to Indian artisans and MSMEs.

### Features
- **Curated Scheme Registry:** Includes **PM Vishwakarma**, **PMEGP** (Prime Minister’s Employment Generation Programme), **MUDRA Yojana**, **Stand-Up India**, and **SFURTI** (Scheme of Fund for Regeneration of Traditional Industries).
- **Smart Filtering:** Filter schemes by business type (Artisan, Weaver, Farmer, SHG) and state.
- **Simplified Eligibility Cards:** Breaks down complex bureaucratic guidelines into plain-language bullet points and document checklists.
- **Direct Official Links:** Directs users to verified government application portals (`pmvishwakarma.gov.in`, `kviconline.gov.in`, `udyamregistration.gov.in`).

- **Status:** ✅ Implemented

---

## 9. Public Artisan Digital Storefront

### Purpose
Gives every rural entrepreneur an instant, mobile-optimized public web store without requiring domain registration or hosting setup.

### How It Works
- **Shareable URL:** Accessed via `https://krivio-ai.vercel.app/?store=<user_id>` (e.g., `?store=usr_demo_1`).
- **Brand Showcase:** Displays the artisan's banner, craft heritage story, verified badge, and location.
- **Interactive Catalog:** Customers can browse high-res product photos, read craft specifications, and view prices.
- **Direct WhatsApp Ordering:** Clicking "Order via WhatsApp" generates a pre-filled message with product title, price, and SKU, opening WhatsApp directly with the artisan.

- **Status:** ✅ Implemented

---

## 10. Multilingual Interface (7 Languages)

### Purpose
Eliminates language barriers across all core platform views.

### Supported Languages
| Language | Script | Locale Code | Coverage |
|---|---|---|---|
| **English** | Latin | `en` | 100% UI & System |
| **Hindi** | देवनागरी | `hi` | 100% UI & System |
| **Marathi** | देवनागरी | `mr` | 100% UI & System |
| **Gujarati** | ગુજરાતી | `gu` | 100% UI & System |
| **Tamil** | தமிழ் | `ta` | 100% UI & System |
| **Bengali** | বাংলা | `bn` | 100% UI & System |
| **Assamese** | অসমীয়া | `as` | 100% UI & System |

- **Status:** ✅ Implemented
- **Architecture:** Client-side JSON dictionary interpolation in `src/i18n/locales/` with instant language switching and `localStorage` caching.

---

## 11. Authentication & Entrepreneur Profile

### Purpose
Provides secure identity management and rich business profiling.

### Features
- **Supabase Google OAuth:** One-click sign-in with Google.
- **Email & Password Authentication:** Standard registration with bcrypt password hashing.
- **Auto-Sync:** Seamless mapping of OAuth sessions to PostgreSQL user accounts (`/api/auth/supabase-sync`).
- **Business Profile:** Collects business name, craft category, artisan bio, district, state, pin code, GST number, and social media links.

- **Status:** ✅ Implemented

---

## 12. Subscriptions & Payments (Razorpay)

### Purpose
Manages subscription tiers and payments for advanced AI capabilities.

### Plans
- **Free Plan (₹0/mo):** Basic catalog management, 5 AI product listings/mo, standard voice mentor queries.
- **Pro Artisan Plan (₹499/mo):** Unlimited AI image enhancements, full marketplace readiness audits, high-definition catalog exports, and priority voice mentoring.

### Implementation
- Client opens `PricingModal.tsx` initiating a Razorpay order via `/api/subscriptions/create-order`.
- Server validates payment signatures via HMAC-SHA256 (`/api/subscriptions/verify-payment`) and activates the subscription in PostgreSQL.

- **Status:** ✅ Implemented
