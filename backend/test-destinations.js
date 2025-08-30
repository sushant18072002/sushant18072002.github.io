require('dotenv').config();
const mongoose = require('mongoose');
const { seedDestinations } = require('./src/seeders/destinations');
const { seedMasterData } = require('./src/seeders/masterData');

async function testDestinations() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Seed master data first
    console.log('🌍 Seeding master data...');
    await seedMasterData();

    // Seed destinations
    console.log('🏙️ Seeding destinations...');
    await seedDestinations();

    // Test API endpoints
    console.log('🧪 Testing destination endpoints...');
    
    const { City } = require('./src/models');
    
    // Test featured destinations
    const featured = await City.find({ featured: true })
      .populate('country', 'name')
      .select('name country pricing stats');
    
    console.log('📍 Featured destinations:');
    featured.forEach(dest => {
      console.log(`  - ${dest.name}, ${dest.country?.name} - $${dest.pricing?.averagePrice} (⭐${dest.stats?.rating})`);
    });

    console.log('✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testDestinations();