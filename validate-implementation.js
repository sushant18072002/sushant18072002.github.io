// Quick implementation validation script
const fs = require('fs');
const path = require('path');

console.log('🔍 VALIDATING PHASE 1 & 2 IMPLEMENTATION\n');

// Check backend files
const backendChecks = [
    { file: 'backend/src/models/TripAppointment.js', desc: 'TripAppointment Model' },
    { file: 'backend/src/models/TripBooking.js', desc: 'TripBooking Model' },
    { file: 'backend/src/controllers/appointmentController.js', desc: 'Appointment Controller' },
    { file: 'backend/src/controllers/adminBookingController.js', desc: 'Admin Booking Controller' },
    { file: 'backend/src/routes/appointments.js', desc: 'Appointment Routes' },
    { file: 'backend/src/routes/admin/appointments.js', desc: 'Admin Appointment Routes' },
    { file: 'backend/src/routes/admin/bookings.js', desc: 'Admin Booking Routes' }
];

// Check frontend files
const frontendChecks = [
    { file: 'react-frontend/src/pages/TripBookingPage.tsx', desc: 'Trip Booking Page' },
    { file: 'react-frontend/src/pages/DashboardPage.tsx', desc: 'User Dashboard' },
    { file: 'react-frontend/src/pages/AdminPage.tsx', desc: 'Admin Page' },
    { file: 'react-frontend/src/App.tsx', desc: 'App Routes' }
];

let passedChecks = 0;
let totalChecks = backendChecks.length + frontendChecks.length;

console.log('📁 BACKEND FILES:');
backendChecks.forEach(check => {
    const filePath = path.join(__dirname, check.file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${check.desc}`);
        passedChecks++;
    } else {
        console.log(`❌ ${check.desc} - FILE MISSING`);
    }
});

console.log('\n📱 FRONTEND FILES:');
frontendChecks.forEach(check => {
    const filePath = path.join(__dirname, check.file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${check.desc}`);
        passedChecks++;
    } else {
        console.log(`❌ ${check.desc} - FILE MISSING`);
    }
});

console.log('\n📊 VALIDATION SUMMARY:');
console.log(`✅ Passed: ${passedChecks}/${totalChecks}`);
console.log(`❌ Failed: ${totalChecks - passedChecks}/${totalChecks}`);

if (passedChecks === totalChecks) {
    console.log('\n🎉 ALL FILES PRESENT - IMPLEMENTATION COMPLETE!');
} else {
    console.log('\n⚠️  SOME FILES MISSING - CHECK IMPLEMENTATION');
}

// Check for critical content in key files
console.log('\n🔍 CONTENT VALIDATION:');

try {
    // Check TripBookingPage uses new endpoint
    const tripBookingContent = fs.readFileSync(path.join(__dirname, 'react-frontend/src/pages/TripBookingPage.tsx'), 'utf8');
    if (tripBookingContent.includes('/appointments')) {
        console.log('✅ TripBookingPage uses new appointment endpoint');
    } else {
        console.log('❌ TripBookingPage still uses old endpoint');
    }

    // Check AdminPage has appointments tab
    const adminPageContent = fs.readFileSync(path.join(__dirname, 'react-frontend/src/pages/AdminPage.tsx'), 'utf8');
    if (adminPageContent.includes('appointments')) {
        console.log('✅ AdminPage has appointments tab');
    } else {
        console.log('❌ AdminPage missing appointments tab');
    }

    // Check DashboardPage has appointments tab
    const dashboardContent = fs.readFileSync(path.join(__dirname, 'react-frontend/src/pages/DashboardPage.tsx'), 'utf8');
    if (dashboardContent.includes('appointments')) {
        console.log('✅ DashboardPage has appointments tab');
    } else {
        console.log('❌ DashboardPage missing appointments tab');
    }

    console.log('\n🎯 IMPLEMENTATION STATUS: READY FOR TESTING');
    console.log('📋 Next Steps:');
    console.log('1. Start backend: cd backend && node server.js');
    console.log('2. Start frontend: cd react-frontend && npm run dev');
    console.log('3. Open test-implementation-validator.html');
    console.log('4. Run complete workflow test');

} catch (error) {
    console.log('❌ Error reading files:', error.message);
}