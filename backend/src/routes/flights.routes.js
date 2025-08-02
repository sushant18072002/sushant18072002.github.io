const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightControllerFixed');
const { auth, admin, optionalAuth } = require('../middleware/auth');
const { validateFlightSearch } = require('../middleware/validation');

// @desc    Search flights
// @route   GET /api/v1/flights/search
// @access  Public
router.get('/search', optionalAuth, flightController.searchFlights);

// @desc    Get flight filters
// @route   GET /api/v1/flights/filters
// @access  Public
router.get('/filters', flightController.getFilters);

// @desc    Get flight details
// @route   GET /api/v1/flights/:id
// @access  Public
router.get('/:id', optionalAuth, flightController.getFlightDetails);

// @desc    Get flight seats
// @route   GET /api/v1/flights/:id/seats
// @access  Public
router.get('/:id/seats', flightController.getFlightSeats);

// @desc    Create price alert
// @route   POST /api/v1/flights/price-alerts
// @access  Private
router.post('/price-alerts', auth, flightController.createPriceAlert);

// @desc    Get user price alerts
// @route   GET /api/v1/flights/price-alerts
// @access  Private
router.get('/price-alerts', auth, flightController.getPriceAlerts);

// @desc    Delete price alert
// @route   DELETE /api/v1/flights/price-alerts/:id
// @access  Private
router.delete('/price-alerts/:id', auth, flightController.deletePriceAlert);

// @desc    Compare flights
// @route   POST /api/v1/flights/compare
// @access  Public
router.post('/compare', flightController.compareFlights);

// Admin routes
// @desc    Create flight (Admin)
// @route   POST /api/v1/flights
// @access  Admin
router.post('/', auth, admin, flightController.createFlight);

// @desc    Update flight (Admin)
// @route   PUT /api/v1/flights/:id
// @access  Admin
router.put('/:id', auth, admin, flightController.updateFlight);

// @desc    Delete flight (Admin)
// @route   DELETE /api/v1/flights/:id
// @access  Admin
router.delete('/:id', auth, admin, flightController.deleteFlight);

// @desc    Bulk import flights (Admin)
// @route   POST /api/v1/flights/bulk-import
// @access  Admin
router.post('/bulk-import', auth, admin, flightController.bulkImportFlights);

module.exports = router;