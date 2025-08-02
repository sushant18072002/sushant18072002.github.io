const express = require('express');
const {
  searchFlights,
  getFlightDetails,
  getFilters,
  createFlight,
  updateFlight,
  deleteFlight
} = require('../controllers/flightController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/search', searchFlights);
router.get('/filters', getFilters);
router.get('/:id', getFlightDetails);

// Admin only routes
router.post('/', authenticate, authorize('admin'), createFlight);
router.patch('/:id', authenticate, authorize('admin'), updateFlight);
router.delete('/:id', authenticate, authorize('admin'), deleteFlight);

module.exports = router;