require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('./src/models');

const testVerify = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travelai');
    console.log('Connected to MongoDB');
    
    const token = 'fcbd8f508cfac39de032c5884aee1a6bb99c175330348bfa218334db8643f2c8';
    
    console.log('Testing verification logic...');
    console.log('Token:', token);
    
    // Test the exact query from verifyEmail function
    const user = await User.findOne({
      'verification.token': token,
      'verification.expires': { $gt: new Date() },
      active: true
    });
    
    console.log('User found:', user ? 'YES' : 'NO');
    
    if (!user) {
      // Check if user exists with this token but expired
      const expiredUser = await User.findOne({
        'verification.token': token,
        active: true
      });
      
      if (expiredUser) {
        console.log('User found but token expired');
        console.log('Token expires:', expiredUser.verification.expires);
        console.log('Current time:', new Date());
      } else {
        console.log('No user found with this token at all');
        
        // Check all users with verification tokens
        const usersWithTokens = await User.find({
          'verification.token': { $exists: true, $ne: null }
        }).select('email verification');
        
        console.log('Users with verification tokens:');
        usersWithTokens.forEach(u => {
          console.log(`- ${u.email}: ${u.verification.token}`);
        });
      }
    } else {
      console.log('User email:', user.email);
      console.log('User status:', user.status);
      console.log('Email verified:', user.emailVerified);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

testVerify();