process.env.NODE_ENV = 'test';

import http from 'http';
import assert from 'assert';
import dotenv from 'dotenv';
dotenv.config();

// Enforce test secret for HMAC signature verification tests
process.env.RAZORPAY_KEY_SECRET = 'valid_test_secret_for_remediation_suite_2026';

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import { app, ensureDbInitialized } from '../server';

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : false
});

let server: http.Server;
let baseUrl: string;

function makeRequest(
  path: string,
  options: { method?: string; body?: any; token?: string; origin?: string } = {}
): Promise<{ status: number; data: any; headers: any }> {
  return new Promise((resolve, reject) => {
    const method = options.method || 'GET';
    const postData = options.body ? JSON.stringify(options.body) : '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (postData) {
      headers['Content-Length'] = Buffer.byteLength(postData).toString();
    }
    if (options.token) {
      headers['Authorization'] = `Bearer ${options.token}`;
    }
    if (options.origin) {
      headers['Origin'] = options.origin;
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

async function runSecurityRemediationSuite() {
  console.log('\n======================================================');
  console.log('  KRIVIO AI — SECURITY REMEDIATION REGRESSION TEST SUITE');
  console.log('======================================================\n');

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

  try {
    // -------------------------------------------------------------------------
    // TEST SUITE 1: SEC-01 Supabase Identity Verification & Anti-Account-Takeover
    // -------------------------------------------------------------------------
    console.log('\n▶ 1. SEC-01: Supabase Identity Verification & Anti-Account-Takeover');

    // 1.1 Unauthenticated / missing token must be rejected with 401
    const unauthSyncRes = await makeRequest('/api/auth/supabase-sync', {
      method: 'POST',
      body: {
        email: 'victim@krivio.org',
        supabase_user_id: 'fake-sub-id',
      },
    });
    assert.strictEqual(
      unauthSyncRes.status,
      401,
      'Unauthenticated supabase-sync without access token MUST return 401'
    );
    console.log('  ✔ Rejects unauthenticated supabase-sync without access token (401)');

    // 1.2 Forged/invalid token must be rejected with 401
    const invalidSyncRes = await makeRequest('/api/auth/supabase-sync', {
      method: 'POST',
      body: {
        email: 'victim@krivio.org',
        access_token: 'forged.jwt.token',
      },
    });
    assert.strictEqual(
      invalidSyncRes.status,
      401,
      'Forged access_token in supabase-sync MUST return 401'
    );
    console.log('  ✔ Rejects forged/invalid token in supabase-sync (401)');

    // -------------------------------------------------------------------------
    // TEST SUITE 2: SEC-02 Payment Signature Verification & Anti-Bypass
    // -------------------------------------------------------------------------
    console.log('\n▶ 2. SEC-02: Payment Signature Verification & Anti-Bypass');

    // Generate an authenticated user token for payment tests
    const userRegRes = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Payment Test Artisan',
        email: `pay_test_${Date.now()}@krivio.org`,
        password: 'SecurePass_2026!',
      },
    });
    assert.ok(userRegRes.status === 200 || userRegRes.status === 201, 'User registration succeeded');
    const userToken = userRegRes.data.token;

    // 2.1 Unauthenticated payment verify must be rejected with 401
    const unauthPayRes = await makeRequest('/api/payments/verify', {
      method: 'POST',
      body: {
        razorpayPaymentId: 'pay_fake_123',
        razorpayOrderId: 'order_fake_123',
        razorpaySignature: 'fake_sig',
      },
    });
    assert.strictEqual(unauthPayRes.status, 401, 'Unauthenticated payment verification must return 401');
    console.log('  ✔ Unauthenticated payment verification rejected (401)');

    // 2.2 Payment verify without signature must be rejected with 400
    const missingSigRes = await makeRequest('/api/payments/verify', {
      method: 'POST',
      token: userToken,
      body: {
        razorpayPaymentId: `pay_${Date.now()}`,
        razorpayOrderId: 'order_test_123',
      },
    });
    assert.strictEqual(
      missingSigRes.status,
      400,
      'Payment verification without signature MUST return 400'
    );
    console.log('  ✔ Payment verification without signature rejected (400)');

    // 2.3 Payment verify with forged/mismatched signature must be rejected with 400
    const forgedSigRes = await makeRequest('/api/payments/verify', {
      method: 'POST',
      token: userToken,
      body: {
        razorpayPaymentId: `pay_${Date.now()}`,
        razorpayOrderId: 'order_test_123',
        razorpaySignature: 'bad_signature_hash_hex',
      },
    });
    assert.strictEqual(
      forgedSigRes.status,
      400,
      'Payment verification with forged signature MUST be rejected (400)'
    );
    console.log('  ✔ Payment verification with invalid HMAC signature rejected (400)');

    // 2.4 Payment verify with valid HMAC signature succeeds (200) and activates Pro
    const payId = `pay_valid_${Date.now()}`;
    const orderId = 'order_test_valid_123';
    const validSignature = crypto
      .createHmac('sha256', 'valid_test_secret_for_remediation_suite_2026')
      .update(`${orderId}|${payId}`)
      .digest('hex');

    const validPayRes = await makeRequest('/api/payments/verify', {
      method: 'POST',
      token: userToken,
      body: {
        razorpayPaymentId: payId,
        razorpayOrderId: orderId,
        razorpaySignature: validSignature,
      },
    });
    assert.strictEqual(validPayRes.status, 200, 'Valid HMAC signature must succeed with 200');
    assert.strictEqual(validPayRes.data.success, true);
    assert.strictEqual(validPayRes.data.subscriptionPlan, 'pro');
    console.log('  ✔ Valid HMAC signature verification accepted and activates Pro (200)');

    // 2.5 Unconfigured gateway secret fails closed with 503
    process.env.RAZORPAY_KEY_SECRET = 'krivio_razorpay_secret_123';
    const unconfigPayRes = await makeRequest('/api/payments/verify', {
      method: 'POST',
      token: userToken,
      body: {
        razorpayPaymentId: payId,
        razorpayOrderId: orderId,
        razorpaySignature: validSignature,
      },
    });
    assert.strictEqual(unconfigPayRes.status, 503, 'Unconfigured gateway secret fails closed with 503');
    console.log('  ✔ Unconfigured gateway fails closed with 503 (no simulated activation)');
    // Restore valid secret
    process.env.RAZORPAY_KEY_SECRET = 'valid_test_secret_for_remediation_suite_2026';

    // -------------------------------------------------------------------------
    // TEST SUITE 3: SEC-05 CORS Whitelist Containment
    // -------------------------------------------------------------------------
    console.log('\n▶ 3. SEC-05: CORS Whitelist Containment');

    // 3.1 Arbitrary Vercel domain must NOT receive Access-Control-Allow-Origin
    const untrustedOriginRes = await makeRequest('/api/ping', {
      origin: 'https://attacker-app.vercel.app',
    });
    const allowOrigin = untrustedOriginRes.headers['access-control-allow-origin'];
    assert.notStrictEqual(
      allowOrigin,
      'https://attacker-app.vercel.app',
      'Arbitrary Vercel domain must NOT be granted CORS access'
    );
    console.log('  ✔ Rejects arbitrary attacker Vercel origins from CORS whitelist');

    // 3.2 Legitimate KRIVIO domain must receive Access-Control-Allow-Origin
    const trustedOriginRes = await makeRequest('/api/ping', {
      origin: 'https://krivio-ai.vercel.app',
    });
    assert.strictEqual(
      trustedOriginRes.headers['access-control-allow-origin'],
      'https://krivio-ai.vercel.app',
      'Production KRIVIO domain must be granted CORS access'
    );
    console.log('  ✔ Approves authentic https://krivio-ai.vercel.app CORS origin');

    // -------------------------------------------------------------------------
    // TEST SUITE 4: SEC-06 Storefront Inquiry Boundary Protection
    // -------------------------------------------------------------------------
    console.log('\n▶ 4. SEC-06: Storefront Inquiry Boundary Protection');

    // 4.1 Missing userId must return 400
    const missingUserInquiry = await makeRequest('/api/storefront/inquiry', {
      method: 'POST',
      body: {
        productTitle: 'Handmade Scarf',
        buyerName: 'Priya',
      },
    });
    assert.strictEqual(missingUserInquiry.status, 400, 'Missing userId in inquiry returns 400');
    console.log('  ✔ Rejects storefront inquiry with missing userId (400)');

    // 4.2 Non-existent userId must return 404
    const nonexistentUserInquiry = await makeRequest('/api/storefront/inquiry', {
      method: 'POST',
      body: {
        userId: 'usr_nonexistent_9999999',
        productTitle: 'Handmade Scarf',
      },
    });
    assert.strictEqual(nonexistentUserInquiry.status, 404, 'Nonexistent userId in inquiry returns 404');
    console.log('  ✔ Rejects storefront inquiry targeting nonexistent artisan (404)');

    // 4.3 Valid inquiry for existing artisan succeeds (200)
    const validInquiry = await makeRequest('/api/storefront/inquiry', {
      method: 'POST',
      body: {
        userId: userRegRes.data.user.id,
        productTitle: 'Handcrafted Wooden Toys',
        buyerName: 'Ananya Sharma',
        city: 'Jaipur',
        quantity: 2,
        totalAmount: 1200,
        inquiryType: 'Direct Order',
      },
    });
    assert.strictEqual(validInquiry.status, 200, 'Valid storefront inquiry succeeds (200)');
    assert.strictEqual(validInquiry.data.success, true);
    console.log('  ✔ Successfully logs validated inquiry for active artisan (200)');

    console.log('\n======================================================');
    console.log('  ALL 9 SECURITY REMEDIATION TESTS PASSED CLEANLY!');
    console.log('======================================================\n');
  } finally {
    if (server) server.close();
    await pgPool.end();
    process.exit(0);
  }
}

runSecurityRemediationSuite().catch((err) => {
  console.error('\n❌ Security remediation test suite failed:', err);
  if (server) server.close();
  process.exit(1);
});
