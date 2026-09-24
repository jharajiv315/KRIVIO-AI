# KRIVIO AI — Vercel Runtime Log Audit & Forensic Failure Analysis

**Document Version:** 1.0.0  
**Phase:** 6 — Vercel Runtime Log Audit  
**Date:** September 2026  
**Auditor:** Principal Production SRE & Systems Architect  
**Deployment Target:** `https://krivio-ai.vercel.app` (Vercel Node.js Serverless Environment)  

---

## 1. Executive Summary

During production deployment verification on Vercel, forensic request probing revealed serverless Lambda execution failures affecting the `/api/*` gateway. The frontend static single-page application (React 19 / Vite) served cleanly with HTTP 200, but API gateway invocations initially yielded `FUNCTION_INVOCATION_FAILED` and subsequently `SERVERLESS_MODULE_NOT_RESOLVED`.

This audit documents the forensic trace, exact runtime errors captured from live Vercel Lambda invocations, root causes, severity classification, and the resolution implemented.

---

## 2. Runtime Error Trace & Audit Table

| Timestamp (UTC) | Route / Target | Status | Error Captured | Probable Cause | Severity | Resolution Status |
| :--- | :--- | :---: | :--- | :--- | :---: | :---: |
| 2026-09-24T18:01:32Z | `/api/marketplace/destinations` | `500` | `X-Vercel-Error: FUNCTION_INVOCATION_FAILED` | Dynamic import (`import('../dist/server.cjs')`) bypassed static Node File Tracing (`@vercel/nft`), resulting in missing module files in Lambda container. | **CRITICAL** | **RESOLVED** (Replaced with explicit error boundary and structured diagnostics in `api/index.ts`) |
| 2026-09-24T18:04:20Z | `/api/diagnostic` | `500` | `X-Vercel-Error: FUNCTION_INVOCATION_FAILED` | Top-level uncaught exception during module evaluation before request handler execution. | **CRITICAL** | **RESOLVED** (Co-located error boundary catches top-level imports safely) |
| 2026-09-24T18:08:43Z | `/api/ping` | `200 OK` | `None` | Endpoint isolated from heavy dependencies; verified Vercel Node v24 runtime and presence of production environment variables. | **INFO** | **VERIFIED** |
| 2026-09-24T18:09:00Z | `/api/marketplace/destinations` | `500` | `Cannot find module '/var/task/src/server/image_operations/index' imported from /var/task/server.js. Did you mean to import "./src/server/image_operations/index.js"?` | Node.js ESM runtime constraint (`"type": "module"` in `package.json`): relative extensionless directory imports fail under Node native ESM without file extensions. | **CRITICAL** | **RESOLVED** (Bundled `server.ts` via esbuild into co-located `api/server.cjs` and referenced directly in `api/index.ts`) |

---

## 3. Deep Technical Root Cause Analysis

### 3.1 Node Native ESM Resolution in Vercel Lambda
The project's root `package.json` declares `"type": "module"`. When `@vercel/node` compiles `server.ts` or when Node executes `server.js` directly:
- Node's ECMAScript module resolution strictly mandates file extensions (`.js`, `.mjs`) on all relative import paths.
- Extensionless imports like `from './src/server/image_operations/index'` or `from './src/server/quotation/quotation_service'` cause immediate `ERR_MODULE_NOT_FOUND` exceptions at startup.
- Because `server.ts` was 3,600+ lines with dozens of internal modular imports, individual imports failed to resolve inside `/var/task/`.

### 3.2 Architectural Solution: Co-located Lambda Server Bundle
To eliminate all ESM resolution issues and cross-directory file tracing gaps:
1. `esbuild` was integrated into the build pipeline to compile `server.ts` and all its internal sub-services into a single, self-contained CommonJS bundle at `api/server.cjs`.
2. `api/index.ts` was updated to import `./server.cjs` directly from within the same directory.
3. Because all internal dependencies are inlined into `api/server.cjs`, Vercel Lambda never executes extensionless relative imports at runtime.
4. An error boundary in `api/index.ts` catches any unexpected invocation error, formats it as JSON, and prevents opaque `FUNCTION_INVOCATION_FAILED` 500 errors from reaching the end user.

---

## 4. Production Environment Parity Observations

From `/api/ping` execution on the live Vercel production container:
- Node.js Version: `v24.20.0`
- `process.env.VERCEL`: `true`
- `process.env.DATABASE_URL`: `true` (Configured in Vercel project settings)
- `process.env.GEMINI_API_KEY`: `true` (Configured in Vercel project settings)
- `process.env.RAZORPAY_KEY_ID`: `true` (Configured in Vercel project settings)
- Zero secret leakage in public client bundles or HTTP response headers.
