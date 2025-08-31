const express = require('express');
const router = express.Router();

// Create new booking
router.post('/', async (req, res) => {
  try {
    const { Booking, Flight, User } = require('../models');
    const {
      type,
      flightId,
      selectedClass,
      bookingOption,
      addOns,
      passengers,
      contactInfo,
      paymentInfo,
      total
    } = req.body;

    // Validate required fields
    if (!type || !flightId || !selectedClass || !contactInfo || !total) {
      return res.status(400).json({
        success: false,
        error: { message: 'Missing required booking information' }
      });
    }

    // Validate flight exists and has availability
    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({
        success: false,
        error: { message: 'Flight not found' }
      });
    }

    const classAvailability = flight.pricing[selectedClass]?.availability || 0;
    if (classAvailability < (passengers?.length || 1)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Insufficient seats available' }
      });
    }

    // Generate booking reference
    const bookingRef = `TRV${Date.now().toString().slice(-8)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Create booking
    const booking = new Booking({
      bookingReference: bookingRef,
      type,
      status: 'confirmed',
      flight: flightId,
      selectedClass,
      bookingOption,
      addOns,
      passengers: passengers || [{
        firstName: contactInfo.firstName,
        lastName: contactInfo.lastName,
        email: contactInfo.email,
        phone: contactInfo.phone
      }],
      contactInfo,
      pricing: {
        basePrice: flight.pricing[selectedClass].totalPrice,
        addOns: {
          seatUpgrade: addOns?.seatUpgrade ? 49 : 0,
          insurance: addOns?.insurance ? 29 : 0,
          hotelPackage: bookingOption === 'package' ? 300 : 0
        },
        total
      },
      paymentStatus: 'completed',
      paymentMethod: paymentInfo?.method || 'card'
    });

    await booking.save();

    // Update flight availability
    await Flight.findByIdAndUpdate(flightId, {
      $inc: {
        [`pricing.${selectedClass}.availability`]: -(passengers?.length || 1),
        'stats.bookings': 1
      }
    });

    // Populate booking for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('flight', 'flightNumber airline route duration')
      .populate('flight.airline', 'name code logo');

    res.status(201).json({
      success: true,
      data: { booking: populatedBooking },
      message: 'Booking created successfully'
    });

  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create booking' }
    });
  }
});

// Get booking by reference
router.get('/reference/:ref', async (req, res) => {
  try {
    const { Booking } = require('../models');
    const booking = await Booking.findOne({ bookingReference: req.params.ref })
      .populate('flight', 'flightNumber airline route duration pricing')
      .populate('flight.airline', 'name code logo')
      .populate('flight.route.departure.airport', 'name code city')
      .populate('flight.route.arrival.airport', 'name code city');

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: { message: 'Booking not found' }
      });
    }

    res.json({ success: true, data: { booking } });
  } catch (error) {
    console.error('Booking retrieval error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to retrieve booking' }
    });
  }
});

// Get booking confirmation
router.get('/confirmation/:id', async (req, res) => {
  try {
    const { Booking } = require('../models');
    const booking = await Booking.findById(req.params.id)
      .populate('flight', 'flightNumber airline route duration pricing')
      .populate('flight.airline', 'name code logo')
      .populate('flight.route.departure.airport', 'name code city')
      .populate('flight.route.arrival.airport', 'name code city');

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: { message: 'Booking not found' }
      });
    }

    res.json({ success: true, data: { booking } });
  } catch (error) {
    console.error('Booking confirmation error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to retrieve booking confirmation' }
    });
  }
});

module.exports = router;