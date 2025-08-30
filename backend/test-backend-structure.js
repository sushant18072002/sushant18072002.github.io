require('dotenv').config();
const mongoose = require('mongoose');

async function testBackendStructure() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const { Trip, City, Country, Category, Activity } = require('./src/models');

    console.log('\n📊 BACKEND STRUCTURE ANALYSIS:');
    console.log('=====================================');

    // Test Trip model structure
    console.log('\n🎯 TRIP MODEL ANALYSIS:');
    const tripCount = await Trip.countDocuments();
    console.log(`- Total trips: ${tripCount}`);
    
    if (tripCount > 0) {
      const sampleTrip = await Trip.findOne()
        .populate('primaryDestination', 'name country')
        .populate('destinations', 'name country')
        .populate('countries', 'name code')
        .populate('category', 'name');
      
      console.log('- Sample trip structure:');
      console.log(`  * Title: ${sampleTrip?.title}`);
      console.log(`  * Primary Destination: ${sampleTrip?.primaryDestination?.name}`);
      console.log(`  * Additional Destinations: ${sampleTrip?.destinations?.length || 0}`);
      console.log(`  * Countries: ${sampleTrip?.countries?.length || 0}`);
      console.log(`  * Category: ${sampleTrip?.category?.name || 'None'}`);
    }

    // Test City model structure (Destinations)
    console.log('\n🏙️ CITY/DESTINATION MODEL ANALYSIS:');
    const cityCount = await City.countDocuments();
    const featuredCityCount = await City.countDocuments({ featured: true });
    console.log(`- Total cities: ${cityCount}`);
    console.log(`- Featured destinations: ${featuredCityCount}`);
    
    if (cityCount > 0) {
      const sampleCity = await City.findOne()
        .populate('country', 'name code')
        .populate('state', 'name');
      
      console.log('- Sample city/destination structure:');
      console.log(`  * Name: ${sampleCity?.name}`);
      console.log(`  * Country: ${sampleCity?.country?.name}`);
      console.log(`  * State: ${sampleCity?.state?.name || 'None'}`);
      console.log(`  * Featured: ${sampleCity?.featured}`);
      console.log(`  * Has pricing: ${!!sampleCity?.pricing}`);
      console.log(`  * Has stats: ${!!sampleCity?.stats}`);
      console.log(`  * Images: ${sampleCity?.images?.length || 0}`);
    }

    // Test Country model
    console.log('\n🌍 COUNTRY MODEL ANALYSIS:');
    const countryCount = await Country.countDocuments();
    console.log(`- Total countries: ${countryCount}`);

    // Test Category model
    console.log('\n🏷️ CATEGORY MODEL ANALYSIS:');
    const categoryCount = await Category.countDocuments();
    console.log(`- Total categories: ${categoryCount}`);

    // Test Activity model
    console.log('\n🎯 ACTIVITY MODEL ANALYSIS:');
    const activityCount = await Activity.countDocuments();
    console.log(`- Total activities: ${activityCount}`);

    // Test relationships
    console.log('\n🔗 RELATIONSHIP ANALYSIS:');
    const tripsWithDestinations = await Trip.countDocuments({ 
      destinations: { $exists: true, $ne: [] } 
    });
    const tripsWithCountries = await Trip.countDocuments({ 
      countries: { $exists: true, $ne: [] } 
    });
    
    console.log(`- Trips with multiple destinations: ${tripsWithDestinations}`);
    console.log(`- Trips with country references: ${tripsWithCountries}`);

    // Test API endpoints structure
    console.log('\n🌐 API ENDPOINT VERIFICATION:');
    console.log('- Home endpoints: /api/home/featured, /api/home/stats');
    console.log('- Destination endpoints: /api/destinations/featured, /api/destinations/spotlight');
    console.log('- Master data endpoints: /api/master/countries, /api/master/cities');
    console.log('- Trip endpoints: /api/trips, /api/trips/featured');

    // Identify potential issues
    console.log('\n⚠️ POTENTIAL ISSUES:');
    const issues = [];

    if (featuredCityCount === 0) {
      issues.push('No featured destinations found - homepage will be empty');
    }

    if (tripCount === 0) {
      issues.push('No trips found - trip pages will be empty');
    }

    if (categoryCount === 0) {
      issues.push('No categories found - trip categorization unavailable');
    }

    const citiesWithoutCountry = await City.countDocuments({ country: { $exists: false } });
    if (citiesWithoutCountry > 0) {
      issues.push(`${citiesWithoutCountry} cities without country reference`);
    }

    if (issues.length === 0) {
      console.log('✅ No major issues detected');
    } else {
      issues.forEach(issue => console.log(`❌ ${issue}`));
    }

    console.log('\n📋 RECOMMENDATIONS:');
    console.log('1. Ensure cities have featured=true for homepage display');
    console.log('2. Add pricing and stats data to cities for better UX');
    console.log('3. Create trips that reference multiple destinations');
    console.log('4. Populate categories for better trip organization');
    console.log('5. Add high-quality images to destinations');

    console.log('\n✅ Backend structure analysis completed!');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testBackendStructure();