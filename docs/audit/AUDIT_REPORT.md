# KRIVIO AI — Master Engineering & Security Audit Report

**Audit Date:** 2026-10-11  
**Lead Auditor:** Principal Engineering & Application Security Review Team  
**Scope:** Architecture, Identity & Auth, Payment Security, Database Transport, API Boundaries, Data Integrity, and UX Credibility  
**Target Platform:** KRIVIO AI (`https://krivio-ai.vercel.app/`)  
**Commit Baseline:** `7c8ce83` (Phase 1 PWA Hardened)

---

## 1. Executive Summary

A comprehensive forensic audit of the `KRIVIO-AI` codebase was performed across security, identity authorization, payment workflows, database connectivity, and product data integrity.

### Critical Verdict:
While the frontend interface and AI inference modules perform well in isolation, **two critical security vulnerabilities** were confirmed that require immediate remediation before any visual or feature modernization:
1. **Critical Authentication Bypass / Account Takeover** in `POST /api/auth/supabase-sync`: The route accepts unauthenticated client-supplied emails and issues valid, signed 7-day application JWTs without cryptographically validating the Supabase access token.
2. **Payment Verification Bypass / Free Privilege Escalation**: The subscription verification endpoint permits bypassing payment verification and upgrading users to Pro with simulated or fabricated payment IDs.

In addition, several high- and medium-severity security and data-integrity defects were confirmed:
- Wildcard CORS regex matching any arbitrary `.vercel.app` domain with `credentials: true`.
- Sensitive internal stack traces and resolution errors returned in serverless 500 error responses (`api/index.ts`).
- Public storefront inquiry endpoint subject to unauthenticated activity feed poisoning.
- Misleading dashboard health score defaulting to 80% when zero (`0 || 80`).
- Fictitious marketplace readiness checks using phone numbers as proxies for bank accounts.

---

## 2. Prioritized Issue Register

| ID | Area | Severity | Classification | Status | Target File(s) |
|---|---|---|---|---|---|
| **SEC-01** | Auth / Identity | **Critical** | Confirmed Defect | **Remediated & Verified** | `server.ts`, `src/services/api.ts`, `src/context/AuthContext.tsx` |
| **SEC-02** | Payments | **Critical** | Confirmed Defect | **Remediated & Verified** | `server.ts`, `src/components/PricingModal.tsx`, `src/components/SubscriptionView.tsx` |
| **SEC-03** | Secrets & JWT | **High** | Confirmed Defect | **Remediated & Verified** | `server.ts`, `.env` |
| **SEC-04** | Database SSL | **High** | Probable Risk | **Preserved Strict SSL** | `server.ts` |
| **SEC-05** | CORS / Network | **High** | Confirmed Defect | **Remediated & Verified** | `server.ts` |
| **SEC-06** | API Boundaries | **Medium** | Confirmed Defect | **Remediated & Verified** | `server.ts`, `src/components/PublicStorefront.tsx` |
| **SEC-07** | Error Disclosure | **Medium** | Confirmed Defect | **Remediated & Verified** | `api/index.ts` |
| **PROD-01**| UX Metrics | **Medium** | Confirmed Defect | **Remediated & Verified** | `src/components/Dashboard.tsx` |
| **PROD-02**| Marketplace Rules| **Medium** | Confirmed Defect | **Remediated & Verified** | `src/components/MarketplaceReadiness.tsx` |
| **PROD-03**| Marketing Claims| **Low** | Claim Discrepancy| **Remediated & Verified** | `src/components/LandingPage.tsx` |

---

## 3. Deep-Dive Findings

### SEC-01: Critical Unauthenticated Account Takeover via `POST /api/auth/supabase-sync`
- **Location:** `server.ts` (lines 405–446)
- **Evidence:**
  ```ts
  app.post('/api/auth/supabase-sync', async (req: Request, res: Response) => {
    const { supabase_user_id, email, full_name, name, ... } = req.body;
    ...
    let existingRes = await queryPg(
      `SELECT * FROM users WHERE supabase_user_id = $1 OR (email IS NOT NULL AND LOWER(email) = LOWER($2)) LIMIT 1`,
      [subId || '', userEmail]
    );
    ...
    const token = jwt.sign(
      { id: user.id, sub: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  ```
- **Root Cause:** The endpoint blindly trusts JSON body parameters (`email`, `supabase_user_id`) without requiring or verifying a cryptographic identity proof from Supabase Auth.
- **User Impact:** Any anonymous user can send `{ "email": "victim@artisan.org" }` and receive a valid 7-day bearer token for that account, seizing full control of products, private orders, business profiles, and quotations.
- **Remediation Plan:**
  1. Require the Supabase access token from `Authorization: Bearer <token>` or `req.body.access_token`.
  2. Verify the token server-side via `supabaseServerClient.auth.getUser(token)`.
  3. Derive user ID, email, and identity claims strictly from the trusted Supabase identity payload.
  4. Reject unverified requests with HTTP 401 Unauthorized.
  5. Never allow client-supplied `role` to elevate permissions.

---

