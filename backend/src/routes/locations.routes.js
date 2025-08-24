const express = require('express');
const router = express.Router();
const { searchLocations } = require('../controllers/hotelController');

// @desc    Search locations
// @route   GET /api/v1/locations/search
// @access  Public
router.get('/search', searchLocations);

module.exports = router;