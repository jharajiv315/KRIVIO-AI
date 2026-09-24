# KRIVIO AI — Comprehensive Test Strategy & Plan

**Project**: KRIVIO AI  
**Scope**: Full-Stack Testing Pyramid (Unit, Integration, Security/Isolation, AI Multimodal, Marketplace & E2E)

---

## 1. Testing Pyramid Architecture

```
                   ┌──────────────────────────────────────┐
                   │           E2E System Tests           │
                   │   (API Lifecycle, User Isolation,    │
                   │    Marketplace Feeds, PDF Invoicing) │
                   └──────────────────┬───────────────────┘
                                      │
                   ┌──────────────────┴───────────────────┐
                   │       AI Golden Suite & Live API     │
                   │  (Multimodal Vision, Anti-Placeholder│
                   │   Deterministic Pricing, Dynamic Br.)│
                   └──────────────────┬───────────────────┘
                                      │
                   ┌──────────────────┴───────────────────┐
                   │      Unit & Arithmetic Calculators   │
                   │  (PricingEngine, Quotation Maths,    │
                   │   CSV Injection Sanitizer, Thumbnail)│
                   └──────────────────────────────────────┘
```

---

## 2. Test Suites & Commands

### Suite 1: TypeScript Compilation & Static Typecheck
- **Command**: `npm run lint` (`tsc --noEmit`)
- **Coverage**: All `.ts` and `.tsx` source files in `src/`, `server.ts`, and `tests/`.

### Suite 2: Security & Tenant Isolation
- **Command**: `tsx tests/user_isolation.test.ts`
- **Coverage**:
  - User A creates private quotations, business profiles, and products.
  - User B is blocked from reading, mutating, deleting, or rendering PDF invoices for User A.
  - Database queries enforce parameterized `WHERE id = $1 AND user_id = $2`.

### Suite 3: Marketplace Feeds & B2B Invoicing
- **Command**: `tsx tests/marketplace_adapters.test.ts`
- **Coverage**:
  - CSV formula injection protection (`=`, `+`, `-`, `@`).
  - Indian multi-script preservation (Hindi, Marathi, Tamil, Bengali, Assamese).
  - Amazon XLSX, Meesho CSV, Flipkart CSV, and ONDC Beckn payloads.
  - B2B volume-tiered pricing arithmetic and PDFKit binary rendering.

### Suite 4: End-to-End API & Database Integration
- **Command**: `tsx tests/api_integration.test.ts`
- **Coverage**:
  - Ephemeral test HTTP server lifecycle.
  - Security headers (OWASP nosniff, SAMEORIGIN, strict-origin-when-cross-origin).
  - JWT forgery rejection and password authentication.
  - Product duplication with craftsmanship preservation.

### Suite 5: AI Golden Suite & Multimodal Verification
- **Command**: `npm run test:ai` (`tsx tests/ai_golden_suite.ts`)
- **Coverage**:
  - Exact deterministic pricing arithmetic (`PricingEngine`).
  - Anti-placeholder domain validator rejecting canned static brand lists.
  - Live Gemini API health check and multi-model failover (`gemini-3.5-flash-lite` -> `gemini-3.6-flash`).
  - Contextual distinction for different craft categories (brass lamp vs ceramic mug).
