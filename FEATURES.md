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

## 6. Sell & Export: Real Marketplace & Catalog Tools

> **Tagline:** *"From Local Hands to Global Markets."*

### Purpose
Empowers rural artisans and grassroots micro-enterprises to maintain **ONE trusted canonical product record** and prepare it for multiple e-commerce marketplaces and wholesale B2B buyer channels without repetitive data entry.

### Architecture: Canonical Product → Multi-Channel Output
```
KRIVIO Canonical Product (Normalized Record)
  ├── Content (Title, Long Desc, Craft Story, Material, Color, Bullet Points)
  ├── Commercial (Selling Price, MRP, Wholesale Price, MOQ, Lead Time, Tax/HSN)
  ├── Physical (Weight kg, Package Dimensions L×W×H cm)
  └── Media (Primary Photo, Angle Photos, Public CDN URLs)
        ↓
Listing Readiness & Validation Engine (Destination Rules: ERROR, WARNING, INFO)
        ↓
Destination Adapters:
  ├── AmazonAdapter       → Amazon-Style Inventory Flat-File (XLSX)
  ├── MeeshoAdapter       → Meesho Micro-Seller Bulk Catalog (CSV)
  ├── FlipkartAdapter     → Flipkart Listing Flat File (CSV)
  ├── GenericCsvAdapter   → Universal Clean CSV (RFC-4180, UTF-8 BOM, Formula Safe)
  ├── GenericXlsxAdapter  → Presentation-Ready Excel Workbook (Styled XLSX)
  ├── OndcAdapter         → ONDC-Ready Beckn Retail Protocol (JSON)
  └── QuotationService    → B2B Wholesale Craft Quotation (PDF)
```

### Destination Specifications & Output Formats
1. **Amazon-Style Inventory Listing (`.xlsx`):**
   - **Schema Version:** `amazon-flatfile-handmade-2026.1`
   - **Structure:** Multi-row headers conforming to Amazon Seller Central flat-file inventory loader specifications (`feed_product_type`, `item_sku`, `brand_name`, `standard_price`, `quantity`, `bullet_point1`, `bullet_point2`, `package_dimensions`, etc.).
   - **Scope:** Prepared for manual flat-file upload via Amazon Seller Central. Does not provide or imply direct automated API publishing.

2. **Meesho Micro-Seller Bulk Catalog (`.csv`):**
   - **Schema Version:** `meesho-catalog-v2026.2`
   - **Structure:** Conforms to Meesho Supplier Panel bulk upload requirements (`Catalog ID / SKU`, `Meesho Price (Incl. GST)`, `Wrong/Defective Return Price`, `Weight (Grams)`, `HSN Code`, `GST %`).
   - **Security:** Serialized with UTF-8 BOM and formula injection defenses.

3. **Flipkart Listing Flat File (`.csv`):**
   - **Schema Version:** `flipkart-flatfile-v2026.1`
   - **Structure:** Conforms to Flipkart Seller Hub listing feed specifications (`Seller SKU ID`, `Listing Status`, `MRP`, `Selling Price`, `Procurement SLA`, `Shipping Provider`, `Package Dimensions`, `Package Weight`).

4. **Universal Clean CSV Catalog (`.csv`):**
   - **Standard:** RFC-4180 compliant with UTF-8 BOM.
   - **Multi-Script Support:** Verified native rendering for Indian regional scripts (Hindi, Marathi, Tamil, Bengali, Assamese, Gujarati).
   - **Formula Injection Defense:** Cell values starting with `=`, `+`, `-`, `@`, `\t`, or `\r` are safely escaped with a single quote prefix to prevent spreadsheet command execution.

5. **Professional Excel Workbook (`.xlsx`):**
   - **Engine:** ExcelJS.
   - **Design:** KRIVIO Emerald (`#0F5132`) header fill with Gold (`#D4AF37`) accent border, frozen header rows, zebra-striped alternating rows, auto-calculated column widths, and native currency formatting (`₹#,##0.00`).

6. **ONDC-Ready Beckn Retail Protocol (`.json`):**
   - **Schema Version:** `ondc-beckn-retail-v1.2.0`
   - **Structure:** Standardized Beckn protocol retail catalog payload (`bpp_provider`, `categories`, `items` with descriptor, price, quantity, tags, and fulfillment terms).
   - **Scope & Transparency:** Labeled strictly as "ONDC-Ready Structured Data". Exporting prepares data for onboarding via an authorized Seller Network Participant (SNP); it does not falsely claim direct network syndication without an SNP agreement.

### Listing Readiness & Validation Engine
- **Configurable Rules:** Evaluates title length, SKU uniqueness, non-negative pricing, public image URLs, package weight, dimensions, and HSN codes.
- **Strict Severity Tiers:**
  - `ERROR`: Blocks export until resolved (e.g., missing price, missing SKU, missing primary image).
  - `WARNING`: Highlights potential marketplace friction (e.g., missing HSN code on Meesho, title >200 characters on Amazon).
  - `INFO`: Advisory tips for optimal buyer conversion (e.g., recommending a second lifestyle photo).
- **Batch Readiness:** Supports filtering and exporting only the validated "Ready Items" when bulk catalogs contain incomplete drafts.

### B2B Craft Wholesale Quotation Generator & PDF Engine
- **Purpose:** Helps artisans present formal, high-trust wholesale proposals to boutiques, retail stores, gift shops, and corporate buyers. (Explicitly positioned as a quotation, not a tax invoice).
- **Capabilities:**
  - **Artisan Branding Snapshot:** Business name, brand name, owner contact, location, GSTIN, and monogram logo fallback.
  - **Buyer Information:** Contact person, company, email, phone, shipping address, buyer GSTIN.
  - **Line Items & Commercial Terms:** Product code, quantity, Minimum Order Quantity (MOQ), unit wholesale price, production lead time.
  - **Tiered Wholesale Pricing:** Configurable volume-based discounts (e.g., 25–49 units: ₹500; 50+ units: ₹450) with non-overlapping range validation.
  - **Decimal-Safe Monetary Arithmetic:** Exact precision without floating-point rounding errors.
  - **Immutable Snapshots:** Preserves historical quotation line items and pricing even if catalog prices change later.
  - **PDF Generation:** Server-side PDFKit rendering styled with KRIVIO palette, craft storytelling section, commercial terms, and multi-page pagination with clean headers/footers.
  - **Quotation Numbering:** Collision-resistant numbering format: `KRV-QT-YYYY-XXXXXX`.

- **Status:** ✅ Implemented
- **Audit Logging:** Every export and quotation generation event is recorded in PostgreSQL (`marketplace_exports`, `quotations`, `activities`) with strict user isolation.

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
