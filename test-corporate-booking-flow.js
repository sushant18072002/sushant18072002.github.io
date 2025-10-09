const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';
let authToken = '';
let companyId = '';
let employeeId = '';
let tripId = '';
let corporateBookingId = '';

// Test data
const testData = {
  admin: {
    email: 'admin@travelai.com',
    password: 'admin123'
  },
  company: {
    name: 'TechCorp Solutions',
    legalName: 'TechCorp Solutions Inc.',
    contact: {
      email: 'admin@techcorp.com',
      phone: '+1-555-0123',
      address: {
        street: '123 Business Ave',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        zipCode: '94105'
      }
    },
    settings: {
      currency: 'USD',
      travelPolicy: {
        requireApproval: true,
        allowedBookingWindow: 30
      },
      budgetControls: {
        enabled: true,
        departmentBudgets: [
          { department: 'Engineering', annualBudget: 100000, spentAmount: 0, currency: 'USD' },
          { department: 'Sales', annualBudget: 75000, spentAmount: 0, currency: 'USD' },
          { department: 'Marketing', annualBudget: 50000, spentAmount: 0, currency: 'USD' }
        ]
      }
    }
  },
  employee: {
    email: 'john.doe@techcorp.com',
    department: 'Engineering',
    designation: 'Senior Developer',
    approvalLimit: 5000,
    canApprove: false,
    permissions: ['book-travel']
  },
  manager: {
    email: 'jane.manager@techcorp.com',
    department: 'Engineering',
    designation: 'Engineering Manager',
    approvalLimit: 25000,
    canApprove: true,
    permissions: ['book-travel', 'approve-bookings', 'manage-team']
  },
  corporateBooking: {
    type: 'trip',
    corporate: {
      department: 'Engineering',
      project: 'Client Integration Project',
      purpose: 'client-visit',
      purposeDescription: 'Meeting with client to discuss system integration requirements'
    },
    travelers: [
      {
        employee: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@techcorp.com',
          department: 'Engineering'
        },
        isPrimary: true
      },
      {
        employee: {
          firstName: 'Sarah',
          lastName: 'Smith',
          email: 'sarah.smith@techcorp.com',
          department: 'Engineering'
        },
        isPrimary: false
      }
    ],
    travelDates: {
      departure: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      return: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    specialRequests: 'Need hotel near client office'
  }
};

async function makeRequest(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      ...(data && { data })
    };

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: error.message }
    };
  }
}

async function step1_AdminLogin() {
  console.log('\n🔐 Step 1: Admin Login');
  
  const result = await makeRequest('POST', '/auth/login', testData.admin);
  
  if (result.success && result.data.success) {
    authToken = result.data.data.token;
    console.log('✅ Admin logged in successfully');
    return true;
  } else {
    console.log('❌ Admin login failed:', result.error);
    return false;
  }
}

async function step2_CreateCompany() {
  console.log('\n🏢 Step 2: Create Company');
  
  const result = await makeRequest('POST', '/corporate/companies', testData.company, authToken);
  
  if (result.success && result.data.success) {
    companyId = result.data.data.company._id;
    console.log('✅ Company created successfully:', companyId);
    return true;
  } else {
    console.log('❌ Company creation failed:', result.error);
    return false;
  }
}

async function step3_AddEmployees() {
  console.log('\n👥 Step 3: Add Employees');
  
  // Add regular employee
  const employeeResult = await makeRequest('POST', '/corporate/companies/employees', testData.employee, authToken);
  
  if (employeeResult.success && employeeResult.data.success) {
    employeeId = employeeResult.data.data.user._id;
    console.log('✅ Employee added successfully:', employeeId);
  } else {
    console.log('❌ Employee addition failed:', employeeResult.error);
    return false;
  }
  
  // Add manager
  const managerResult = await makeRequest('POST', '/corporate/companies/employees', testData.manager, authToken);
  
  if (managerResult.success && managerResult.data.success) {
    console.log('✅ Manager added successfully');
    return true;
  } else {
    console.log('❌ Manager addition failed:', managerResult.error);
    return false;
  }
}

async function step4_GetAvailableTrip() {
  console.log('\n🧳 Step 4: Get Available Trip');
  
  const result = await makeRequest('GET', '/trips', null, authToken);
  
  if (result.success && result.data.success && result.data.data.trips.length > 0) {
    tripId = result.data.data.trips[0]._id;
    console.log('✅ Found available trip:', tripId);
    return true;
  } else {
    console.log('❌ No trips available or fetch failed:', result.error);
    return false;
  }
}

