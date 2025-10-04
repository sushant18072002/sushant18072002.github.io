// Quick backend test
const fetch = require('node-fetch');

async function testBackend() {
  try {
    console.log('🔍 Testing backend health...');
    const response = await fetch('http://localhost:3000/health');
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Backend is running:', data);
      return true;
    } else {
      console.log('❌ Backend health check failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Backend not accessible:', error.message);
    return false;
  }
}

testBackend();