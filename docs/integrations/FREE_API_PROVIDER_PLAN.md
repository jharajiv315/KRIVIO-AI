# KRIVIO AI — Free & Low-Cost External API Provider Strategy

**Project**: KRIVIO AI  
**Scope**: Zero / Low-Cost Sustainable Infrastructure for Rural Artisan Empowerment  
**Design Principle**: Architect interchangeable provider boundaries; do not lock business logic into a single proprietary API.

---

## 1. Provider Evaluation & Strategy Matrix

| Feature | Recommended Provider | Alternative Provider | Verified Free Tier / Quota | Rate Limits & Constraints | Key Creation URL | Required Environment Variable | Fallback Strategy | Expected Cost After Free Tier |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Multimodal Product Vision Analysis** | **Google Gemini (`gemini-3.6-flash`)** | Google Gemini (`gemini-3.5-flash-lite`) | 15 RPM / 1,500 RPD / 1M TPM on Google AI Studio Free Tier | Non-commercial evaluation / standard rate throttles | [Google AI Studio](https://aistudio.google.com/app/apikey) | `GEMINI_API_KEY` | Immediate automatic failover to `gemini-3.5-flash-lite` | Pay-as-you-go (~$0.075 / 1M input tokens) |
| **Fast Intent & Conversational Guidance** | **Google Gemini (`gemini-3.5-flash-lite`)** | Groq Cloud (Llama 3.3 70B) | Gemini: 30 RPM / 1M TPM. Groq: 30 RPM / 14,400 RPD | Free tier requires payload within token windows | [Groq Console](https://console.groq.com/keys) | `GEMINI_API_KEY` / `GROQ_API_KEY` | Failover to deterministic rules & structured responses | Gemini: ~$0.05 / 1M tokens. Groq: ~$0.59 / 1M tokens |
| **Image Storage & Transformation** | **Cloudinary** | Local Data URI / S3 | 25 monthly credits (25 GB storage / net bandwidth) | File size limits on free plan (10MB per image) | [Cloudinary Console](https://cloudinary.com/console) | `CLOUDINARY_URL` | Base64 inline storage with PostgreSQL byte/text storage | $89/mo for Plus tier or AWS S3 pay-as-you-go ($0.023/GB) |
| **Database & Managed PostgreSQL** | **Supabase / Neon** | Local PostgreSQL | 500 MB database storage, 50,000 monthly active users | Inactivity pause on some free plans if idle > 7 days | [Supabase Dashboard](https://supabase.com/dashboard) | `DATABASE_URL` | Local PostgreSQL pool (`pg.Pool`) with auto-reconnect | $25/mo Pro tier |
| **Authentication & OAuth** | **Supabase Auth** | Built-in JWT + bcrypt | Unlimited social logins & 50,000 MAU on free tier | Standard rate limit on OTP / email triggers | [Supabase Dashboard](https://supabase.com/dashboard) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Fallback to secure server bcrypt `/api/auth/login` | Included in Supabase free tier |
| **Indian Domestic Payments (UPI / Cards)** | **Razorpay** | Cash on Delivery / Direct UPI QR | Unlimited sandbox testing mode; 0 fixed monthly fee | Standard Indian RBI / KYC verification for live merchant ID | [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys) | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Fast direct UPI link generation & test simulation | 2% + GST per successful domestic transaction |

---

## 2. Gemini Multi-Model Failover Architecture

```
                      ┌────────────────────────────────┐
                      │  AI Request (TaskRouter)       │
                      └──────────────┬─────────────────┘
                                     │
                                     ▼
                      ┌────────────────────────────────┐
                      │  Primary: gemini-3.6-flash     │
                      └──────────────┬─────────────────┘
                                     │
                        (503 Spike / Rate Limit / Timeout)
                                     │
                                     ▼
                      ┌────────────────────────────────┐
                      │  Fallback 1: gemini-3.5-flash-lite│
                      └──────────────┬─────────────────┘
                                     │
                                (Failover)
                                     │
                                     ▼
                      ┌────────────────────────────────┐
                      │  Domain Validator &            │
                      │  Deterministic Calculation     │
                      └────────────────────────────────┘
```

---

## 3. Secret Management & OWASP Rules
1. **Zero Secret Leakage**: No secret (`GEMINI_API_KEY`, `RAZORPAY_KEY_SECRET`, `JWT_SECRET`, `DATABASE_URL`) may ever be prefixed with `VITE_` or `NEXT_PUBLIC_` unless specifically intended for client public consumption (such as `VITE_SUPABASE_ANON_KEY`).
2. **Environment Variable Injection**: All keys reside in server environment configuration. Client sends authenticated requests via `Authorization: Bearer <jwt>`.
3. **Template Placeholders**: `.env.example` provides documentation templates without exposing real API secrets.
