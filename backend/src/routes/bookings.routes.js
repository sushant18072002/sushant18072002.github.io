const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const { bookingValidation } = require('../middleware/validation');
const {
  getUserBookings,
  getBookingById,
  createBooking,
  updateBooking,
  cancelBooking,
  confirmBooking,
  processPayment
} = require('../controllers/bookingController');

router.get('/', auth, getUserBookings);
router.get('/:id', auth, getBookingById);
router.post('/', auth, bookingValidation, createBooking);
router.put('/:id', auth, updateBooking);
router.post('/:id/cancel', auth, cancelBooking);
router.post('/:id/payment', auth, processPayment);
router.post('/:id/confirm', auth, admin, confirmBooking);

module.exports = router;