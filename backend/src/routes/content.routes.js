const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');

// @desc    Get home stats
// @route   GET /api/v1/content/home-stats
// @access  Public
router.get('/home-stats', contentController.getHomeStats);

// @desc    Get featured destinations
// @route   GET /api/v1/content/featured-destinations
// @access  Public
router.get('/featured-destinations', contentController.getFeaturedDestinations);

// @desc    Get travel categories
// @route   GET /api/v1/content/travel-categories
// @access  Public
router.get('/travel-categories', contentController.getTravelCategories);

// @desc    Get deals
// @route   GET /api/v1/content/deals
// @access  Public
router.get('/deals', contentController.getDeals);

// @desc    Get latest blog posts
// @route   GET /api/v1/content/blog/latest
// @access  Public
router.get('/blog/latest', contentController.getLatestBlogPosts);

// @desc    Get testimonials
// @route   GET /api/v1/content/testimonials
// @access  Public
router.get('/testimonials', contentController.getTestimonials);

module.exports = router;