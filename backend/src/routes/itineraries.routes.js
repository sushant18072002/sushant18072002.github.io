const express = require('express');
const router = express.Router();
const itineraryController = require('../controllers/itineraryController');
const { auth, optionalAuth } = require('../middleware/auth');

// @desc    Get all itineraries
// @route   GET /api/v1/itineraries
// @access  Private
router.get('/', auth, itineraryController.getUserItineraries);

// @desc    Create itinerary
// @route   POST /api/v1/itineraries
// @access  Private
router.post('/', auth, itineraryController.createItinerary);

// @desc    Get shared itinerary
// @route   GET /api/v1/itineraries/shared/:token
// @access  Public
router.get('/shared/:token', itineraryController.getSharedItinerary);

// @desc    Get featured itineraries
// @route   GET /api/v1/itineraries/featured
// @access  Public
router.get('/featured', itineraryController.getFeaturedItineraries);

// @desc    Search public itineraries
// @route   GET /api/v1/itineraries/search
// @access  Public
router.get('/search', itineraryController.searchItineraries);

// @desc    Get public itinerary details
// @route   GET /api/v1/itineraries/public/:id
// @access  Public
router.get('/public/:id', itineraryController.getPublicItineraryDetails);

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

// @desc    Book itinerary
// @route   POST /api/v1/itineraries/:id/book
// @access  Private
router.post('/:id/book', auth, async (req, res) => {
  try {
    const itinerary = await require('../models').Itinerary.findById(req.params.id);
    if (!itinerary) {
      return res.status(404).json({ success: false, error: { message: 'Itinerary not found' } });
    }
    
    const { Booking } = require('../models');
    const booking = new Booking({
      user: req.user._id,
      type: 'package',
      status: 'draft',
      pricing: {
        baseAmount: itinerary.budget.total,
        totalAmount: itinerary.budget.total,
        currency: itinerary.budget.currency
      },
      contact: {
        email: req.user.email,
        phone: req.user.profile?.phone
      }
    });
    
    await booking.save();
    res.json({ success: true, data: { booking } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

module.exports = router;