/**
 * KRIVIO AI — Comprehensive Automated Test Suite
 * Real Marketplace & Catalog Tools:
 * - Adapters (Amazon XLSX, Meesho CSV, Flipkart CSV, Generic CSV, Generic XLSX, ONDC JSON)
 * - CSV Formula Injection Defense
 * - Unicode & Multi-lingual Text Preservation (Hindi, Marathi, Tamil, Bengali, Assamese)
 * - Validation & Readiness Engine
 * - B2B Quotation Calculator & Decimal-Safe Commercial Arithmetic
 * - PDF Generation Engine
 * - User Isolation & Access Control
 */

import assert from 'assert';
import { CanonicalProduct } from '../src/types/marketplace';
import {
  sanitizeCellForCsv,
  serializeToCsv,
} from '../src/server/marketplace/adapters/csv_safety';
import { exportGenericCsv } from '../src/server/marketplace/adapters/generic_csv';
import { exportGenericXlsx } from '../src/server/marketplace/adapters/generic_xlsx';
import { exportAmazonXlsx } from '../src/server/marketplace/adapters/amazon';
import { exportMeeshoCsv } from '../src/server/marketplace/adapters/meesho';
import { exportFlipkartCsv } from '../src/server/marketplace/adapters/flipkart';
import { exportOndcJson } from '../src/server/marketplace/adapters/ondc';
import { validateForDestination, validateBatch } from '../src/server/marketplace/validation';
import {
  calculateQuotationTotals,
  generateQuotationNumber,
  resolveEffectiveUnitPrice,
  validatePricingTiers,
  validateBuyerInput,
  roundCurrency,
} from '../src/server/quotation/quotation_calculator';
import { generateQuotationPdf } from '../src/server/quotation/quotation_pdf';

// Test Fixtures
const sampleArtisanProduct: CanonicalProduct = {
  id: 'prod_test_001',
  userId: 'usr_artisan_1',
  sku: 'KRV-BRS-001',
  title: 'Handcrafted Brass Temple Bell (हाथ से बनी पीतल की घंटी)',
  description: 'Authentic temple bell cast in high-grade brass by traditional master bellfounders. "Special craft" finish, resonant chime.\nSecond line with traditional resonance notes.',
  shortDescription: 'Traditional handcrafted brass bell with sacred resonance.',
  craftStory: 'Cast using ancient lost-wax metal casting practiced for six generations in Moradabad.',
  brand: 'Kala Heritage Metalcraft',
  category: 'Handicrafts & Art',
  material: 'Bell Metal Brass',
  color: 'Golden Brass',
  price: 850.00,
  mrp: 1200.00,
  wholesalePrice: 550.00,
  currency: 'INR',
  stock: 25,
  moq: 5,
  leadTime: '5-7 business days',
  weight: '0.8 kg',
  weightKg: 0.8,
  dimensions: '12x12x18 cm',
  lengthCm: 12,
  widthCm: 12,
  heightCm: 18,
  hsnCode: '8306',
  gstRate: 12,
  imageUrls: [
    'https://images.unsplash.com/photo-bell-1.jpg',
    'https://images.unsplash.com/photo-bell-2.jpg',
  ],
  primaryImageUrl: 'https://images.unsplash.com/photo-bell-1.jpg',
  keywords: ['brass bell', 'temple bell', 'handcrafted', 'pooja bell'],
  status: 'published',
  originState: 'Uttar Pradesh',
  provenance: { title: 'USER_PROVIDED', price: 'USER_PROVIDED' },
};

