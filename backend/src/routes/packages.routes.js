const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');
const { auth, optionalAuth } = require('../middleware/auth');

// @desc    Get all packages
// @route   GET /api/packages
// @access  Public
router.get('/', optionalAuth, packageController.getPackages);

// @desc    Get package details
// @route   GET /api/packages/:id
// @access  Public
router.get('/:id', optionalAuth, packageController.getPackageDetails);

// @desc    Get package categories
// @route   GET /api/packages/categories
// @access  Public
router.get('/categories', packageController.getPackageCategories);

// @desc    Get featured packages
// @route   GET /api/packages/featured
// @access  Public
router.get('/featured', packageController.getFeaturedPackages);

// @desc    Search packages
// @route   GET /api/packages/search
// @access  Public
router.get('/search', optionalAuth, packageController.searchPackages);

// @desc    Customize package
// @route   POST /api/packages/:id/customize
// @access  Private
router.post('/:id/customize', auth, packageController.customizePackage);

// @desc    Get package itinerary
// @route   GET /api/packages/:id/itinerary
// @access  Public
router.get('/:id/itinerary', packageController.getPackageItinerary);

// @desc    Send package inquiry
// @route   POST /api/packages/:id/inquiry
// @access  Public
router.post('/:id/inquiry', packageController.sendPackageInquiry);

module.exports = router;