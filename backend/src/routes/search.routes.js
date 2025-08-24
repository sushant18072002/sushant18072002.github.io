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
router.post('/global', optionalAuth, globalSearch);
router.get('/', optionalAuth, globalSearch); // Keep backward compatibility

// Search suggestions/autocomplete
router.get('/suggestions', getSearchSuggestions);

// Advanced search with filters
router.post('/advanced', optionalAuth, advancedSearch);

// Popular searches
router.get('/popular', getPopularSearches);

// Additional search endpoints
const { auth } = require('../middleware/auth');
const {
  getSearchHistory,
  deleteSearchHistory
} = require('../controllers/searchController');

// Search history (requires auth)
router.get('/history', auth, getSearchHistory);
router.delete('/history', auth, deleteSearchHistory);
router.delete('/history/:id', auth, deleteSearchHistory);

module.exports = router;