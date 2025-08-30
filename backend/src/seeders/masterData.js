const { Category, Airline, Airport } = require('../models');

const seedMasterData = async () => {
  try {
    console.log('🌱 Seeding master data...');

    // Categories
    const categories = [
      { name: 'Adventure', slug: 'adventure', type: 'flight', icon: '🏔️', color: '#FF6B35', active: true },
      { name: 'Cultural', slug: 'cultural', type: 'flight', icon: '🏛️', color: '#4ECDC4', active: true },
      { name: 'Beach', slug: 'beach', type: 'flight', icon: '🏖️', color: '#45B7D1', active: true },
      { name: 'City Break', slug: 'city-break', type: 'flight', icon: '🏙️', color: '#96CEB4', active: true },
      { name: 'Sightseeing', slug: 'sightseeing', type: 'activity', icon: '👁️', color: '#FFEAA7', active: true },
      { name: 'Food & Dining', slug: 'food-dining', type: 'activity', icon: '🍽️', color: '#FD79A8', active: true }
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