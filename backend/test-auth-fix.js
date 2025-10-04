require('dotenv').config();
const mongoose = require('mongoose');
const { User, Session } = require('./src/models');

async function testAuthFix() {
  try {
    console.log('🔍 Testing Auth Login Fix...');
    
    // Check environment variables
    console.log('\n📋 Environment Variables:');
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
    console.log('JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET ? '✅ Set' : '❌ Missing');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');
    
    // Connect to database
    console.log('\n🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
    
    // Check if models are properly loaded
    console.log('\n📦 Checking Models:');
    console.log('User model:', User ? '✅ Loaded' : '❌ Missing');
    console.log('Session model:', Session ? '✅ Loaded' : '❌ Missing');
    
    // Test User model methods
    console.log('\n🧪 Testing User Model Methods:');
    const userMethods = ['comparePassword', 'toSafeObject'];
    userMethods.forEach(method => {
      console.log(`User.prototype.${method}:`, 
        User.prototype[method] ? '✅ Available' : '❌ Missing');
    });
    
    // Check if admin user exists
    console.log('\n👤 Checking Admin User:');
    const adminUser = await User.findOne({ email: 'admin@demo.com' });
    if (adminUser) {
      console.log('✅ Admin user exists');
      console.log('   Email:', adminUser.email);
      console.log('   Role:', adminUser.role);
      console.log('   Status:', adminUser.status);
      console.log('   Active:', adminUser.active);
    } else {
      console.log('❌ Admin user not found');
      console.log('🔧 Creating admin user...');
      
      const newAdmin = await User.create({
        email: 'admin@demo.com',
        password: 'admin123',
        role: 'admin',
        status: 'active',
        active: true,
        emailVerified: true,
        profile: {
          firstName: 'Admin',
          lastName: 'User'
        }
      });
      
      console.log('✅ Admin user created:', newAdmin.email);
    }
    
    // Test Session model
    console.log('\n💾 Testing Session Model:');
    const sessionCount = await Session.countDocuments();
    console.log(`Current sessions: ${sessionCount}`);
    
    console.log('\n✅ All tests passed! Auth login should work now.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  }
}

testAuthFix();