const express = require('express');
const router = express.Router();
const destinationController = require('../controllers/destinationController');

// Public destination APIs
router.get('/featured', destinationController.getFeaturedDestinations);
router.get('/spotlight', destinationController.getDestinationSpotlight);
router.get('/:id', destinationController.getDestinationDetails);

module.exports = router;