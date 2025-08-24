const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const {
  getSearchTrends,
  getPopularDestinations,
  getBookingPatterns,
  getUserBehavior,
  getRevenueMetrics
} = require('../controllers/analyticsController');

// All analytics routes require admin access
router.use(auth, admin);

router.get('/search-trends', getSearchTrends);
router.get('/popular-destinations', getPopularDestinations);
router.get('/booking-patterns', getBookingPatterns);
router.get('/user-behavior', getUserBehavior);
router.get('/revenue-metrics', getRevenueMetrics);

module.exports = router;