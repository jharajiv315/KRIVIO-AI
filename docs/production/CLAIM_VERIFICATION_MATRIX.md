# KRIVIO AI — Claim Verification Matrix
**Audit Date**: September 24, 2026  
**Auditor**: Principal Production & SRE Architect  
**Objective**: Rigorous, evidence-backed evaluation of all claims made in the previous stabilization reports.

---

## 1. Structured Claim Verification Matrix

| Claim | Evidence Required | Evidence Found | Environment | Status | Contradiction Found | Required Action |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Local build passes** | `npm run build` exits 0; `dist/index.html` and `dist/server.cjs` generated | Exit code 0, Vite transformed 2162 modules, generated 3 client chunks + `dist/server.cjs` (334.9 kB) | Local Node v24.12 | **VERIFIED** | None | Maintain bundle size limits |
| **TypeScript typecheck passes** | `tsc --noEmit` exits 0 with 0 diagnostics | Exit code 0, 0 type errors across all `.ts` and `.tsx` source files | Local Node v24.12 | **VERIFIED** | None | Enforce in CI pipeline |
| **User isolation tests pass** | `tests/user_isolation.test.ts` passes all test cases | Exit code 0; 8/8 tests passed verifying User B blocked from User A quotations, deletion, and PDF rendering | Local Test Runner | **VERIFIED** | None | Retain parameterized SQL queries |
| **Marketplace adapters pass** | `tests/marketplace_adapters.test.ts` passes all test cases | Exit code 0; 25/25 tests passed verifying CSV formula escaping, multi-script UTF-8, and marketplace feeds | Local Test Runner | **VERIFIED** | None | Preserve UTF-8 BOM encoding |
| **Thumbnail resolution passes** | `scratch/test_thumbnail_resolver.mjs` passes all candidate inspections | Exit code 0; 12/12 candidate checks passed (handles strings, objects, JSON strings, and alternate keys) | Local Test Runner | **VERIFIED** | None | Enforce `normalizeCandidateUrl` |
| **Database metrics & exit codes** | `scratch/check_products.mjs` returns exact COUNT and exits with code 1 on DB failure | Exit code 0; reports distinct total inventory (6) vs sample checked (6); exit code 1 on query catch | Local PostgreSQL | **VERIFIED** | Previous script had `process.exitCode = 1` without non-zero exit propagation | Implemented in `scratch/check_products.mjs` |
| **51/51 automated tests passed** | Mathematical reconciliation of test counts across test runners | `npm run test` executes 3 test files: `user_isolation` (8) + `marketplace_adapters` (25) + `api_integration` (18) = 51 tests | Local Test Runner | **VERIFIED** | Previous report listed 51 while also citing other suites without clarifying runner grouping | Published formal reconciliation in Phase 2 |
| **Vercel serverless API compatibility** | Live Vercel `/api/*` endpoints respond with 200 and serve requests | Live fetch to `https://krivio-ai.vercel.app/api/marketplace/destinations` returned HTTP 500 (`Cannot find module '/var/task/server'`) | Vercel Live Production | **CONTRADICTED** | `api/index.ts` used dynamic runtime `import()` which Vercel lambda bundler did not trace into `/var/task` | Replaced dynamic import with static `import app from '../server'` in commit `5af8f17` |
| **AI multi-model failover** | Fast failover under high-demand 503 spikes | Tested live with `@google/genai`; `gemini-3.5-flash-lite` answers in < 15s; automatic failover avoids downtime | Local + Live Gemini API | **VERIFIED** | `gemini-2.5-flash` was deprecated by Google in 2026; single-model fallback caused stalled retries | Updated `DEFAULT_MODEL` to `gemini-3.5-flash-lite` with `gemini-3.6-flash` fallback |
| **Deterministic pricing arithmetic** | Direct costs sum deterministically; price varies by input, not hardcoded | Suite 1 passed (10/10); pricing engine computes exact mathematical prices without reusing static numbers | Local + Engine | **VERIFIED** | None | Preserve `PricingEngine` arithmetic |
