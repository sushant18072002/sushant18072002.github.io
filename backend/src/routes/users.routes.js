const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, admin } = require('../middleware/auth');

// @desc    Get user dashboard
// @route   GET /api/v1/users/dashboard
// @access  Private
router.get('/dashboard', auth, userController.getDashboard);

// @desc    Get user profile
// @route   GET /api/v1/users/profile
// @access  Private
router.get('/profile', auth, userController.getProfile);

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
router.put('/profile', auth, userController.updateProfile);

// @desc    Get user bookings
// @route   GET /api/v1/users/bookings
// @access  Private
router.get('/bookings', auth, userController.getBookings);

// @desc    Get user trips timeline
// @route   GET /api/v1/users/trips/timeline
// @access  Private
router.get('/trips/timeline', auth, userController.getTripsTimeline);

// @desc    Update user preferences
// @route   PUT /api/v1/users/preferences
// @access  Private
router.put('/preferences', auth, userController.updatePreferences);

// Admin routes
// @desc    Get all users (Admin)
// @route   GET /api/v1/users
// @access  Admin
router.get('/', auth, admin, userController.getAllUsers);

// @desc    Get user by ID (Admin)
// @route   GET /api/v1/users/:id
// @access  Admin
router.get('/:id', auth, admin, userController.getUserById);

// @desc    Update user (Admin)
// @route   PUT /api/v1/users/:id
// @access  Admin
router.put('/:id', auth, admin, userController.updateUser);

// @desc    Delete user (Admin)
// @route   DELETE /api/v1/users/:id
// @access  Admin
router.delete('/:id', auth, admin, userController.deleteUser);

module.exports = router;