### SEC-02: Payment Verification Bypass & Simulated Pro Escalation
- **Location:** `server.ts` (lines 2869–2923), `src/components/PricingModal.tsx` (lines 106–108), `src/components/SubscriptionView.tsx` (lines 28–31)
- **Evidence:**
  ```ts
  // In server.ts:
  } else if (process.env.NODE_ENV === 'production' && !razorpaySignature) {
    res.status(400).json({ error: 'Missing payment signature for verification.' });
    return;
  }
  // Inserts Pro subscription in DB!
  ```
- **Root Cause:** Verification falls through to granting Pro status if `NODE_ENV !== 'production'` or if `RAZORPAY_KEY_SECRET` is unset. Client components include "Simulate Upgrade" and fallback flows that generate fake IDs like `pay_${Date.now()}` and pass them to the verification route.
- **User Impact:** Commercial integrity loss: any artisan or external visitor can grant themselves lifetime/monthly Pro subscriptions without paying.
- **Remediation Plan:**
  1. Require authoritative HMAC-SHA256 signature verification matching server-tracked orders (`crypto.timingSafeEqual`).
  2. Fail securely if Razorpay credentials are unset: return HTTP 503 "Payment service unavailable".
  3. Strip simulated upgrade buttons and fake payment IDs from `PricingModal.tsx` and `SubscriptionView.tsx`.

---

### SEC-03: Insecure JWT Fallback Secret
- **Location:** `server.ts` (line 50), `.env` (line 12)
- **Evidence:**
  ```ts
  const JWT_SECRET = process.env.JWT_SECRET || 'krivio_secret_key_2026';
  ```
- **Root Cause:** Public fallback strings in code and placeholder secrets in `.env` (`"krivio_secret_key_change_in_production"`).
- **Remediation Plan:** Enforce managed `JWT_SECRET` in environment variables. If missing or default in production, refuse startup or generate a secure cryptographic random ephemeral secret per process.

---

### SEC-04: Remote Database Connection Disables Certificate Verification
- **Location:** `server.ts` (line 38)
- **Evidence:**
  ```ts
  ssl: isRemoteDb ? { rejectUnauthorized: false } : false
  ```
- **Root Cause:** Bypasses TLS certificate validation for remote PostgreSQL.
- **Remediation Plan:** Configure SSL using standard CA verification supported by the provider, removing insecure default overrides where possible.

---

### SEC-05: Wildcard CORS RegEx Allowing Any Vercel Subdomain
- **Location:** `server.ts` (lines 73–78)
- **Evidence:**
  ```ts
  const ALLOWED_ORIGIN_PATTERNS = [
    /^https:\/\/[a-z0-9-]+\.vercel\.app$/,
  ];
  ```
- **Root Cause:** Matches any website hosted on Vercel by any developer, combined with `Access-Control-Allow-Credentials: true`.
- **Remediation Plan:** Restrict to authorized project domains:
  `^https:\/\/krivio-ai(-[a-z0-9-]+)?\.vercel\.app$`, `^https:\/\/krivio(-[a-z0-9-]+)?\.vercel\.app$`, and localhost in development.

---

### SEC-06: Unauthenticated Storefront Inquiry Endpoint Subject to Feed Poisoning
- **Location:** `server.ts` (lines 2825–2848)
- **Evidence:** Unauthenticated `POST /api/storefront/inquiry` inserts directly into `activities` table with arbitrary client-supplied strings without verifying `userId`.
- **Remediation Plan:** Validate that `userId` exists, enforce string lengths and type boundaries, and apply rate limiting.

---

### SEC-07: Sensitive Information Disclosure in Serverless Error Handler
- **Location:** `api/index.ts` (lines 80–100)
- **Evidence:** `resolutionErrors: errors` and `stack: fatalErr?.stack` returned in HTTP 500 JSON.
- **Remediation Plan:** Log stacks server-side only; return sanitized machine-readable error codes (`SERVER_ERROR`).

---

### PROD-01: Deceptive Fallback Health Score in Dashboard
- **Location:** `src/components/Dashboard.tsx` (line 228)
- **Evidence:** `{stats?.healthScore || 80}%` evaluates to `80%` when `healthScore === 0`.
- **Remediation Plan:** Change to nullish coalescing `{stats?.healthScore ?? 0}%`.

---

### PROD-02: Fictitious Marketplace Readiness Checks
- **Location:** `src/components/MarketplaceReadiness.tsx` (lines 102–106)
- **Evidence:** Checks `Boolean(businessProfile?.phoneNumber)` for "Linked Direct Payout Bank Account Details".
- **Remediation Plan:** Update rule label and description to reflect verified contact details or accurately mark payout accounts as requiring external bank onboarding.

---

### PROD-03: Unverified Marketing Claims
- **Location:** `src/components/LandingPage.tsx`
- **Evidence:** "100% Data Privacy", "zero complex paperwork", "exact fair prices".
- **Remediation Plan:** Rephrase with grounded, accurate product descriptions ("Artisan Data Ownership", "Assisted Pricing Guidance").
