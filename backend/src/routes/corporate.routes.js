const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const corporateBookingController = require('../controllers/corporateBookingController');
const companyController = require('../controllers/companyController');

// Company management routes
router.post('/companies', auth, companyController.createCompany);
router.get('/companies/me', auth, companyController.getCompanyDetails);
router.put('/companies/settings', auth, companyController.updateCompanySettings);
router.get('/companies/dashboard', auth, companyController.getCompanyDashboard);

// Employee management routes
router.post('/companies/employees', auth, companyController.addEmployee);
router.get('/companies/employees', auth, companyController.getCompanyEmployees);
router.put('/companies/employees/:employeeId', auth, companyController.updateEmployeePermissions);

// Corporate booking routes
router.post('/bookings', auth, corporateBookingController.createCorporateBooking);
router.get('/bookings', auth, corporateBookingController.getCompanyBookings);
router.get('/bookings/analytics', auth, corporateBookingController.getBookingAnalytics);

// Approval workflow routes
router.get('/approvals/pending', auth, corporateBookingController.getPendingApprovals);
router.post('/bookings/:id/approve', auth, corporateBookingController.approveBooking);

module.exports = router;