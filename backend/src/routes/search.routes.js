const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const {
  globalSearch,
  getSearchSuggestions,
  advancedSearch,
  getPopularSearches
} = require('../controllers/searchController');

// Global search endpoint
router.get('/', optionalAuth, globalSearch);

// Search suggestions/autocomplete
router.get('/suggestions', getSearchSuggestions);

// Advanced search with filters
router.post('/advanced', optionalAuth, advancedSearch);

// Popular searches
router.get('/popular', getPopularSearches);

module.exports = router;