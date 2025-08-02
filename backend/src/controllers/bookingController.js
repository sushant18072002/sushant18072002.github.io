const { Booking, Payment, Flight, Hotel, Package, Activity, User } = require('../models');
const auditService = require('../services/auditService');

// Get user's bookings
const getUserBookings = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      type,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { user: req.user._id };
    if (status) query.status = status;
    if (type) query.type = type;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const bookings = await Booking.find(query)
      .populate('flight.flightId', 'flightNumber airline route')
      .populate('hotel.hotelId', 'name location starRating')
      .populate('package.packageId', 'name description duration')
      .populate('activity.activityId', 'name description duration')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'email profile')
      .populate('flight.flightId')
      .populate('hotel.hotelId')
      .populate('package.packageId')
      .populate('activity.activityId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: { message: 'Booking not found' }
      });
    }

    // Check if user owns the booking or is admin
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied' }
      });
    }

    res.json({ success: true, data: { booking } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Create new booking
const createBooking = async (req, res) => {
  try {
    const bookingData = {
      ...req.body,
      user: req.user._id,
      status: 'draft',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
    };

    // Validate booking data based on type
    const validationResult = await validateBookingData(bookingData);
    if (!validationResult.valid) {
      return res.status(400).json({
        success: false,
        error: { message: validationResult.message }
      });
    }

    const booking = new Booking(bookingData);
    await booking.save();

    await auditService.log({
      userId: req.user._id,
      action: 'BOOKING_CREATED',
      resource: 'booking',
      resourceId: booking._id.toString(),
      metadata: { type: booking.type, amount: booking.pricing.totalAmount }
    });

    res.status(201).json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

// Update booking
const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: { message: 'Booking not found' }
      });
    }

    // Check permissions
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied' }
      });
    }

    // Only allow updates for draft or pending bookings
    if (!['draft', 'pending'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot update confirmed booking' }
      });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    await auditService.log({
      userId: req.user._id,
      action: 'BOOKING_UPDATED',
      resource: 'booking',
      resourceId: req.params.id
    });

    res.json({ success: true, data: { booking: updatedBooking } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: { message: 'Booking not found' }
      });
    }

    // Check permissions
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied' }
      });
    }

    // Check if booking can be cancelled
    if (['cancelled', 'completed', 'refunded'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Booking cannot be cancelled' }
      });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = reason;
    booking.cancellationDate = new Date();
    booking.updatedBy = req.user._id;
    await booking.save();

    // Process refund if payment was completed
    if (booking.payment.status === 'completed') {
      await processRefund(booking);
    }

    await auditService.log({
      userId: req.user._id,
      action: 'BOOKING_CANCELLED',
      resource: 'booking',
      resourceId: req.params.id,
      metadata: { reason }
    });

    res.json({
      success: true,
      data: { message: 'Booking cancelled successfully', booking }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Confirm booking (admin only)
const confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: { message: 'Booking not found' }
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: { message: 'Only pending bookings can be confirmed' }
      });
    }

    booking.status = 'confirmed';
    booking.confirmedAt = new Date();
    booking.updatedBy = req.user._id;
    await booking.save();

    await auditService.log({
      userId: req.user._id,
      action: 'BOOKING_CONFIRMED',
      resource: 'booking',
      resourceId: req.params.id
    });

    res.json({
      success: true,
      data: { message: 'Booking confirmed successfully', booking }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Process payment for booking
const processPayment = async (req, res) => {
  try {
    const { paymentMethod, paymentDetails } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: { message: 'Booking not found' }
      });
    }

    // Check permissions
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied' }
      });
    }

    if (booking.status !== 'draft') {
      return res.status(400).json({
        success: false,
        error: { message: 'Payment already processed or booking not valid' }
      });
    }

    // Create payment record
    const payment = new Payment({
      booking: booking._id,
      user: req.user._id,
      amount: {
        total: booking.pricing.totalAmount,
        currency: booking.pricing.currency,
        breakdown: {
          subtotal: booking.pricing.baseAmount,
          taxes: booking.pricing.taxes,
          fees: booking.pricing.fees,
          discounts: booking.pricing.discounts
        }
      },
      method: {
        type: paymentMethod,
        details: paymentDetails
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    await payment.save();

    // Update booking status
    booking.status = 'pending';
    booking.payment.method = paymentMethod;
    booking.payment.status = 'processing';
    booking.payment.transactionId = payment.paymentId;
    await booking.save();

    // Here you would integrate with actual payment gateway
    // For now, we'll simulate successful payment
    setTimeout(async () => {
      try {
        payment.status = 'completed';
        payment.processedAt = new Date();
        await payment.save();

        booking.payment.status = 'completed';
        booking.payment.paymentDate = new Date();
        booking.status = 'confirmed';
        booking.confirmedAt = new Date();
        await booking.save();
      } catch (error) {
        console.error('Payment processing error:', error);
      }
    }, 2000);

    await auditService.log({
      userId: req.user._id,
      action: 'PAYMENT_INITIATED',
      resource: 'booking',
      resourceId: req.params.id,
      metadata: { amount: booking.pricing.totalAmount, method: paymentMethod }
    });

    res.json({
      success: true,
      data: { 
        message: 'Payment processing initiated',
        paymentId: payment.paymentId,
        booking 
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Helper function to validate booking data
const validateBookingData = async (bookingData) => {
  try {
    switch (bookingData.type) {
      case 'flight':
        if (!bookingData.flight?.flightId || !bookingData.flight?.passengers?.length) {
          return { valid: false, message: 'Flight booking requires flight ID and passenger details' };
        }
        break;
      case 'hotel':
        if (!bookingData.hotel?.hotelId || !bookingData.hotel?.checkIn || !bookingData.hotel?.checkOut) {
          return { valid: false, message: 'Hotel booking requires hotel ID, check-in and check-out dates' };
        }
        break;
      case 'package':
        if (!bookingData.package?.packageId || !bookingData.package?.startDate) {
          return { valid: false, message: 'Package booking requires package ID and start date' };
        }
        break;
      case 'activity':
        if (!bookingData.activity?.activityId || !bookingData.activity?.date) {
          return { valid: false, message: 'Activity booking requires activity ID and date' };
        }
        break;
    }
    return { valid: true };
  } catch (error) {
    return { valid: false, message: 'Validation error: ' + error.message };
  }
};

// Helper function to process refund
const processRefund = async (booking) => {
  try {
    // Here you would integrate with payment gateway for refund
    // For now, we'll just update the booking status
    booking.payment.status = 'refunded';
    booking.payment.refundDate = new Date();
    booking.status = 'refunded';
    await booking.save();
  } catch (error) {
    console.error('Refund processing error:', error);
  }
};

module.exports = {
  getUserBookings,
  getBookingById,
  createBooking,
  updateBooking,
  cancelBooking,
  confirmBooking,
  processPayment
};