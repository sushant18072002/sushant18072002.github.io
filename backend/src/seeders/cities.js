const { City, Country } = require('../models');

const sampleCountries = [
  { name: 'France', code: 'FR', code3: 'FRA', currency: 'EUR', continent: 'Europe' },
  { name: 'USA', code: 'US', code3: 'USA', currency: 'USD', continent: 'North America' },
  { name: 'UAE', code: 'AE', code3: 'ARE', currency: 'AED', continent: 'Asia' },
  { name: 'Japan', code: 'JP', code3: 'JPN', currency: 'JPY', continent: 'Asia' },
  { name: 'UK', code: 'GB', code3: 'GBR', currency: 'GBP', continent: 'Europe' },
  { name: 'Italy', code: 'IT', code3: 'ITA', currency: 'EUR', continent: 'Europe' },
  { name: 'Spain', code: 'ES', code3: 'ESP', currency: 'EUR', continent: 'Europe' },
  { name: 'Netherlands', code: 'NL', code3: 'NLD', currency: 'EUR', continent: 'Europe' },
  { name: 'Australia', code: 'AU', code3: 'AUS', currency: 'AUD', continent: 'Oceania' },
  { name: 'Singapore', code: 'SG', code3: 'SGP', currency: 'SGD', continent: 'Asia' },
  { name: 'Thailand', code: 'TH', code3: 'THA', currency: 'THB', continent: 'Asia' },
  { name: 'Turkey', code: 'TR', code3: 'TUR', currency: 'TRY', continent: 'Asia' },
  { name: 'Germany', code: 'DE', code3: 'DEU', currency: 'EUR', continent: 'Europe' },
  { name: 'Czech Republic', code: 'CZ', code3: 'CZE', currency: 'CZK', continent: 'Europe' }
];

const sampleCitiesData = [
  { name: 'Paris', countryName: 'France' },
  { name: 'New York', countryName: 'USA' },
  { name: 'Dubai', countryName: 'UAE' },
  { name: 'Tokyo', countryName: 'Japan' },
  { name: 'London', countryName: 'UK' },
  { name: 'Los Angeles', countryName: 'USA' },
  { name: 'Rome', countryName: 'Italy' },
  { name: 'Barcelona', countryName: 'Spain' },
  { name: 'Amsterdam', countryName: 'Netherlands' },
  { name: 'Sydney', countryName: 'Australia' },
  { name: 'Singapore', countryName: 'Singapore' },
  { name: 'Bangkok', countryName: 'Thailand' },
  { name: 'Istanbul', countryName: 'Turkey' },
  { name: 'Berlin', countryName: 'Germany' },
  { name: 'Prague', countryName: 'Czech Republic' }
];

const seedCities = async () => {
  try {
    console.log('🌍 Seeding cities...');
    
    // Clear existing cities only
    await City.deleteMany({});
    
    // Check if countries exist, if not create them
    const existingCountries = await Country.find();
    if (existingCountries.length === 0) {
      await Country.insertMany(sampleCountries);
    }
    
    // Get all countries
    const countries = await Country.find();
    console.log(`📍 Found ${countries.length} countries`);
    
    // Create country name to ID mapping
    const countryMap = {};
    countries.forEach(country => {
      countryMap[country.name] = country._id;
    });
    
    // Prepare cities with country references
    const citiesWithRefs = sampleCitiesData
      .filter(cityData => countryMap[cityData.countryName]) // Only include cities with valid countries
      .map(cityData => ({
        name: cityData.name,
        country: countryMap[cityData.countryName],
        status: 'active'
      }));
    
    // Insert cities
    const cities = await City.insertMany(citiesWithRefs);
    console.log(`✅ Created ${cities.length} cities`);
    
    return { countries, cities };
  } catch (error) {
    console.error('❌ Error seeding cities:', error);
    throw error;
  }
};

module.exports = { seedCities };