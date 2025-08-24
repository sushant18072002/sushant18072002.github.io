require('dotenv').config();
const mongoose = require('mongoose');
const { Package } = require('./src/models');

const testPackageFlow = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travelai');
    console.log('Connected to MongoDB');
    
    // Test 1: Create a package
    console.log('\n=== TEST 1: Creating Package ===');
    const packageData = {
      title: 'Bali Paradise Escape',
      description: 'Ultimate luxury experience in tropical paradise',
      destinations: ['Bali', 'Ubud', 'Seminyak'],
      duration: 7,
      price: {
        amount: 2499,
        currency: 'USD',
        originalPrice: 2999
      },
      category: 'luxury',
      includes: ['Luxury accommodation', 'All meals', 'Private transfers'],
      excludes: ['Travel insurance', 'Personal expenses'],
      highlights: ['5-star resorts', 'Private villa', 'Spa treatments'],
      images: [{
        url: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&h=600&fit=crop',
        alt: 'Bali luxury resort',
        isPrimary: true,
        order: 1
      }],
      featured: true,
      status: 'active'
    };
    
    const newPackage = await Package.create(packageData);
    console.log('✅ Package created:', newPackage._id);
    
    // Test 2: Retrieve package
    console.log('\n=== TEST 2: Retrieving Package ===');
    const retrievedPackage = await Package.findById(newPackage._id);
    console.log('✅ Package retrieved:', {
      id: retrievedPackage._id,
      title: retrievedPackage.title,
      highlights: retrievedPackage.highlights,
      images: retrievedPackage.images.length
    });
    
    // Test 3: Search packages
    console.log('\n=== TEST 3: Searching Packages ===');
    const searchResults = await Package.find({ category: 'luxury', status: 'active' });
    console.log('✅ Search results:', searchResults.length, 'packages found');
    
    // Test 4: Featured packages
    console.log('\n=== TEST 4: Featured Packages ===');
    const featuredPackages = await Package.find({ featured: true, status: 'active' });
    console.log('✅ Featured packages:', featuredPackages.length, 'packages found');
    
    // Test 5: Data transformation (simulate controller)
    console.log('\n=== TEST 5: Data Transformation ===');
    const transformedPackage = {
      id: retrievedPackage._id,
      title: retrievedPackage.title,
      description: retrievedPackage.description,
      destination: retrievedPackage.destinations?.join(', ') || '',
      duration: retrievedPackage.duration,
      price: retrievedPackage.price?.amount || 0,
      originalPrice: retrievedPackage.price?.originalPrice,
      rating: retrievedPackage.rating?.overall || 4.8,
      reviews: retrievedPackage.rating?.reviewCount || 0,
      images: retrievedPackage.images?.map(img => img.url) || [],
      highlights: retrievedPackage.highlights || [],
      inclusions: retrievedPackage.includes || [],
      category: retrievedPackage.category
    };
    
    console.log('✅ Transformed package:', {
      id: transformedPackage.id,
      title: transformedPackage.title,
      destination: transformedPackage.destination,
      price: transformedPackage.price,
      highlights: transformedPackage.highlights.length,
      images: transformedPackage.images.length
    });
    
    console.log('\n🎉 ALL TESTS PASSED - Package flow working correctly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

testPackageFlow();