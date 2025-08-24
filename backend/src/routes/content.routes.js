const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');

router.get('/home-stats', contentController.getHomeStats);
router.get('/featured-destinations', contentController.getFeaturedDestinations);
router.get('/travel-categories', contentController.getTravelCategories);
router.get('/deals', contentController.getDeals);
router.get('/blog/latest', contentController.getLatestBlogPosts);
router.get('/testimonials', contentController.getTestimonials);

module.exports = router;