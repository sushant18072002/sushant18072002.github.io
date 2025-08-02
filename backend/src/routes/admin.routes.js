const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, admin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(auth, admin);

// @desc    Get admin dashboard
// @route   GET /api/v1/admin/dashboard
// @access  Admin
router.get('/dashboard', adminController.getDashboard);

// User Management
router.get('/users', adminController.getUsers);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Booking Management
router.get('/bookings', adminController.getBookings);
router.put('/bookings/:id/status', adminController.updateBookingStatus);

// Analytics
router.get('/analytics/overview', adminController.getAnalyticsOverview);

// Flight Management
router.post('/flights', adminController.createFlight);
router.put('/flights/:id', adminController.updateFlight);
router.delete('/flights/:id', adminController.deleteFlight);

// Hotel Management
router.post('/hotels', adminController.createHotel);
router.put('/hotels/:id', adminController.updateHotel);
router.delete('/hotels/:id', adminController.deleteHotel);

// Support Management
router.get('/support/tickets', adminController.getSupportTickets);
router.put('/support/tickets/:id', adminController.updateSupportTicket);

// Content Management
router.post('/content/blog', adminController.createBlogPost);

// Settings
router.put('/settings', adminController.updateSettings);

module.exports = router;