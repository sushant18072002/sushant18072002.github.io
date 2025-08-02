const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  sendNotification,
  getAllNotifications,
  getNotificationAnalytics
} = require('../controllers/notificationController');

// User notification routes
router.get('/', auth, getUserNotifications);
router.put('/:id/read', auth, markAsRead);
router.put('/read-all', auth, markAllAsRead);
router.delete('/:id', auth, deleteNotification);

// Notification preferences
router.get('/preferences', auth, getNotificationPreferences);
router.put('/preferences', auth, updateNotificationPreferences);

// Admin notification routes
router.post('/send', auth, admin, sendNotification);
router.get('/admin/all', auth, admin, getAllNotifications);
router.get('/admin/analytics', auth, admin, getNotificationAnalytics);

module.exports = router;