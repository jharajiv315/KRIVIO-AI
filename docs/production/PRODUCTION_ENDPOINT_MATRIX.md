# KRIVIO AI — Production Endpoint Verification Matrix

**Document Version:** 1.0.0  
**Phase:** 25 — Production API Inventory & Endpoint Verification  
**Date:** September 2026  
**Auditor:** Production Engineering & SRE Team  

---

## 1. Overview

This matrix inventories all critical API endpoints implemented in `server.ts` and exposed via the Vercel serverless gateway (`/api/(.*)` rewrite to `api/index.ts`). Every endpoint is mapped with authentication requirements, database side effects, external provider integrations, and error handling behaviors.

---

## 2. API Endpoint Matrix

| Method | Endpoint | Auth Required | Production Tested | Status | Expected Response | Actual Response | DB Effect | External Provider | Error Handling |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/ping` | No | Yes | **VERIFIED** | `{ status: 'ok', runtime: 'vercel-serverless' }` | `200 OK` (JSON) | None | None | 500 error boundary |
| `GET` | `/api/ai/health` | No | Yes | **VERIFIED** | Model health status, latency, fallback status | `200 OK` (JSON) | None | Gemini API (`gemini-3.5-flash-lite`) | Catches quota/network errors, returns degraded state |
| `GET` | `/api/marketplace/destinations` | No | Yes | **VERIFIED** | List of supported channels (`amazon`, `meesho`, `flipkart`, `ondc`) | `200 OK` (JSON) | None | None | Deterministic JSON dictionary |
| `POST` | `/api/marketplace/validate` | No | Yes | **VERIFIED** | Canonical product validation results per marketplace | `200 OK` (JSON) | None | None | Schema validation error array with field paths |
| `POST` | `/api/marketplace/export` | No | Yes | **VERIFIED** | Destination-specific formatted product payload | `200 OK` (JSON) | None | None | Field mapping error details |
| `POST` | `/api/marketplace/bulk-export` | No | Yes | **VERIFIED** | Batch export package with per-product validation | `200 OK` (JSON) | None | None | Per-item error isolation |
| `POST` | `/api/auth/register` | No | Yes | **VERIFIED** | New user record + JWT session token | `201 Created` | `INSERT users` | None | Duplicate email check (409 Conflict), bcrypt hashing |
| `POST` | `/api/auth/login` | No | Yes | **VERIFIED** | Authenticated user profile + JWT token | `200 OK` | `SELECT users` | None | Constant-time password comparison, 401 on mismatch |
| `GET` | `/api/auth/me` | Bearer Token | Yes | **VERIFIED** | Authenticated user object | `200 OK` | `SELECT users` | Supabase OAuth fallback | 401 Unauthorized if token invalid/expired |
| `GET` | `/api/products` | Bearer Token | Yes | **VERIFIED** | Isolated array of user-owned products | `200 OK` (Array) | `SELECT products WHERE user_id = $1` | None | Enforces strict tenant isolation; 401 if unauthenticated |
| `POST` | `/api/products` | Bearer Token | Yes | **VERIFIED** | Created product with auto-generated ID & thumbnail | `201 Created` | `INSERT products` | Supabase Storage (images) | Auto-extracts thumbnails via `normalizeCandidateUrl` |
| `GET` | `/api/products/:id` | Bearer Token | Yes | **VERIFIED** | Product details | `200 OK` | `SELECT products` | None | Returns 404/403 if product belongs to another user |
| `PUT` | `/api/products/:id` | Bearer Token | Yes | **VERIFIED** | Updated product | `200 OK` | `UPDATE products WHERE user_id = $1` | None | Enforces user ownership; 403 Forbidden on mismatch |
| `DELETE`| `/api/products/:id` | Bearer Token | Yes | **VERIFIED** | `{ success: true }` | `200 OK` | `DELETE products WHERE user_id = $1` | None | Safe cascade / isolated deletion |
| `POST` | `/api/ai/analyze-product` | Bearer Token | Yes | **VERIFIED** | Vision extraction: materials, craft category, colors | `200 OK` | Optional audit log | Gemini Vision (`gemini-3.5-flash-lite`) | Fallback to contextual heuristic if API key quota exceeded |
| `POST` | `/api/ai/pricing-suggestions`| Bearer Token | Yes | **VERIFIED** | Deterministic breakdown: material, labor, markup, MSP | `200 OK` | None | Gemini + PricingEngine | Fallback to deterministic formula on timeout |
| `POST` | `/api/ai/generate-usp` | Bearer Token | Yes | **VERIFIED** | Product-specific USPs, taglines, story angles | `200 OK` | None | Gemini 3.5 | Clean JSON extraction; handles markdown fences |
| `POST` | `/api/ai/image/generate` | Bearer Token | Yes | **VERIFIED** | Enhanced product image URL + operation metadata | `200 OK` | Optional image audit | Gemini Imagen 3 / Composition | Validates aspect ratio, returns truthful error on failure |
| `POST` | `/api/payment/create-order` | Bearer Token | Yes | **VERIFIED** | Razorpay order ID, currency, amount | `200 OK` | `INSERT orders` | Razorpay API / Test Mode | 500 with sanitized message if secret key misconfigured |
| `POST` | `/api/payment/verify` | Bearer Token | Yes | **VERIFIED** | Payment confirmation status | `200 OK` | `UPDATE orders, UPDATE users` | Razorpay HMAC-SHA256 | Validates signature server-side; rejects client spoofing |
| `GET` | `/api/whatsapp/webhook` | Query Token | Yes | **VERIFIED** | `hub.challenge` string | `200 OK` | None | Meta Graph API | 403 Forbidden if verify token does not match |
| `POST` | `/api/whatsapp/webhook` | Webhook Sig | Yes | **VERIFIED** | `{ status: 'received' }` | `200 OK` | `INSERT messages` | Meta Cloud API | Signature verification, asynchronous dispatch |
