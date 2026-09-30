process.env.NODE_ENV = 'test';

import http from 'http';
import assert from 'assert';
import dotenv from 'dotenv';
dotenv.config();

import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import { app, ensureDbInitialized } from '../server';

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : false
});

let server: http.Server;
let baseUrl: string;

function makeRequest(path: string, options: { method?: string; body?: any; token?: string } = {}): Promise<{ status: number; data: any; headers: any }> {
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
    if (postData) req.write(postData);
    req.end();
  });
}

async function runAuthForensicSuite() {
  console.log('\n======================================================');
  console.log('  KRIVIO AI — MASTER AUTHENTICATION FORENSICS TEST SUITE');
  console.log('======================================================\n');

  await ensureDbInitialized();

  // Start in-process test server on an ephemeral port
  await new Promise<void>((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address() as any;
      baseUrl = `http://127.0.0.1:${address.port}`;
      console.log(`✓ Test HTTP server initialized on ${baseUrl}`);
      resolve();
    });
  });

  const timestamp = Date.now();
  const testEmail1 = `artisan_test_${timestamp}@krivio.org`;
  const testEmail2 = `weaver_test_${timestamp}@krivio.org`;
  const initialPassword = 'InitialSecurePass123!';
  const updatedPassword = 'NewSecretPassword456!';

  let testUser1Id = '';
  let testUser1Token = '';

  try {
    // -------------------------------------------------------------------------
    // 1. REGISTRATION VALIDATION & ERROR HANDLING
    // -------------------------------------------------------------------------
    console.log('\n▶ 1. Registration Validation & Edge Cases');

    // 1.1 Missing full name
    const missingNameRes = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: { email: testEmail1, password: initialPassword }
    });
    assert.strictEqual(missingNameRes.status, 400, 'Rejects registration without name');
    console.log('  ✔ Rejects registration with missing name (400)');

    // 1.2 Missing email
    const missingEmailRes = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: { name: 'Sunita Devi', password: initialPassword }
    });
    assert.strictEqual(missingEmailRes.status, 400, 'Rejects registration without email');
    console.log('  ✔ Rejects registration with missing email (400)');

    // 1.3 Invalid email format
    const badEmailRes = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: { name: 'Sunita Devi', email: 'notanemail', password: initialPassword }
    });
    assert.strictEqual(badEmailRes.status, 400, 'Rejects invalid email format');
    console.log('  ✔ Rejects invalid email syntax (400)');

    // 1.4 Weak password (< 6 chars)
    const weakPassRes = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: { name: 'Sunita Devi', email: testEmail1, password: '123' }
    });
    assert.strictEqual(weakPassRes.status, 400, 'Rejects weak password under 6 chars');
    console.log('  ✔ Rejects short/weak password (400)');

    // 1.5 Successful Registration (User 1)
    const validRegRes = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Sunita Devi',
        email: testEmail1,
        password: initialPassword,
        role: 'artisan',
        businessName: 'Sunita Banarasi Weaves',
        location: 'Varanasi, Uttar Pradesh'
      }
    });
    assert.strictEqual(validRegRes.status, 200, 'Successful registration returns 200');
    assert.ok(validRegRes.data.token, 'JWT session token returned');
    assert.ok(validRegRes.data.user.id, 'User record created with ID');
    assert.strictEqual(validRegRes.data.user.businessName, 'Sunita Banarasi Weaves', 'Business name persisted');
    assert.strictEqual(validRegRes.data.user.location, 'Varanasi, Uttar Pradesh', 'Location persisted');
    testUser1Id = validRegRes.data.user.id;
    testUser1Token = validRegRes.data.token;
    console.log(`  ✔ Valid registration succeeded for ${testEmail1} (id: ${testUser1Id})`);

    // 1.6 Duplicate email registration (Must be rejected with 409 Conflict)
    const duplicateRes = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Another Person',
        email: testEmail1.toUpperCase(), // Case insensitive duplicate check
        password: initialPassword
      }
    });
    assert.strictEqual(duplicateRes.status, 409, 'Rejects duplicate email with 409 Conflict');
    console.log('  ✔ Duplicate email correctly rejected with 409 Conflict');

    // -------------------------------------------------------------------------
    // 2. DATA PERSISTENCE VERIFICATION IN POSTGRESQL
    // -------------------------------------------------------------------------
    console.log('\n▶ 2. Database Record Persistence Verification');

    const dbUser = await pgPool.query('SELECT * FROM users WHERE id = $1', [testUser1Id]);
    assert.strictEqual(dbUser.rows.length, 1, 'User row exists in PostgreSQL');
    assert.ok(dbUser.rows[0].password_hash.startsWith('$2'), 'Password stored as bcrypt hash');
    assert.notStrictEqual(dbUser.rows[0].password_hash, initialPassword, 'Plain-text password is NEVER stored');
    console.log('  ✔ Canonical user record verified in PostgreSQL with bcrypt hash');

    const dbProfile = await pgPool.query('SELECT * FROM business_profiles WHERE user_id = $1', [testUser1Id]);
    assert.strictEqual(dbProfile.rows.length, 1, 'Business profile row exists in PostgreSQL');
    assert.strictEqual(dbProfile.rows[0].business_name, 'Sunita Banarasi Weaves');
    assert.strictEqual(dbProfile.rows[0].state, 'Varanasi, Uttar Pradesh');
    console.log('  ✔ Associated business_profiles record verified in PostgreSQL');

    const dbSub = await pgPool.query('SELECT * FROM subscriptions WHERE user_id = $1', [testUser1Id]);
    assert.strictEqual(dbSub.rows.length, 1, 'Subscription row exists in PostgreSQL');
    assert.strictEqual(dbSub.rows[0].plan, 'free');
    console.log('  ✔ Default subscription row verified in PostgreSQL');

    // -------------------------------------------------------------------------
    // 3. LOGIN & SESSION VERIFICATION
    // -------------------------------------------------------------------------
    console.log('\n▶ 3. Login & Session Lifecycle');

    // 3.1 Invalid password rejected
    const badPwLogin = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: testEmail1, password: 'WrongPassword999!' }
    });
    assert.strictEqual(badPwLogin.status, 401, 'Invalid password rejected with 401');
    console.log('  ✔ Invalid credentials rejected with 401');

    // 3.2 Non-existent account rejected
    const unknownLogin = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'nonexistent_ghost@krivio.org', password: initialPassword }
    });
    assert.strictEqual(unknownLogin.status, 401, 'Unknown account rejected with 401');
    console.log('  ✔ Unknown account rejected with 401');

    // 3.3 Valid Login
    const validLogin = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: testEmail1, password: initialPassword }
    });
    assert.strictEqual(validLogin.status, 200, 'Valid credentials login successfully');
    assert.ok(validLogin.data.token, 'Session token returned on login');
    assert.strictEqual(validLogin.data.user.businessName, 'Sunita Banarasi Weaves', 'Preserves businessName on login');
    assert.strictEqual(validLogin.data.user.location, 'Varanasi, Uttar Pradesh', 'Preserves location on login');
    console.log('  ✔ Login succeeded and restored complete profile data');

    // 3.4 Identity check (/api/auth/me)
    const meRes = await makeRequest('/api/auth/me', { token: testUser1Token });
    assert.strictEqual(meRes.status, 200, '/api/auth/me succeeds');
    assert.strictEqual(meRes.data.user.id, testUser1Id);
    assert.strictEqual(meRes.data.user.businessName, 'Sunita Banarasi Weaves');
    console.log('  ✔ /api/auth/me restored authenticated profile');

    // -------------------------------------------------------------------------
    // 4. FORGOT PASSWORD & RECOVERY FLOW
    // -------------------------------------------------------------------------
    console.log('\n▶ 4. Password Recovery & Reset Lifecycle');

    // 4.1 Forgot password request for existing user
    const forgotRes = await makeRequest('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: testEmail1 }
    });
    assert.strictEqual(forgotRes.status, 200, 'Forgot password returns 200');
    assert.strictEqual(forgotRes.data.status, 'success');
    console.log('  ✔ /api/auth/forgot-password dispatches recovery token');

    // 4.2 Non-enumerating response for non-existent user
    const forgotUnknownRes = await makeRequest('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: 'nobody_here@krivio.org' }
    });
    assert.strictEqual(forgotUnknownRes.status, 200, 'Non-existent email returns identical 200 to prevent enumeration');
    assert.strictEqual(forgotUnknownRes.data.status, 'success');
    console.log('  ✔ Non-enumerating safe response verified for unknown emails');

    // Fetch recovery token from test database
    const resetRows = await pgPool.query(
      `SELECT * FROM password_resets WHERE email = $1 ORDER BY created_at DESC LIMIT 1`,
      [testEmail1]
    );
    assert.strictEqual(resetRows.rows.length, 1, 'Reset record written to database');
    assert.strictEqual(resetRows.rows[0].used_at, null, 'Reset token is initially unused');
    console.log('  ✔ Cryptographic reset token hash verified in database');

    // 4.3 Verify valid token endpoint
    // To test verification, we need the token hash
    const dbTokenHash = resetRows.rows[0].token_hash;
    // Test with invalid token
    const verifyBadRes = await makeRequest('/api/auth/verify-reset-token', {
      method: 'POST',
      body: { token: 'completely_invalid_token_12345' }
    });
    assert.strictEqual(verifyBadRes.status, 400, 'Rejects fake/invalid recovery token');
    console.log('  ✔ Invalid recovery token rejected (400)');

    // 4.4 Reset password using direct endpoint test
    // We insert a known test token for predictable testing
    const crypto = await import('crypto');
    const testRawToken = 'test_predictable_token_' + timestamp;
    const testTokenHash = crypto.createHash('sha256').update(testRawToken).digest('hex');
    await pgPool.query(
      `INSERT INTO password_resets (id, email, token_hash, expires_at, created_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '1 hour', NOW())`,
      [`rst_test_${timestamp}`, testEmail1, testTokenHash]
    );

    // 4.5 Verify the known test token
    const verifyGoodRes = await makeRequest('/api/auth/verify-reset-token', {
      method: 'POST',
      body: { token: testRawToken }
    });
    assert.strictEqual(verifyGoodRes.status, 200, 'Verifies valid reset token');
    assert.strictEqual(verifyGoodRes.data.valid, true);
    console.log('  ✔ Valid reset token successfully verified');

    // 4.6 Reset password with weak new password (must reject)
    const weakResetRes = await makeRequest('/api/auth/reset-password', {
      method: 'POST',
      body: { token: testRawToken, newPassword: '123' }
    });
    assert.strictEqual(weakResetRes.status, 400, 'Rejects reset with short password');
    console.log('  ✔ Rejects weak new password (400)');

    // 4.7 Successful password reset
    const goodResetRes = await makeRequest('/api/auth/reset-password', {
      method: 'POST',
      body: { token: testRawToken, newPassword: updatedPassword }
    });
    assert.strictEqual(goodResetRes.status, 200, 'Password reset succeeds');
    assert.strictEqual(goodResetRes.data.status, 'success');
    console.log('  ✔ Password reset executed successfully');

    // 4.8 Reuse of already-used token must be rejected
    const reuseResetRes = await makeRequest('/api/auth/reset-password', {
      method: 'POST',
      body: { token: testRawToken, newPassword: 'AnotherPassword789!' }
    });
    assert.strictEqual(reuseResetRes.status, 400, 'Rejects already-used reset token');
    console.log('  ✔ Re-use of consumed token rejected (400)');

    // 4.9 Login with old password must fail
    const oldPwLoginRes = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: testEmail1, password: initialPassword }
    });
    assert.strictEqual(oldPwLoginRes.status, 401, 'Old password no longer works');
    console.log('  ✔ Old password rejected after reset (401)');

    // 4.10 Login with new password must succeed
    const newPwLoginRes = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: testEmail1, password: updatedPassword }
    });
    assert.strictEqual(newPwLoginRes.status, 200, 'Login with new password succeeds');
    console.log('  ✔ Login with new password succeeded (200)');

    console.log('\n======================================================');
    console.log('  ALL 19 MASTER AUTHENTICATION FORENSIC TESTS PASSED!');
    console.log('======================================================\n');
  } finally {
    // Clean up test data
    if (testUser1Id) {
      await pgPool.query('DELETE FROM users WHERE id = $1', [testUser1Id]).catch(() => {});
      await pgPool.query('DELETE FROM password_resets WHERE email = $1', [testEmail1]).catch(() => {});
    }
    if (server) {
      server.close();
    }
    await pgPool.end();
  }
}

runAuthForensicSuite().catch((err) => {
  console.error('\n❌ MASTER AUTHENTICATION FORENSIC TEST SUITE FAILED:', err);
  process.exit(1);
});
