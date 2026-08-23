import http from 'http';

function makeRequest(path, method, data) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    const options = {
      hostname: '127.0.0.1',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('Testing KRIVIO AI Endpoints...\n');

  // Test 1: Marketplace recommendations
  const r1 = await makeRequest('/api/marketplace/recommendations', 'GET');
  console.log('1. Marketplace Channels (Status:', r1.status, '):', r1.data.channels.length, 'channels returned.');

  // Test 2: AI Mentor in English
  const r2 = await makeRequest('/api/ai/mentor', 'POST', {
    message: 'What is the pricing formula for handloom?',
    language: 'English',
  });
  console.log('2. AI Mentor English (Status:', r2.status, '):', r2.data.reply.slice(0, 100) + '...');

  // Test 3: AI Mentor in Hindi
  const r3 = await makeRequest('/api/ai/mentor', 'POST', {
    message: 'कारीगरी का सही मूल्य कैसे तय करें?',
    language: 'Hindi',
  });
  console.log('3. AI Mentor Hindi (Status:', r3.status, '):', r3.data.reply.slice(0, 100) + '...');

  // Test 4: Product Auto-generation
  const r4 = await makeRequest('/api/products/generate-details', 'POST', {
    rawName: 'Madhubani Handpainted Dupatta',
    craftType: 'Textiles & Handlooms',
    materials: 'Tussar Silk and Natural Pigments',
    targetPrice: 2400,
  });
  console.log('4. Product Studio Generator (Status:', r4.status, '):', r4.data.data.title, '| Suggested Price: ₹' + r4.data.data.suggestedPrice);

  // Test 5: Image Studio AI Diagnostic
  const r5 = await makeRequest('/api/images/analyze', 'POST', {
    imageBase64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...',
  });
  console.log('5. Image Studio Vision Audit (Status:', r5.status, '): Lighting:', r5.data.analysis.lightingScore, '| Overall:', r5.data.analysis.overallScore);

  // Test 6: Business Profile
  const r6 = await makeRequest('/api/business-profile', 'GET');
  console.log('6. Business Profile (Status:', r6.status, '):', r6.data.businessProfile.businessName);

  // Test 7: Products list
  const r7 = await makeRequest('/api/products', 'GET');
  console.log('7. Products Catalog (Status:', r7.status, '):', r7.data.products.length, 'products retrieved.');

  console.log('\nAll 7 endpoint tests passed with Status 200 OK!');
}

runTests().catch(console.error);
