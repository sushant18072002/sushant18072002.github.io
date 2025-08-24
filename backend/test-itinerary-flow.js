require('dotenv').config();
const mongoose = require('mongoose');
const { Itinerary } = require('./src/models');

const testItineraryFlow = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travelai');
    console.log('Connected to MongoDB');
    
    // Test 1: Create a public itinerary
    console.log('\n=== TEST 1: Creating Public Itinerary ===');
    const itineraryData = {
      title: 'Paris Romance',
      description: 'Eiffel Tower dinners, Seine cruises, cozy cafes',
      user: new mongoose.Types.ObjectId(),
      type: 'template',
      destination: {
        primary: new mongoose.Types.ObjectId(),
        cities: [new mongoose.Types.ObjectId()]
      },
      duration: { days: 5, nights: 4 },
      travelers: {
        adults: 2,
        children: 0,
        infants: 0,
        total: 2
      },
      budget: {
        total: 2400,
        currency: 'USD'
      },
      preferences: {
        travelStyle: 'luxury', // Valid enum value
        interests: ['romance', 'culture']
      },
      days: [{
        day: 1,
        theme: 'Arrival',
        activities: [{
          title: 'Eiffel Tower Visit',
          type: 'activity',
          images: ['https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop']
        }]
      }],
      sharing: {
        isPublic: true
      },
      stats: {
        views: 89,
        likes: 45
      },
      status: 'published'
    };
    
    const newItinerary = await Itinerary.create(itineraryData);
    console.log('✅ Itinerary created:', newItinerary._id);
    
    // Test 2: Test featured itineraries query
    console.log('\n=== TEST 2: Featured Itineraries Query ===');
    const featuredItineraries = await Itinerary.find({
      'sharing.isPublic': true,
      status: 'published'
    }).limit(6);
    
    console.log('✅ Featured itineraries found:', featuredItineraries.length);
    
    // Test 3: Test data transformation
    console.log('\n=== TEST 3: Data Transformation ===');
    const transformedItinerary = {
      id: newItinerary._id,
      title: newItinerary.title,
      description: newItinerary.description,
      image: newItinerary.days?.[0]?.activities?.[0]?.images?.[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop',
      price: newItinerary.budget?.total || 0,
      rating: 4.8,
      reviews: newItinerary.stats?.views || 0,
      duration: `${newItinerary.duration?.days || 7} Days`,
      tags: newItinerary.preferences?.interests || ['adventure'],
      badges: [newItinerary.preferences?.travelStyle || 'Adventure']
    };
    
    console.log('✅ Transformed itinerary:', {
      id: transformedItinerary.id,
      title: transformedItinerary.title,
      price: transformedItinerary.price,
      duration: transformedItinerary.duration,
      tags: transformedItinerary.tags,
      badges: transformedItinerary.badges
    });
    
    console.log('\n🎉 ALL ITINERARY TESTS PASSED!');
    
  } catch (error) {
    console.error('❌ Itinerary test failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

testItineraryFlow();