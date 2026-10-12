# KRIVIO AI — Business Model & Plan Specification
**Document Version:** 1.0.0 (Production Release Candidate)  
**Author:** Payments & SaaS Monetization Engineering  
**Scope:** Plan Catalogue, Tier Entitlements, Billing Semantics & Allowance Governance  

---

## 1. Executive Summary

KRIVIO AI provides an AI-powered operating system for rural Indian artisans, Self-Help Groups (SHGs), and micro-enterprises transitioning from local trade to national and global commerce. The commercial model balances financial viability, fair access for micro-entrepreneurs, and strict cost controls on paid model providers (Google Gemini, Imagen, Google Speech).

### Core Principles
1. **Zero Client Trust:** Frontend state never dictates entitlements, pricing, or balances. The PostgreSQL backend acts as the sole source of truth.
2. **Prepaid 30-Day Passes (Manual Renewal):** Avoid forced recurring credit-card debits unfamiliar to rural micro-entrepreneurs. Period lasts exactly 30 days from confirmation. Early renewal retains all remaining paid access.
3. **Graceful Free Tier:** Free tier retains full read/update/export/delete access to existing products, with strict creation quotas (5 products max) and metered AI usage (10 requests/month).
4. **Zero-Charge Fallbacks:** If generative AI fails or produces studio canvas compositions (`krivio-studio-engine`), zero AI credits are deducted.

---

## 2. Canonical Plan Catalogue

| Parameter | Artisan Free (`free`) | Artisan Pro (`artisan_pro`) | SHG Growth (`shg_growth`) |
| :--- | :--- | :--- | :--- |
| **Price** | ₹0 | ₹299 (29,900 paise) | ₹999 (99,900 paise) |
| **Duration** | Perpetual monthly cycle | 30 days prepaid (manual renewal) | 30 days prepaid (manual renewal) |
| **Seats** | 1 user | 1 user | Up to 3 workspace members |
| **Product Limit** | 5 active products | 100 active products | 300 organization products |
| **AI Text / Mentor** | 10 ops / monthly cycle | 75 ops / 30-day period | 250 ops / 30-day period |
| **AI Image Generations**| 0 paid generative credits | 5 paid generative credits | 20 paid generative credits |
| **Quotation Tool** | 2 wholesale trial quotations | Unlimited wholesale quotes | Unlimited wholesale quotes |
| **PDF Downloads** | Basic download | Professional B2B PDF download | Professional B2B PDF download |
| **Image Studio** | Basic composition canvas | Generative AI + Studio | Generative AI + Studio |
| **Storefront** | Basic public store | Branded custom storefront | Organization storefront |
| **Checkout Mode** | Free registration | Self-service Razorpay | Assisted enterprise enquiry |

---

## 3. Allowance & Reset Policies

### 3.1 Free Tier (Artisan Free)
- **Cycle Duration:** Account-anchored 30-day rolling cycle.
- **Product Cap:** 5 products. Attempting a 6th product returns HTTP 403 `PRODUCT_LIMIT_REACHED`. Deleting an existing product restores capacity.
- **AI Allowance:** 10 successful completions. Exhaustion returns HTTP 403 `QUOTA_EXHAUSTED` with reset timestamp.
- **Data Protection:** Expired/capped users retain 100% read, edit, delete, and export permissions on existing data.

### 3.2 Paid Tier (Artisan Pro)
- **Activation Timestamp:** Persisted in UTC immediately upon gateway signature verification.
- **Expiration:** UTC timestamp `start_date + INTERVAL '30 days'`.
- **Early Renewal Extension:** When renewing before expiration:
  $$\text{new\_end\_date} = \text{current\_end\_date} + 30\text{ days}$$
  Ensures customers never lose already-paid remaining days.
- **Credit Packs (Post-Launch Staging):** Optional top-up packs (5 images for ₹129, 15 images for ₹329) defined in catalogue but disabled (`purchaseEnabled: false`) until multi-week provider cost measurements finalize.

### 3.3 Enterprise / Collective Tier (SHG Growth)
- **Status:** Staged in canonical catalogue with self-service disabled (`enquiryRequired: true`).
- **Call-to-Action:** "Enquire About Group Access" modal routing to enterprise support.
- **Policy:** Never charge users for multi-tenant features before workspace isolation passes formal pen-testing.

---

## 4. Anti-Abuse & Integrity Guarantees

1. **Client Amount Tampering:** Backend completely ignores client-supplied `amount` parameters during order generation. It pulls strictly from `PLAN_CATALOGUE['artisan_pro'].pricePaise`.
2. **Replay Protection:** Razorpay payment IDs are unique-constrained in `subscriptions` and `payment_orders`. A malicious user cannot reuse another user's payment ID.
3. **HMAC Signature Integrity:** Razorpay orders and webhook payloads are validated using timing-safe comparisons (`crypto.timingSafeEqual`) against `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET`.
