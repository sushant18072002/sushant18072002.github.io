const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

console.log('Home routes file loaded');

// Public home page APIs
router.get('/featured', homeController.getFeaturedContent);
router.get('/stats', homeController.getStats);
router.get('/deals', homeController.getDeals);

module.exports = router;