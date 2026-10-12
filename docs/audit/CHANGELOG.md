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
- Authored a dedicated 10-point security regression test suite covering SEC-01, SEC-02, SEC-05, and SEC-06 with negative and positive cryptographic controls, replay protection, and CORS verification.

---

## 4. Stage 0 Security Delta Remediation

### `server.ts`
- **0.1 JWT Fallback Prevention:** `getJwtSecret()` strictly disallows known fallback signing secrets (`krivio_secret_key_2026`, `krivio_secret_key_change_in_production`) or keys shorter than 32 characters when `NODE_ENV === 'production'`.
- **0.2 Database TLS:** `getDbSslConfig()` supports `DATABASE_CA_CERT` and `DATABASE_SSL_REJECT_UNAUTHORIZED`. Confirmed Supabase pooler certificate chain validation requirements.
- **0.3 Payment Replay Protection:** `POST /api/payments/verify` checks if `razorpayPaymentId` has already been applied to any user account; rejects duplicate claims with `409 Conflict`.
- **0.4 Account-Linking Safety:** `POST /api/auth/supabase-sync` verifies that an existing account already associated with a different Supabase UID cannot be silently reassigned; returns `409 Conflict`.

---

## 5. Stage G Product Experience & UX Modernization

### `src/components/LandingPage.tsx`
- Established "Prepare Your First Product" as the single primary hero action (`setCurrentTab('products')`).
- Added "Try Voice AI Mentor" as the secondary consultation action.
- Grounded capability descriptions in real platform features.

### `src/components/Dashboard.tsx`
- Structured clear bifurcation: First-Time Artisan Onboarding (0 products) vs Returning Entrepreneur Active Workspace.
- Replaced 6 competing quick actions with 1 primary recommended next step.
- Displayed business health score honestly without arbitrary defaults (`stats?.healthScore ?? 'Calculating...'`).
- Added optimistic rollback to growth tasks if server toggle fails.
- Added explicit network/server error recovery state (`fetchError`) preserving user data.
- Added one-click live storefront sharing with WhatsApp inquiry pre-formatting.

### `src/components/ProductStudio.tsx`
- Replaced congested 15-field vertical modal with an accessible 3-step progressive wizard:
  - Step 1: Craft Identity & AI Assistant
  - Step 2: Photos & Artisan Heritage Story
  - Step 3: Fair Pricing, Inventory & Status
- Added accessible stepper tabs enabling non-linear navigation for returning editors.
- Added collapsible AI Assistant Auto-Fill tool with clear indication that output is an editable suggestion.
- Added collapsible Advanced Logistics accordion (SKU, weight, dimensions).
- Guaranteed full input preservation on validation and network errors.
