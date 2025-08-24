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
router.delete('/:id', auth, cancelBooking);
router.post('/:id/cancel', auth, cancelBooking);
router.post('/:id/payment', auth, processPayment);
router.post('/:id/confirm', auth, admin, confirmBooking);

// Additional booking endpoints
const {
  createFlightBooking,
  createHotelBooking,
  createPackageBooking,
  getBookingInvoice,
  modifyBooking,
  getBookingHistory,
  getUpcomingBookings,
  addBookingReview
} = require('../controllers/bookingController');

router.post('/flights', auth, createFlightBooking);
router.post('/hotels', auth, createHotelBooking);
router.post('/packages', auth, createPackageBooking);
router.get('/:id/invoice', auth, getBookingInvoice);
router.post('/:id/modify', auth, modifyBooking);
router.get('/history', auth, getBookingHistory);
router.get('/upcoming', auth, getUpcomingBookings);
router.post('/:id/review', auth, addBookingReview);
// Payment process already handled by processPayment above
router.get('/payment/status/:id', auth, async (req, res) => {
  try {
    const { Payment } = require('../models');
    const payment = await Payment.findById(req.params.id)
      .populate('booking', 'bookingReference')
      .populate('user', 'email');
    
    if (!payment || payment.user._id.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, error: { message: 'Payment not found' } });
    }
    
    res.json({ success: true, data: { payment } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});
router.post('/payment/refund', auth, async (req, res) => {
  try {
    const { Booking } = require('../models');
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, error: { message: 'Booking not found' } });
    }
    if (booking.payment.status !== 'completed') {
      return res.status(400).json({ success: false, error: { message: 'No payment to refund' } });
    }
    booking.payment.status = 'refunded';
    booking.payment.refundDate = new Date();
    booking.status = 'refunded';
    await booking.save();
    res.json({ success: true, data: { message: 'Refund processed successfully', booking } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

module.exports = router;