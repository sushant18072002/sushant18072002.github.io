require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./src/models/Category');

const seedTripCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing trip categories
    await Category.deleteMany({ type: 'trip' });
    console.log('Cleared existing trip categories');

    const tripCategories = [
      { name: 'Adventure Trips', slug: 'adventure-trip', type: 'trip', icon: '🏔️', color: '#FF6B35', active: true, order: 1 },
      { name: 'Cultural Trips', slug: 'cultural-trip', type: 'trip', icon: '🏛️', color: '#4ECDC4', active: true, order: 2 },
      { name: 'Beach Trips', slug: 'beach-trip', type: 'trip', icon: '🏖️', color: '#45B7D1', active: true, order: 3 }
    ];

    const created = await Category.insertMany(tripCategories);
    console.log(`✅ Successfully seeded ${created.length} trip categories`);
    
    // List all trip categories
    const allCategories = await Category.find({ type: 'trip' }).select('name slug order');
    console.log('Trip categories in database:');
    allCategories.forEach(cat => console.log(`- ${cat.name} (${cat.slug}) - Order: ${cat.order}`));
    
  } catch (error) {
    console.error('❌ Error seeding trip categories:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seedTripCategories();