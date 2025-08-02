const express = require('express');
const router = express.Router();
const itineraryController = require('../controllers/itineraryController');
const { auth, optionalAuth } = require('../middleware/auth');

// @desc    Get all itineraries
// @route   GET /api/v1/itineraries
// @access  Private
router.get('/', auth, itineraryController.getItineraries);

// @desc    Create itinerary
// @route   POST /api/v1/itineraries
// @access  Private
router.post('/', auth, itineraryController.createItinerary);

// @desc    Get itinerary details
// @route   GET /api/v1/itineraries/:id
// @access  Private/Public (if shared)
router.get('/:id', optionalAuth, itineraryController.getItineraryDetails);

// @desc    Update itinerary
// @route   PUT /api/v1/itineraries/:id
// @access  Private
router.put('/:id', auth, itineraryController.updateItinerary);

// @desc    Delete itinerary
// @route   DELETE /api/v1/itineraries/:id
// @access  Private
router.delete('/:id', auth, itineraryController.deleteItinerary);

// @desc    Share itinerary
// @route   POST /api/v1/itineraries/:id/share
// @access  Private
router.post('/:id/share', auth, itineraryController.shareItinerary);

// @desc    Get shared itinerary
// @route   GET /api/v1/itineraries/shared/:token
// @access  Public
router.get('/shared/:token', itineraryController.getSharedItinerary);

// @desc    Book itinerary
// @route   POST /api/v1/itineraries/:id/book
// @access  Private
router.post('/:id/book', auth, itineraryController.bookItinerary);

module.exports = router;