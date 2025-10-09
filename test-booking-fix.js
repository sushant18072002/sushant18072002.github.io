const mongoose = require('mongoose');
require('dotenv').config();

const TripBooking = require('./backend/src/models/TripBooking');

async function testBookingCreation() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test creating a corporate group trip booking
    const testBooking = new TripBooking({
      user: new mongoose.Types.ObjectId(),
      
      trip: {
        tripId: new mongoose.Types.ObjectId(),
        title: 'Test Corporate Trip',
        destination: 'Test Destination',
        duration: {
          days: 5,
          nights: 4
        }
      },

      customer: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        phone: '1234567890'
      },

      travelers: {
        count: 2,
        adults: 2,
        children: 0,
        details: [{
          type: 'adult',
          firstName: 'John',
          lastName: 'Doe',
          nationality: 'Indian'
        }, {
          type: 'adult',
          firstName: 'Jane',
          lastName: 'Smith',
          nationality: 'Indian'
        }]
      },

      pricing: {
        basePrice: 1000,
        pricePerPerson: 1000,
        totalTravelers: 2,
        finalAmount: 1900
      },

      payment: {
        method: 'bank-transfer',
        status: 'pending'
      },

      status: 'draft',
      source: 'website',
      
      management: {
        tags: ['corporate', 'group-booking'],
        internalNotes: 'Corporate group booking test'
      },
      
      metadata: {
        companyDetails: {
          companyName: 'Test Company',
          gstNumber: 'GST123456789'
        }
      }
    });

    await testBooking.save();
    console.log('✅ Test booking created successfully!');
    console.log('📋 Booking Reference:', testBooking.bookingReference);

    // Clean up
    await TripBooking.deleteOne({ _id: testBooking._id });
    console.log('✅ Test booking cleaned up');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testBookingCreation();