const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightControllerFixed');
const { auth, admin, optionalAuth } = require('../middleware/auth');
// Validation middleware not used in this route

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

// Missing endpoints
// @desc    Get baggage info
// @route   GET /api/v1/flights/:id/baggage-info
// @access  Public
router.get('/:id/baggage-info', flightController.getBaggageInfo);

// @desc    Get meal options
// @route   GET /api/v1/flights/:id/meal-options
// @access  Public
router.get('/:id/meal-options', flightController.getMealOptions);

// @desc    Get popular routes
// @route   GET /api/v1/flights/popular-routes
// @access  Public
router.get('/popular-routes', flightController.getPopularRoutes);

// @desc    Get flight deals
// @route   GET /api/v1/flights/deals
// @access  Public
router.get('/deals', flightController.getFlightDeals);



// @desc    Get calendar prices
// @route   GET /api/v1/flights/calendar-prices
// @access  Public
router.get('/calendar-prices', flightController.getCalendarPrices);

// @desc    Flexible search
// @route   POST /api/v1/flights/flexible-search
// @access  Public
router.post('/flexible-search', flightController.flexibleSearch);

// @desc    Multi-city search
// @route   POST /api/v1/flights/multi-city
// @access  Public
router.post('/multi-city', flightController.multiCitySearch);

// @desc    Hold seat
// @route   POST /api/v1/flights/:id/hold-seat
// @access  Private
router.post('/:id/hold-seat', auth, flightController.holdSeat);

module.exports = router;