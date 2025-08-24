const http = require('http');

const testEndpoint = (method, path, data = null) => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (e) => {
      resolve({ status: 'ERROR', data: e.message });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('🔍 TESTING ALL PACKAGE ENDPOINTS\n');

  const tests = [
    // Admin endpoints
    { method: 'GET', path: '/api/admin/test', name: 'Admin Test Route' },
    { method: 'GET', path: '/api/admin/packages', name: 'Admin List Packages' },
    { method: 'GET', path: '/api/admin/packages/68a77c139cbabbca55014a00', name: 'Admin Get Single Package' },
    { method: 'PUT', path: '/api/admin/packages/68a77c139cbabbca55014a00', name: 'Admin Update Package', data: { title: 'Test Update' } },
    
    // Public endpoints
    { method: 'GET', path: '/api/packages', name: 'Public List Packages' },
    { method: 'GET', path: '/api/packages/68a77c139cbabbca55014a00', name: 'Public Get Package Details' },
    
    // Wrong endpoints (should fail)
    { method: 'GET', path: '/api/v1/admin/packages', name: 'Wrong Admin Endpoint (should fail)' },
    { method: 'PUT', path: '/api/v1/admin/packages/68a77c139cbabbca55014a00', name: 'Wrong Admin Update (should fail)' }
  ];

  for (const test of tests) {
    try {
      const result = await testEndpoint(test.method, test.path, test.data);
      const status = result.status === 200 ? '✅' : result.status === 404 ? '❌' : '⚠️';
      console.log(`${status} ${test.name}: ${result.status}`);
      if (result.status === 404) {
        console.log(`   Error: ${result.data.error?.message || 'Not found'}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
    }
  }

  console.log('\n📋 ENDPOINT SUMMARY:');
  console.log('✅ = Working (200)');
  console.log('❌ = Not Found (404)');
  console.log('⚠️ = Other Status');
};

runTests();