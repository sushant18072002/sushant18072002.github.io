const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const appointmentController = require('../controllers/appointmentController');

// Customer appointment routes
router.post('/', auth, appointmentController.createAppointment);
router.get('/', auth, appointmentController.getUserAppointments);
router.get('/bookings', auth, appointmentController.getUserBookings);
router.put('/bookings/:id/status', auth, appointmentController.updateBookingStatus);
router.get('/slots', appointmentController.getAvailableSlots);
router.put('/:id/reschedule', auth, appointmentController.rescheduleAppointment);
router.put('/:id/cancel', auth, appointmentController.cancelAppointment);

module.exports = router;