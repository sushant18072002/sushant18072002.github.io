require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { User, Session } = require('./src/models');

const createSession = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travelai');
    console.log('Connected to MongoDB');
    
    // Find admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('No admin user found');
      return;
    }
    
    console.log('Admin user found:', adminUser.email);
    
    // Generate new tokens
    const token = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: adminUser._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    
    // Create session
    const session = await Session.create({
      userId: adminUser._id,
      token,
      refreshToken,
      deviceInfo: {
        userAgent: 'Admin Dashboard',
        ip: '127.0.0.1'
      },
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      isActive: true
    });
    
    console.log('Session created successfully');
    console.log('New JWT Token:', token);
    console.log('Session ID:', session._id);
    
    // Update localStorage in browser with this token
    console.log('\n🔑 Use this token in your browser:');
    console.log(`localStorage.setItem('token', '${token}');`);
    console.log(`localStorage.setItem('user', '${JSON.stringify(adminUser.toSafeObject())}');`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

createSession();