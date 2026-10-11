# KRIVIO AI — Production Release & Rollback Checklist

**Release Target:** KRIVIO AI Production (`https://krivio-ai.vercel.app/`)  
**Release Version:** v1.1.0-sec-remediated  
**Prepared By:** Principal Software Engineer & Reliability Lead  
**Approval Requirement:** **EXPLICIT USER APPROVAL REQUIRED BEFORE DEPLOYMENT**  

---

## 1. Pre-Deployment Configuration & Environment Boundaries

Ensure the following environment variables are properly configured in Vercel Production Settings:

| Environment Variable | Status / Value Expectation | Risk if Missing |
|---|---|---|
| `DATABASE_URL` | Supabase PostgreSQL Connection String (`sslmode=require`) | Application fails to connect to database |
| `SUPABASE_URL` | Verified Supabase Project URL (`https://...supabase.co`) | Auth token verification fails (HTTP 401/500) |
| `SUPABASE_ANON_KEY` | Public Anon Key | Client Supabase JS client fails |
| `SUPABASE_SERVICE_ROLE_KEY` | Private Service Role Key (if used server-side) | Elevated admin operations fail |
| `JWT_SECRET` | High-entropy secret (>= 32 chars, not fallback) | Token forgery risk if weak; server will fail secure |
| `RAZORPAY_KEY_ID` | Production/Test Key ID from Razorpay Dashboard | Checkout modal fails to load |
| `RAZORPAY_KEY_SECRET` | Private Key Secret from Razorpay Dashboard | `/api/payments/verify` fails closed with HTTP 503 |
| `GEMINI_API_KEY` | Valid Google Gemini API Key | AI Mentor and Image Studio features return error |

---

## 2. Verification Protocol (Pre-Release)

Execute the following verification steps locally before initiating git push or deployment:

1. **Static Analysis & Type Checking:**
   ```bash
   npm run lint
   # Expect: Zero errors (exit code 0)
   ```
2. **Security Remediation Regression Suite:**
   ```bash
   npm run test:security
   # Expect: All 9 security checks PASS (exit code 0)
   ```
3. **Core Integration & Forensics Suites:**
   ```bash
   npm test
   # Expect: All 79 tests PASS across 5 suites (exit code 0)
   ```
4. **AI Golden Regression Suite:**
   ```bash
   npm run test:ai
   # Expect: All 26 AI tests PASS (exit code 0)
   ```
5. **Full Production Bundle Compilation:**
   ```bash
   npm run build
   # Expect: Vite client bundle, Workbox SW, and both CJS server bundles generated cleanly
   ```

---

## 3. Rollback Procedure

In the event of an unexpected regression or deployment disruption in production:

### Rollback Strategy: Fast Revert to Baseline
1. **Git Revert:**
   The stable pre-remediation commit baseline is `7c8ce83`.
   ```bash
   git revert HEAD --no-edit
   git push origin main
   ```
2. **Instant Vercel Rollback:**
   - Navigate to Vercel Dashboard -> `krivio-ai` -> **Deployments**.
   - Locate the previous successful production deployment.
   - Click **...** -> **Promote to Production** (instant zero-downtime rollback).
3. **Database Compatibility:**
   - All database schema tables (`users`, `products`, `subscriptions`, `business_profiles`, `quotations`, `inquiries`) remained backward compatible.
   - No destructive migrations or column drops were executed.
   - Existing user sessions remain valid.

---

## 4. Release Decision Gate

- [x] Security vulnerabilities SEC-01 and SEC-02 remediated.
- [x] CORS regex containment SEC-05 verified.
- [x] Storefront inquiry boundary SEC-06 verified.
- [x] Serverless error sanitization SEC-07 verified.
- [x] Data integrity PROD-01 (health score) and PROD-02 (marketplace rules) corrected.
- [x] Marketing claims PROD-03 grounded in reality.
- [x] All 114 tests passing.
- [x] Clean TypeScript lint and build passing.
- [ ] **User explicit authorization received for deployment.**

> **Notice:** Under non-negotiable engineering principles, automatic production deployment is disabled. The system is fully verified and packaged, awaiting explicit user authorization.
