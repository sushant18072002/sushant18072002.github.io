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

// Admin appointment management
const {
  updateAppointmentStatus,
  convertAppointmentToBooking
} = require('../controllers/tripAppointmentController');

router.put('/appointments/:id/status', auth, admin, updateAppointmentStatus);
router.post('/appointments/:id/convert', auth, admin, convertAppointmentToBooking);

// Trip appointment endpoints
const {
  createTripAppointment,
  getUserAppointments,
  getAvailableSlots
} = require('../controllers/tripAppointmentController');

router.post('/appointments/trip', auth, createTripAppointment);
router.get('/appointments', auth, getUserAppointments);
router.get('/appointments/slots', getAvailableSlots);

// Additional user endpoints
const {
  getUserTrips,
  getLoyaltyPoints,
  addToFavorites,
  removeFromFavorites,
  deleteAccount,
  markNotificationRead
} = require('../controllers/userController');

router.get('/trips', auth, getUserTrips);
router.get('/loyalty-points', auth, getLoyaltyPoints);
router.post('/favorites', auth, addToFavorites);
router.delete('/favorites/:id', auth, removeFromFavorites);
router.delete('/account', auth, deleteAccount);
router.get('/notifications', auth, async (req, res) => {
  try {
    const { Notification } = require('../models');
    const { page = 1, limit = 20 } = req.query;
    
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Notification.countDocuments({ user: req.user._id });
    const unread = await Notification.countDocuments({ user: req.user._id, isRead: false });
    
    res.json({
      success: true,
      data: {
        notifications,
        unread,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});
router.put('/notifications/:id/read', auth, markNotificationRead);

module.exports = router;