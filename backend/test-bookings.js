const mongoose = require('mongoose');
require('dotenv').config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const TripBooking = require('./src/models/TripBooking');

async function testBookings() {
  try {
    console.log('🔍 Testing TripBooking collection...');
    
    // Count all bookings
    const totalCount = await TripBooking.countDocuments({});
    console.log('📊 Total bookings in database:', totalCount);
    
    // Get all bookings
    const allBookings = await TripBooking.find({});
    console.log('📋 All bookings:', allBookings.length);
    
    if (allBookings.length > 0) {
      allBookings.forEach((booking, i) => {
        console.log(`${i + 1}. ${booking.bookingReference} - ${booking.status} - User: ${booking.user}`);
      });
    } else {
      console.log('❌ No bookings found in database');
    }
    
    // Test the exact query used by admin
    const adminQuery = {};
    const adminBookings = await TripBooking.find(adminQuery)
      .populate('user', 'email profile')
      .populate('appointmentId', 'appointmentReference')
      .sort({ createdAt: -1 });
      
    console.log('👨💼 Admin query result:', adminBookings.length);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test error:', error);
    process.exit(1);
  }
}

testBookings();