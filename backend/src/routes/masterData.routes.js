const express = require('express');
const router = express.Router();
const { auth, admin, optionalAuth } = require('../middleware/auth');
const {
  // Airlines
  getAirlines,
  createAirline,
  updateAirline,
  
  // Airports
  getAirports,
  createAirport,
  
  // Countries
  getCountries,
  createCountry,
  
  // Cities
  getCities,
  
  // Currencies
  getCurrencies,
  updateCurrencyRates,
  
  // Settings
  getSettings,
  updateSettings,
  
  // Bulk operations
  bulkImportData
} = require('../controllers/masterDataController');

// Airlines routes
router.get('/airlines', getAirlines);
router.post('/airlines', auth, admin, createAirline);
router.put('/airlines/:id', auth, admin, updateAirline);

// Airports routes
router.get('/airports', getAirports);
router.post('/airports', auth, admin, createAirport);

// Countries routes
router.get('/countries', getCountries);
router.post('/countries', auth, admin, createCountry);

// Cities routes
router.get('/cities', getCities);

// Currencies routes
router.get('/currencies', getCurrencies);
router.put('/currencies/rates', auth, admin, updateCurrencyRates);

// Settings routes
router.get('/settings', auth, admin, getSettings);
router.put('/settings', auth, admin, updateSettings);

// Bulk operations
router.post('/bulk-import', auth, admin, bulkImportData);

module.exports = router;