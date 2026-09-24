# KRIVIO AI — Initial Baseline Verification Report
**Date**: September 24, 2026  
**Environment**: Windows 11, Node.js v22+, PostgreSQL 16, Vite 6, React 19

---

## 1. Baseline Test Execution Results

### Check 1: TypeScript Static Typecheck
- **Command**: `npm run lint` (`tsc --noEmit`)
- **Result**: PASSED (Exit code: 0)
- **Output**: 0 type errors across client components, server controllers, adapters, and tests.

### Check 2: Core Security, User Isolation & Marketplace Adapters
- **Command**: `npm run test`
- **Sub-Suites**:
  1. `tests/user_isolation.test.ts`:
     - **Result**: 8/8 PASSED.
     - **Verification**: User B blocked from accessing, deleting, or rendering PDF invoices for User A. Historical price snapshots preserved.
  2. `tests/marketplace_adapters.test.ts`:
     - **Result**: 25/25 PASSED.
     - **Verification**: CSV formula injection prevention (`=`, `+`, `-`, `@`), Indian multi-script preservation (Hindi, Marathi, Tamil, Bengali, Assamese), Amazon XLSX, Meesho CSV, Flipkart CSV, ONDC Beckn protocol, and B2B quotation arithmetic.
  3. `tests/api_integration.test.ts`:
     - **Result**: 18/18 PASSED.
     - **Verification**: Security headers, token forgery defense, registration/login, business profile isolation, product lifecycle, and database persistence.

### Check 3: AI Golden Suite & Live Integration
- **Command**: `npm run test:ai` (`tests/ai_golden_suite.ts`)
- **Result**: PARTIAL / 503 RECOVERY REQUIRED (Exit code: 1)
- **Passes**:
  - Suite 1: Deterministic Pricing Engine (10/10 tests passed)
  - Suite 2: Anti-Placeholder & Domain Validators (2/2 tests passed)
  - Suite 3: Gemini Health Check passed on `gemini-3.6-flash`
- **Failure**:
  - During live Mentor question test, `gemini-3.6-flash` experienced a transient 503 high-demand spike. Because `FALLBACK_MODELS` was hardcoded to only `['gemini-3.6-flash']` and `task_router.ts` line 233 referenced deprecated `gemini-2.5-flash`, the system could not fail over to available `gemini-3.5-flash-lite`.
- **Root Cause**: Lack of multi-model fallback chain in `GeminiService` and deprecated model constant in `task_router.ts`.
- **Next Action**: Configure `FALLBACK_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.6-flash']` and set default model to `gemini-3.6-flash`.

---

## 2. Baseline Summary Matrix

| Baseline Check | Command | Status | Root Cause of Failure | Next Engineering Action |
| :--- | :--- | :--- | :--- | :--- |
| TypeScript Typecheck | `npm run lint` | PASSED | None | Maintain zero-error threshold |
| Security & Isolation | `tsx tests/user_isolation.test.ts` | PASSED | None | Maintain tenant checks |
| Marketplace Feed Adapters | `tsx tests/marketplace_adapters.test.ts` | PASSED | None | Preserve UTF-8 BOM & RFC-4180 |
| E2E API & Database | `tsx tests/api_integration.test.ts` | PASSED | None | Verify table schemas & cascade |
| Deterministic Pricing | `tsx tests/ai_golden_suite.ts` (S1) | PASSED | None | Preserve arithmetic formulas |
| Anti-Placeholder Validator | `tsx tests/ai_golden_suite.ts` (S2) | PASSED | None | Guard against static brand lists |
| Live AI Multimodal Provider | `tsx tests/ai_golden_suite.ts` (S3) | 503 SPIKE | Deprecated model string & single-model fallback array | Implement `gemini-3.5-flash-lite` auto-failover |
