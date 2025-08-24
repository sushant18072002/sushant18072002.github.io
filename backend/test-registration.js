require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');
const { User } = require('./src/models');

const testRegistration = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travelai');
    console.log('Connected to MongoDB');
    
    // Delete test user if exists
    await User.deleteOne({ email: 'test@verification.com' });
    
    const verificationToken = crypto.randomBytes(32).toString('hex');
    console.log('Generated token:', verificationToken);
    
    const userData = {
      email: 'test@verification.com',
      password: 'password123',
      profile: { 
        firstName: 'Test', 
        lastName: 'User', 
        phone: '+1234567890' 
      },
      verification: {
        token: verificationToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    };
    
    console.log('Creating user with data:', JSON.stringify(userData, null, 2));
    
    const user = await User.create(userData);
    console.log('User created successfully');
    console.log('User ID:', user._id);
    
    // Fetch the user back from database to verify
    const savedUser = await User.findById(user._id);
    console.log('Saved user verification:', JSON.stringify(savedUser.verification, null, 2));
    
    // Test the verification query
    const foundUser = await User.findOne({
      'verification.token': verificationToken,
      'verification.expires': { $gt: new Date() },
      active: true
    });
    
    console.log('User found with verification query:', foundUser ? 'YES' : 'NO');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

testRegistration();