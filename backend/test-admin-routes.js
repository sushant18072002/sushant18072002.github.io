const express = require('express');
const app = express();

// Test admin routes
const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log(`🔍 Admin route hit: ${req.method} ${req.path}`);
  next();
});

// Test routes
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Test route working' });
});

router.get('/packages/:id', (req, res) => {
  console.log('Single package route hit with ID:', req.params.id);
  res.json({ success: true, message: 'Single package route', id: req.params.id });
});

router.get('/packages', (req, res) => {
  console.log('Packages list route hit');
  res.json({ success: true, message: 'Packages list route' });
});

app.use('/api/admin', router);

app.listen(3001, () => {
  console.log('Test server running on port 3001');
  console.log('Test routes:');
  console.log('- GET /api/admin/test');
  console.log('- GET /api/admin/packages');
  console.log('- GET /api/admin/packages/123');
});

// Test the routes
setTimeout(() => {
  const http = require('http');
  
  console.log('\n=== Testing Routes ===');
  
  // Test 1: Test route
  http.get('http://localhost:3001/api/admin/test', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('✅ Test route:', JSON.parse(data));
    });
  });
  
  // Test 2: Packages list
  setTimeout(() => {
    http.get('http://localhost:3001/api/admin/packages', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✅ Packages list:', JSON.parse(data));
      });
    });
  }, 100);
  
  // Test 3: Single package
  setTimeout(() => {
    http.get('http://localhost:3001/api/admin/packages/68a7691a783ff1afdf433239', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✅ Single package:', JSON.parse(data));
        process.exit(0);
      });
    });
  }, 200);
  
}, 1000);