const express = require('express');
const router = express.Router();
const { searchAirports } = require('../controllers/flightControllerFixed');

// @desc    Search airports
// @route   GET /api/v1/airports/search
// @access  Public
router.get('/search', searchAirports);

module.exports = router;