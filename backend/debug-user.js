require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('./src/models');

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travelai');
    console.log('Connected to MongoDB');
    
    // Find user with your token
    const token = 'fcbd8f508cfac39de032c5884aee1a6bb99c175330348bfa218334db8643f2c8';
    
    console.log('Looking for token:', token);
    
    // Check all users to see their verification structure
    const allUsers = await User.find({}).select('email verification status emailVerified');
    console.log('\nAll users in database:');
    allUsers.forEach(user => {
      console.log('User:', user.email);
      console.log('Status:', user.status);
      console.log('Email Verified:', user.emailVerified);
      console.log('Verification:', JSON.stringify(user.verification, null, 2));
      console.log('---');
    });
    
    // Try to find user with the specific token
    const userWithToken = await User.findOne({ 'verification.token': token });
    console.log('\nUser with token found:', userWithToken ? 'YES' : 'NO');
    
    if (userWithToken) {
      console.log('User email:', userWithToken.email);
      console.log('Token expires:', userWithToken.verification.expires);
      console.log('Current time:', new Date());
      console.log('Token expired?', userWithToken.verification.expires < new Date());
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkUser();