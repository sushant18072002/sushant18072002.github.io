const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// Search locations (cities/destinations) for autocomplete
router.get('/search', locationController.searchLocations);

// Get all cities with filtering
router.get('/cities', locationController.getCities);

// Get city details
router.get('/cities/:id', locationController.getCityDetails);

module.exports = router;