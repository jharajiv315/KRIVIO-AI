# KRIVIO AI — Comprehensive Forensic Audit
**Date**: September 24, 2026  
**Auditor**: Principal Full-Stack & AI Systems Engineering  
**Scope**: Complete Full-Stack Runtime, Frontend, Backend, Database, AI Pipeline, and Security Boundary

---

## 1. Executive Summary & Current Architecture
KRIVIO AI is an enterprise-grade digital empowerment platform tailored for rural Indian artisans, Self-Help Groups (SHGs), and micro-enterprises. It translates traditional craftsmanship into global e-commerce readiness (Amazon, Meesho, Flipkart, ONDC) with multimodal vision inspection, contextual brand name generation, deterministic pricing calculations, and B2B quotation management.

### Full-Stack Topology
- **Client Frontend**: React 19 + TypeScript + Tailwind CSS (v4) + Vite + Framer Motion (`motion`) + Lucide Icons.
- **Node/Express API Gateway**: `server.ts` (3,598 lines) hosting REST endpoints, authentication middleware, database connection pool, rate limiting, and AI orchestration.
- **Python / FastAPI Secondary Service**: `backend/` directory containing SQLAlchemy ORM models, Alembic migrations, and modular endpoints.
- **Serverless Edge Layer**: `api/index.ts` routing Vercel requests dynamically to prebuilt CJS (`dist/server.cjs`) or source server.
- **Database**: PostgreSQL with connection pooling (`pg.Pool`), parameterized queries, JSONB storage for arrays, and ACID transaction safety.
- **AI Engine**: Google Gemini API via official `@google/genai` SDK v2 utilizing `gemini-3.6-flash` and `gemini-3.5-flash-lite`, with structured output validation, multimodal buffer analysis, and deterministic domain validators.

---

## 2. Actual Implemented Features vs. Gaps

| Feature Domain | Implemented Capabilities | Identified Deficiencies & Edge Cases |
| :--- | :--- | :--- |
| **Authentication & Identity** | Dual-mode auth: Supabase OAuth sync (`/api/auth/supabase-sync`), local bcrypt password auth (`/api/auth/register`, `/api/auth/login`), signed JWT session tokens, profile persistence. | Potential token confusion if legacy mock keys are passed; need strict verification without defaulting to hardcoded demo profiles. |
| **Product CRUD & Studio** | Complete lifecycle (create, read, update, delete, duplicate, archive). Rich craftsmanship schema (HSN, wholesale price, MRP, MOQ, lead time, craft story). | Product image parsing previously assumed `rawImageUrls[0]` was a string without checking nested objects (`{ url }`) or empty values. |
| **Multimodal Vision AI** | `/api/images/analyze` routes base64 payload to `PHOTO_DIAGNOSIS` & `PRODUCT_ANALYSIS` using genuine Gemini vision models without canned mock fallbacks. | Model version mismatch: `gemini-2.5-flash` had been deprecated by Google in 2026, causing 404s; fallback needed updating to `gemini-3.5-flash-lite`. |
| **B2B Quotations & Invoicing** | `/api/quotations` with decimal-safe calculations, wholesale volume tier discounts, buyer info validation, and PDFKit binary rendering (`/api/quotations/:id/pdf`). | Tenant isolation must be strictly enforced on quotation PDF downloads (already verified by automated tests). |
| **Marketplace Adapters & Readiness** | Feed generators for Amazon (XLSX), Meesho (CSV), Flipkart (CSV), and ONDC Beckn Retail Protocol. Automated formula injection escaping. | Batch readiness evaluation requires safe handling of optional fields (dimensions, weight). |
| **Deterministic Pricing Engine** | Mathematical pricing breakdown (`PricingEngine`) preventing arbitrary identical prices. Direct costs sum deterministically; platform commissions factored. | Fallback when AI explanation fails must retain arithmetic breakdown without throwing 500. |
| **Thumbnail & Craft Resolver** | `productThumbnail.ts` contextually resolves authentic photography for Indian crafts based on title, category, material, and description. | Incomplete image collection searching: failed when images were stored as objects or in alternate keys (`photos`, `gallery`, `thumbnail_url`). |

---

## 3. High-Risk Defects & Root Causes (The "CodeRabbit" & Systematic Defect Classes)

### Defect Class 1: Process Exit & Sample Count Distortion in Scripts (`scratch/check_products.mjs`)
- **Root Cause**: Scripts caught database errors with `console.error` and set `process.exitCode = 1` or swallowed errors, and limited query samples (`LIMIT 10`) were prone to being reported as total inventory counts.
- **Fix**: Propagate errors cleanly with explicit `process.exit(1)`, perform distinct `COUNT(*)` queries, and label sample inspections clearly.

### Defect Class 2: Unsafe String Methods on Unvalidated Types (`server.ts` & Scripts)
- **Root Cause**: Code called `.includes('example.com')` or `.includes('placeholder')` directly on raw array elements or request parameters assuming they are strings. If an image was an object `{ url: '...' }` or null, it threw an unhandled TypeError.
- **Fix**: Centralize URL normalization (`normalizeImageUrl`) ensuring input is non-null string before calling `.includes()` or regex operations.

### Defect Class 3: Incomplete Image Collection Inspection (`productThumbnail.ts`)
- **Root Cause**: `getDirectProductPhoto` checked only `product.imageUrls`, `product.image_urls`, `product.imageUrl`, and `product.images`. It failed to inspect `photos`, `gallery`, `media`, `thumbnail`, `thumbnail_url`, `original_image`, or nested URL properties (`img.secure_url`, `img.src`, `img.path`).
- **Fix**: Recursively and exhaustively search all known image fields, object shapes, and serialized JSON strings, normalizing every candidate through `isValidImageUrl`.

### Defect Class 4: AI Model Deprecation & Outdated Identifier Reference
- **Root Cause**: `task_router.ts` and `gemini_client.ts` referenced legacy model strings (`gemini-2.5-flash`), which Google deprecated in 2026 with a 404 response. When `gemini-3.6-flash` encountered temporary load spikes (503), no valid alternate model was available.
- **Fix**: Configure `DEFAULT_MODEL = 'gemini-3.6-flash'` and `FALLBACK_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.6-flash']`, providing immediate zero-latency fallback under demand spikes.

---

## 4. Multi-Tenant User Isolation & Security Posture
- All user-owned entities (`products`, `business_profiles`, `quotations`, `image_studio_history`) enforce `WHERE user_id = $auth_user_id`.
- Automated test suite `tests/user_isolation.test.ts` validates that User B cannot read, mutate, delete, or generate PDFs for User A's resources.
- JWT tokens are validated against `JWT_SECRET` with signature verification; forged signatures are rejected with HTTP 401.
- CSV/XLSX export routines in `src/server/marketplace/adapters/csv_safety.ts` escape dangerous formula prefixes (`=`, `+`, `-`, `@`) to block CSV injection.
