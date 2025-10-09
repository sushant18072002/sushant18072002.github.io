const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

// Test corporate group booking
async function testCorporateGroupBooking() {
  try {
    console.log('🧪 Testing Corporate Group Booking...');

    // 1. Login as user
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'customer@travel.com',
      password: 'password123'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed');
      return;
    }

    const token = loginResponse.data.data.token;
    console.log('✅ User logged in');

    // 2. Test corporate group booking
    const bookingData = {
      type: 'trip',
      itemId: '507f1f77bcf86cd799439011', // Sample trip ID
      companyDetails: {
        companyName: 'Test Company Ltd',
        contactPerson: 'John Doe',
        contactEmail: 'john@testcompany.com',
        contactPhone: '9876543210',
        gstNumber: 'GST123456789',
        billingAddress: '123 Business Street, City'
      },
      travelers: [
        {
          title: 'Mr',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@testcompany.com',
          phone: '9876543210',
          nationality: 'Indian'
        },
        {
          title: 'Ms',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@testcompany.com',
          phone: '9876543211',
          nationality: 'Indian'
        }
      ],
      totalTravelers: 2,
      specialRequests: 'Vegetarian meals preferred',
      totalAmount: 2000,
      bookingDetails: {
        title: 'Test Trip',
        destination: 'Goa',
        duration: '3 days, 2 nights',
        pricePerPerson: 1000,
        currency: 'USD'
      }
    };

    const bookingResponse = await axios.post(
      `${API_BASE}/appointments/corporate-group`,
      bookingData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (bookingResponse.data.success) {
      console.log('✅ Corporate group booking created successfully!');
      console.log('📋 Booking Reference:', bookingResponse.data.data.booking.bookingReference);
      console.log('💰 Total Amount:', bookingResponse.data.data.booking.totalAmount);
      console.log('👥 Travelers:', bookingResponse.data.data.booking.travelers);
    } else {
      console.log('❌ Booking failed:', bookingResponse.data.error);
    }

  } catch (error) {
    console.log('❌ Test failed:', error.response?.data || error.message);
  }
}

testCorporateGroupBooking();