const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, admin } = require('../middleware/auth');

console.log('Admin routes file loaded');

// Debug middleware
router.use((req, res, next) => {
  console.log(`🔍 Admin route hit: ${req.method} ${req.path}`);
  next();
});

// TEMPORARILY DISABLE AUTH FOR TESTING
// router.use(auth, admin);

// Mock user for testing
router.use((req, res, next) => {
  req.user = { _id: '688f999b00e3dc1122f146c0', role: 'admin', email: 'admin@demo.com' };
  next();
});

// Test route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Admin routes working', user: req.user?.email });
});

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// User Management
router.get('/users', adminController.getUsers);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Booking Management
router.get('/bookings', adminController.getBookings);
router.put('/bookings/:id/status', adminController.updateBookingStatus);

// Package Management
console.log('Setting up package routes...');
router.get('/packages/:id', adminController.getPackage); // Move specific route before general route
router.get('/packages', adminController.getPackages);
router.post('/packages', adminController.createPackage);
router.put('/packages/:id', adminController.updatePackage);
router.delete('/packages/:id', adminController.deletePackage);

// Package Image Management
router.post('/packages/:id/images', adminController.uploadPackageImages);
router.put('/packages/:id/images/:imageId/primary', adminController.setPrimaryImage);
router.delete('/packages/:id/images/:imageId', adminController.deletePackageImage);
console.log('Package routes set up complete');

// Flight Management
router.post('/flights', adminController.createFlight);
router.put('/flights/:id', adminController.updateFlight);
router.delete('/flights/:id', adminController.deleteFlight);

// Hotel Management
router.post('/hotels', adminController.createHotel);
router.put('/hotels/:id', adminController.updateHotel);
router.delete('/hotels/:id', adminController.deleteHotel);

// Analytics
router.get('/analytics/overview', adminController.getAnalyticsOverview);

// Support Management
router.get('/support/tickets', adminController.getSupportTickets);
router.put('/support/tickets/:id', adminController.updateSupportTicket);

// Content Management
router.post('/content/blog', adminController.createBlogPost);

// Settings
router.put('/settings', adminController.updateSettings);

module.exports = router;