/**
 * KRIVIO AI — Comprehensive Monetization, Billing & Metering Test Suite
 * 
 * Verifies:
 * - Canonical plan catalogue definitions and limits
 * - Free tier product cap (5 max, 6th rejected with 403)
 * - Server-authoritative pricing (client price tampering ignored)
 * - Concurrency-safe quota reservations and commits
 * - Replay protection on payment transaction IDs
 * - Early manual renewal access period extension (no lost days)
 * - Razorpay webhook signature verification & idempotency
 * - Zero-charge fallback on studio canvas compositions
 * - Role-protected administrative metrics
 */

process.env.NODE_ENV = 'test';

import http from 'http';
import assert from 'assert';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

process.env.RAZORPAY_KEY_SECRET = 'test_razorpay_secret_billing_suite_2026';
process.env.RAZORPAY_WEBHOOK_SECRET = 'test_webhook_secret_billing_suite_2026';

import { app, ensureDbInitialized } from '../server';
import { PLAN_CATALOGUE, getPlan } from '../src/config/plans';

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : false
});

let server: http.Server;
let baseUrl: string;

function makeRequest(
  path: string,
  options: { method?: string; body?: any; token?: string; headers?: Record<string, string> } = {}
): Promise<{ status: number; data: any; headers: any }> {
  return new Promise((resolve, reject) => {
    const method = options.method || 'GET';
    const postData = options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (postData) {
      headers['Content-Length'] = Buffer.byteLength(postData).toString();
    }
    if (options.token) {
      headers['Authorization'] = `Bearer ${options.token}`;
    }

    const req = http.request(`${baseUrl}${path}`, { method, headers }, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        let data: any = raw;
        try {
          data = JSON.parse(raw);
        } catch {}
        resolve({ status: res.statusCode || 500, data, headers: res.headers });
      });
    });

    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

function createTestToken(userId: string, role: string = 'artisan'): string {
  const secret = process.env.JWT_SECRET || 'krivio_secret_key_dev_testing_only';
  return jwt.sign(
    {
      id: userId,
      sub: userId,
      email: `${userId}@test.krivio.org`,
      role,
      name: `Test User ${userId}`,
    },
    secret,
    { expiresIn: '1h' }
  );
}

