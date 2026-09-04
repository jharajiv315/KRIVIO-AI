# KRIVIO AI — Security Policy

This document outlines the security architecture, data handling practices, vulnerability reporting process, and current security boundaries for the KRIVIO AI repository.

For technical architecture details, see [ARCHITECTURE.md](ARCHITECTURE.md). For feature workflows, see [FEATURES.md](FEATURES.md).

---

## 1. Scope

This security policy applies to:
- The React / TypeScript frontend application (`src/`).
- The Express.js / Node.js API gateway (`server.ts`).
- The FastAPI Python microservice layer (`backend/`).
- The PostgreSQL database schemas and migrations.
- Inbound webhook receivers (Meta WhatsApp Cloud API).

---

## 2. Security Principles

- **Zero Client Secrets:** Sensitive API credentials (Gemini keys, database connection strings, payment secret keys, WhatsApp tokens) are strictly stored server-side in environment variables and never bundled into frontend assets.
- **Strict Tenant Isolation:** All application data is scoped by `user_id`. Direct object references are validated against authenticated session claims before any query or mutation is executed.
- **Cryptographic Verification:** Inbound webhook payloads and payment transactions use cryptographic HMAC-SHA256 signature verification before processing.
- **Ephemeral Audio Lifecycle:** Voice audio buffers are processed in-memory for transcription and discarded immediately. Raw audio files are not permanently stored on the file system or database.

---

## 3. Supported Versions

KRIVIO AI is under active development. Security updates are applied directly to the `main` branch.

| Branch | Status | Supported |
|---|---|---|
| `main` | Active Development | ✅ Supported |
| `< older tags / branches >` | Deprecated | ❌ Not Supported |

---

## 4. Reporting a Vulnerability

We appreciate responsible security disclosure. If you discover a security vulnerability within this repository, please **do not open a public GitHub issue**.

### How to Report
1. Open a **Private Security Advisory** on GitHub via the [Security Advisory tab](https://github.com/jharajiv315/KRIVIO-AI/security/advisories/new).
2. If private advisories are unavailable, contact the project maintainer via GitHub profile communications.

### What to Include in Your Report
- A detailed description of the vulnerability.
- Clear step-by-step instructions or a minimal Proof of Concept (PoC) to reproduce the issue.
- The potential impact of exploitation (e.g., unauthorized data access, privilege escalation).
- Any proposed remediation or patches.

**Important:** Please do not include live user credentials, active production tokens, or private database connection strings in your vulnerability reports.

---

## 5. Secret Management & Environment Variables

- **Configuration:** Environment variables are loaded via `.env` in local environments and via hosting provider secret managers (e.g., Vercel Project Settings) in production.
- **Git Exclusion:** The `.env` file is explicitly ignored in `.gitignore`. Only `.env.example` containing sanitized placeholder strings is committed.
- **Public Client Keys:** Only client-safe public keys (e.g., `VITE_SUPABASE_ANON_KEY`, `VITE_SITE_URL`) are prefixed with `VITE_` for frontend exposure.

---

## 6. Authentication & Authorization

```mermaid
flowchart LR
    Token[Bearer JWT / Supabase OAuth Token] --> Parser[Security Layer: decode_token / resolveUserFromToken]
    Parser --> SigCheck{Cryptographic Signature Check}
    SigCheck -->|Valid| MatchUser[Lookup or Provision User in PostgreSQL]
    SigCheck -->|Invalid / Expired| Reject[HTTP 401 Unauthorized]
    MatchUser --> AuthUser[Authenticated Request Context (req.user)]
```

- **Password Hashing:** Passwords for direct email logins are hashed using **bcrypt** with standard salt rounds (`passlib.context.CryptContext` in Python, `bcryptjs` in Node.js).
- **Session Tokens:** Application JWTs are signed using `HS256` with an expiration window of 7 days (`ACCESS_TOKEN_EXPIRE_MINUTES`).
- **OAuth Identity Mapping:** Supabase OAuth tokens (Google sign-in) are verified and matched against `supabase_user_id` in PostgreSQL.

---

## 7. User Data Isolation & Tenant Boundaries

- **Database Foreign Keys:** All data models (`products`, `business_profiles`, `product_images`, `conversations`, `activities`, `voice_assets`, `subscriptions`) define explicit foreign keys referencing `users.id` with `ON DELETE CASCADE`.
- **Query Scoping:** Service controllers query records filtered by the authenticated user's ID:
  ```python
  # Example from backend/crud/crud_product.py
  def get_by_user_id(db: Session, user_id: str, skip: int = 0, limit: int = 100):
      return db.query(Product).filter(Product.user_id == user_id).offset(skip).limit(limit).all()
  ```
- **Public Storefront Isolation:** The public storefront endpoint `/api/storefront/:id` filters exclusively by `status = 'published'` and strips private contact, email, and subscription metadata.

---

## 8. API & Webhook Security

- **WhatsApp Webhook Verification:**
  - `GET /webhook/whatsapp` verifies Meta's challenge token against `WHATSAPP_VERIFY_TOKEN`.
  - `POST /webhook/whatsapp` verifies payload integrity using the `X-Hub-Signature-256` header calculated with HMAC-SHA256 and `WHATSAPP_APP_SECRET`.
- **Razorpay Signature Verification:** Payment webhooks and verification endpoints calculate and compare HMAC-SHA256 signatures of `razorpay_order_id + "|" + razorpay_payment_id` against `RAZORPAY_KEY_SECRET`.
- **Input Validation:** Request bodies are validated using Pydantic models in FastAPI and TypeScript interfaces with size limits (`25MB`) in Express.

---

## 9. Privacy & Voice Data Handling

- **Consent & Ephemerality:** Spoken audio is converted to Base64 in the browser, transmitted over TLS, transcribed by Gemini multimodal models, and the audio stream is dropped from memory.
- **Voice History Management:** Stored transcripts, intents, and AI responses in `voice_assets` can be permanently deleted by the user via the `DELETE /api/voice/history` endpoint.

---

## 10. Audit Findings & Known Security Limitations

An audit of the codebase identified the following items to be aware of in production deployments:

| Area | Current Implementation | Recommendation for Production |
|---|---|---|
| **CORS Policy** | `allow_origins=["*"]` in FastAPI and `Access-Control-Allow-Origin: *` in Express for seamless local development. | Restrict allowed origins to production domains (e.g., `https://krivio-ai.vercel.app`) in production environments. |
| **Supabase JWT Verification** | If `SUPABASE_JWT_SECRET` is not set, the backend falls back to decoding claims to maintain local developer velocity. | Always configure `SUPABASE_JWT_SECRET` in production `.env` to enforce strict cryptographic signature verification on all OAuth sessions. |
| **Default JWT Secret** | Fallback secret `krivio_secret_key_2026` is used if `JWT_SECRET` is omitted. | Require a random, high-entropy `JWT_SECRET` and fail server startup if not defined. |
| **API Rate Limiting** | Rate limiting is not currently enforced at the application code level. | Deploy reverse-proxy rate limiting (e.g., Cloudflare, Vercel Edge Middleware, or Redis token bucket) on public endpoints. |

---

## 11. Security Roadmap

- [ ] Add strict CORS domain whitelisting based on `NODE_ENV === 'production'`.
- [ ] Enforce startup assertions requiring `JWT_SECRET` and `DATABASE_URL` presence.
- [ ] Implement rate-limiting middleware on AI generation routes (`/api/images/analyze`, `/api/voice/respond`).
- [ ] Add automated dependency vulnerability scanning via GitHub Dependabot.
