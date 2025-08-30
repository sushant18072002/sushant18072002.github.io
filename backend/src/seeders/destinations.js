const { City, Country } = require('../models');

const seedDestinations = async () => {
  try {
    console.log('🌍 Seeding destination data...');

    // Get some countries first
    const countries = await Country.find().limit(10);
    if (countries.length === 0) {
      console.log('⚠️ No countries found. Please seed countries first.');
      return;
    }

    const destinationData = [
      {
        name: 'Berlin',
        country: countries.find(c => c.code === 'DE')?._id || countries.find(c => c.name === 'Germany')?._id || countries[0]._id,
        description: 'Germany\'s vibrant capital city with rich history and modern culture',
        images: [
          'https://images.unsplash.com/photo-1587330979470-3016b6702d89?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1599946347371-68eb71b16afc?w=800&h=600&fit=crop'
        ],
        popularFor: ['history', 'culture', 'nightlife', 'museums'],
        bestTimeToVisit: ['May', 'June', 'July', 'August', 'September'],
        featured: true,
        priority: 10,
        pricing: {
          averagePrice: 180,
          priceRange: { min: 120, max: 300 }
        },
        stats: {
          visitorsPerYear: 13500000,
          rating: 4.6,
          reviewCount: 2847
        },
        coordinates: {
          latitude: 52.5200,
          longitude: 13.4050
        }
      },
      {
        name: 'Prague',
        country: countries.find(c => c.code === 'CZ')?._id || countries.find(c => c.name === 'Czech Republic')?._id || countries[1]._id,
        description: 'The City of a Hundred Spires with stunning medieval architecture',
        images: [
          'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop'
        ],
        popularFor: ['architecture', 'history', 'beer', 'castles'],
        bestTimeToVisit: ['April', 'May', 'September', 'October'],
        featured: true,
        priority: 9,
        pricing: {
          averagePrice: 150,
          priceRange: { min: 80, max: 250 }
        },
        stats: {
          visitorsPerYear: 8000000,
          rating: 4.7,
          reviewCount: 1923
        },
        coordinates: {
          latitude: 50.0755,
          longitude: 14.4378
        }
      },
      {
        name: 'Istanbul',
        country: countries.find(c => c.code === 'TR')?._id || countries.find(c => c.name === 'Turkey')?._id || countries[2]._id,
        description: 'Where Europe meets Asia - a city of incredible history and culture',
        images: [
          'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800&h=600&fit=crop'
        ],
        popularFor: ['history', 'culture', 'food', 'bazaars', 'mosques'],
        bestTimeToVisit: ['April', 'May', 'September', 'October', 'November'],
        featured: true,
        priority: 8,
        pricing: {
          averagePrice: 120,
          priceRange: { min: 60, max: 200 }
        },
        stats: {
          visitorsPerYear: 15000000,
          rating: 4.5,
          reviewCount: 3456
        },
        coordinates: {
          latitude: 41.0082,
          longitude: 28.9784
        }
      },
      {
        name: 'Singapore',
        country: countries.find(c => c.name === 'Singapore')?._id || countries[3]._id,
        description: 'A modern city-state blending cultures, cuisine, and cutting-edge architecture',
        images: [
          'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
        ],
        popularFor: ['food', 'shopping', 'architecture', 'gardens', 'skyline'],
        bestTimeToVisit: ['February', 'March', 'April', 'May', 'June'],
        featured: true,
        priority: 7,
        pricing: {
          averagePrice: 280,
          priceRange: { min: 180, max: 450 }
        },
        stats: {
          visitorsPerYear: 19100000,
          rating: 4.8,
          reviewCount: 4521
        },
        coordinates: {
          latitude: 1.3521,
          longitude: 103.8198
        }
      },
      {
        name: 'Tokyo',
        country: countries.find(c => c.name === 'Japan')?._id || countries[4]._id,
        description: 'Japan\'s bustling capital where tradition meets ultra-modern innovation',
        images: [
          'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=800&h=600&fit=crop'
        ],
        popularFor: ['technology', 'food', 'culture', 'temples', 'shopping'],
        bestTimeToVisit: ['March', 'April', 'May', 'October', 'November'],
        featured: true,
        priority: 6,
        pricing: {
          averagePrice: 320,
          priceRange: { min: 200, max: 500 }
        },
        stats: {
          visitorsPerYear: 14000000,
          rating: 4.9,
          reviewCount: 5678
        },
        coordinates: {
          latitude: 35.6762,
          longitude: 139.6503
        }
      },
      {
        name: 'Paris',
        country: countries.find(c => c.name === 'France')?._id || countries[5]._id,
        description: 'The City of Light - romance, art, and world-class cuisine',
        images: [
          'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1431274172761-fca41d930114?w=800&h=600&fit=crop'
        ],
        popularFor: ['art', 'romance', 'food', 'fashion', 'museums'],
        bestTimeToVisit: ['April', 'May', 'June', 'September', 'October'],
        featured: false,
        priority: 5,
        pricing: {
          averagePrice: 250,
          priceRange: { min: 150, max: 400 }
        },
        stats: {
          visitorsPerYear: 30000000,
          rating: 4.7,
          reviewCount: 8901
        },
        coordinates: {
          latitude: 48.8566,
          longitude: 2.3522
        }
      }
    ];

    // Clear existing destinations
    await City.deleteMany({});
    
    console.log('Available countries:', countries.map(c => `${c.name} (${c.code})`));

    // Insert new destinations
    const destinations = await City.insertMany(destinationData);
    console.log(`✅ Successfully seeded ${destinations.length} destinations`);

    return destinations;
  } catch (error) {
    console.error('❌ Error seeding destinations:', error);
    throw error;
  }
};

module.exports = { seedDestinations };