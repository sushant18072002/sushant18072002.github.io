const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./backend/src/models/User');

async function createDemoUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create demo user for testing
    let user = await User.findOne({ email: 'customer@travel.com' });
    if (!user) {
      user = new User({
        email: 'customer@travel.com',
        password: 'password123',
        role: 'customer',
        status: 'active',
        emailVerified: true,
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          phone: '9876543210'
        }
      });
      await user.save();
      console.log('✅ Demo user created: customer@travel.com / password123');
    } else {
      console.log('✅ Demo user already exists');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createDemoUser();