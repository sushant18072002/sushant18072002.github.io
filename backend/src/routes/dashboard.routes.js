const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getCustomerDashboard,
  getBookingAnalytics,
  getTravelInsights
} = require('../controllers/dashboardController');

// Customer dashboard routes
router.get('/', auth, getCustomerDashboard);
router.get('/analytics', auth, getBookingAnalytics);
router.get('/insights', auth, getTravelInsights);

module.exports = router;