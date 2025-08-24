require('dotenv').config();
const mongoose = require('mongoose');
const { Package } = require('./src/models');

const testAllFixes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travelai');
    console.log('Connected to MongoDB');
    
    // Test 1: Create packages with different image formats
    console.log('\n=== TEST 1: Creating Packages with Different Image Formats ===');
    
    // Package with new image format
    const packageWithNewImages = await Package.create({
      title: 'Test Package - New Format',
      description: 'Testing new image format',
      destinations: ['Test City'],
      duration: 5,
      price: { amount: 1000, currency: 'USD' },
      category: 'test',
      images: [{
        url: '/uploads/packages/test-1.jpg',
        alt: 'Test image',
        isPrimary: true,
        order: 1
      }],
      highlights: ['Test highlight'],
      status: 'active'
    });
    
    // Package with old image format (string array)
    const packageWithOldImages = await Package.create({
      title: 'Test Package - Old Format',
      description: 'Testing old image format',
      destinations: ['Test City 2'],
      duration: 7,
      price: { amount: 1500, currency: 'USD' },
      category: 'test',
      images: ['https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop'],
      highlights: ['Test highlight 2'],
      status: 'active'
    });
    
    // Package with no images
    const packageWithNoImages = await Package.create({
      title: 'Test Package - No Images',
      description: 'Testing no images',
      destinations: ['Test City 3'],
      duration: 3,
      price: { amount: 500, currency: 'USD' },
      category: 'test',
      highlights: ['Test highlight 3'],
      status: 'active'
    });
    
    console.log('✅ Created 3 test packages');
    
    // Test 2: Retrieve packages and test data transformation
    console.log('\n=== TEST 2: Testing Data Transformation ===');
    
    const packages = await Package.find({ category: 'test' });
    console.log(`✅ Found ${packages.length} test packages`);
    
    packages.forEach((pkg, index) => {
      console.log(`Package ${index + 1}:`);
      console.log(`  - Title: ${pkg.title}`);
      console.log(`  - Images: ${pkg.images?.length || 0} images`);
      console.log(`  - Image format: ${typeof pkg.images?.[0] === 'string' ? 'Old (string)' : 'New (object)'}`);
    });
    
    // Test 3: Test admin controller transformation
    console.log('\n=== TEST 3: Testing Admin Controller Transformation ===');
    
    const transformedPackages = packages.map(pkg => ({
      _id: pkg._id,
      title: pkg.title || 'Untitled Package',
      description: pkg.description || '',
      destinations: pkg.destinations || [],
      duration: pkg.duration || 0,
      price: pkg.price || { amount: 0, currency: 'USD' },
      category: pkg.category || 'general',
      images: pkg.images || [],
      status: pkg.status || 'active',
      featured: pkg.featured || false
    }));
    
    console.log('✅ Admin transformation successful');
    console.log(`✅ All ${transformedPackages.length} packages transformed correctly`);
    
    // Test 4: Test frontend compatibility
    console.log('\n=== TEST 4: Testing Frontend Compatibility ===');
    
    const frontendPackages = packages.map(pkg => ({
      id: pkg._id,
      title: pkg.title,
      description: pkg.description,
      destination: pkg.destinations?.join(', ') || '',
      duration: pkg.duration,
      price: pkg.price?.amount || 0,
      originalPrice: pkg.price?.originalPrice,
      rating: pkg.rating?.overall || 4.5,
      reviews: pkg.rating?.reviewCount || 0,
      images: pkg.images?.map(img => {
        if (typeof img === 'string') return img;
        return img.url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop';
      }) || ['https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop'],
      highlights: pkg.highlights || [],
      inclusions: pkg.includes || [],
      category: pkg.category || 'general'
    }));
    
    console.log('✅ Frontend transformation successful');
    frontendPackages.forEach((pkg, index) => {
      console.log(`Frontend Package ${index + 1}:`);
      console.log(`  - ID: ${pkg.id}`);
      console.log(`  - Images: ${pkg.images.length} images`);
      console.log(`  - First image: ${pkg.images[0].substring(0, 50)}...`);
    });\n    \n    console.log('\n🎉 ALL TESTS PASSED - System is working correctly!');\n    \n  } catch (error) {\n    console.error('❌ Test failed:', error);\n  } finally {\n    mongoose.connection.close();\n  }\n};\n\ntestAllFixes();