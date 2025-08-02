const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');
const { auth, optionalAuth } = require('../middleware/auth');
const { validateHotelSearch, validateReview } = require('../middleware/validation');

// @desc    Search hotels
// @route   GET /api/v1/hotels/search
// @access  Public
router.get('/search', optionalAuth, hotelController.searchHotels);

// @desc    Get hotel filters
// @route   GET /api/v1/hotels/filters
// @access  Public
router.get('/filters', hotelController.getFilters);

// @desc    Get hotel details
// @route   GET /api/v1/hotels/:id
// @access  Public
router.get('/:id', optionalAuth, hotelController.getHotelDetails);

// @desc    Get hotel rooms
// @route   GET /api/v1/hotels/:id/rooms
// @access  Public
router.get('/:id/rooms', hotelController.getHotelRooms);

// @desc    Check availability
// @route   GET /api/v1/hotels/:id/availability
// @access  Public
router.get('/:id/availability', hotelController.checkAvailability);

// @desc    Get hotel reviews
// @route   GET /api/v1/hotels/:id/reviews
// @access  Public
router.get('/:id/reviews', hotelController.getHotelReviews);

// @desc    Add hotel review
// @route   POST /api/v1/hotels/:id/reviews
// @access  Private
router.post('/:id/reviews', auth, validateReview, hotelController.addHotelReview);

// @desc    Get hotel amenities
// @route   GET /api/v1/hotels/:id/amenities
// @access  Public
router.get('/:id/amenities', hotelController.getHotelAmenities);

// @desc    Get hotel photos
// @route   GET /api/v1/hotels/:id/photos
// @access  Public
router.get('/:id/photos', hotelController.getHotelPhotos);

// @desc    Get nearby hotels
// @route   GET /api/v1/hotels/nearby/:lat/:lng
// @access  Public
router.get('/nearby/:lat/:lng', hotelController.getNearbyHotels);

// @desc    Compare hotels
// @route   POST /api/v1/hotels/compare
// @access  Public
router.post('/compare', hotelController.compareHotels);

// @desc    Get hotel deals
// @route   GET /api/v1/hotels/deals
// @access  Public
router.get('/deals', hotelController.getHotelDeals);

// @desc    Search locations
// @route   GET /api/v1/locations/search
// @access  Public
router.get('/locations/search', hotelController.searchLocations);

// @desc    Create price alert
// @route   POST /api/v1/hotels/price-alerts
// @access  Private
router.post('/price-alerts', auth, hotelController.createPriceAlert);

// @desc    Delete price alert
// @route   DELETE /api/v1/hotels/price-alerts/:id
// @access  Private
router.delete('/price-alerts/:id', auth, hotelController.deletePriceAlert);

// @desc    Get popular destinations
// @route   GET /api/v1/hotels/popular-destinations
// @access  Public
router.get('/popular-destinations', hotelController.getPopularDestinations);

module.exports = router;