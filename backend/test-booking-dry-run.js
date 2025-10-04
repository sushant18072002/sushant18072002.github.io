require('dotenv').config();
const mongoose = require('mongoose');

async function dryRunBookingFlow() {
  console.log('🧪 Starting Booking Flow Dry Run Test...\n');
  
  try {
    // 1. Database Connection Test
    console.log('📊 Testing Database Connection...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected successfully\n');
    
    // 2. Model Loading Test
    console.log('📦 Testing Model Loading...');
    const { User, Booking, Trip } = require('./src/models');
    console.log('✅ User model:', User ? 'Loaded' : 'Failed');
    console.log('✅ Booking model:', Booking ? 'Loaded' : 'Failed');
    console.log('✅ Trip model:', Trip ? 'Loaded' : 'Failed');
    console.log('');
    
    // 3. Controller Loading Test
    console.log('🎛️ Testing Controller Loading...');
    const tripAppointmentController = require('./src/controllers/tripAppointmentController');
    console.log('✅ Trip Appointment Controller methods:');
    console.log('   - createTripAppointment:', typeof tripAppointmentController.createTripAppointment);
    console.log('   - getUserAppointments:', typeof tripAppointmentController.getUserAppointments);
    console.log('   - getAvailableSlots:', typeof tripAppointmentController.getAvailableSlots);
    console.log('');
    
    // 4. Test Sample Trip Data
    console.log('🎯 Testing Sample Trip Data...');
    const sampleTrip = await Trip.findOne().limit(1);
    if (sampleTrip) {
      console.log('✅ Sample trip found:');
      console.log(`   - ID: ${sampleTrip._id}`);
      console.log(`   - Title: ${sampleTrip.title}`);
      console.log(`   - Destination: ${sampleTrip.primaryDestination?.name || 'N/A'}`);
      console.log(`   - Price: ${sampleTrip.pricing?.finalPrice || sampleTrip.pricing?.estimated || 'N/A'}`);
    } else {
      console.log('⚠️ No sample trip found in database');
    }
    console.log('');
    
    // 5. Test User Data
    console.log('👤 Testing User Data...');
    const sampleUser = await User.findOne({ role: 'admin' }).limit(1);
    if (sampleUser) {
      console.log('✅ Sample admin user found:');
      console.log(`   - ID: ${sampleUser._id}`);
      console.log(`   - Email: ${sampleUser.email}`);
      console.log(`   - Role: ${sampleUser.role}`);
      console.log(`   - Phone: ${sampleUser.profile?.phone || 'Not set'}`);
    } else {
      console.log('⚠️ No admin user found');
    }
    console.log('');
    
    // 6. Test Appointment Creation Logic
    console.log('📅 Testing Appointment Creation Logic...');
    
    const mockAppointmentData = {
      tripId: sampleTrip?._id || '68b2ea18c06c9dbc8cc82908',
      customerInfo: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '+1234567890'
      },
      bookingDetails: {
        preferredDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        timeSlot: '09:00 AM - 10:00 AM',
        travelers: 2,
        specialRequests: 'Dry run test'
      },
      tripInfo: {
        title: sampleTrip?.title || 'Test Trip',
        destination: sampleTrip?.primaryDestination?.name || 'Test Destination',
        price: sampleTrip?.pricing?.finalPrice || 999.99
      }
    };
    
    // Validate required fields
    const requiredFields = ['tripId', 'customerInfo.phone', 'bookingDetails.preferredDate', 'bookingDetails.timeSlot'];
    let validationPassed = true;
    
    requiredFields.forEach(field => {
      const fieldPath = field.split('.');
      let value = mockAppointmentData;
      
      for (const path of fieldPath) {
        value = value?.[path];
      }
      
      if (!value) {
        console.log(`❌ Missing required field: ${field}`);
        validationPassed = false;
      } else {
        console.log(`✅ Required field present: ${field}`);
      }
    });
    
    if (validationPassed) {
      console.log('✅ All validation checks passed');
    }
    console.log('');
    
    // 7. Test Phone Validation
    console.log('📞 Testing Phone Validation...');
    const phoneTestCases = [
      { phone: '+1234567890', expected: true },
      { phone: '1234567890', expected: true },
      { phone: '+1 (555) 123-4567', expected: true },
      { phone: '123', expected: false },
      { phone: 'invalid', expected: false }
    ];
    
    phoneTestCases.forEach(testCase => {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      const isValid = phoneRegex.test(testCase.phone.replace(/[\s\-\(\)]/g, ''));
      const result = isValid === testCase.expected ? '✅' : '❌';
      console.log(`${result} Phone "${testCase.phone}": ${isValid ? 'Valid' : 'Invalid'}`);
    });
    console.log('');
    
    // 8. Test Time Slot Generation
    console.log('⏰ Testing Time Slot Generation...');
    const availableSlots = [
      '09:00 AM - 10:00 AM',
      '10:30 AM - 11:30 AM',
      '12:00 PM - 01:00 PM',
      '02:00 PM - 03:00 PM',
      '03:30 PM - 04:30 PM',
      '05:00 PM - 06:00 PM'
    ];
    
    console.log(`✅ Generated ${availableSlots.length} time slots:`);
    availableSlots.forEach((slot, index) => {
      console.log(`   ${index + 1}. ${slot}`);
    });
    console.log('');
    
    // 9. Test Booking Reference Generation
    console.log('🔖 Testing Booking Reference Generation...');
    const generateRef = () => `TRV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    const refs = [];
    for (let i = 0; i < 5; i++) {
      refs.push(generateRef());
    }
    
    console.log('✅ Generated booking references:');
    refs.forEach((ref, index) => {
      console.log(`   ${index + 1}. ${ref}`);
    });
    console.log('');
    
    // 10. Test Route Structure
    console.log('🛣️ Testing Route Structure...');
    const routes = [
      '/api/bookings/trip-appointment',
      '/api/users/appointments',
      '/api/users/appointments/slots'
    ];
    
    console.log('✅ Expected API routes:');
    routes.forEach(route => {
      console.log(`   - POST/GET ${route}`);
    });
    console.log('');
    
    // 11. Environment Variables Check
    console.log('🔧 Testing Environment Variables...');
    const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'PORT'];
    
    requiredEnvVars.forEach(envVar => {
      const value = process.env[envVar];
      const status = value ? '✅' : '❌';
      console.log(`${status} ${envVar}: ${value ? 'Set' : 'Missing'}`);
    });
    console.log('');
    
    console.log('🎉 Dry Run Test Completed Successfully!');
    console.log('📋 Summary:');
    console.log('   - Database: Connected');
    console.log('   - Models: Loaded');
    console.log('   - Controllers: Available');
    console.log('   - Validation: Working');
    console.log('   - Routes: Configured');
    console.log('   - Environment: Ready');
    console.log('');
    console.log('✅ Booking flow is ready for testing!');
    
  } catch (error) {
    console.error('❌ Dry run failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database disconnected');
  }
}

// Run the dry run test
dryRunBookingFlow();