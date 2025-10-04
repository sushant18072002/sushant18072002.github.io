const express = require('express');
const router = express.Router();
const { auth, admin } = require('../../middleware/auth');
const adminBookingController = require('../../controllers/adminBookingController');

// Admin booking management routes
router.get('/', auth, admin, adminBookingController.getAllBookings);
router.get('/all', auth, admin, adminBookingController.getAllBookingsForAdmin); // All bookings for admin

// Test route
router.put('/test/:id/status', (req, res) => {
  console.log('🧪 TEST ROUTE HIT - Status update test');
  res.json({ success: true, message: 'Test route working', id: req.params.id, status: req.body.status });
});
router.put('/:id/status', auth, admin, (req, res) => {
  console.log('🔍 Route handler called for status update');
  console.log('Function exists:', typeof adminBookingController.updateBookingStatus);
  return adminBookingController.updateBookingStatus(req, res);
});
router.post('/:id/payment', auth, admin, adminBookingController.recordPayment);

// Simple direct status update
router.put('/:id/status-direct', async (req, res) => {
  try {
    console.log('🔄 DIRECT status update route hit');
    console.log('ID:', req.params.id);
    console.log('Status:', req.body.status);
    
    const TripBooking = require('../../models/TripBooking');
    
    const result = await TripBooking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    
    console.log('✅ Direct update result:', result?.status);
    
    res.json({
      success: true,
      data: { booking: result },
      message: 'Status updated directly'
    });
  } catch (error) {
    console.error('❌ Direct update error:', error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

module.exports = router;