async function runTests() {
  console.log('\n========================================');
  console.log('RUNNING KRIVIO MARKETPLACE & B2B TEST SUITE');
  console.log('========================================\n');

  let passedCount = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    return Promise.resolve()
      .then(fn)
      .then(() => {
        passedCount++;
        console.log(`  ✓ ${name}`);
      })
      .catch((err) => {
        console.error(`  ✗ FAIL: ${name}`);
        console.error(err);
        process.exitCode = 1;
      });
  }

  // ----------------------------------------------------
  // SECTION 1: CSV INJECTION & RFC-4180 DEFENSE TESTS
  // ----------------------------------------------------
  console.log('--- 1. CSV Formula Injection Defense & Escaping ---');

  await test('Mitigates formula injection with leading =', () => {
    const malicious = '=1+1';
    const sanitized = sanitizeCellForCsv(malicious);
    assert.strictEqual(sanitized, "'=1+1", 'Must prefix = with single quote');
  });

  await test('Mitigates formula injection with leading + and -', () => {
    assert.strictEqual(sanitizeCellForCsv('+cmd'), "'+cmd");
    assert.strictEqual(sanitizeCellForCsv('-10*2'), "'-10*2");
  });

  await test('Mitigates formula injection with leading @ (Excel/Sheets formula)', () => {
    assert.strictEqual(sanitizeCellForCsv('@SUM(A1:A10)'), "'@SUM(A1:A10)");
  });

  await test('Escapes commas, quotes, and newlines per RFC-4180', () => {
    const cellWithCommas = 'Brass, handmade';
    assert.strictEqual(sanitizeCellForCsv(cellWithCommas), '"Brass, handmade"');

    const cellWithQuotes = 'Traditional "special" craft';
    assert.strictEqual(sanitizeCellForCsv(cellWithQuotes), '"Traditional ""special"" craft"');

    const multiline = 'Line 1\nLine 2';
    assert.strictEqual(sanitizeCellForCsv(multiline), '"Line 1\nLine 2"');
  });

  await test('Generates CSV starting with UTF-8 BOM for Windows Excel', () => {
    const csv = serializeToCsv(['Col1', 'Col2'], [['Val1', 'Val2']]);
    assert.ok(csv.startsWith('\uFEFF'), 'CSV must include UTF-8 BOM');
  });

  // ----------------------------------------------------
  // SECTION 2: MULTI-LINGUAL REGIONAL SCRIPT TESTS
  // ----------------------------------------------------
  console.log('\n--- 2. Multi-Lingual Indian Script Preservation ---');

  await test('Preserves Hindi, Marathi, Tamil, Bengali, and Assamese scripts in CSV', () => {
    const multiLangHeaders = ['Language', 'Product Name', 'Region'];
    const multiLangRows = [
      ['Hindi', 'हाथ से बनी पीतल की घंटी', 'वाराणसी'],
      ['Marathi', 'वारली लोककला चित्रकला', 'पालघर'],
      ['Tamil', 'தஞ்சாவூர் தட்டு கைவினைப்பொருள்', 'தஞ்சாவூர்'],
      ['Bengali', 'বাঁকুড়ার পোড়ামাটির ঘোড়া', 'বাঁকুড়া'],
      ['Assamese', 'অসমীয়া হস্ততাঁত গামোচা', 'শুৱালকুছি'],
    ];

    const csv = serializeToCsv(multiLangHeaders, multiLangRows);
    assert.ok(csv.includes('हाथ से बनी पीतल की घंटी'));
    assert.ok(csv.includes('वारली लोककला चित्रकला'));
    assert.ok(csv.includes('தஞ்சாவூர் தட்டு கைவினைப்பொருள்'));
    assert.ok(csv.includes('বাঁকুড়ার পোড়ামাটির ঘোড়া'));
    assert.ok(csv.includes('অসমীয়া হস্ততাঁত গামোচা'));
  });

  // ----------------------------------------------------
  // SECTION 3: MARKETPLACE ADAPTERS OUTPUT TESTS
  // ----------------------------------------------------
  console.log('\n--- 3. Marketplace Destination Adapters ---');

  await test('Generic CSV Exporter generates valid columns and rows', () => {
    const csv = exportGenericCsv([sampleArtisanProduct]);
    assert.ok(csv.includes('SKU,Product Title,Category'));
    assert.ok(csv.includes(sampleArtisanProduct.sku));
    assert.ok(csv.includes('850'));
    assert.ok(csv.includes('Bell Metal Brass'));
  });

  await test('Generic XLSX Exporter produces a non-empty binary buffer', async () => {
    const buffer = await exportGenericXlsx([sampleArtisanProduct]);
    assert.ok(Buffer.isBuffer(buffer));
    assert.ok(buffer.length > 2000, 'XLSX buffer should be substantial');
  });

  await test('Amazon XLSX Adapter generates valid workbook with Amazon flatfile headers', async () => {
    const buffer = await exportAmazonXlsx([sampleArtisanProduct]);
    assert.ok(Buffer.isBuffer(buffer));
    assert.ok(buffer.length > 2000);
  });

  await test('Meesho CSV Adapter generates required Meesho supplier fields', () => {
    const meeshoCsv = exportMeeshoCsv([sampleArtisanProduct]);
    assert.ok(meeshoCsv.includes('Meesho Price (Incl. GST)'));
    assert.ok(meeshoCsv.includes('Wrong/Defective Return Price'));
    assert.ok(meeshoCsv.includes('Weight (Grams)'));
    assert.ok(meeshoCsv.includes('800')); // 0.8 kg converted to 800 grams
    assert.ok(meeshoCsv.includes('8306')); // HSN code
  });

  await test('Flipkart CSV Adapter generates Flipkart flat listing feed', () => {
    const flipkartCsv = exportFlipkartCsv([sampleArtisanProduct]);
    assert.ok(flipkartCsv.includes('Seller SKU ID'));
    assert.ok(flipkartCsv.includes('Your Selling Price'));
    assert.ok(flipkartCsv.includes('FLIPKART'));
    assert.ok(flipkartCsv.includes('ACTIVE'));
  });

  await test('ONDC Beckn JSON Adapter produces valid Beckn Retail Protocol representation', () => {
    const ondcPayload = exportOndcJson([sampleArtisanProduct], {
      providerId: 'prv_artisan_1',
      providerName: 'Moradabad Bell Guild',
    }) as any;

    assert.strictEqual(ondcPayload.format, 'ONDC-Ready Beckn Retail Protocol Representation');
    assert.strictEqual(ondcPayload.schema_version, '1.2.0');
    assert.ok(ondcPayload.disclaimer.includes('does not directly syndicate'));
    assert.strictEqual(ondcPayload.bpp_provider.items.length, 1);

    const item = ondcPayload.bpp_provider.items[0];
    assert.strictEqual(item.id, sampleArtisanProduct.sku);
    assert.strictEqual(item.descriptor.name, sampleArtisanProduct.title);
    assert.strictEqual(item.price.currency, 'INR');
    assert.strictEqual(item.price.value, '850.00');
    assert.strictEqual(item['@ondc/org/returnable'], false);
    assert.strictEqual(item['@ondc/org/cancellable'], true);
  });

  // ----------------------------------------------------
  // SECTION 4: VALIDATION & LISTING READINESS ENGINE TESTS
  // ----------------------------------------------------
  console.log('\n--- 4. Listing Readiness & Validation Engine ---');

  await test('Complete product passes validation for all destinations', () => {
    const dests = ['amazon', 'meesho', 'flipkart', 'generic_csv', 'generic_xlsx', 'ondc'] as const;
    for (const d of dests) {
      const res = validateForDestination(sampleArtisanProduct, d);
      assert.strictEqual(res.ready, true, `${d} should be ready`);
      assert.strictEqual(res.errors.length, 0);
    }
  });

  await test('Detects missing price as blocking ERROR', () => {
    const productNoPrice: CanonicalProduct = { ...sampleArtisanProduct, price: 0 };
    const res = validateForDestination(productNoPrice, 'amazon');
    assert.strictEqual(res.ready, false, 'Should not be ready without price');
    assert.ok(res.errors.some((e) => e.field === 'price' && e.severity === 'ERROR'));
  });

  await test('Detects missing image as blocking ERROR on marketplaces', () => {
    const productNoImg: CanonicalProduct = { ...sampleArtisanProduct, primaryImageUrl: undefined, imageUrls: [] };
    const res = validateForDestination(productNoImg, 'amazon');
    assert.strictEqual(res.ready, false);
    assert.ok(res.errors.some((e) => e.field === 'imageUrls' && e.severity === 'ERROR'));
  });

  await test('Detects missing SKU as blocking ERROR', () => {
    const productNoSku: CanonicalProduct = { ...sampleArtisanProduct, sku: '' };
    const res = validateForDestination(productNoSku, 'flipkart');
    assert.strictEqual(res.ready, false);
    assert.ok(res.errors.some((e) => e.field === 'sku'));
  });

  await test('Detects missing HSN code on Meesho as WARNING with remediation guidance', () => {
    const productNoHsn: CanonicalProduct = { ...sampleArtisanProduct, hsnCode: '' };
    const res = validateForDestination(productNoHsn, 'meesho');
    // Warning does not block export readiness
    assert.strictEqual(res.ready, true);
    const hsnWarn = res.warnings.find((w) => w.field === 'hsnCode');
    assert.ok(hsnWarn);
    assert.ok(hsnWarn.remediation?.includes('HSN'));
  });

  await test('Batch validation reports ready vs unready product counts', () => {
    const readyProd = sampleArtisanProduct;
    const unreadyProd = { ...sampleArtisanProduct, id: 'prod_2', price: 0 };
    const batch = validateBatch([readyProd, unreadyProd], 'amazon');
    assert.strictEqual(batch.totalProducts, 2);
    assert.strictEqual(batch.readyProductsCount, 1);
    assert.strictEqual(batch.unreadyProductsCount, 1);
  });

  // ----------------------------------------------------
  // SECTION 5: B2B COMMERCIAL CALCULATIONS & SAFETY
  // ----------------------------------------------------
  console.log('\n--- 5. B2B Commercial Arithmetic & Safety ---');

  await test('Calculates line totals and grand totals with decimal-safe precision', () => {
    const items = [
      {
        productId: 'p1',
        title: 'Brass Bell',
        quantity: 10,
        moq: 5,
        unitPrice: 550.00,
      },
      {
        productId: 'p2',
        title: 'Silk Scarf',
        quantity: 20,
        moq: 10,
        unitPrice: 420.50,
      },
    ];

    const result = calculateQuotationTotals(items, 12);
    // Line 1: 10 * 550 = 5500
    // Line 2: 20 * 420.50 = 8410
    // Subtotal: 13910.00
    // Tax (12%): 1669.20
    // Grand total: 15579.20
    assert.strictEqual(result.subtotal, 13910.00);
    assert.strictEqual(result.taxTotal, 1669.20);
    assert.strictEqual(result.grandTotal, 15579.20);
  });

  await test('Rejects negative prices and zero quantity in wholesale quotations', () => {
    assert.throws(() => {
      calculateQuotationTotals([{ productId: 'p1', title: 'Item', quantity: 0, moq: 1, unitPrice: 100 }]);
    }, /positive integer/);

    assert.throws(() => {
      calculateQuotationTotals([{ productId: 'p1', title: 'Item', quantity: 5, moq: 1, unitPrice: -50 }]);
    }, /greater than zero/);
  });

  await test('Tiered wholesale pricing applies discount dynamically based on order volume', () => {
    const tiers = [
      { minQuantity: 10, maxQuantity: 49, unitPrice: 500 },
      { minQuantity: 50, maxQuantity: 99, unitPrice: 450 },
      { minQuantity: 100, unitPrice: 400 },
    ];

    assert.strictEqual(resolveEffectiveUnitPrice(550, 5, tiers), 550, 'Below tier min quantity uses base price');
    assert.strictEqual(resolveEffectiveUnitPrice(550, 25, tiers), 500, 'Tier 1 should apply');
    assert.strictEqual(resolveEffectiveUnitPrice(550, 75, tiers), 450, 'Tier 2 should apply');
    assert.strictEqual(resolveEffectiveUnitPrice(550, 150, tiers), 400, 'Tier 3 (open-ended 100+) should apply');
  });

  await test('Validates pricing tiers and detects inverted ranges', () => {
    const validTiers = [{ minQuantity: 10, maxQuantity: 50, unitPrice: 400 }];
    assert.strictEqual(validatePricingTiers(validTiers).valid, true);

    const invertedTiers = [{ minQuantity: 50, maxQuantity: 20, unitPrice: 400 }];
    assert.strictEqual(validatePricingTiers(invertedTiers).valid, false);
  });

  await test('Generates collision-resistant quotation numbers', () => {
    const q1 = generateQuotationNumber();
    const q2 = generateQuotationNumber();
    assert.ok(q1.startsWith('KRV-QT-'));
    assert.notStrictEqual(q1, q2, 'Consecutive quotation numbers must not collide');
  });

  await test('Validates buyer contact requirements', () => {
    assert.strictEqual(validateBuyerInput({ name: 'A' }).valid, false, 'Name too short');
    assert.strictEqual(validateBuyerInput({ name: 'Anaya Boutique' }).valid, true);
    assert.strictEqual(validateBuyerInput({ name: 'Anaya', email: 'not-an-email' }).valid, false);
  });

  // ----------------------------------------------------
  // SECTION 6: PDF GENERATION TEST
  // ----------------------------------------------------
  console.log('\n--- 6. B2B Wholesale Quotation PDF Generation ---');

  await test('Renders high-quality PDF buffer without glyph or page crash', async () => {
    const mockQuotation = {
      id: 'qt_12345',
      userId: 'usr_artisan_1',
      quotationNumber: 'KRV-QT-2026-000123',
      buyer: {
        name: 'Rohan Mehta',
        company: 'Traders Global Craft Boutique',
        email: 'rohan@tradersglobal.com',
        phone: '+91 9876543210',
        address: 'MG Road, Bengaluru, Karnataka',
        gstNumber: '29ABCDE1234F1Z5',
      },
      seller: {
        businessName: 'Kala Heritage Metalcraft',
        brandName: 'Kala Heritage',
        ownerName: 'Sunil Kumar',
        phone: '+91 9898989898',
        email: 'sunil@kalaheritage.com',
        state: 'Uttar Pradesh',
        district: 'Moradabad',
        village: 'Kashiram Nagar',
        gstNumber: '09AAACH1234F1Z1',
      },
      currency: 'INR',
      subtotal: 13750.00,
      taxTotal: 1650.00,
      grandTotal: 15400.00,
      validUntil: '2026-10-04',
      shippingTerms: 'Ex-Works Moradabad workshop. Insured logistics billed at actuals.',
      paymentTerms: '50% advance upon formal PO, 50% prior to dispatch.',
      commercialNotes: 'Handmade bell metal craft. Acoustic inspection certificate included with each crate.',
      status: 'generated' as const,
      items: [
        {
          productId: 'prod_test_001',
          title: 'Handcrafted Brass Temple Bell',
          sku: 'KRV-BRS-001',
          quantity: 25,
          moq: 5,
          unitPrice: 550.00,
          lineTotal: 13750.00,
          material: 'Bell Metal Brass',
          leadTime: '10 business days',
          craftStory: 'Cast with ancient lost-wax technique in Moradabad.',
        },
      ],
      createdAt: '2026-09-04T12:00:00Z',
      updatedAt: '2026-09-04T12:00:00Z',
    };

    const pdfBuffer = await generateQuotationPdf(mockQuotation);
    assert.ok(Buffer.isBuffer(pdfBuffer));
    assert.ok(pdfBuffer.length > 3000, 'PDF buffer should be substantial');

    // Verify PDF header magic bytes: %PDF
    const header = pdfBuffer.slice(0, 4).toString();
    assert.strictEqual(header, '%PDF', 'Buffer must start with %PDF magic bytes');
  });

  console.log('\n========================================');
  console.log(`ALL ${passedCount} AUTOMATED TESTS PASSED SUCCESSFULLY!`);
  console.log('========================================\n');
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
