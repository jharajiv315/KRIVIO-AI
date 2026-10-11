# KRIVIO AI — Engineering Changelog

**Program:** Principal Engineering Master Audit, Security Remediation & Product Excellence  
**Target Version:** 1.1.0-sec-remediated  
**Date:** 2026-10-12  

---

## 1. Security & Identity Protections

### `server.ts`
- **SEC-01 (Authentication Token Verification):**
  - Updated `POST /api/auth/supabase-sync` to mandate an `Authorization: Bearer <token>` or `access_token` in body.
  - Implemented server-side token validation via `supabaseServerClient.auth.getUser(token)`.
  - Extracted email and user ID strictly from the verified Supabase identity, eliminating unauthenticated client-supplied identity takeover.
  - Ignored client-supplied `role` parameter; defaulted new users to `'artisan'` and retained database roles for existing users.
  - Enhanced account-linking logic to verify that conflicting accounts are not silently hijacked.
- **SEC-02 (Payment HMAC & Timing Protection):**
  - Updated `POST /api/payments/verify` to require `razorpaySignature`.
  - Implemented timing-safe HMAC-SHA256 signature verification via `crypto.timingSafeEqual()`.
  - Replaced simulated fallback activations with fail-closed HTTP 503 behavior when gateway secrets are unconfigured or placeholder.
- **SEC-05 (CORS Whitelist Containment):**
  - Replaced overly broad regex `.*\.vercel\.app` with strictly scoped project patterns: `^https:\/\/krivio-ai(-[a-z0-9-]+)?\.vercel\.app$`.
- **SEC-06 (Storefront Inquiry Sanitization & Isolation):**
  - Updated `POST /api/storefront/inquiry` to verify that `userId` exists in `users` table before logging inquiry activity.
  - Added strict string length limits and trimming on all inquiry fields to protect against database bloat.

### `api/index.ts`
- **SEC-07 (Serverless Information Disclosure Sanitization):**
  - Replaced verbose 500 error responses containing stack traces and internal module paths with sanitized generic error JSON: `{ error: 'Server initialization failed' }` and `{ error: 'Internal server error' }`.
  - Preserved internal server-side logging for observability.

### `src/services/api.ts` & `src/context/AuthContext.tsx`
- **SEC-01 & SEC-02 Frontend Service Alignment:**
  - Updated `syncSupabaseUser` in `api.ts` to accept and send `session.access_token` in headers.
  - Updated `AuthContext.tsx` to pass the cryptographic access token during Supabase sign-in/OAuth callbacks.
  - Enhanced `verifyPayment` TypeScript signature in `api.ts` to require `razorpaySignature: string` and `razorpayOrderId: string`.

### `src/components/PricingModal.tsx` & `src/components/SubscriptionView.tsx`
- **SEC-02 (Elimination of Payment Simulation):**
  - Removed simulated payment handlers (`pay_${Date.now()}`) and synthetic success alerts.
  - Enforced server-side order generation and Razorpay checkout modal flows.
  - Handled gateway unavailability gracefully with clear, professional messaging.

---

## 2. Product Integrity & Grounded UX

### `src/components/Dashboard.tsx`
- **PROD-01 (Health Score Truth in Data):**
  - Replaced deceptive fallback `stats?.healthScore || 80` (which showed 80% when score was 0 or uncalculated) with strict nullish coalescing `{stats?.healthScore ?? 0}%`.

### `src/components/MarketplaceReadiness.tsx`
- **PROD-02 (Marketplace Rule Integrity):**
  - Grounded readiness checks in actual business attributes (`p.price > 0`, `p.images.length > 0`, `p.sku`, `p.hsn_code`).
  - Removed the fabricated rule that treated presence of a phone number as proof of a verified bank account.

### `src/components/LandingPage.tsx`
- **PROD-03 (Marketing Claim Grounding):**
  - Replaced unverified absolute claims ("100% Data Privacy", "Verified Government Schemes", "ONDC & GeM Ready") with accurate, credible product statements ("Enterprise-grade data encryption", "Government Schemes Information Guidance", "Marketplace-Ready Catalogue Export").

---

## 3. Tooling & Test Automation

### `package.json`
- Added dedicated `"test:security": "tsx tests/security_remediation.test.ts"`.
- Incorporated `test:security` into the primary `"npm test"` regression pipeline.

### `tests/security_remediation.test.ts`
- Authored a dedicated 9-point security regression test suite covering SEC-01, SEC-02, SEC-05, and SEC-06 with negative and positive cryptographic controls.
