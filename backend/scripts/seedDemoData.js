const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const { Country, State, City, Category, Activity, Trip, Hotel, Flight, User, Booking } = require('../src/models');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedCountries = async () => {
  console.log('🌍 Seeding countries...');
  const countries = [
    { name: 'United States', code: 'US', code3: 'USA', currency: 'USD', timezone: 'America/New_York', continent: 'North America', flag: '🇺🇸', status: 'active' },
    { name: 'France', code: 'FR', code3: 'FRA', currency: 'EUR', timezone: 'Europe/Paris', continent: 'Europe', flag: '🇫🇷', status: 'active' },
    { name: 'Japan', code: 'JP', code3: 'JPN', currency: 'JPY', timezone: 'Asia/Tokyo', continent: 'Asia', flag: '🇯🇵', status: 'active' },
    { name: 'Indonesia', code: 'ID', code3: 'IDN', currency: 'IDR', timezone: 'Asia/Jakarta', continent: 'Asia', flag: '🇮🇩', status: 'active' },
    { name: 'United Kingdom', code: 'GB', code3: 'GBR', currency: 'GBP', timezone: 'Europe/London', continent: 'Europe', flag: '🇬🇧', status: 'active' }
  ];

  await Country.deleteMany({});
  const createdCountries = await Country.insertMany(countries);
  console.log(`✅ Created ${createdCountries.length} countries`);
  return createdCountries;
};

const seedCategories = async () => {
  console.log('🏷️ Seeding categories...');
  const categories = [
    { name: 'Adventure', slug: 'adventure', description: 'Thrilling outdoor experiences', icon: '🏔️', color: '#FF6B35', type: 'trip', order: 1, active: true },
    { name: 'Romance', slug: 'romance', description: 'Perfect getaways for couples', icon: '💕', color: '#E91E63', type: 'trip', order: 2, active: true },
    { name: 'Cultural', slug: 'cultural', description: 'Immerse in local culture', icon: '🎭', color: '#9C27B0', type: 'trip', order: 3, active: true },
    { name: 'Luxury', slug: 'luxury', description: 'Premium experiences', icon: '💎', color: '#FFD700', type: 'trip', order: 4, active: true },
    { name: 'Family', slug: 'family', description: 'Fun for all family members', icon: '👨‍👩‍👧‍👦', color: '#4CAF50', type: 'trip', order: 5, active: true }
  ];

  await Category.deleteMany({});
  const createdCategories = await Category.insertMany(categories);
  console.log(`✅ Created ${createdCategories.length} categories`);
  return createdCategories;
};

const seedCities = async (countries) => {
  console.log('🏙️ Seeding cities...');
  const cities = [
    { name: 'New York', country: countries.find(c => c.code === 'US')._id, coordinates: { latitude: 40.7128, longitude: -74.0060 }, timezone: 'America/New_York', description: 'The city that never sleeps', popularFor: ['skyline', 'broadway', 'museums'], bestTimeToVisit: ['April', 'May', 'September'], status: 'active' },
    { name: 'Paris', country: countries.find(c => c.code === 'FR')._id, coordinates: { latitude: 48.8566, longitude: 2.3522 }, timezone: 'Europe/Paris', description: 'The City of Light', popularFor: ['romance', 'art', 'cuisine'], bestTimeToVisit: ['April', 'May', 'June'], status: 'active' },
    { name: 'Tokyo', country: countries.find(c => c.code === 'JP')._id, coordinates: { latitude: 35.6762, longitude: 139.6503 }, timezone: 'Asia/Tokyo', description: 'Modern metropolis meets tradition', popularFor: ['technology', 'culture', 'food'], bestTimeToVisit: ['March', 'April', 'May'], status: 'active' },
    { name: 'Bali', country: countries.find(c => c.code === 'ID')._id, coordinates: { latitude: -8.3405, longitude: 115.0920 }, timezone: 'Asia/Makassar', description: 'Tropical paradise', popularFor: ['beaches', 'temples', 'yoga'], bestTimeToVisit: ['April', 'May', 'June'], status: 'active' },
    { name: 'London', country: countries.find(c => c.code === 'GB')._id, coordinates: { latitude: 51.5074, longitude: -0.1278 }, timezone: 'Europe/London', description: 'Historic capital', popularFor: ['history', 'museums', 'royalty'], bestTimeToVisit: ['May', 'June', 'July'], status: 'active' }
  ];

  await City.deleteMany({});
  const createdCities = await City.insertMany(cities);
  console.log(`✅ Created ${createdCities.length} cities`);
  return createdCities;
};

