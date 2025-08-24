require('dotenv').config();
const mongoose = require('mongoose');
const { Package } = require('./src/models');
const fs = require('fs');
const path = require('path');

const testImageUpload = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travelai');
    console.log('Connected to MongoDB');
    
    // Test 1: Check uploads directory
    console.log('\n=== TEST 1: Directory Structure ===');
    const uploadsDir = path.join(__dirname, 'uploads');
    const packagesDir = path.join(uploadsDir, 'packages');
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('✅ Created uploads directory');
    } else {
      console.log('✅ Uploads directory exists');
    }
    
    if (!fs.existsSync(packagesDir)) {
      fs.mkdirSync(packagesDir, { recursive: true });
      console.log('✅ Created packages directory');
    } else {
      console.log('✅ Packages directory exists');
    }
    
    // Test 2: Create a package with images
    console.log('\n=== TEST 2: Package with Images ===');
    const packageWithImages = await Package.create({
      title: 'Test Package with Images',
      description: 'Testing image functionality',
      destinations: ['Test Destination'],
      duration: 5,
      price: {
        amount: 1000,
        currency: 'USD'
      },
      category: 'test',
      images: [
        {
          url: '/uploads/packages/test-image-1.jpg',
          alt: 'Test image 1',
          isPrimary: true,
          order: 1
        },
        {
          url: '/uploads/packages/test-image-2.jpg',
          alt: 'Test image 2',
          isPrimary: false,
          order: 2
        }
      ],
      status: 'active'
    });
    
    console.log('✅ Package created with images:', packageWithImages._id);
    console.log('✅ Images count:', packageWithImages.images.length);
    console.log('✅ Primary image:', packageWithImages.images.find(img => img.isPrimary)?.url);
    
    // Test 3: Test image operations
    console.log('\n=== TEST 3: Image Operations ===');
    
    // Add new image
    packageWithImages.images.push({
      url: '/uploads/packages/test-image-3.jpg',
      alt: 'Test image 3',
      isPrimary: false,
      order: 3
    });
    await packageWithImages.save();
    console.log('✅ Added new image, total:', packageWithImages.images.length);
    
    // Change primary image
    packageWithImages.images.forEach(img => img.isPrimary = false);
    packageWithImages.images[1].isPrimary = true;
    await packageWithImages.save();
    console.log('✅ Changed primary image to:', packageWithImages.images.find(img => img.isPrimary)?.url);
    
    // Remove image
    packageWithImages.images.splice(0, 1);
    await packageWithImages.save();
    console.log('✅ Removed image, remaining:', packageWithImages.images.length);
    
    console.log('\n🎉 ALL IMAGE TESTS PASSED!');
    
  } catch (error) {
    console.error('❌ Image test failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

testImageUpload();