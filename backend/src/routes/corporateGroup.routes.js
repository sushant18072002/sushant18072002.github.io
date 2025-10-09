const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  createCorporateGroupBooking,
  getCorporateGroupBookings,
  getCorporateGroupBookingById
} = require('../controllers/corporateGroupBookingController');

// Corporate group booking routes
router.post('/corporate-group', auth, createCorporateGroupBooking);
router.get('/corporate-group', auth, getCorporateGroupBookings);
router.get('/corporate-group/:id', auth, getCorporateGroupBookingById);

module.exports = router;