const seedTrips = async (cities, categories) => {
  console.log('🧳 Seeding trips...');
  const trips = [
    {
      title: '7-Day Bali Paradise Adventure',
      slug: 'bali-paradise-adventure',
      description: 'Experience the magic of Bali with pristine beaches, ancient temples, and vibrant culture. This comprehensive journey takes you through the cultural heart of Ubud, the beach paradise of Seminyak, and the spiritual temples of East Bali.',
      primaryDestination: cities.find(c => c.name === 'Bali')._id,
      destinations: [cities.find(c => c.name === 'Bali')._id],
      countries: [cities.find(c => c.name === 'Bali').country],
      duration: { days: 7, nights: 6 },
      type: 'featured',
      category: categories.find(c => c.name === 'Adventure')._id,
      tags: ['beach', 'culture', 'temples', 'nature', 'wellness'],
      travelStyle: 'adventure',
      difficulty: 'moderate',
      suitableFor: { couples: true, families: true, soloTravelers: true, groups: true },
      groupSize: { min: 1, max: 12, recommended: 4 },
      physicalRequirements: { fitnessLevel: 'moderate', walkingDistance: 5, altitude: 1500, specialNeeds: ['comfortable walking shoes'] },
      pricing: { 
        currency: 'USD', 
        estimated: 1850, 
        breakdown: { flights: 600, accommodation: 700, activities: 350, food: 150, transport: 50, other: 0 }, 
        priceRange: 'mid-range' 
      },
      itinerary: [
        {
          day: 1,
          title: 'Arrival in Bali',
          description: 'Welcome to the Island of Gods! Transfer to your hotel and evening at leisure.',
          location: cities.find(c => c.name === 'Bali')._id,
          activities: [
            {
              time: '14:00',
              title: 'Airport Transfer',
              description: 'Private transfer from Ngurah Rai Airport to hotel',
              type: 'transport',
              duration: 60,
              location: 'Ngurah Rai Airport',
              estimatedCost: { currency: 'USD', amount: 25, perPerson: false },
              included: true,
              optional: false
            },
            {
              time: '19:00',
              title: 'Welcome Dinner',
              description: 'Traditional Balinese dinner at beachfront restaurant',
              type: 'meal',
              duration: 120,
              location: 'Seminyak Beach',
              estimatedCost: { currency: 'USD', amount: 35, perPerson: true },
              included: true,
              optional: false
            }
          ],
          estimatedCost: { currency: 'USD', amount: 95 },
          tips: ['Arrive early to enjoy sunset at Seminyak Beach', 'Try local Bintang beer with dinner']
        }
      ],
      customizable: { duration: true, activities: true, accommodation: true, dates: true, groupSize: true },
      travelInfo: {
        bestTimeToVisit: { months: ['April', 'May', 'June', 'July', 'August', 'September'], weather: 'Dry season with sunny days', temperature: { min: 24, max: 31 } },
        visaRequirements: { required: true, countries: ['Most countries'], processingTime: 'On arrival', cost: 35 },
        healthRequirements: { vaccinations: [], healthInsurance: true, medicalFacilities: 'Good medical facilities in main areas' },
        localCulture: { language: ['Indonesian', 'Balinese'], currency: 'IDR', customs: ['Remove shoes before entering temples', 'Dress modestly at religious sites'] }
      },
      bookingInfo: { instantBook: false, requiresApproval: true, advanceBooking: 14, cancellationPolicy: 'Free cancellation up to 7 days before departure', depositRequired: 30, finalPaymentDue: 30 },
      images: [{ url: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800', alt: 'Bali Beach Sunset', isPrimary: true, order: 1 }],
      sharing: { isPublic: true, allowCopy: true, allowComments: true },
      stats: { views: 2847, likes: 156, copies: 23, bookings: 45, rating: 4.8, reviewCount: 89 },
      featured: true,
      status: 'published'
    },
    {
      title: 'Paris Romance Getaway',
      slug: 'paris-romance-getaway',
      description: 'A romantic 5-day escape through the City of Love',
      primaryDestination: cities.find(c => c.name === 'Paris')._id,
      destinations: [cities.find(c => c.name === 'Paris')._id],
      countries: [cities.find(c => c.name === 'Paris').country],
      duration: { days: 5, nights: 4 },
      type: 'featured',
      category: categories.find(c => c.name === 'Romance')._id,
      tags: ['romance', 'culture', 'cuisine', 'art'],
      travelStyle: 'luxury',
      difficulty: 'easy',
      suitableFor: { couples: true, families: false, soloTravelers: false, groups: false },
      pricing: { currency: 'EUR', estimated: 2200, breakdown: { flights: 800, accommodation: 900, activities: 300, food: 200, transport: 0, other: 0 }, priceRange: 'luxury' },
      customizable: { duration: true, activities: true, accommodation: true, dates: true, groupSize: true },
      bookingInfo: { instantBook: false, requiresApproval: true, advanceBooking: 7, cancellationPolicy: 'Free cancellation up to 48 hours before departure' },
      featured: true,
      status: 'published'
    },
    {
      title: 'Tokyo Cultural Discovery',
      slug: 'tokyo-cultural-discovery',
      description: 'Immerse yourself in Japanese culture and modern city life',
      primaryDestination: cities.find(c => c.name === 'Tokyo')._id,
      destinations: [cities.find(c => c.name === 'Tokyo')._id],
      countries: [cities.find(c => c.name === 'Tokyo').country],
      duration: { days: 6, nights: 5 },
      type: 'featured',
      category: categories.find(c => c.name === 'Cultural')._id,
      tags: ['culture', 'food', 'temples', 'technology'],
      travelStyle: 'cultural',
      difficulty: 'moderate',
      suitableFor: { couples: true, families: true, soloTravelers: true, groups: true },
      pricing: { currency: 'USD', estimated: 2800, breakdown: { flights: 1200, accommodation: 800, activities: 500, food: 300, transport: 0, other: 0 }, priceRange: 'luxury' },
      customizable: { duration: true, activities: true, accommodation: true, dates: true, groupSize: true },
      bookingInfo: { instantBook: true, requiresApproval: false, advanceBooking: 10, cancellationPolicy: 'Free cancellation up to 72 hours before departure' },
      featured: true,
      status: 'published'
    },
    {
      title: 'New York City Explorer',
      slug: 'new-york-city-explorer',
      description: 'Discover the energy and excitement of the Big Apple',
      primaryDestination: cities.find(c => c.name === 'New York')._id,
      destinations: [cities.find(c => c.name === 'New York')._id],
      countries: [cities.find(c => c.name === 'New York').country],
      duration: { days: 4, nights: 3 },
      type: 'featured',
      category: categories.find(c => c.name === 'Cultural')._id,
      tags: ['city', 'museums', 'broadway', 'shopping'],
      travelStyle: 'cultural',
      difficulty: 'easy',
      suitableFor: { couples: true, families: true, soloTravelers: true, groups: true },
      pricing: { currency: 'USD', estimated: 1200, breakdown: { flights: 400, accommodation: 500, activities: 200, food: 100, transport: 0, other: 0 }, priceRange: 'mid-range' },
      customizable: { duration: true, activities: true, accommodation: true, dates: true, groupSize: true },
      bookingInfo: { instantBook: true, requiresApproval: false, advanceBooking: 5, cancellationPolicy: 'Free cancellation up to 24 hours before departure' },
      featured: false,
      status: 'published'
    },
    {
      title: 'London Royal Heritage Tour',
      slug: 'london-royal-heritage-tour',
      description: 'Experience the grandeur of British royalty and history',
      primaryDestination: cities.find(c => c.name === 'London')._id,
      destinations: [cities.find(c => c.name === 'London')._id],
      countries: [cities.find(c => c.name === 'London').country],
      duration: { days: 5, nights: 4 },
      type: 'featured',
      category: categories.find(c => c.name === 'Luxury')._id,
      tags: ['royalty', 'history', 'castles', 'museums'],
      travelStyle: 'luxury',
      difficulty: 'easy',
      suitableFor: { couples: true, families: true, soloTravelers: false, groups: true },
      pricing: { currency: 'GBP', estimated: 1800, breakdown: { flights: 600, accommodation: 700, activities: 350, food: 150, transport: 0, other: 0 }, priceRange: 'luxury' },
      customizable: { duration: true, activities: true, accommodation: true, dates: true, groupSize: true },
      bookingInfo: { instantBook: false, requiresApproval: true, advanceBooking: 14, cancellationPolicy: 'Free cancellation up to 7 days before departure' },
      featured: false,
      status: 'published'
    },
    {
      title: 'Bali Yoga Retreat',
      slug: 'bali-yoga-retreat',
      description: 'Find inner peace with yoga and meditation in tropical Bali',
      primaryDestination: cities.find(c => c.name === 'Bali')._id,
      destinations: [cities.find(c => c.name === 'Bali')._id],
      countries: [cities.find(c => c.name === 'Bali').country],
      duration: { days: 10, nights: 9 },
      type: 'custom',
      category: categories.find(c => c.name === 'Adventure')._id,
      tags: ['yoga', 'meditation', 'wellness', 'nature'],
      travelStyle: 'relaxed',
      difficulty: 'easy',
      suitableFor: { couples: true, families: false, soloTravelers: true, groups: true },
      pricing: { currency: 'USD', estimated: 2200, breakdown: { flights: 700, accommodation: 900, activities: 400, food: 200, transport: 0, other: 0 }, priceRange: 'mid-range' },
      customizable: { duration: true, activities: true, accommodation: true, dates: true, groupSize: true },
      bookingInfo: { instantBook: false, requiresApproval: true, advanceBooking: 21, cancellationPolicy: 'Free cancellation up to 14 days before departure' },
      featured: false,
      status: 'published'
    },
    {
      title: 'Paris Art & Culture Week',
      slug: 'paris-art-culture-week',
      description: 'Immerse yourself in Parisian art, culture, and cuisine',
      primaryDestination: cities.find(c => c.name === 'Paris')._id,
      destinations: [cities.find(c => c.name === 'Paris')._id],
      countries: [cities.find(c => c.name === 'Paris').country],
      duration: { days: 7, nights: 6 },
      type: 'custom',
      category: categories.find(c => c.name === 'Cultural')._id,
      tags: ['art', 'museums', 'cuisine', 'culture'],
      travelStyle: 'cultural',
      difficulty: 'moderate',
      suitableFor: { couples: true, families: true, soloTravelers: true, groups: false },
      pricing: { currency: 'EUR', estimated: 2500, breakdown: { flights: 900, accommodation: 1000, activities: 400, food: 200, transport: 0, other: 0 }, priceRange: 'luxury' },
      customizable: { duration: true, activities: true, accommodation: true, dates: true, groupSize: true },
      bookingInfo: { instantBook: true, requiresApproval: false, advanceBooking: 7, cancellationPolicy: 'Free cancellation up to 48 hours before departure' },
      featured: false,
      status: 'published'
    },
    {
      title: 'Tokyo Food Adventure',
      slug: 'tokyo-food-adventure',
      description: 'Discover authentic Japanese cuisine and street food',
      primaryDestination: cities.find(c => c.name === 'Tokyo')._id,
      destinations: [cities.find(c => c.name === 'Tokyo')._id],
      countries: [cities.find(c => c.name === 'Tokyo').country],
      duration: { days: 5, nights: 4 },
      type: 'custom',
      category: categories.find(c => c.name === 'Cultural')._id,
      tags: ['food', 'cuisine', 'street food', 'culture'],
      travelStyle: 'cultural',
      difficulty: 'moderate',
      suitableFor: { couples: true, families: true, soloTravelers: true, groups: true },
      pricing: { currency: 'USD', estimated: 1800, breakdown: { flights: 800, accommodation: 600, activities: 250, food: 150, transport: 0, other: 0 }, priceRange: 'mid-range' },
      customizable: { duration: true, activities: true, accommodation: true, dates: true, groupSize: true },
      bookingInfo: { instantBook: true, requiresApproval: false, advanceBooking: 10, cancellationPolicy: 'Free cancellation up to 72 hours before departure' },
      featured: false,
      status: 'published'
    },
    {
      title: 'New York Family Fun',
      slug: 'new-york-family-fun',
      description: 'Perfect family adventure in the Big Apple',
      primaryDestination: cities.find(c => c.name === 'New York')._id,
      destinations: [cities.find(c => c.name === 'New York')._id],
      countries: [cities.find(c => c.name === 'New York').country],
      duration: { days: 6, nights: 5 },
      type: 'featured',
      category: categories.find(c => c.name === 'Family')._id,
      tags: ['family', 'kids', 'attractions', 'entertainment'],
      travelStyle: 'relaxed',
      difficulty: 'easy',
      suitableFor: { couples: false, families: true, soloTravelers: false, groups: true },
      pricing: { currency: 'USD', estimated: 2000, breakdown: { flights: 600, accommodation: 800, activities: 400, food: 200, transport: 0, other: 0 }, priceRange: 'mid-range' },
      customizable: { duration: true, activities: true, accommodation: true, dates: true, groupSize: true },
      bookingInfo: { instantBook: true, requiresApproval: false, advanceBooking: 7, cancellationPolicy: 'Free cancellation up to 48 hours before departure' },
      featured: false,
      status: 'published'
    },
    {
      title: 'London Theatre & Music',
      slug: 'london-theatre-music',
      description: 'Experience the best of London\'s theatre and music scene',
      primaryDestination: cities.find(c => c.name === 'London')._id,
      destinations: [cities.find(c => c.name === 'London')._id],
      countries: [cities.find(c => c.name === 'London').country],
      duration: { days: 4, nights: 3 },
      type: 'custom',
      category: categories.find(c => c.name === 'Cultural')._id,
      tags: ['theatre', 'music', 'entertainment', 'culture'],
      travelStyle: 'cultural',
      difficulty: 'easy',
      suitableFor: { couples: true, families: true, soloTravelers: true, groups: true },
      pricing: { currency: 'GBP', estimated: 1200, breakdown: { flights: 400, accommodation: 500, activities: 200, food: 100, transport: 0, other: 0 }, priceRange: 'mid-range' },
      customizable: { duration: true, activities: true, accommodation: true, dates: true, groupSize: true },
      bookingInfo: { instantBook: true, requiresApproval: false, advanceBooking: 5, cancellationPolicy: 'Free cancellation up to 24 hours before departure' },
      featured: false,
      status: 'published'
    }
  ];

  await Trip.deleteMany({});
  const createdTrips = await Trip.insertMany(trips);
  console.log(`✅ Created ${createdTrips.length} trips`);
  return createdTrips;
};

const seedHotels = async (cities) => {
  console.log('🏨 Seeding hotels...');
  const hotels = [
    {
      name: 'Grand Bali Resort & Spa',
      chain: 'Grand Hotels',
      hotelCategory: 'resort',
      description: 'Luxury beachfront resort with world-class amenities and stunning ocean views',
      shortDescription: 'Luxury beachfront resort with spa and multiple dining options',
      starRating: 5,
      location: { 
        city: cities.find(c => c.name === 'Bali')._id, 
        country: cities.find(c => c.name === 'Bali').country, 
        address: { street: 'Jl. Pantai Kuta No. 1', area: 'Kuta Beach', landmark: 'Near Kuta Beach', zipCode: '80361' }, 
        coordinates: { type: 'Point', coordinates: [115.0920, -8.3405] },
        distanceFromCenter: 5.2,
        nearbyAttractions: ['Kuta Beach', 'Waterbom Bali', 'Bali Airport']
      },
      contact: { phone: '+62-361-123456', email: 'info@grandbali.com', website: 'https://grandbali.com', checkIn: '15:00', checkOut: '11:00' },
      rooms: [{
        id: 'deluxe-ocean',
        name: 'Deluxe Ocean View',
        type: 'deluxe',
        size: 45,
        maxOccupancy: 2,
        bedConfiguration: { kingBeds: 1 },
        amenities: ['Ocean View', 'Balcony', 'Mini Bar', 'WiFi', 'AC'],
        pricing: { baseRate: 350, currency: 'USD', taxes: 50, totalRate: 400, cancellationPolicy: { type: 'free', deadline: 24 } },
        totalRooms: 50
      }],
      amenities: { general: [{ name: 'WiFi', category: 'connectivity', available: true }, { name: 'Pool', category: 'recreation', available: true }, { name: 'Spa', category: 'services', available: true, fee: 50 }, { name: 'Restaurant', category: 'food', available: true }, { name: 'Bar', category: 'food', available: true }, { name: 'Gym', category: 'recreation', available: true }, { name: 'Beach Access', category: 'recreation', available: true }] },
      policies: {
        checkIn: { from: '15:00', to: '23:00', minAge: 18 },
        checkOut: { from: '06:00', to: '11:00' },
        cancellation: 'Free cancellation up to 24 hours before check-in',
        children: { allowed: true, freeAge: 12, extraBedFee: 50 },
        pets: { allowed: false }
      },
      rating: { overall: 4.8, breakdown: { cleanliness: 4.9, comfort: 4.8, location: 4.7, service: 4.8, value: 4.6, facilities: 4.9 }, reviewCount: 1247 },
      pricing: { priceRange: { min: 250, max: 800, currency: 'USD' }, averageNightlyRate: 450 },
      images: [{ url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', alt: 'Grand Bali Resort', category: 'exterior', isPrimary: true, order: 1 }],
      tags: ['beachfront', 'luxury', 'spa', 'family-friendly'],
      featured: true,
      verified: true,
      status: 'active'
    },
    {
      name: 'Hotel Le Meurice Paris',
      chain: 'Dorchester Collection',
      hotelCategory: 'luxury',
      description: 'Iconic luxury hotel in the heart of Paris with palace-level service',
      shortDescription: 'Luxury palace hotel near Louvre with Michelin-starred dining',
      starRating: 5,
      location: { 
        city: cities.find(c => c.name === 'Paris')._id, 
        country: cities.find(c => c.name === 'Paris').country, 
        address: { street: '228 Rue de Rivoli', area: '1st Arrondissement', landmark: 'Near Louvre Museum', zipCode: '75001' }, 
        coordinates: { type: 'Point', coordinates: [2.3276, 48.8656] },
        distanceFromCenter: 1.2,
        nearbyAttractions: ['Louvre Museum', 'Tuileries Garden', 'Place Vendome']
      },
      contact: { phone: '+33-1-44-58-10-10', email: 'info@lemeurice.com', website: 'https://lemeurice.com', checkIn: '15:00', checkOut: '12:00' },
      rooms: [{
        id: 'classic-room',
        name: 'Classic Room',
        type: 'standard',
        size: 35,
        maxOccupancy: 2,
        bedConfiguration: { kingBeds: 1 },
        amenities: ['City View', 'Marble Bathroom', 'Mini Bar', 'WiFi', 'AC'],
        pricing: { baseRate: 800, currency: 'EUR', taxes: 150, totalRate: 950, cancellationPolicy: { type: 'partial', deadline: 48, fee: 100 } },
        totalRooms: 80
      }],
      amenities: { general: [{ name: 'WiFi', category: 'connectivity', available: true }, { name: 'Spa', category: 'services', available: true, fee: 120 }, { name: 'Restaurant', category: 'food', available: true }, { name: 'Bar', category: 'food', available: true }, { name: 'Concierge', category: 'services', available: true }, { name: 'Valet', category: 'services', available: true, fee: 30 }] },
      policies: {
        checkIn: { from: '15:00', to: '24:00', minAge: 18 },
        checkOut: { from: '07:00', to: '12:00' },
        cancellation: 'Partial refund with 48h notice',
        children: { allowed: true, freeAge: 12, extraBedFee: 80 },
        pets: { allowed: true, fee: 50 }
      },
      rating: { overall: 4.9, breakdown: { cleanliness: 5.0, comfort: 4.9, location: 5.0, service: 4.9, value: 4.5, facilities: 4.8 }, reviewCount: 892 },
      pricing: { priceRange: { min: 500, max: 2000, currency: 'EUR' }, averageNightlyRate: 950 },
      tags: ['luxury', 'palace', 'michelin', 'historic'],
      featured: true,
      verified: true,
      status: 'active'
    },
    {
      name: 'Park Hyatt Tokyo',
      chain: 'Hyatt Hotels',
      hotelCategory: 'luxury',
      description: 'Contemporary luxury hotel in the heart of Shinjuku with panoramic city views',
      shortDescription: 'Luxury hotel with city views and world-class dining',
      starRating: 5,
      location: { 
        city: cities.find(c => c.name === 'Tokyo')._id, 
        country: cities.find(c => c.name === 'Tokyo').country, 
        address: { street: '3-7-1-2 Nishi Shinjuku', area: 'Shinjuku', landmark: 'Shinjuku Park Tower', zipCode: '163-1055' }, 
        coordinates: { type: 'Point', coordinates: [139.6917, 35.6938] },
        distanceFromCenter: 2.1,
        nearbyAttractions: ['Tokyo Metropolitan Government Building', 'Meiji Shrine', 'Shinjuku Park']
      },
      contact: { phone: '+81-3-5322-1234', email: 'tokyo.park@hyatt.com', website: 'https://tokyo.park.hyatt.com', checkIn: '15:00', checkOut: '12:00' },
      rooms: [{
        id: 'park-deluxe',
        name: 'Park Deluxe Room',
        type: 'deluxe',
        size: 45,
        maxOccupancy: 2,
        bedConfiguration: { kingBeds: 1 },
        amenities: ['City View', 'Marble Bathroom', 'Mini Bar', 'WiFi', 'AC'],
        pricing: { baseRate: 550, currency: 'USD', taxes: 100, totalRate: 650, cancellationPolicy: { type: 'free', deadline: 24 } },
        totalRooms: 60
      }],
      amenities: { general: [{ name: 'WiFi', category: 'connectivity', available: true }, { name: 'Spa', category: 'services', available: true, fee: 80 }, { name: 'Pool', category: 'recreation', available: true }, { name: 'Restaurant', category: 'food', available: true }, { name: 'Bar', category: 'food', available: true }, { name: 'Gym', category: 'recreation', available: true }] },
      policies: {
        checkIn: { from: '15:00', to: '24:00', minAge: 18 },
        checkOut: { from: '06:00', to: '12:00' },
        cancellation: 'Free cancellation up to 24 hours',
        children: { allowed: true, freeAge: 12, extraBedFee: 60 },
        pets: { allowed: false }
      },
      rating: { overall: 4.7, breakdown: { cleanliness: 4.8, comfort: 4.7, location: 4.6, service: 4.8, value: 4.5, facilities: 4.7 }, reviewCount: 654 },
      pricing: { priceRange: { min: 400, max: 1200, currency: 'USD' }, averageNightlyRate: 650 },
      tags: ['luxury', 'business', 'city-view', 'spa'],
      featured: true,
      verified: true,
      status: 'active'
    },
    {
      name: 'The Plaza New York',
      chain: 'Fairmont Hotels',
      hotelCategory: 'luxury',
      description: 'Iconic luxury hotel overlooking Central Park with timeless elegance',
      shortDescription: 'Legendary luxury hotel at Fifth Avenue and Central Park',
      starRating: 5,
      location: { 
        city: cities.find(c => c.name === 'New York')._id, 
        country: cities.find(c => c.name === 'New York').country, 
        address: { street: '768 5th Ave', area: 'Midtown Manhattan', landmark: 'Central Park South', zipCode: '10019' }, 
        coordinates: { type: 'Point', coordinates: [-73.9759, 40.7648] },
        distanceFromCenter: 1.5,
        nearbyAttractions: ['Central Park', 'Times Square', 'Fifth Avenue']
      },
      contact: { phone: '+1-212-759-3000', email: 'info@theplaza.com', website: 'https://theplaza.com', checkIn: '16:00', checkOut: '12:00' },
      rooms: [{
        id: 'plaza-room',
        name: 'Plaza Room',
        type: 'standard',
        size: 40,
        maxOccupancy: 2,
        bedConfiguration: { kingBeds: 1 },
        amenities: ['City View', 'Marble Bathroom', 'Mini Bar', 'WiFi', 'AC'],
        pricing: { baseRate: 700, currency: 'USD', taxes: 150, totalRate: 850, cancellationPolicy: { type: 'partial', deadline: 48, fee: 150 } },
        totalRooms: 100
      }],
      amenities: { general: [{ name: 'WiFi', category: 'connectivity', available: true }, { name: 'Spa', category: 'services', available: true, fee: 150 }, { name: 'Restaurant', category: 'food', available: true }, { name: 'Bar', category: 'food', available: true }, { name: 'Gym', category: 'recreation', available: true }, { name: 'Concierge', category: 'services', available: true }, { name: 'Room Service', category: 'services', available: true }] },
      policies: {
        checkIn: { from: '16:00', to: '24:00', minAge: 21 },
        checkOut: { from: '07:00', to: '12:00' },
        cancellation: 'Partial refund with 48h notice',
        children: { allowed: true, freeAge: 12, extraBedFee: 75 },
        pets: { allowed: true, fee: 75 }
      },
      rating: { overall: 4.6, breakdown: { cleanliness: 4.7, comfort: 4.6, location: 4.9, service: 4.5, value: 4.2, facilities: 4.6 }, reviewCount: 2156 },
      pricing: { priceRange: { min: 600, max: 1500, currency: 'USD' }, averageNightlyRate: 850 },
      tags: ['luxury', 'historic', 'central-park', 'iconic'],
      featured: false,
      verified: true,
      status: 'active'
    },
    {
      name: 'The Savoy London',
      chain: 'Fairmont Hotels',
      hotelCategory: 'luxury',
      description: 'Legendary luxury hotel on the Strand with Art Deco elegance',
      shortDescription: 'Historic luxury hotel in Covent Garden with Thames views',
      starRating: 5,
      location: { 
        city: cities.find(c => c.name === 'London')._id, 
        country: cities.find(c => c.name === 'London').country, 
        address: { street: 'Strand', area: 'Covent Garden', landmark: 'Thames Embankment', zipCode: 'WC2R 0EZ' }, 
        coordinates: { type: 'Point', coordinates: [-0.1205, 51.5101] },
        distanceFromCenter: 0.8,
        nearbyAttractions: ['Covent Garden', 'Thames River', 'Somerset House']
      },
      contact: { phone: '+44-20-7836-4343', email: 'info@thesavoy.com', website: 'https://thesavoy.com', checkIn: '15:00', checkOut: '12:00' },
      rooms: [{
        id: 'superior-room',
        name: 'Superior Room',
        type: 'standard',
        size: 35,
        maxOccupancy: 2,
        bedConfiguration: { kingBeds: 1 },
        amenities: ['River View', 'Marble Bathroom', 'Mini Bar', 'WiFi', 'AC'],
        pricing: { baseRate: 600, currency: 'GBP', taxes: 150, totalRate: 750, cancellationPolicy: { type: 'free', deadline: 24 } },
        totalRooms: 70
      }],
      amenities: { general: [{ name: 'WiFi', category: 'connectivity', available: true }, { name: 'Spa', category: 'services', available: true, fee: 100 }, { name: 'Restaurant', category: 'food', available: true }, { name: 'Bar', category: 'food', available: true }, { name: 'Gym', category: 'recreation', available: true }, { name: 'Butler Service', category: 'services', available: true, fee: 200 }] },
      policies: {
        checkIn: { from: '15:00', to: '24:00', minAge: 18 },
        checkOut: { from: '07:00', to: '12:00' },
        cancellation: 'Free cancellation up to 24 hours',
        children: { allowed: true, freeAge: 12, extraBedFee: 80 },
        pets: { allowed: true, fee: 50 }
      },
      rating: { overall: 4.8, breakdown: { cleanliness: 4.9, comfort: 4.8, location: 4.9, service: 4.8, value: 4.5, facilities: 4.7 }, reviewCount: 1543 },
      pricing: { priceRange: { min: 450, max: 1800, currency: 'GBP' }, averageNightlyRate: 750 },
      tags: ['luxury', 'historic', 'art-deco', 'thames-view'],
      featured: false,
      verified: true,
      status: 'active'
    },
    {
      name: 'Bali Eco Lodge',
      chain: 'Independent',
      hotelCategory: 'boutique',
      description: 'Sustainable eco-friendly accommodation surrounded by nature in Ubud',
      shortDescription: 'Eco-lodge with yoga studio and organic gardens',
      starRating: 4,
      location: { 
        city: cities.find(c => c.name === 'Bali')._id, 
        country: cities.find(c => c.name === 'Bali').country, 
        address: { street: 'Jl. Raya Ubud', area: 'Ubud', landmark: 'Monkey Forest Road', zipCode: '80571' }, 
        coordinates: { type: 'Point', coordinates: [115.2624, -8.5069] },
        distanceFromCenter: 8.5,
        nearbyAttractions: ['Monkey Forest Sanctuary', 'Ubud Market', 'Rice Terraces']
      },
      contact: { phone: '+62-361-975-123', email: 'info@baliecco.com', website: 'https://baliecco.com', checkIn: '14:00', checkOut: '11:00' },
      rooms: [{
        id: 'garden-villa',
        name: 'Garden Villa',
        type: 'villa',
        size: 50,
        maxOccupancy: 2,
        bedConfiguration: { kingBeds: 1 },
        amenities: ['Garden View', 'Private Terrace', 'Mini Bar', 'WiFi', 'Fan'],
        pricing: { baseRate: 100, currency: 'USD', taxes: 20, totalRate: 120, cancellationPolicy: { type: 'free', deadline: 24 } },
        totalRooms: 20
      }],
      amenities: { general: [{ name: 'WiFi', category: 'connectivity', available: true }, { name: 'Restaurant', category: 'food', available: true }, { name: 'Yoga Studio', category: 'recreation', available: true }, { name: 'Garden', category: 'recreation', available: true }, { name: 'Spa', category: 'services', available: true, fee: 40 }] },
      policies: {
        checkIn: { from: '14:00', to: '22:00', minAge: 18 },
        checkOut: { from: '07:00', to: '11:00' },
        cancellation: 'Free cancellation up to 24 hours',
        children: { allowed: true, freeAge: 12, extraBedFee: 25 },
        pets: { allowed: false }
      },
      rating: { overall: 4.6, breakdown: { cleanliness: 4.7, comfort: 4.5, location: 4.8, service: 4.6, value: 4.8, facilities: 4.4 }, reviewCount: 432 },
      pricing: { priceRange: { min: 80, max: 200, currency: 'USD' }, averageNightlyRate: 120 },
      tags: ['eco-friendly', 'yoga', 'nature', 'sustainable'],
      featured: false,
      verified: true,
      status: 'active'
    }
  ];

  await Hotel.deleteMany({});
  const createdHotels = await Hotel.insertMany(hotels);
  console.log(`✅ Created ${createdHotels.length} hotels`);
  return createdHotels;
};

const seedFlights = async (cities) => {
  console.log('✈️ Seeding flights...');
  
  try {
    // Create Airlines first
    const Airline = require('../src/models/Airline');
    await Airline.deleteMany({});
    const airlines = await Airline.insertMany([
      { 
        name: 'American Airlines', 
        code: 'AA', 
        country: 'United States',
        status: 'active',
        services: { classes: ['economy', 'business', 'first'] },
        hubs: ['JFK', 'LAX', 'DFW']
      },
      { 
        name: 'British Airways', 
        code: 'BA', 
        country: 'United Kingdom',
        status: 'active',
        services: { classes: ['economy', 'premium_economy', 'business', 'first'] },
        hubs: ['LHR', 'LGW']
      },
      { 
        name: 'Garuda Indonesia', 
        code: 'GA', 
        country: 'Indonesia',
        status: 'active',
        services: { classes: ['economy', 'business'] },
        hubs: ['CGK']
      }
    ]);
    
    // Create Airports first
    const Airport = require('../src/models/Airport');
    await Airport.deleteMany({});
    const airports = await Airport.insertMany([
      { 
        code: 'JFK', 
        name: 'John F. Kennedy International Airport', 
        city: 'New York', 
        country: 'United States',
        timezone: 'America/New_York',
        location: { coordinates: { type: 'Point', coordinates: [-73.7781, 40.6413] } },
        type: 'international',
        status: 'active'
      },
      { 
        code: 'CDG', 
        name: 'Charles de Gaulle Airport', 
        city: 'Paris', 
        country: 'France',
        timezone: 'Europe/Paris',
        location: { coordinates: { type: 'Point', coordinates: [2.5479, 49.0097] } },
        type: 'international',
        status: 'active'
      },
      { 
        code: 'LHR', 
        name: 'London Heathrow Airport', 
        city: 'London', 
        country: 'United Kingdom',
        timezone: 'Europe/London',
        location: { coordinates: { type: 'Point', coordinates: [-0.4543, 51.4700] } },
        type: 'international',
        status: 'active'
      },
      { 
        code: 'NRT', 
        name: 'Narita International Airport', 
        city: 'Tokyo', 
        country: 'Japan',
        timezone: 'Asia/Tokyo',
        location: { coordinates: { type: 'Point', coordinates: [140.3929, 35.7720] } },
        type: 'international',
        status: 'active'
      },
      { 
        code: 'DPS', 
        name: 'Ngurah Rai International Airport', 
        city: 'Denpasar', 
        country: 'Indonesia',
        timezone: 'Asia/Makassar',
        location: { coordinates: { type: 'Point', coordinates: [115.1668, -8.7467] } },
        type: 'international',
        status: 'active'
      }
    ]);
    
    const flights = [
      {
        flightNumber: 'AA101',
        airline: airlines.find(a => a.code === 'AA')._id,
        flightCategory: 'international',
        flightType: 'direct',
        aircraft: 'Boeing 777',
        route: {
          departure: { airport: airports.find(a => a.code === 'JFK')._id, scheduledTime: new Date('2024-06-15T08:00:00Z'), terminal: 'T4', gate: 'A12' },
          arrival: { airport: airports.find(a => a.code === 'CDG')._id, scheduledTime: new Date('2024-06-15T20:30:00Z'), terminal: '2E', gate: 'K25' }
        },
        duration: { scheduled: 450 },
        distance: 5837,
        pricing: {
          economy: { basePrice: 450, taxes: 70, totalPrice: 520, availability: 45, restrictions: { refundable: false, changeable: true, changeFee: 150 } },
          business: { basePrice: 1200, taxes: 150, totalPrice: 1350, availability: 8, restrictions: { refundable: true, changeable: true, changeFee: 0 } }
        },

        operatingDays: [1,2,3,4,5,6,0],
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2024-12-31'),
        status: 'scheduled',
        featured: true
      },
      {
        flightNumber: 'BA205',
        airline: airlines.find(a => a.code === 'BA')._id,
        flightCategory: 'international',
        flightType: 'direct',
        aircraft: 'Airbus A350',
        route: {
          departure: { airport: airports.find(a => a.code === 'LHR')._id, scheduledTime: new Date('2024-06-16T10:15:00Z'), terminal: '5', gate: 'B7' },
          arrival: { airport: airports.find(a => a.code === 'NRT')._id, scheduledTime: new Date('2024-06-17T06:45:00Z'), terminal: '1', gate: '31' }
        },
        duration: { scheduled: 690 },
        distance: 9560,
        pricing: {
          economy: { basePrice: 650, taxes: 100, totalPrice: 750, availability: 32, restrictions: { refundable: false, changeable: true, changeFee: 200 } },
          business: { basePrice: 1800, taxes: 200, totalPrice: 2000, availability: 12, restrictions: { refundable: true, changeable: true, changeFee: 0 } }
        },

        operatingDays: [1,3,5],
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2024-12-31'),
        status: 'scheduled',
        featured: false
      },
      {
        flightNumber: 'GA715',
        airline: airlines.find(a => a.code === 'GA')._id,
        flightCategory: 'international',
        flightType: 'direct',
        aircraft: 'Boeing 787',
        route: {
          departure: { airport: airports.find(a => a.code === 'DPS')._id, scheduledTime: new Date('2024-06-18T14:20:00Z'), terminal: 'I', gate: 'D5' },
          arrival: { airport: airports.find(a => a.code === 'NRT')._id, scheduledTime: new Date('2024-06-18T22:30:00Z'), terminal: '1', gate: 'C18' }
        },
        duration: { scheduled: 490 },
        distance: 3600,
        pricing: {
          economy: { basePrice: 380, taxes: 80, totalPrice: 460, availability: 28, restrictions: { refundable: false, changeable: true, changeFee: 100 } },
          business: { basePrice: 950, taxes: 120, totalPrice: 1070, availability: 6, restrictions: { refundable: true, changeable: true, changeFee: 0 } }
        },

        operatingDays: [0,2,4,6],
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2024-12-31'),
        status: 'scheduled',
        featured: false
      }
    ];

    await Flight.deleteMany({});
    const createdFlights = await Flight.insertMany(flights);
    console.log(`✅ Created ${createdFlights.length} flights`);
    console.log(`✅ Created ${airlines.length} airlines`);
    console.log(`✅ Created ${airports.length} airports`);
    return createdFlights;
  } catch (error) {
    console.log('⚠️ Skipping flights - models not available:', error.message);
    return [];
  }
};

const seedActivities = async (cities, categories) => {
  console.log('🎯 Seeding activities...');
  const activities = [
    {
      name: 'Bali Temple Tour',
      slug: 'bali-temple-tour',
      description: 'Visit ancient Hindu temples and learn about Balinese culture',
      shortDescription: 'Explore sacred temples with expert guide',
      category: categories.find(c => c.name === 'Cultural')._id,
      city: cities.find(c => c.name === 'Bali')._id,
      country: cities.find(c => c.name === 'Bali').country,
      coordinates: { type: 'Point', coordinates: [115.0920, -8.3405] },
      type: 'cultural',
      duration: { typical: 360, min: 300, max: 420 },
      difficulty: 'easy',
      pricing: { currency: 'USD', adult: 45, child: 25, group: 300, priceType: 'per-person' },
      highlights: ['Ancient temples', 'Cultural insights', 'Photo opportunities'],
      includes: ['Professional guide', 'Transportation', 'Temple entrance fees', 'Bottled water'],
      excludes: ['Lunch', 'Personal expenses', 'Gratuities'],
      rating: { overall: 4.8, reviewCount: 234 },
      availability: { daysOfWeek: [1,2,3,4,5,6], timeSlots: [{ start: '09:00', end: '15:00', capacity: 15 }] },
      images: [{ url: 'https://images.unsplash.com/photo-1555400082-8c5cd5b3c3d1?w=800', alt: 'Bali Temple', isPrimary: true }],
      status: 'active',
      featured: true
    },
    {
      name: 'Paris Seine River Cruise',
      slug: 'paris-seine-cruise',
      description: 'Romantic evening cruise along the Seine with gourmet dinner',
      shortDescription: 'Romantic dinner cruise with city views',
      category: categories.find(c => c.name === 'Romance')._id,
      city: cities.find(c => c.name === 'Paris')._id,
      country: cities.find(c => c.name === 'Paris').country,
      coordinates: { type: 'Point', coordinates: [2.3522, 48.8566] },
      type: 'entertainment',
      duration: { typical: 180, min: 150, max: 210 },
      difficulty: 'easy',
      pricing: { currency: 'EUR', adult: 85, child: 45, group: 1200, priceType: 'per-person' },
      highlights: ['Seine river views', 'Gourmet dinner', 'Live music', 'City landmarks'],
      includes: ['3-course dinner', 'Wine selection', 'Live entertainment', 'Commentary'],
      excludes: ['Hotel pickup', 'Gratuities', 'Additional beverages'],
      rating: { overall: 4.9, reviewCount: 567 },
      availability: { daysOfWeek: [0,1,2,3,4,5,6], timeSlots: [{ start: '19:30', end: '22:30', capacity: 50 }] },
      images: [{ url: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800', alt: 'Seine Cruise', isPrimary: true }],
      status: 'active',
      featured: true
    },
    {
      name: 'Tokyo Sushi Making Class',
      slug: 'tokyo-sushi-class',
      description: 'Learn authentic sushi preparation from master chef',
      shortDescription: 'Hands-on sushi making with expert chef',
      category: categories.find(c => c.name === 'Cultural')._id,
      city: cities.find(c => c.name === 'Tokyo')._id,
      country: cities.find(c => c.name === 'Tokyo').country,
      coordinates: { type: 'Point', coordinates: [139.6503, 35.6762] },
      type: 'food',
      duration: { typical: 240, min: 210, max: 270 },
      difficulty: 'moderate',
      pricing: { currency: 'USD', adult: 120, child: 80, group: 800, priceType: 'per-person' },
      highlights: ['Master chef instruction', 'Fresh ingredients', 'Traditional techniques', 'Take home recipes'],
      includes: ['All ingredients', 'Chef instruction', 'Lunch', 'Recipe booklet', 'Apron'],
      excludes: ['Transportation', 'Additional beverages', 'Hotel pickup'],
      rating: { overall: 4.7, reviewCount: 189 },
      availability: { daysOfWeek: [1,2,3,4,5,6], timeSlots: [{ start: '10:00', end: '14:00', capacity: 8 }, { start: '15:00', end: '19:00', capacity: 8 }] },
      images: [{ url: 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=800', alt: 'Sushi Making', isPrimary: true }],
      status: 'active',
      featured: false
    },
    {
      name: 'New York Broadway Show',
      slug: 'nyc-broadway-show',
      description: 'Premium seats to top Broadway musical productions',
      shortDescription: 'Broadway musical with premium seating',
      category: categories.find(c => c.name === 'Cultural')._id,
      city: cities.find(c => c.name === 'New York')._id,
      country: cities.find(c => c.name === 'New York').country,
      coordinates: { type: 'Point', coordinates: [-74.0060, 40.7128] },
      type: 'entertainment',
      duration: { typical: 180, min: 150, max: 210 },
      difficulty: 'easy',
      pricing: { currency: 'USD', adult: 150, child: 120, group: 1200, priceType: 'per-person' },
      highlights: ['Premium orchestra seats', 'Top-rated shows', 'Theater district location'],
      includes: ['Show tickets', 'Program', 'Theater guide'],
      excludes: ['Transportation', 'Dinner', 'Drinks'],
      rating: { overall: 4.8, reviewCount: 892 },
      availability: { daysOfWeek: [0,1,2,3,4,5,6], timeSlots: [{ start: '19:00', end: '22:00', capacity: 20 }] },
      status: 'active',
      featured: true
    },
    {
      name: 'London Royal Palace Tour',
      slug: 'london-palace-tour',
      description: 'Exclusive guided tour of Buckingham Palace and Windsor Castle',
      shortDescription: 'Royal palaces with expert historian guide',
      category: categories.find(c => c.name === 'Luxury')._id,
      city: cities.find(c => c.name === 'London')._id,
      country: cities.find(c => c.name === 'London').country,
      coordinates: { type: 'Point', coordinates: [-0.1278, 51.5074] },
      type: 'sightseeing',
      duration: { typical: 480, min: 420, max: 540 },
      difficulty: 'moderate',
      pricing: { currency: 'GBP', adult: 95, child: 65, group: 750, priceType: 'per-person' },
      highlights: ['Buckingham Palace', 'Windsor Castle', 'Crown Jewels', 'Royal history'],
      includes: ['Expert guide', 'Palace entries', 'Transportation', 'Audio headsets'],
      excludes: ['Lunch', 'Personal expenses', 'Photography fees'],
      rating: { overall: 4.6, reviewCount: 445 },
      availability: { daysOfWeek: [1,2,3,4,5], timeSlots: [{ start: '09:00', end: '17:00', capacity: 12 }] },
      status: 'active',
      featured: false
    }
  ];

  await Activity.deleteMany({});
  const createdActivities = await Activity.insertMany(activities);
  console.log(`✅ Created ${createdActivities.length} activities`);
  return createdActivities;
};

const seedUsers = async () => {
  console.log('👥 Seeding users...');
  const bcrypt = require('bcryptjs');
  
  const users = [
    { email: 'admin@travel.com', password: await bcrypt.hash('admin123', 10), role: 'admin', profile: { firstName: 'Admin', lastName: 'User' }, status: 'active', emailVerified: true },
    { email: 'customer@travel.com', password: await bcrypt.hash('customer123', 10), role: 'customer', profile: { firstName: 'John', lastName: 'Doe' }, status: 'active', emailVerified: true }
  ];

  await User.deleteMany({});
  const createdUsers = await User.insertMany(users);
  console.log(`✅ Created ${createdUsers.length} users`);
  return createdUsers;
};

const main = async () => {
  try {
    await connectDB();
    
    console.log('🚀 Starting demo data seeding...\n');
    
    const countries = await seedCountries();
    const categories = await seedCategories();
    const cities = await seedCities(countries);
    const trips = await seedTrips(cities, categories);
    const hotels = await seedHotels(cities);
    const flights = await seedFlights(cities);
    const activities = await seedActivities(cities, categories);
    const users = await seedUsers();
    
    console.log('\n🎉 Demo data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Countries: ${countries.length}`);
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Cities: ${cities.length}`);
    console.log(`   Trips: ${trips.length}`);
    console.log(`   Hotels: ${hotels.length}`);
    console.log(`   Flights: ${flights.length}`);
    console.log(`   Activities: ${activities.length}`);
    console.log(`   Users: ${users.length}`);
    
    console.log('\n🔐 Login Credentials:');
    console.log('   Admin: admin@travel.com / admin123');
    console.log('   Customer: customer@travel.com / customer123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

main();