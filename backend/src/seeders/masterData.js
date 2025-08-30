const { Category, Airline, Airport, Country } = require('../models');

const seedMasterData = async () => {
  try {
    console.log('🌱 Seeding master data...');

    // Countries
    const countries = [
      { name: 'Germany', code: 'DE', code3: 'DEU', currency: 'EUR', continent: 'Europe', status: 'active' },
      { name: 'Czech Republic', code: 'CZ', code3: 'CZE', currency: 'CZK', continent: 'Europe', status: 'active' },
      { name: 'Turkey', code: 'TR', code3: 'TUR', currency: 'TRY', continent: 'Asia', status: 'active' },
      { name: 'Singapore', code: 'SG', code3: 'SGP', currency: 'SGD', continent: 'Asia', status: 'active' },
      { name: 'Japan', code: 'JP', code3: 'JPN', currency: 'JPY', continent: 'Asia', status: 'active' },
      { name: 'France', code: 'FR', code3: 'FRA', currency: 'EUR', continent: 'Europe', status: 'active' },
      { name: 'United States', code: 'US', code3: 'USA', currency: 'USD', continent: 'North America', status: 'active' },
      { name: 'United Kingdom', code: 'GB', code3: 'GBR', currency: 'GBP', continent: 'Europe', status: 'active' },
      { name: 'United Arab Emirates', code: 'AE', code3: 'ARE', currency: 'AED', continent: 'Asia', status: 'active' }
    ];

    for (const country of countries) {
      await Country.findOneAndUpdate(
        { code: country.code },
        country,
        { upsert: true, new: true }
      );
    }

    // Categories (including adventure categories)
    const categories = [
      // Flight categories
      { name: 'Adventure', slug: 'adventure', type: 'flight', icon: '🏔️', color: '#FF6B35', active: true },
      { name: 'Cultural', slug: 'cultural', type: 'flight', icon: '🏛️', color: '#4ECDC4', active: true },
      { name: 'Beach', slug: 'beach', type: 'flight', icon: '🏖️', color: '#45B7D1', active: true },
      { name: 'City Break', slug: 'city-break', type: 'flight', icon: '🏙️', color: '#96CEB4', active: true },
      // Trip categories (for homepage and trip hub)
      { name: 'Adventure', slug: 'adventure-trip', type: 'trip', icon: '🏔️', color: '#FF6B35', active: true, order: 1 },
      { name: 'Cultural', slug: 'cultural-trip', type: 'trip', icon: '🏛️', color: '#4ECDC4', active: true, order: 2 },
      { name: 'Beach', slug: 'beach-trip', type: 'trip', icon: '🏖️', color: '#45B7D1', active: true, order: 3 },
      // Activity categories
      { name: 'Sightseeing', slug: 'sightseeing', type: 'activity', icon: '👁️', color: '#FFEAA7', active: true },
      { name: 'Food & Dining', slug: 'food-dining', type: 'activity', icon: '🍽️', color: '#FD79A8', active: true },
      // Adventure categories for homepage
      { 
        name: 'Mountain Adventures', 
        slug: 'mountain-adventures', 
        type: 'adventure', 
        icon: '🏔️', 
        color: '#FF6B35', 
        active: true,
        order: 1,
        metadata: { adventureSpecific: { places: '50+ Places', difficulty: 'moderate' } }
      },
      { 
        name: 'Beach Escapes', 
        slug: 'beach-escapes', 
        type: 'adventure', 
        icon: '🏖️', 
        color: '#45B7D1', 
        active: true,
        order: 2,
        metadata: { adventureSpecific: { places: '30+ Places', difficulty: 'easy' } }
      },
      { 
        name: 'Cultural Tours', 
        slug: 'cultural-tours', 
        type: 'adventure', 
        icon: '🏛️', 
        color: '#4ECDC4', 
        active: true,
        order: 3,
        metadata: { adventureSpecific: { places: '40+ Places', difficulty: 'easy' } }
      },
      { 
        name: 'City Breaks', 
        slug: 'city-breaks', 
        type: 'adventure', 
        icon: '🌆', 
        color: '#96CEB4', 
        active: true,
        order: 4,
        metadata: { adventureSpecific: { places: '25+ Places', difficulty: 'easy' } }
      },
      { 
        name: 'Wildlife Safari', 
        slug: 'wildlife-safari', 
        type: 'adventure', 
        icon: '🦁', 
        color: '#F39C12', 
        active: true,
        order: 5,
        metadata: { adventureSpecific: { places: '15+ Places', difficulty: 'moderate' } }
      },
      { 
        name: 'Food & Wine', 
        slug: 'food-wine', 
        type: 'adventure', 
        icon: '🍷', 
        color: '#E74C3C', 
        active: true,
        order: 6,
        metadata: { adventureSpecific: { places: '20+ Places', difficulty: 'easy' } }
      },
      { 
        name: 'Romance', 
        slug: 'romance', 
        type: 'adventure', 
        icon: '💕', 
        color: '#FF69B4', 
        active: true,
        order: 7,
        metadata: { adventureSpecific: { places: '35+ Places', difficulty: 'easy' } }
      },
      { 
        name: 'Luxury', 
        slug: 'luxury', 
        type: 'adventure', 
        icon: '💎', 
        color: '#FFD700', 
        active: true,
        order: 8,
        metadata: { adventureSpecific: { places: '25+ Places', difficulty: 'easy' } }
      },
      { 
        name: 'Family', 
        slug: 'family', 
        type: 'adventure', 
        icon: '👨👩👧👦', 
        color: '#32CD32', 
        active: true,
        order: 9,
        metadata: { adventureSpecific: { places: '45+ Places', difficulty: 'easy' } }
      }
    ];

    for (const cat of categories) {
      await Category.findOneAndUpdate(
        { slug: cat.slug },
        cat,
        { upsert: true, new: true }
      );
    }

    // Airlines
    const airlines = [
      { code: 'AA', name: 'American Airlines', country: 'United States', status: 'active' },
      { code: 'BA', name: 'British Airways', country: 'United Kingdom', status: 'active' },
      { code: 'LH', name: 'Lufthansa', country: 'Germany', status: 'active' },
      { code: 'AF', name: 'Air France', country: 'France', status: 'active' },
      { code: 'EK', name: 'Emirates', country: 'United Arab Emirates', status: 'active' }
    ];

    for (const airline of airlines) {
      await Airline.findOneAndUpdate(
        { code: airline.code },
        airline,
        { upsert: true, new: true }
      );
    }

    // Airports
    const airports = [
      { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States', timezone: 'America/New_York', location: { coordinates: { type: 'Point', coordinates: [-73.7781, 40.6413] } }, type: 'international', status: 'active' },
      { code: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'United Kingdom', timezone: 'Europe/London', location: { coordinates: { type: 'Point', coordinates: [-0.4543, 51.4700] } }, type: 'international', status: 'active' },
      { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', timezone: 'Europe/Paris', location: { coordinates: { type: 'Point', coordinates: [2.5479, 49.0097] } }, type: 'international', status: 'active' },
      { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', timezone: 'Asia/Dubai', location: { coordinates: { type: 'Point', coordinates: [55.3644, 25.2532] } }, type: 'international', status: 'active' },
      { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo', location: { coordinates: { type: 'Point', coordinates: [140.3929, 35.7720] } }, type: 'international', status: 'active' }
    ];

    for (const airport of airports) {
      await Airport.findOneAndUpdate(
        { code: airport.code },
        airport,
        { upsert: true, new: true }
      );
    }

    console.log('✅ Master data seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding master data:', error);
  }
};

module.exports = { seedMasterData };