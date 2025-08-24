require('dotenv').config();
const mongoose = require('mongoose');

// Start server for testing
const app = require('./server');

const testAPI = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travelai');
    console.log('Connected to MongoDB for API test');
    
    // Test registration endpoint
    const fetch = require('node-fetch');
    
    const registrationData = {
      email: 'apitest@example.com',
      password: 'password123',
      firstName: 'API',
      lastName: 'Test',
      phone: '+1234567890'
    };
    
    console.log('Testing registration API...');
    
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registrationData)
    });
    
    const result = await response.json();
    console.log('Registration response:', JSON.stringify(result, null, 2));
    
    if (result.success && result.data.verificationToken) {
      console.log('Testing verification with token:', result.data.verificationToken);
      
      const verifyResponse = await fetch(`http://localhost:3001/api/auth/verify-email?token=${result.data.verificationToken}`);
      const verifyResult = await verifyResponse.json();
      console.log('Verification response:', JSON.stringify(verifyResult, null, 2));
    }
    
  } catch (error) {
    console.error('API Test Error:', error);
  }
};

// Give server time to start
setTimeout(testAPI, 2000);