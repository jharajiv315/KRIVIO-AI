# KRIVIO AI — Billing & Payments Architecture
**Document Version:** 1.0.0 (Production Release Candidate)  
**Author:** Payments Architect & Application Security Lead  
**Scope:** Razorpay Gateway Lifecycle, Signature Verification, Webhook Processing, and Expiry Operations  

---

## 1. Architectural Overview

KRIVIO AI integrates Razorpay as its primary payment processor for Indian domestic payments (UPI, RuPay, NetBanking, Debit/Credit Cards). All operations adhere strictly to zero-trust principles:

```
[ Frontend Client ] ──(1. Select Plan)──> [ KRIVIO API Gateway ]
                                                 │
                                     (2. Resolve Server Price: 29900 paise)
                                     (3. INSERT internal payment_orders)
                                                 │
                                                 ▼
[ Razorpay API ] <───(4. Create Order)──────────┘
       │
       ▼
(5. Order ID returned to client)
       │
       ▼
[ Razorpay Checkout Modal ] ──(6. User Pays via UPI/Card)
       │
       ▼
[ Client Callback ] ──(7. Signature, OrderId, PaymentId)──> [ POST /api/payments/verify ]
                                                                 │
                                                     (8. Verify HMAC SHA-256)
                                                     (9. Check Payment Order & Replay)
                                                     (10. Activate Subscription)
                                                     (11. Initialize Usage Period)
                                                                 │
                                                                 ▼
                                                     [ 200 OK + Pro Entitlements ]
```

---

## 2. Order Creation & Protection Against Tampering

1. **Endpoint:** `POST /api/payments/create-order`
2. **Authentication:** Bearer JWT required.
3. **Payload:** `{ plan: 'artisan_pro' }` (Client may send arbitrary `amount` fields, but backend completely disregards them).
4. **Resolution:** Looks up canonical price from `src/config/plans.ts`:
   - `artisan_pro` = 29900 paise (₹299.00)
   - Currency: `INR`
5. **Gateway Invocation:** Calls Razorpay Orders API via HTTP Basic Auth.
6. **Internal Persistence:** Saves record to `payment_orders` table:
   - `internal_order_id`: UUID
   - `razorpay_order_id`: Razorpay Order ID (e.g., `order_...`)
   - `user_id`: Authenticated user ID
   - `amount_paise`: 29900
   - `currency`: 'INR'
   - `status`: 'created'

---

## 3. Payment Verification & Replay Protection

1. **Endpoint:** `POST /api/payments/verify`
2. **Inputs:** `razorpayPaymentId`, `razorpayOrderId`, `razorpaySignature`
3. **Cryptographic Check:**
   $$\text{expected} = \text{HMAC-SHA256}(\text{razorpayOrderId} \parallel "|" \parallel \text{razorpayPaymentId}, \text{RAZORPAY\_KEY\_SECRET})$$
   - Comparison uses `crypto.timingSafeEqual` over buffers to prevent timing side-channel attacks.
4. **Tenant & Order Ownership Verification:**
   - Checks `payment_orders` table for `razorpay_order_id`.
   - Confirms `order.user_id === authenticated_user.id`.
5. **Anti-Replay Enforcement:**
   - Verifies whether `razorpay_payment_id` has already been recorded in `subscriptions` or settled `payment_orders`.
   - If recorded under a different user or already finalized, returns HTTP 409 Conflict.
6. **Atomic Activation:**
   - Executes inside a PostgreSQL transaction (`applyPaymentEntitlement`).
   - Updates `payment_orders` status to `'paid'`.
   - Upserts `subscriptions` with `plan = 'artisan_pro'`, `status = 'active'`, `start_date = NOW()`.
   - Computes `end_date` using the early renewal policy.

---

## 4. Webhook Architecture & Idempotency

1. **Endpoint:** `POST /api/payments/webhook`
2. **Raw Body Middleware:** Express JSON parser captures `req.rawBody = buf` so webhook HMAC signatures match the raw transmitted byte sequence.
3. **Signature Verification:**
   - Evaluates `x-razorpay-signature` against `crypto.createHmac('sha256', RAZORPAY_WEBHOOK_SECRET).update(req.rawBody).digest('hex')`.
   - Invalid signatures immediately return HTTP 400.
4. **Deduplication:**
   - Uses `payment_events` table with unique constraint on `provider_event_id`.
   - If `provider_event_id` exists, returns HTTP 200 `{ status: 'ignored_duplicate' }` without re-running billing operations.
5. **Supported Events:**
   - `order.paid`: Triggers asynchronous entitlement synchronization if client callback did not execute.
   - `payment.failed`: Records failed payment attempt in `payment_orders`.

---

## 5. Subscription Expiration & Renewal Policies

1. **Prepaid 30-Day Period:**
   - No surprise recurring card charges.
   - Expiration timestamp is persisted in UTC.
2. **Early Renewal (Access Protection):**
   - If user renews 5 days before expiration, new expiration is $\text{existing\_end\_date} + 30\text{ days}$ (35 total remaining days).
3. **Graceful Downgrade on Expiry:**
   - Backend evaluates `NOW() > end_date`.
   - Effective subscription falls back to `free`.
   - Existing product records and quotations are permanently preserved (read, edit, delete, export remain active).
   - Creation of new products is capped at 5.
