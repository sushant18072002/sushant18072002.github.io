const express = require('express');
const router = express.Router();
const { getAirlines } = require('../controllers/flightControllerFixed');

// @desc    Get all airlines
// @route   GET /api/v1/airlines
// @access  Public
router.get('/', getAirlines);

module.exports = router;