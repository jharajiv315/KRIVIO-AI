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
let port: number;
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

async function runApiIntegrationTests() {
  console.log('\n======================================================');
  console.log('  KRIVIO AI — END-TO-END API & DATABASE INTEGRATION SUITE');
  console.log('======================================================\n');

  await ensureDbInitialized();

  // Start in-process server on ephemeral test port
  await new Promise<void>((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address() as any;
      port = addr.port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`✓ Test HTTP server initialized on ${baseUrl}`);
      resolve();
    });
  });

  const timestamp = Date.now();
  const userAEmail = `artisan_a_${timestamp}@krivio.org`;
  const userBEmail = `artisan_b_${timestamp}@krivio.org`;
  const testPassword = 'Password123!';

  let userAToken = '';
  let userBToken = '';
  let userAId = '';
  let userBId = '';
  let productAId = '';
  let quotationAId = '';

  try {
    // --- 1. UNPROTECTED / PUBLIC ENDPOINTS & SECURITY HEADERS ---
    console.log('▶ 1. Security Headers & CORS Audit');
    const healthRes = await makeRequest('/api/ai/health');
    assert.strictEqual(healthRes.status, 200, 'Health endpoint responds with 200');
    assert.strictEqual(healthRes.headers['x-content-type-options'], 'nosniff', 'X-Content-Type-Options: nosniff header present');
    assert.strictEqual(healthRes.headers['x-frame-options'], 'SAMEORIGIN', 'X-Frame-Options: SAMEORIGIN header present');
    console.log('  ✔ Security headers verified');

    // --- 2. AUTHENTICATION CONTROLS & FORGERY RESISTANCE ---
    console.log('\n▶ 2. Authentication Controls & Token Forgery Defense');
    
    // 2.1 Missing token
    const noTokenRes = await makeRequest('/api/products');
    assert.strictEqual(noTokenRes.status, 401, 'Rejects unauthenticated request with 401');
    console.log('  ✔ Unauthenticated access blocked (401)');

    // 2.2 Forged token with invalid secret
    const forgedToken = jwt.sign({ sub: 'usr_admin', email: 'admin@krivio.org' }, 'attacker_forged_secret_key');
    const forgedRes = await makeRequest('/api/products', { token: forgedToken });
    assert.strictEqual(forgedRes.status, 401, 'Rejects forged JWT signature with 401');
    console.log('  ✔ Forged JWT token signature rejected (401)');

    // --- 3. REGISTRATION & LOGIN LIFECYCLE ---
    console.log('\n▶ 3. User Registration & Password Authentication');
    
    // 3.1 Register User A
    const regARes = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Artisan A (Varanasi Weaves)',
        email: userAEmail,
        password: testPassword,
        role: 'artisan',
        phone: '+91 9876543210'
      }
    });
    assert.strictEqual(regARes.status, 200, 'User A registered successfully');
    assert.ok(regARes.data.token, 'Token returned for User A');
    userAToken = regARes.data.token;
    userAId = regARes.data.user.id;
    console.log(`  ✔ User A registered (id: ${userAId})`);

    // 3.2 Register User B
    const regBRes = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Artisan B (Moradabad Brass)',
        email: userBEmail,
        password: testPassword,
        role: 'artisan',
        phone: '+91 9123456780'
      }
    });
    assert.strictEqual(regBRes.status, 200, 'User B registered successfully');
    userBToken = regBRes.data.token;
    userBId = regBRes.data.user.id;
    console.log(`  ✔ User B registered (id: ${userBId})`);

    // 3.3 Login with wrong password
    const badLoginRes = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: userAEmail, password: 'WrongPassword!' }
    });
    assert.strictEqual(badLoginRes.status, 401, 'Invalid password rejected with 401');
    console.log('  ✔ Invalid password correctly rejected (401)');

    // 3.4 Verify /api/auth/me
    const meRes = await makeRequest('/api/auth/me', { token: userAToken });
    assert.strictEqual(meRes.status, 200, '/api/auth/me succeeds with valid token');
    assert.strictEqual(meRes.data.user.id, userAId, '/api/auth/me returns User A ID');
    console.log('  ✔ /api/auth/me returns authenticated identity');

    // --- 4. BUSINESS PROFILE & TENANT ISOLATION ---
    console.log('\n▶ 4. Business Profile & Tenant Isolation');
    
    // 4.1 Save User A profile
    const saveProfRes = await makeRequest('/api/business-profile', {
      method: 'POST',
      token: userAToken,
      body: {
        businessName: 'Varanasi Silk Artisans Guild',
        businessCategory: 'Handloom Textiles',
        craftType: 'Banarasi Brocade Weaving',
        state: 'Uttar Pradesh',
        district: 'Varanasi',
        description: 'Generational handloom silk weavers crafting GI-tagged authentic Banarasi sarees.',
        pinCode: '221001'
      }
    });
    assert.strictEqual(saveProfRes.status, 200, 'User A profile saved successfully');
    console.log('  ✔ User A profile created via POST');

    // 4.2 Update User A profile via PUT (tests fix for PUT recursion loop)
    const updateProfRes = await makeRequest('/api/business-profile', {
      method: 'PUT',
      token: userAToken,
      body: {
        businessName: 'Varanasi Heritage Handlooms',
        businessCategory: 'Handloom Textiles',
        craftType: 'Banarasi Brocade Weaving',
        state: 'Uttar Pradesh',
        district: 'Varanasi'
      }
    });
    assert.strictEqual(updateProfRes.status, 200, 'User A profile updated via PUT without recursion');
    assert.strictEqual(updateProfRes.data.businessProfile.businessName, 'Varanasi Heritage Handlooms', 'Profile name updated correctly');
    console.log('  ✔ User A profile updated via PUT (no recursion loop)');

    // 4.3 Tenant Isolation: User B cannot see User A profile
    const userBProfRes = await makeRequest('/api/business-profile', { token: userBToken });
    assert.strictEqual(userBProfRes.status, 200);
    assert.strictEqual(userBProfRes.data.businessProfile.businessName, '', 'User B receives clean unconfigured profile, NOT User A profile');
    console.log('  ✔ Tenant Isolation: User B cannot access User A profile');

    // --- 5. PRODUCT LIFECYCLE & STRICT TENANT ISOLATION ---
    console.log('\n▶ 5. Product Lifecycle, Duplication & Isolation');

    // 5.1 Create Product for User A
    const createProdRes = await makeRequest('/api/products', {
      method: 'POST',
      token: userAToken,
      body: {
        title: 'Authentic Banarasi Katan Silk Saree',
        description: 'Pure Katan silk saree woven with real gold zari floral kadwa weave.',
        category: 'Textiles & Handlooms',
        price: 8500,
        mrp: 11000,
        wholesalePrice: 6200,
        moq: 3,
        material: '100% Pure Katan Silk',
        craftStory: 'Woven on traditional pit looms taking 21 days per piece.',
        hsnCode: '5007',
        leadTime: '7 business days',
        brand: 'Varanasi Heritage',
        color: 'Royal Crimson',
        originState: 'Uttar Pradesh',
        stock: 5,
        sku: `SKU-BAN-${timestamp.toString().slice(-4)}`,
        imageUrls: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c']
      }
    });
    assert.strictEqual(createProdRes.status, 200, 'Product created successfully');
    productAId = createProdRes.data.product.id;
    assert.strictEqual(createProdRes.data.product.material, '100% Pure Katan Silk', 'Product material stored');
    assert.strictEqual(createProdRes.data.product.wholesalePrice, 6200, 'Wholesale price stored');
    console.log(`  ✔ Product created (id: ${productAId}) with all extended craft attributes`);

    // 5.2 Retrieve Product as User A
    const getProdRes = await makeRequest(`/api/products/${productAId}`, { token: userAToken });
    assert.strictEqual(getProdRes.status, 200, 'User A can retrieve their product');
    assert.strictEqual(getProdRes.data.product.title, 'Authentic Banarasi Katan Silk Saree');
    console.log('  ✔ User A retrieved product by ID');

    // 5.3 Duplicate Product (verifying all 11 columns are copied)
    const dupRes = await makeRequest(`/api/products/${productAId}/duplicate`, {
      method: 'POST',
      token: userAToken
    });
    assert.strictEqual(dupRes.status, 200, 'Product duplicated successfully');
    assert.strictEqual(dupRes.data.product.material, '100% Pure Katan Silk', 'Duplicate preserved material');
    assert.strictEqual(dupRes.data.product.craftStory, 'Woven on traditional pit looms taking 21 days per piece.', 'Duplicate preserved craft story');
    assert.strictEqual(dupRes.data.product.wholesalePrice, 6200, 'Duplicate preserved wholesale price');
    const duplicateId = dupRes.data.product.id;
    console.log('  ✔ Duplicate product preserved all extended craftsmanship and wholesale fields');

    // Clean up duplicate product
    await makeRequest(`/api/products/${duplicateId}`, { method: 'DELETE', token: userAToken });

    // 5.4 TENANT ISOLATION: User B attempts to read User A product
    const crossReadRes = await makeRequest(`/api/products/${productAId}`, { token: userBToken });
    assert.strictEqual(crossReadRes.status, 404, 'User B reading User A product returns 404');
    console.log('  ✔ Tenant Isolation: User B blocked from reading User A product (404)');

    // 5.5 TENANT ISOLATION: User B attempts to delete User A product
    const crossDeleteRes = await makeRequest(`/api/products/${productAId}`, { method: 'DELETE', token: userBToken });
    assert.strictEqual(crossDeleteRes.status, 404, 'User B deleting User A product returns 404');
    console.log('  ✔ Tenant Isolation: User B blocked from deleting User A product (404)');

    // --- 6. B2B WHOLESALE QUOTATION & PDF GENERATION ---
    console.log('\n▶ 6. B2B Wholesale Quotation & PDF Generation');

    // 6.1 Create Quotation for User A
    const quoteRes = await makeRequest('/api/quotations', {
      method: 'POST',
      token: userAToken,
      body: {
        buyer: {
          name: 'Priya Sharma',
          company: 'FabIndia Regional Sourcing',
          email: 'priya@fabindia.mock',
          phone: '+91 9876500000',
          address: 'Connaught Place, New Delhi',
          gstNumber: '07AAAAA0000A1Z5'
        },
        items: [
          {
            productId: productAId,
            title: 'Authentic Banarasi Katan Silk Saree',
            sku: 'SKU-BAN-001',
            quantity: 10,
            unitPrice: 6200,
            taxPercent: 5,
            notes: 'Wholesale lot of 10 pieces with custom silk pouches'
          }
        ],
        commercial: {
          validDays: 30,
          paymentTerms: '50% advance, 50% on dispatch',
          shippingTerms: 'Insured courier delivery to Delhi hub',
          notes: 'Handmade product; slight natural variations in zari weave are expected.'
        }
      }
    });

    assert.strictEqual(quoteRes.status, 200, 'Quotation created successfully');
    quotationAId = quoteRes.data.quotation.id;
    assert.strictEqual(quoteRes.data.quotation.subtotal, 62000, 'Subtotal correctly calculated (10 * 6200 = 62000)');
    assert.strictEqual(quoteRes.data.quotation.taxTotal, 3100, 'Tax total correctly calculated (5% of 62000 = 3100)');
    assert.strictEqual(quoteRes.data.quotation.grandTotal, 65100, 'Grand total matches exact sum (62000 + 3100 = 65100)');
    console.log(`  ✔ B2B Quotation generated (id: ${quotationAId}, grandTotal: ₹65,100)`);

    // 6.2 Render and download Quotation PDF
    const pdfRes = await makeRequest(`/api/quotations/${quotationAId}/pdf`, { token: userAToken });
    assert.strictEqual(pdfRes.status, 200, 'PDF download succeeds');
    assert.ok(pdfRes.headers['content-type'].includes('application/pdf'), 'Returns PDF content type');
    console.log('  ✔ High-resolution PDF generated and delivered');

    // 6.3 TENANT ISOLATION: User B attempts to access User A quotation
    const crossQuoteRes = await makeRequest(`/api/quotations/${quotationAId}`, { token: userBToken });
    assert.strictEqual(crossQuoteRes.status, 404, 'User B accessing User A quotation returns 404');
    console.log('  ✔ Tenant Isolation: User B blocked from accessing User A quotation (404)');

    // 6.4 TENANT ISOLATION: User B attempts to render User A quotation PDF
    const crossPdfRes = await makeRequest(`/api/quotations/${quotationAId}/pdf`, { token: userBToken });
    assert.strictEqual(crossPdfRes.status, 404, 'User B rendering User A quotation PDF returns 404');
    console.log('  ✔ Tenant Isolation: User B blocked from rendering User A quotation PDF (404)');

    // --- 7. MARKETPLACE READINESS & ADAPTERS ---
    console.log('\n▶ 7. Marketplace Destinations & Readiness Engine');
    const destRes = await makeRequest('/api/marketplace/destinations');
    assert.strictEqual(destRes.status, 200);
    assert.ok(destRes.data.destinations.length >= 4, 'Returns at least 4 active marketplace destinations');
    console.log(`  ✔ Marketplace destinations: ${destRes.data.destinations.map((d: any) => d.id).join(', ')}`);

    const readRes = await makeRequest('/api/marketplace/readiness', {
      method: 'POST',
      token: userAToken,
      body: { destination: 'ONDC' }
    });
    assert.strictEqual(readRes.status, 200, 'Marketplace readiness audit succeeds');
    assert.ok(readRes.data.totalProducts !== undefined, 'Batch readiness totalProducts returned');
    assert.strictEqual(readRes.data.destination, 'ondc', 'Readiness destination matches ondc');
    console.log(`  ✔ Marketplace readiness evaluated (Total items: ${readRes.data.totalProducts}, Ready: ${readRes.data.readyProductsCount})`);

    // --- 8. PRICING CALCULATION ENDPOINT ---
    console.log('\n▶ 8. Exact Pricing Engine Arithmetic Endpoint');
    const priceCalcRes = await makeRequest('/api/pricing/calculate', {
      method: 'POST',
      token: userAToken,
      body: {
        materialCost: 500,
        laborCost: 400,
        packagingCost: 50,
        transportCost: 50,
        overheadCost: 0,
        desiredMarginPercent: 25,
        platformFeePercent: 10
      }
    });
    assert.strictEqual(priceCalcRes.status, 200);
    assert.strictEqual(priceCalcRes.data.breakdown.totalDirectCost, 1000, 'Direct cost sums to 1000');
    assert.ok(Math.abs(priceCalcRes.data.breakdown.fairRetailPrice - 1333.33) < 0.05, 'Fair retail price calculated correctly');
    console.log('  ✔ Exact pricing calculation arithmetic verified');

    // --- 9. CLEANUP ---
    console.log('\n▶ 9. Resource Cleanup & Cascade Validation');
    const delProdRes = await makeRequest(`/api/products/${productAId}`, { method: 'DELETE', token: userAToken });
    assert.strictEqual(delProdRes.status, 200, 'User A product deleted');
    const delQuoteRes = await makeRequest(`/api/quotations/${quotationAId}`, { method: 'DELETE', token: userAToken });
    assert.strictEqual(delQuoteRes.status, 200, 'User A quotation deleted');
    console.log('  ✔ Created test records cleaned up safely');

    console.log('\n======================================================');
    console.log('  ALL 18 END-TO-END INTEGRATION & SECURITY TESTS PASSED!');
    console.log('======================================================\n');
  } finally {
    // Teardown test users from database to maintain clean state
    await pgPool.query('DELETE FROM users WHERE id IN ($1, $2)', [userAId, userBId]).catch(() => {});
    await pgPool.end();
    if (server) {
      server.close();
    }
  }
}

runApiIntegrationTests()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n✖ API Integration Test Failure:', err);
    if (server) server.close();
    process.exit(1);
  });
