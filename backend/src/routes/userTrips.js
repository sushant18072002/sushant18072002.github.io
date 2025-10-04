const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const userTripsController = require('../controllers/userTripsController');

// Unified user trips routes
router.get('/', auth, userTripsController.getUserTrips);
router.get('/:type/:id', auth, userTripsController.getTripDetails);

module.exports = router;