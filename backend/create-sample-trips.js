require('dotenv').config();
const mongoose = require('mongoose');

async function createSampleTrips() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const { Trip, City, Category } = require('./src/models');

    // Get cities and categories
    const cities = await City.find().populate('country', 'name');
    const categories = await Category.find({ type: 'trip' });

    if (cities.length === 0) {
      console.log('❌ No cities found. Please run destination seeder first.');
      return;
    }

    console.log(`📍 Found ${cities.length} cities`);
    console.log(`🏷️ Found ${categories.length} categories`);

    const sampleTrips = [
      {
        title: 'Berlin Historical Adventure',
        slug: 'berlin-historical-adventure',
        description: 'Explore Berlin\'s rich history, from the Brandenburg Gate to the Berlin Wall. Experience world-class museums, vibrant nightlife, and authentic German cuisine.',
        primaryDestination: cities.find(c => c.name === 'Berlin')?._id,
        destinations: [cities.find(c => c.name === 'Berlin')?._id],
        countries: [cities.find(c => c.name === 'Berlin')?.country._id],
        duration: { days: 5, nights: 4 },
        type: 'featured',
        category: categories.find(c => c.name.toLowerCase().includes('cultural'))?._id,
        travelStyle: 'cultural',
        difficulty: 'easy',
        pricing: {
          currency: 'USD',
          estimated: 1200,
          priceRange: 'mid-range'
        },
        suitableFor: {
          couples: true,
          families: true,
          soloTravelers: true,
          groups: true
        },
        featured: true,
        status: 'published'
      },
      {
        title: 'Prague Castle & Culture Tour',
        slug: 'prague-castle-culture-tour',
        description: 'Discover the magic of Prague with its stunning castle, charming old town, and famous beer culture. Walk through centuries of history in this fairy-tale city.',
        primaryDestination: cities.find(c => c.name === 'Prague')?._id,
        destinations: [cities.find(c => c.name === 'Prague')?._id],
        countries: [cities.find(c => c.name === 'Prague')?.country._id],
        duration: { days: 4, nights: 3 },
        type: 'featured',
        category: categories.find(c => c.name.toLowerCase().includes('cultural'))?._id,
        travelStyle: 'cultural',
        difficulty: 'easy',
        pricing: {
          currency: 'USD',
          estimated: 800,
          priceRange: 'budget'
        },
        suitableFor: {
          couples: true,
          families: true,
          soloTravelers: true,
          groups: true
        },
        featured: true,
        status: 'published'
      },
      {
        title: 'Istanbul East Meets West',
        slug: 'istanbul-east-meets-west',
        description: 'Experience the crossroads of Europe and Asia in Istanbul. Visit the Hagia Sophia, Blue Mosque, and Grand Bazaar while enjoying Turkish delights and Bosphorus views.',
        primaryDestination: cities.find(c => c.name === 'Istanbul')?._id,
        destinations: [cities.find(c => c.name === 'Istanbul')?._id],
        countries: [cities.find(c => c.name === 'Istanbul')?.country._id],
        duration: { days: 6, nights: 5 },
        type: 'featured',
        category: categories.find(c => c.name.toLowerCase().includes('cultural'))?._id,
        travelStyle: 'cultural',
        difficulty: 'moderate',
        pricing: {
          currency: 'USD',
          estimated: 950,
          priceRange: 'mid-range'
        },
        suitableFor: {
          couples: true,
          families: true,
          soloTravelers: true,
          groups: true
        },
        featured: true,
        status: 'published'
      }
    ];

    // Clear existing trips
    await Trip.deleteMany({});
    console.log('🗑️ Cleared existing trips');

    // Create sample trips
    const createdTrips = await Trip.insertMany(sampleTrips.filter(trip => trip.primaryDestination));
    console.log(`✅ Created ${createdTrips.length} sample trips`);

    createdTrips.forEach(trip => {
      console.log(`  - ${trip.title} (${trip.duration.days} days, $${trip.pricing.estimated})`);
    });

    console.log('\n✅ Sample trips created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating sample trips:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createSampleTrips();