async function step5_CreateCorporateBooking() {
  console.log('\n📋 Step 5: Create Corporate Booking');
  
  const bookingData = {
    ...testData.corporateBooking,
    bookingDetails: {
      trip: {
        tripId: tripId
      }
    }
  };
  
  const result = await makeRequest('POST', '/corporate/bookings', bookingData, authToken);
  
  if (result.success && result.data.success) {
    corporateBookingId = result.data.data.booking._id;
    console.log('✅ Corporate booking created:', corporateBookingId);
    console.log('📋 Booking Reference:', result.data.data.booking.bookingReference);
    console.log('⏳ Requires Approval:', result.data.data.requiresApproval);
    return true;
  } else {
    console.log('❌ Corporate booking creation failed:', result.error);
    return false;
  }
}

async function step6_GetPendingApprovals() {
  console.log('\n⏳ Step 6: Check Pending Approvals');
  
  const result = await makeRequest('GET', '/corporate/approvals/pending', null, authToken);
  
  if (result.success && result.data.success) {
    const pendingBookings = result.data.data.bookings;
    console.log('✅ Found', pendingBookings.length, 'pending approvals');
    
    if (pendingBookings.length > 0) {
      console.log('📋 Pending booking:', pendingBookings[0].bookingReference);
      return true;
    }
  } else {
    console.log('❌ Failed to get pending approvals:', result.error);
  }
  
  return false;
}

async function step7_ApproveBooking() {
  console.log('\n✅ Step 7: Approve Corporate Booking');
  
  const approvalData = {
    action: 'approve',
    notes: 'Approved for client meeting - within budget'
  };
  
  const result = await makeRequest('POST', `/corporate/bookings/${corporateBookingId}/approve`, approvalData, authToken);
  
  if (result.success && result.data.success) {
    console.log('✅ Booking approved successfully');
    console.log('📋 Status:', result.data.data.booking.status);
    return true;
  } else {
    console.log('❌ Booking approval failed:', result.error);
    return false;
  }
}

async function step8_GetCompanyAnalytics() {
  console.log('\n📊 Step 8: Get Company Analytics');
  
  const result = await makeRequest('GET', '/corporate/bookings/analytics', null, authToken);
  
  if (result.success && result.data.success) {
    const analytics = result.data.data;
    console.log('✅ Analytics retrieved:');
    console.log('   📈 Total Bookings:', analytics.overview.totalBookings);
    console.log('   💰 Total Spent:', analytics.overview.totalSpent);
    console.log('   📊 Avg Booking Value:', analytics.overview.avgBookingValue);
    return true;
  } else {
    console.log('❌ Analytics retrieval failed:', result.error);
    return false;
  }
}

async function step9_AdminViewCorporateData() {
  console.log('\n👨‍💼 Step 9: Admin View Corporate Data');
  
  // Get all companies
  const companiesResult = await makeRequest('GET', '/admin/corporate/companies', null, authToken);
  
  if (companiesResult.success && companiesResult.data.success) {
    console.log('✅ Admin can view', companiesResult.data.data.companies.length, 'companies');
  } else {
    console.log('❌ Admin company view failed:', companiesResult.error);
    return false;
  }
  
  // Get all corporate bookings
  const bookingsResult = await makeRequest('GET', '/admin/corporate/bookings', null, authToken);
  
  if (bookingsResult.success && bookingsResult.data.success) {
    console.log('✅ Admin can view', bookingsResult.data.data.bookings.length, 'corporate bookings');
    return true;
  } else {
    console.log('❌ Admin bookings view failed:', bookingsResult.error);
    return false;
  }
}

async function runCompleteTest() {
  console.log('🚀 Starting Corporate Booking System Test');
  console.log('==========================================');
  
  const steps = [
    step1_AdminLogin,
    step2_CreateCompany,
    step3_AddEmployees,
    step4_GetAvailableTrip,
    step5_CreateCorporateBooking,
    step6_GetPendingApprovals,
    step7_ApproveBooking,
    step8_GetCompanyAnalytics,
    step9_AdminViewCorporateData
  ];
  
  let passedSteps = 0;
  
  for (let i = 0; i < steps.length; i++) {
    const success = await steps[i]();
    if (success) {
      passedSteps++;
    } else {
      console.log(`\n❌ Test failed at step ${i + 1}`);
      break;
    }
  }
  
  console.log('\n==========================================');
  console.log('🏁 Test Results:');
  console.log(`✅ Passed: ${passedSteps}/${steps.length} steps`);
  
  if (passedSteps === steps.length) {
    console.log('🎉 ALL TESTS PASSED! Corporate booking system is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the implementation.');
  }
  
  console.log('\n📋 Test Summary:');
  console.log('   🏢 Company ID:', companyId);
  console.log('   👤 Employee ID:', employeeId);
  console.log('   🧳 Trip ID:', tripId);
  console.log('   📋 Booking ID:', corporateBookingId);
}

// Run the test
runCompleteTest().catch(console.error);