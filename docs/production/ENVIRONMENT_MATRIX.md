# KRIVIO AI — Production Environment Variables Matrix

**Document Version:** 1.0.0  
**Phase:** 24 — Deployment Environment Matrix  
**Date:** September 2026  
**Auditor:** Production Engineering & SRE Team  
**Security Classification:** Confidential (Sanitized — Zero Raw Secrets)

---

## 1. Overview

This matrix inventories every environment variable genuinely used by the KRIVIO AI full-stack application (frontend Vite client, Node.js Express server, and Vercel serverless Lambda functions). 

Per production security guidelines, **no raw secret values are printed**.

---

## 2. Environment Variables Matrix

| Variable | Local (`.env`) | Preview / Staging | Production (Vercel) | Required | Secret? | Verified State / Notes |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| `DATABASE_URL` | Configured (`postgresql://...`) | Optional (fallback to local mock if absent) | Configured | **YES** | YES | Used by `pgPool` in `server.ts`. Critical for PostgreSQL persistence of products, quotes, users, and audit logs. |
| `GEMINI_API_KEY` | Configured | Configured | Configured | **YES** | YES | Used by `geminiService` and `GenerationService` for AI Voice Mentor, Multilingual Translation, USP generation, and Image Studio. |
| `VITE_GEMINI_API_KEY` | Configured | Configured | Configured | Optional | YES | Client-side fallback if server-side gateway is bypassed. |
| `SUPABASE_URL` | Configured | Configured | Configured | **YES** | NO | Base URL for Supabase backend and media storage bucket. Fallback hardcoded if missing. |
| `VITE_SUPABASE_URL` | Configured | Configured | Configured | **YES** | NO | Client-side Vite environment variable for Supabase client. |
| `SUPABASE_ANON_KEY` | Configured | Configured | Configured | **YES** | YES (Public) | Standard public anon key for Supabase client authorization. Fallback configured. |
| `VITE_SUPABASE_ANON_KEY` | Configured | Configured | Configured | **YES** | YES (Public) | Client-side Vite anon key for Supabase authentication. |
| `SUPABASE_JWT_SECRET` | Optional | Optional | Configured | Optional | YES | Used by `resolveUserFromToken` in `server.ts` to cryptographically verify Supabase session tokens. |
| `JWT_SECRET` | Configured | Configured | Configured | **YES** | YES | Signs and validates internal JWT tokens for email/password authentication. Defaults to fallback key if missing. |
| `RAZORPAY_KEY_ID` | Configured (`rzp_test_...`) | Configured (`rzp_test_...`) | Configured | Optional | NO (Public) | Public key for Razorpay checkout script on frontend and order creation. Defaults to test ID. |
| `RAZORPAY_KEY_SECRET` | Configured | Configured | Configured | Optional | YES | Used server-side to HMAC-SHA256 verify payment signatures. |
| `APP_URL` | `http://localhost:5173` | Preview URL | `https://krivio-ai.vercel.app` | Optional | NO | Explicit CORS origin whitelist entry in `server.ts`. |
| `VITE_SITE_URL` | `http://localhost:5173` | Preview URL | `https://krivio-ai.vercel.app` | Optional | NO | Frontend site URL for redirects and CORS validation. |
| `GEMINI_MODEL` | `gemini-3.5-flash-lite` | `gemini-3.5-flash-lite` | `gemini-3.5-flash-lite` | Optional | NO | Model selector. Defaults to `gemini-3.5-flash-lite` with automatic fallback to `gemini-3.6-flash`. |
| `WHATSAPP_ACCESS_TOKEN` | Optional | Optional | Configured | Optional | YES | WhatsApp Business Cloud API access token for omni-channel messaging. |
| `WHATSAPP_PHONE_NUMBER_ID`| Optional | Optional | Configured | Optional | NO | WhatsApp Cloud API phone number ID. |
| `WHATSAPP_VERIFY_TOKEN` | Optional | Optional | Configured | Optional | YES | Webhook verification challenge token. |
| `WHATSAPP_GRAPH_API_VERSION`| `v21.0` | `v21.0` | `v21.0` | Optional | NO | Meta Graph API version for WhatsApp integration. |
| `GOOGLE_APPLICATION_CREDENTIALS`| Optional | Optional | Optional | Optional | YES | Service account path for Google Cloud Speech (Chirp 2). |
| `PORT` | `3000` | N/A | N/A (Serverless) | Optional | NO | Server listening port for standalone Node server. Unused on Vercel Serverless. |
| `VERCEL` | Undefined | `1` | `1` | System | NO | Injected by Vercel runtime to detect serverless environment and disable `app.listen()`. |

---

## 3. Security & Isolation Verification

1. **Client Bundle Leak Prevention:** All server secrets (`DATABASE_URL`, `RAZORPAY_KEY_SECRET`, `SUPABASE_JWT_SECRET`, `WHATSAPP_ACCESS_TOKEN`) are strictly scoped to the Node.js backend. None are prefixed with `VITE_` or bundled into client assets.
2. **Serverless Environment Parity:** On Vercel, `process.env.VERCEL = 1` activates the URL normalizer in `server.ts` to map `/api/*` rewrites back to Express routes seamlessly.
