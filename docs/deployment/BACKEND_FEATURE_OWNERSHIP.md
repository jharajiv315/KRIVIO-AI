# KRIVIO AI — Backend Feature Ownership & Route Authority Matrix

**Document Purpose**: Definitive evidence-based audit establishing which backend (`server.ts` Express Monolith vs `backend/` Python FastAPI) currently owns and serves each frontend feature.  
**Auditor**: Principal Cloud Architect & Senior DevOps Engineer  
**Date**: September 2026  

---

## 1. Feature Ownership Matrix

| Feature | Current Backend | Route(s) | Provider / Library | Database Table(s) | Ready for Cloud Deployment | Production Notes |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **Authentication** | Node / Express (`server.ts`) | `POST /api/auth/supabase-sync`<br>`POST /api/auth/register`<br>`POST /api/auth/login`<br>`GET /api/auth/me`<br>`PUT /api/users/profile`<br>`PUT /api/users/language` | Supabase Auth + `bcryptjs` + `jsonwebtoken` | `users` | **YES** | Cryptographically validates tokens; syncs Google OAuth identities to PostgreSQL. Python backend also implements this route. |
| **Dashboard** | Node / Express (`server.ts`) | `GET /api/dashboard`<br>`POST /api/tasks/toggle` | Node Express | `users`, `products`, `activities` | **YES** | Aggregates business health metrics, action tasks, and recent catalog items with tenant isolation. |
| **Products CRUD** | Node / Express (`server.ts`) | `GET /api/products`<br>`GET /api/products/:id`<br>`POST /api/products`<br>`PUT /api/products/:id`<br>`DELETE /api/products/:id`<br>`POST /api/products/:id/duplicate`<br>`POST /api/products/:id/archive` | Node Express + `pg` | `products`, `activities` | **YES** | Multi-tenant isolation verified by automated tests (`tests/user_isolation.test.ts`). Preserves craftsmanship attributes during duplication. |
| **Product Studio (AI Details)** | Node / Express (`server.ts`) | `POST /api/products/generate-details` | Google Gemini API (`gemini-3.6-flash`) | None (Draft state until saved) | **YES** | Context-aware generation of SEO titles, artisan craft stories, HSN codes, and marketplace readiness scores. |
| **Product Analysis (Photo Vision)** | Node / Express (`server.ts`) | `POST /api/images/analyze` | Google Gemini Multimodal Vision API | None (Ephemeral analysis) | **YES** | Analyzes lighting, background clarity, and product appeal from base64 image buffers. Zero native OpenCV/PaddleOCR needed. |
| **Image Studio** | Node / Express (`server.ts`) | `GET /api/image-studio/operations`<br>`POST /api/image-studio/generate`<br>`POST /api/image-studio/edit`<br>`GET /api/image-studio/history`<br>`POST /api/image-studio/save-to-product`<br>`DELETE /api/image-studio/history/:id` | `GenerationService` + Google Gemini Vision | `image_studio_assets`, `products` | **YES** | Generates white-background studio photos, social marketing cards, and lifestyle assets. **COMPLETELY MISSING IN FASTAPI.** |
| **Pricing Engine** | Node / Express (`server.ts`) | `POST /api/pricing/calculate` | `PricingEngine` | None (Deterministic arithmetic) | **YES** | Exact calculation of direct costs, fair rural labor rate, shipping, platform fees, and wholesale discounts. **COMPLETELY MISSING IN FASTAPI.** |
| **Branding & Identity** | Node / Express (`server.ts`) | `POST /api/products/suggest-brand`<br>`POST /api/products/generate-identity` | Google Gemini API (`gemini-3.6-flash`) | None (Interactive wizard) | **YES** | Contextually suggests craft brand names and regional taglines. *FastAPI returns hardcoded static array (`KalaGram`, etc.).* |
| **AI Mentor** | Node / Express (`server.ts`) | `POST /api/ai/mentor` | Google Gemini API + `aiObservability` | `conversations`, `activities`, `business_profiles` | **YES** | Grounded memory injecting real business profile, product list, and location into prompt. Stores transcript history. |
| **Marketplace Recommendations** | Node / Express (`server.ts`) | `GET /api/marketplace/recommendations`<br>`GET /api/marketplace/destinations` | Node Express | `business_profiles`, `products` | **YES** | Evaluates artisan readiness for ONDC, Amazon Karigar, Meesho, Flipkart, and Etsy. |
| **Marketplace Catalog Export** | Node / Express (`server.ts`) | `POST /api/marketplace/readiness`<br>`POST /api/marketplace/export`<br>`GET /api/marketplace/exports` | `ExcelJS` + CSV Builder with RFC-4180 BOM & formula defense | `marketplace_exports`, `products` | **YES** | Streams binary `.xlsx` workbooks and multi-lingual CSV feeds. **COMPLETELY MISSING IN FASTAPI.** |
| **B2B Quotations** | Node / Express (`server.ts`) | `POST /api/quotations`<br>`GET /api/quotations`<br>`GET /api/quotations/:id`<br>`DELETE /api/quotations/:id`<br>`GET /api/quotations/:id/pdf` | `QuotationService` + `PDFKit` | `quotations` | **YES** | Generates commercial invoices and streams high-resolution vector PDFs with letterhead. **COMPLETELY MISSING IN FASTAPI.** |
| **Payments & Subscriptions** | Node / Express (`server.ts`) | `POST /api/payments/create-order`<br>`POST /api/payments/verify`<br>`GET /api/subscriptions` | Razorpay SDK + HMAC SHA256 verification | `subscriptions` | **YES** | Creates Razorpay order ID and verifies webhooks/client signatures. **COMPLETELY MISSING IN FASTAPI.** |
| **Public Storefront** | Node / Express (`server.ts`) | `GET /api/storefront/:userId`<br>`POST /api/storefront/inquiry` | Node Express | `users`, `products`, `business_profiles` | **YES** | Publicly accessible artisan mini-catalog with inquiry capture. |
| **Voice Transcribe & Respond** | Node / Express (`server.ts`) | `POST /api/voice/transcribe`<br>`POST /api/voice/respond`<br>`POST /api/voice/listen`<br>`GET /api/voice/history`<br>`DELETE /api/voice/history` | Google Gemini Audio + `VoiceService` | `voice_assets` | **YES** | Transcribes Indic vernacular voice audio and persists message exchange. |
| **WhatsApp Webhook** | Python FastAPI (`backend/`) | `GET /webhook/whatsapp`<br>`POST /webhook/whatsapp`<br>`GET /api/whatsapp/status` | Meta Graph API + Google Cloud Chirp 2 | `voice_assets`, `users` | **YES (FastAPI)** | Verifies Meta webhook challenge, processes inbound voice notes via Google Chirp 2 speech adapter. |
| **Government Schemes** | Client-Side / AI Mentor | `GovernmentSchemes.tsx` + `POST /api/ai/mentor` | Verified Indian Govt Portals + Gemini Scheme guidance | None | **YES** | Frontend provides official direct links to PM Vishwakarma, SFURTI, and Stand-Up India. Backend AI mentor provides contextual advice. |

---

## 2. Why Switching `VITE_API_URL` to FastAPI Today Will Break Production

If Vercel's `VITE_API_URL` environment variable were redirected to the Python FastAPI backend today, the following core user flows would immediately crash with **HTTP 404 (Not Found)**:

1. **Image Studio Tab**: Completely non-functional (`/api/image-studio/operations`, `/generate`, `/edit`, `/history` do not exist).
2. **Pricing Tab**: Completely non-functional (`/api/pricing/calculate` does not exist).
3. **B2B Quotations**: Quotation creation and PDF generation would fail (`/api/quotations` and `/api/quotations/:id/pdf` do not exist).
4. **Marketplace Catalog Export**: Exporting XLSX/CSV feeds for Amazon or Meesho would fail (`/api/marketplace/export` does not exist).
5. **Branding & Identity**: Would return static hardcoded mock names (`KalaGram`) instead of dynamic AI generation.

### Conclusion:
**Node/Express (`server.ts`) is the SOLE backend currently capable of powering KRIVIO AI in production.**  
FastAPI must remain a secondary microservice until all missing routers achieve complete functional parity.
