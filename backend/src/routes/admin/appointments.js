const express = require('express');
const router = express.Router();
const { auth, admin } = require('../../middleware/auth');
const adminBookingController = require('../../controllers/adminBookingController');

// Admin appointment management routes
router.get('/', auth, admin, adminBookingController.getAllAppointments);
router.put('/:id', auth, admin, adminBookingController.updateAppointment);
router.post('/:id/convert', auth, admin, adminBookingController.convertToBooking);

module.exports = router;