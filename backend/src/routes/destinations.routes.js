const express = require('express');
const router = express.Router();
const { auth, admin, optionalAuth } = require('../middleware/auth');
const {
  getAllDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
  getDestinationCities,
  getFeaturedDestinations,
  searchDestinations
} = require('../controllers/destinationController');

// GET /api/v1/destinations - Get all destinations (public)
router.get('/', optionalAuth, getAllDestinations);

// GET /api/v1/destinations/featured - Get featured destinations
router.get('/featured', getFeaturedDestinations);

// GET /api/v1/destinations/search - Search destinations
router.get('/search', searchDestinations);

// GET /api/v1/destinations/:id - Get destination by ID (public)
router.get('/:id', optionalAuth, getDestinationById);

// POST /api/v1/destinations - Create destination (admin only)
router.post('/', auth, admin, createDestination);

// PUT /api/v1/destinations/:id - Update destination (admin only)
router.put('/:id', auth, admin, updateDestination);

// DELETE /api/v1/destinations/:id - Delete destination (admin only)
router.delete('/:id', auth, admin, deleteDestination);

// GET /api/v1/destinations/:id/cities - Get cities in destination
router.get('/:id/cities', getDestinationCities);

module.exports = router;