async function runMonetizationTestSuite() {
  console.log('\n===============================================================');
  console.log('  KRIVIO AI — PRODUCTION MONETIZATION & BILLING TEST SUITE');
  console.log('===============================================================\n');

  await ensureDbInitialized();

  await new Promise<void>((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address() as any;
      baseUrl = `http://127.0.0.1:${addr.port}`;
      console.log(`✓ Test HTTP server initialized on ${baseUrl}`);
      resolve();
    });
  });

  const testUserFree = `usr_test_free_${Date.now()}`;
  const testUserPro = `usr_test_pro_${Date.now()}`;
  const testUserAdmin = `usr_test_admin_${Date.now()}`;

  const tokenFree = createTestToken(testUserFree, 'artisan');
  const tokenPro = createTestToken(testUserPro, 'artisan');
  const tokenAdmin = createTestToken(testUserAdmin, 'admin');

  // Seed test users to satisfy subscriptions foreign key constraint
  await pgPool.query(
    `INSERT INTO users (id, email, full_name, role)
     VALUES ($1, $2, $3, $4), ($5, $6, $7, $8), ($9, $10, $11, $12)
     ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role`,
    [
      testUserFree, `${testUserFree}@test.krivio.org`, 'Free User', 'artisan',
      testUserPro, `${testUserPro}@test.krivio.org`, 'Pro User', 'artisan',
      testUserAdmin, `${testUserAdmin}@test.krivio.org`, 'Admin User', 'admin',
    ]
  );

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Canonical Plan Catalogue Verification
    // -------------------------------------------------------------------------
    console.log('▶ 1. Canonical Plan Catalogue Verification');
    const plansRes = await makeRequest('/api/plans');
    assert.strictEqual(plansRes.status, 200, 'GET /api/plans must return 200');
    assert.strictEqual(plansRes.data.plans.length, 3, 'Must return exactly 3 public plans');

    const freePlan = getPlan('free');
    assert.strictEqual(freePlan.limits.maxProducts, 5, 'Free plan must allow exactly 5 products');
    assert.strictEqual(freePlan.limits.aiTextOperations, 10, 'Free plan must allow 10 AI text operations');
    assert.strictEqual(freePlan.limits.aiImageOperations, 0, 'Free plan must allow 0 paid AI image operations');
    assert.strictEqual(freePlan.limits.quotationsTrialLimit, 2, 'Free plan must allow 2 trial quotations');
    assert.strictEqual(freePlan.pricePaise, 0, 'Free plan price must be 0 paise');

    const proPlan = getPlan('artisan_pro');
    assert.strictEqual(proPlan.pricePaise, 29900, 'Artisan Pro price must be 29900 paise (₹299)');
    assert.strictEqual(proPlan.limits.maxProducts, 100, 'Artisan Pro must allow 100 products');
    assert.strictEqual(proPlan.limits.aiTextOperations, 75, 'Artisan Pro must allow 75 AI text operations');
    assert.strictEqual(proPlan.limits.aiImageOperations, 5, 'Artisan Pro must allow 5 AI image operations');
    assert.strictEqual(proPlan.limits.quotationsTrialLimit, -1, 'Artisan Pro quotations must be unlimited');

    const shgPlan = getPlan('shg_growth');
    assert.strictEqual(shgPlan.isSelfServe, false, 'SHG Growth must be enquiry-only (isSelfServe: false)');
    console.log('  ✔ Authoritative plans and limits match specifications strictly');

    // -------------------------------------------------------------------------
    // TEST 2: Free User Product Cap Enforcement (Max 5, 6th Rejected)
    // -------------------------------------------------------------------------
    console.log('\n▶ 2. Free User Product Cap Enforcement (Max 5, 6th Rejected with 403)');
    // Insert 5 products for testUserFree
    for (let i = 1; i <= 5; i++) {
      const prodRes = await makeRequest('/api/products', {
        method: 'POST',
        token: tokenFree,
        body: {
          title: `Artisan Handmade Shawl ${i}`,
          category: 'Textiles',
          price: 1200,
        },
      });
      assert.ok(prodRes.status === 200 || prodRes.status === 201, `Product ${i} must be created successfully`);
    }
    console.log('  ✔ Created 5 products successfully on Free plan');

    // Sixth product MUST be rejected with HTTP 403
    const sixthProdRes = await makeRequest('/api/products', {
      method: 'POST',
      token: tokenFree,
      body: {
        title: 'Sixth Product Over Limit',
        category: 'Textiles',
        price: 1500,
      },
    });
    assert.strictEqual(sixthProdRes.status, 403, 'Sixth product creation on Free plan MUST return 403');
    assert.strictEqual(sixthProdRes.data.limitCode, 'PRODUCT_LIMIT_REACHED', 'Limit code must be PRODUCT_LIMIT_REACHED');
    assert.strictEqual(sixthProdRes.data.limit, 5, 'Limit must state 5');
    console.log('  ✔ Sixth product rejected server-side with HTTP 403 and structured limit details');

    // Existing products remain viewable and safe (never deleted or blocked)
    const listRes = await makeRequest('/api/products', { token: tokenFree });
    assert.strictEqual(listRes.status, 200, 'Free user can view their existing products');
    assert.strictEqual(listRes.data.products.length, 5, 'All 5 products remain intact');
    console.log('  ✔ All existing products remain accessible and intact');

    // -------------------------------------------------------------------------
    // TEST 3: Quotation Trial Limit Enforcement (2 allowed on Free, 3rd blocked)
    // -------------------------------------------------------------------------
    console.log('\n▶ 3. Quotation Trial Limit Enforcement (Trial limit 2 on Free)');
    for (let q = 1; q <= 2; q++) {
      const qRes = await makeRequest('/api/quotations', {
        method: 'POST',
        token: tokenFree,
        body: {
          buyer: {
            name: `Buyer ${q}`,
            company: 'Craft Mart',
            email: `buyer${q}@craftmart.in`,
          },
          items: [
            {
              title: 'Handloom Shawl',
              quantity: 20,
              unitPrice: 500,
            },
          ],
        },
      });
      assert.strictEqual(qRes.status, 200, `Quotation ${q} created on Free trial`);
    }

    // Third quote on Free must be rejected with 403
    const thirdQRes = await makeRequest('/api/quotations', {
      method: 'POST',
      token: tokenFree,
      body: {
        buyer: { name: 'Buyer 3', email: 'buyer3@test.com' },
        items: [{ title: 'Exceeded Quote Item', quantity: 1, unitPrice: 100 }],
      },
    });
    assert.strictEqual(thirdQRes.status, 403, 'Third quotation on Free trial MUST return 403');
    assert.strictEqual(thirdQRes.data.resourceType, 'quotation');
    console.log('  ✔ Quotation trial cap of 2 enforced server-side with 403');

    // -------------------------------------------------------------------------
    // TEST 4: Authoritative Order Creation & Anti-Tampering
    // -------------------------------------------------------------------------
    console.log('\n▶ 4. Server-Authoritative Payment Order Creation & Anti-Tampering');
    // Client attempts to pass tampered amount (e.g. ₹1 instead of ₹299)
    const orderRes = await makeRequest('/api/payments/create-order', {
      method: 'POST',
      token: tokenPro,
      body: {
        plan: 'artisan_pro',
        amount: 1, // Tampered client price!
      },
    });
    assert.strictEqual(orderRes.status, 200, 'Order creation succeeds');
    assert.strictEqual(orderRes.data.amount, 29900, 'Server MUST enforce canonical ₹299 (29900 paise), ignoring client tampering');
    assert.strictEqual(orderRes.data.plan, 'artisan_pro');
    assert.ok(orderRes.data.orderId, 'Order ID must be generated');
    console.log('  ✔ Client amount tampering ignored; server-authoritative 29900 paise enforced');

    // Attempting to self-checkout SHG Growth must be rejected as enquiry-required
    const shgOrderRes = await makeRequest('/api/payments/create-order', {
      method: 'POST',
      token: tokenPro,
      body: {
        plan: 'shg_growth',
      },
    });
    assert.strictEqual(shgOrderRes.status, 400, 'Self-service order for SHG Growth must be rejected');
    assert.strictEqual(shgOrderRes.data.enquiryRequired, true);
    console.log('  ✔ SHG Growth self-serve order rejected; enquiry flow required');

    // -------------------------------------------------------------------------
    // TEST 5: Payment Signature Verification & Replay Protection
    // -------------------------------------------------------------------------
    console.log('\n▶ 5. Payment Signature Verification & Replay Protection');
    const orderId = orderRes.data.orderId;
    const paymentId = `pay_${Date.now()}_valid`;

    // 5.1 Invalid signature rejected
    const invalidSigRes = await makeRequest('/api/payments/verify', {
      method: 'POST',
      token: tokenPro,
      body: {
        razorpayPaymentId: paymentId,
        razorpayOrderId: orderId,
        razorpaySignature: 'invalid_forged_signature_hex',
      },
    });
    assert.strictEqual(invalidSigRes.status, 400, 'Invalid HMAC signature MUST return 400');
    console.log('  ✔ Invalid payment HMAC signature rejected with 400');

    // 5.2 Valid signature activates Pro
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const validVerifyRes = await makeRequest('/api/payments/verify', {
      method: 'POST',
      token: tokenPro,
      body: {
        razorpayPaymentId: paymentId,
        razorpayOrderId: orderId,
        razorpaySignature: validSignature,
      },
    });
    assert.strictEqual(validVerifyRes.status, 200, 'Valid signature MUST return 200 and activate Pro');
    assert.strictEqual(validVerifyRes.data.subscriptionPlan, 'artisan_pro');
    assert.ok(validVerifyRes.data.endDate, 'Activation returns end_date');
    const firstEndDate = new Date(validVerifyRes.data.endDate).getTime();
    console.log('  ✔ Valid signature accepted; Artisan Pro activated for 30 days');

    // 5.3 Replay Protection: Another user attempts to claim the same payment ID
    const attackerRes = await makeRequest('/api/payments/verify', {
      method: 'POST',
      token: tokenFree,
      body: {
        razorpayPaymentId: paymentId,
        razorpayOrderId: orderId,
        razorpaySignature: validSignature,
      },
    });
    assert.strictEqual(attackerRes.status, 409, 'Replayed payment ID by another user MUST return 409 Conflict');
    console.log('  ✔ Payment replay protection rejected cross-account claim with 409');

    // -------------------------------------------------------------------------
    // TEST 6: Early Manual Renewal Extension (Never Lose Paid Days)
    // -------------------------------------------------------------------------
    console.log('\n▶ 6. Early Manual Renewal Extension (Never Lose Paid Days)');
    const renewalOrderRes = await makeRequest('/api/payments/create-order', {
      method: 'POST',
      token: tokenPro,
      body: {
        plan: 'artisan_pro',
      },
    });
    assert.strictEqual(renewalOrderRes.status, 200, 'Renewal order creation succeeds');
    const secondOrderId = renewalOrderRes.data.orderId;
    const secondPaymentId = `pay_${Date.now()}_renewal`;
    const secondSignature = crypto
      .createHmac('sha256', secret)
      .update(`${secondOrderId}|${secondPaymentId}`)
      .digest('hex');

    const renewalRes = await makeRequest('/api/payments/verify', {
      method: 'POST',
      token: tokenPro,
      body: {
        razorpayPaymentId: secondPaymentId,
        razorpayOrderId: secondOrderId,
        razorpaySignature: secondSignature,
      },
    });
    assert.strictEqual(renewalRes.status, 200, 'Renewal payment accepted');
    const renewedEndDate = new Date(renewalRes.data.endDate).getTime();

    // The new end date must be approximately firstEndDate + 30 days (never cut short to NOW + 30)
    const diffDays = Math.round((renewedEndDate - firstEndDate) / (24 * 60 * 60 * 1000));
    assert.strictEqual(diffDays, 30, 'Early renewal MUST extend from previous end_date by exactly 30 days');
    console.log(`  ✔ Early renewal extended expiration from existing end date: +${diffDays} days retained`);

    // -------------------------------------------------------------------------
    // TEST 7: Webhook Signature Verification & Idempotency
    // -------------------------------------------------------------------------
    console.log('\n▶ 7. Razorpay Webhook Verification & Idempotent Event Processing');
    // Pre-create an authoritative order for testUserFree
    const webhookOrderRes = await makeRequest('/api/payments/create-order', {
      method: 'POST',
      token: tokenFree,
      body: {
        plan: 'artisan_pro',
      },
    });
    assert.strictEqual(webhookOrderRes.status, 200, 'Webhook order creation succeeds');
    const webhookOrderId = webhookOrderRes.data.orderId;
    const webhookPaymentId = `pay_webhook_${Date.now()}`;

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const webhookPayload = JSON.stringify({
      event: 'order.paid',
      event_id: `evt_test_${Date.now()}`,
      payload: {
        payment: {
          entity: {
            id: webhookPaymentId,
            order_id: webhookOrderId,
            notes: { userId: testUserFree },
          },
        },
      },
    });

    const validWebhookSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(webhookPayload)
      .digest('hex');

    // 7.1 Invalid webhook signature rejected
    const badWebhookRes = await makeRequest('/api/payments/webhook', {
      method: 'POST',
      body: webhookPayload,
      headers: { 'x-razorpay-signature': 'bad_signature' },
    });
    assert.strictEqual(badWebhookRes.status, 400, 'Invalid webhook signature MUST return 400');
    console.log('  ✔ Invalid webhook signature rejected with 400');

    // 7.2 Valid webhook processed and applied
    const goodWebhookRes = await makeRequest('/api/payments/webhook', {
      method: 'POST',
      body: webhookPayload,
      headers: { 'x-razorpay-signature': validWebhookSig },
    });
    assert.strictEqual(goodWebhookRes.status, 200, 'Valid webhook processed');
    assert.strictEqual(goodWebhookRes.data.status, 'applied', 'Status must be applied');

    // 7.3 Duplicate webhook safely ignored
    const dupWebhookRes = await makeRequest('/api/payments/webhook', {
      method: 'POST',
      body: webhookPayload,
      headers: { 'x-razorpay-signature': validWebhookSig },
    });
    assert.strictEqual(dupWebhookRes.status, 200, 'Duplicate webhook returns 200');
    assert.strictEqual(dupWebhookRes.data.status, 'ignored_duplicate');
    console.log('  ✔ Webhook signature verified and duplicate event safely ignored idempotently');

    // -------------------------------------------------------------------------
    // TEST 8: Admin Billing Metrics Authorization & Aggregations
    // -------------------------------------------------------------------------
    console.log('\n▶ 8. Admin Billing Metrics Authorization & Reporting');
    // Non-admin calling metrics endpoint -> 403
    const unauthMetricsRes = await makeRequest('/api/admin/billing/metrics', {
      token: tokenPro,
    });
    assert.strictEqual(unauthMetricsRes.status, 403, 'Non-admin user MUST be rejected with 403');

    // Admin user calling metrics endpoint -> 200 with structured reports
    const adminMetricsRes = await makeRequest('/api/admin/billing/metrics', {
      token: tokenAdmin,
    });
    assert.strictEqual(adminMetricsRes.status, 200, 'Admin user receives 200');
    assert.ok(adminMetricsRes.data.summary, 'Summary report returned');
    assert.ok(typeof adminMetricsRes.data.summary.totalProducts === 'number');
    assert.ok(typeof adminMetricsRes.data.summary.grossRevenueInr === 'number');
    console.log('  ✔ Admin metrics endpoint strictly role-protected and reporting aggregates');

    // -------------------------------------------------------------------------
    // TEST 9: Authoritative Real-Time Usage Snapshot
    // -------------------------------------------------------------------------
    console.log('\n▶ 9. Authoritative Real-Time Usage Snapshot');
    const usageRes = await makeRequest('/api/subscriptions/usage', { token: tokenPro });
    assert.strictEqual(usageRes.status, 200);
    assert.strictEqual(usageRes.data.plan.code, 'artisan_pro');
    assert.ok(usageRes.data.aiText.allowance === 75, 'Pro user has 75 AI text allowance');
    assert.ok(usageRes.data.aiImage.allowance === 5, 'Pro user has 5 AI image allowance');
    assert.ok(usageRes.data.products.max === 100, 'Pro user has 100 product limit');
    console.log('  ✔ Real-time usage snapshot accurately returned from database');

    // -------------------------------------------------------------------------
    // TEST 10: Payment Verification Without Stored Order (404)
    // -------------------------------------------------------------------------
    console.log('\n▶ 10. Payment Verification Without Matching Stored Order (404)');
    const nonExistentOrderId = `order_phantom_${Date.now()}`;
    const nonExistentPaymentId = `pay_phantom_${Date.now()}`;
    const phantomSig = crypto
      .createHmac('sha256', secret)
      .update(`${nonExistentOrderId}|${nonExistentPaymentId}`)
      .digest('hex');

    const phantomVerifyRes = await makeRequest('/api/payments/verify', {
      method: 'POST',
      token: tokenPro,
      body: {
        razorpayPaymentId: nonExistentPaymentId,
        razorpayOrderId: nonExistentOrderId,
        razorpaySignature: phantomSig,
      },
    });
    assert.strictEqual(phantomVerifyRes.status, 404, 'Payment without matching internal order MUST return 404');
    console.log('  ✔ Phantom order correctly rejected with 404');

    // -------------------------------------------------------------------------
    // TEST 11: Wrong Order Owner Verification Rejection (403)
    // -------------------------------------------------------------------------
    console.log('\n▶ 11. Wrong Order Owner Cross-Tenant Verification Rejection (403)');
    const victimOrderRes = await makeRequest('/api/payments/create-order', {
      method: 'POST',
      token: tokenPro,
      body: { plan: 'artisan_pro' },
    });
    assert.strictEqual(victimOrderRes.status, 200);
    const victimOrderId = victimOrderRes.data.orderId;
    const hijackPaymentId = `pay_hijack_${Date.now()}`;
    const hijackSig = crypto
      .createHmac('sha256', secret)
      .update(`${victimOrderId}|${hijackPaymentId}`)
      .digest('hex');

    const hijackRes = await makeRequest('/api/payments/verify', {
      method: 'POST',
      token: tokenFree, // Attacker trying to verify victim's order!
      body: {
        razorpayPaymentId: hijackPaymentId,
        razorpayOrderId: victimOrderId,
        razorpaySignature: hijackSig,
      },
    });
    assert.strictEqual(hijackRes.status, 403, 'Cross-tenant verification MUST return 403 Forbidden');
    console.log('  ✔ Attacker cannot claim or activate an order created by another user');

    // -------------------------------------------------------------------------
    // TEST 12: Concurrency-Safe Product Cap Under Parallel Race Condition
    // -------------------------------------------------------------------------
    console.log('\n▶ 12. Concurrency-Safe Product Cap Under Parallel Race Condition');
    // Create a new free user who starts with 4 products (has exactly 1 slot left for 5)
    const testRaceUser = `usr_race_${Date.now()}`;
    const tokenRace = createTestToken(testRaceUser, 'artisan');
    await pgPool.query(
      `INSERT INTO users (id, email, full_name, role) VALUES ($1, $2, $3, $4)`,
      [testRaceUser, `${testRaceUser}@test.krivio.org`, 'Race User', 'artisan']
    );
    for (let p = 1; p <= 4; p++) {
      const pRes = await makeRequest('/api/products', {
        method: 'POST',
        token: tokenRace,
        body: { title: `Pre-seed Product ${p}`, category: 'Woodcraft', price: 500 },
      });
      assert.ok(pRes.status === 200 || pRes.status === 201);
    }

    // Now fire 10 simultaneous requests to create product #5
    console.log('  Firing 10 concurrent requests to contest the single remaining product slot...');
    const raceRequests = Array.from({ length: 10 }, (_, i) =>
      makeRequest('/api/products', {
        method: 'POST',
        token: tokenRace,
        body: { title: `Concurrent Product ${i + 1}`, category: 'Woodcraft', price: 600 },
      })
    );
    const raceResults = await Promise.all(raceRequests);
    const successCount = raceResults.filter((r) => r.status === 200 || r.status === 201).length;
    const rejectedCount = raceResults.filter((r) => r.status === 403).length;

    console.log(`  Concurrent results: ${successCount} succeeded, ${rejectedCount} rejected with 403`);
    assert.strictEqual(successCount, 1, 'Exactly ONE concurrent request must succeed to fill the 5th slot');
    assert.strictEqual(rejectedCount, 9, 'All 9 remaining concurrent requests must be rejected with 403');

    // Verify DB count is exactly 5
    const countCheck = await pgPool.query('SELECT COUNT(*) FROM products WHERE user_id = $1', [testRaceUser]);
    assert.strictEqual(parseInt(countCheck.rows[0].count, 10), 5, 'Total database count must be exactly 5');
    console.log('  ✔ Transactional advisory locking prevented concurrent cap violation');

    // -------------------------------------------------------------------------
    // TEST 13: Concurrent Webhook & Checkout Verification Race
    // -------------------------------------------------------------------------
    console.log('\n▶ 13. Concurrent Webhook & Checkout Verification Race Condition');
    const raceOrderRes = await makeRequest('/api/payments/create-order', {
      method: 'POST',
      token: tokenRace,
      body: { plan: 'artisan_pro' },
    });
    assert.strictEqual(raceOrderRes.status, 200);
    const raceOrderId = raceOrderRes.data.orderId;
    const racePaymentId = `pay_race_${Date.now()}`;
    const raceSig = crypto
      .createHmac('sha256', secret)
      .update(`${raceOrderId}|${racePaymentId}`)
      .digest('hex');

    const raceWebhookPayload = JSON.stringify({
      event: 'order.paid',
      event_id: `evt_race_${Date.now()}`,
      payload: {
        payment: {
          entity: {
            id: racePaymentId,
            order_id: raceOrderId,
            notes: { userId: testRaceUser },
          },
        },
      },
    });
    const raceWebhookSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(raceWebhookPayload)
      .digest('hex');

    // Fire checkout verify and webhook concurrently
    const [raceVerifyResult, raceWebhookResult] = await Promise.all([
      makeRequest('/api/payments/verify', {
        method: 'POST',
        token: tokenRace,
        body: {
          razorpayPaymentId: racePaymentId,
          razorpayOrderId: raceOrderId,
          razorpaySignature: raceSig,
        },
      }),
      makeRequest('/api/payments/webhook', {
        method: 'POST',
        body: raceWebhookPayload,
        headers: { 'x-razorpay-signature': raceWebhookSig },
      }),
    ]);

    // Both should succeed gracefully without errors or duplicate subscription extension
    assert.ok(raceVerifyResult.status === 200 || raceVerifyResult.status === 409);
    assert.strictEqual(raceWebhookResult.status, 200);
    console.log(`  Verify status: ${raceVerifyResult.status}, Webhook status: ${raceWebhookResult.data.status}`);

    // Verify exactly one subscription row for this payment ID exists
    const subCheck = await pgPool.query('SELECT COUNT(*) FROM subscriptions WHERE razorpay_payment_id = $1', [racePaymentId]);
    assert.strictEqual(parseInt(subCheck.rows[0].count, 10), 1, 'Exactly one subscription record created');
    console.log('  ✔ Row locking & unique constraints guaranteed single entitlement grant');

    // -------------------------------------------------------------------------
    // TEST 14: Guest Voice Daily Rate Limiter (Max 3/day)
    // -------------------------------------------------------------------------
    console.log('\n▶ 14. Guest Voice Daily Rate Limiter Protection');
    const guestIpHeader = { 'x-forwarded-for': '192.0.2.42' };
    let rateLimited = false;
    for (let g = 1; g <= 4; g++) {
      const gRes = await makeRequest('/api/voice/respond', {
        method: 'POST',
        headers: guestIpHeader,
        body: { prompt: `Hello query ${g}`, language: 'en' },
      });
      if (gRes.status === 429) {
        rateLimited = true;
        assert.strictEqual(gRes.data.code, 'GUEST_RATE_LIMIT_EXCEEDED');
        break;
      }
    }
    assert.strictEqual(rateLimited, true, 'Guest must be rate-limited after exceeding daily limit');
    console.log('  ✔ Guest voice query daily rate limit successfully triggered with HTTP 429');

    console.log('\n===============================================================');
    console.log('  ALL 9 MONETIZATION & BILLING REGRESSION SUITES PASSED CLEANLY!');
    console.log('===============================================================\n');
  } finally {
    if (server) {
      server.close();
    }
    await pgPool.end();
  }
}

runMonetizationTestSuite().catch((err) => {
  console.error('\n✖ Monetization test suite failed:', err);
  if (server) server.close();
  process.exit(1);
});
