const TripAppointment = require('../models/TripAppointment');
const TripBooking = require('../models/TripBooking');
const { User } = require('../models');
const auditService = require('../services/auditService');

// Get all appointments (admin dashboard)
const getAllAppointments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      assignedAgent, 
      dateFrom, 
      dateTo,
      search 
    } = req.query;

    const query = {};
    
    if (status) query.status = status;
    if (assignedAgent) query['consultation.assignedAgent'] = assignedAgent;
    
    if (dateFrom || dateTo) {
      query['schedule.preferredDate'] = {};
      if (dateFrom) query['schedule.preferredDate'].$gte = new Date(dateFrom);
      if (dateTo) query['schedule.preferredDate'].$lte = new Date(dateTo);
    }

    if (search) {
      query.$or = [
        { appointmentReference: { $regex: search, $options: 'i' } },
        { 'customer.firstName': { $regex: search, $options: 'i' } },
        { 'customer.lastName': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } }
      ];
    }

    const appointments = await TripAppointment.find(query)
      .populate('user', 'email profile')
      .populate('consultation.assignedAgent', 'profile.firstName profile.lastName email')
      .populate('conversion.bookingId', 'bookingReference status')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await TripAppointment.countDocuments(query);

    // Get statistics
    const stats = await TripAppointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$pricing.estimatedTotal' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        stats
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

// Update appointment status and details (admin)
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      assignedAgent,
      callNotes,
      customerInterest,
      quotedPrice,
      followUpRequired,
      followUpDate,
      customizations
    } = req.body;

    const appointment = await TripAppointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: { message: 'Appointment not found' }
      });
    }

    // Update status
    if (status) appointment.status = status;

    // Update consultation details
    if (assignedAgent) appointment.consultation.assignedAgent = assignedAgent;
    if (callNotes) appointment.consultation.callNotes = callNotes;
    if (customerInterest) appointment.consultation.customerInterest = customerInterest;
    if (followUpRequired !== undefined) appointment.consultation.followUpRequired = followUpRequired;
    if (followUpDate) appointment.consultation.followUpDate = new Date(followUpDate);
    if (customizations) appointment.consultation.customizations = customizations;

    // Update pricing
    if (quotedPrice) {
      appointment.pricing.quotedPrice = quotedPrice;
      appointment.pricing.validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days validity
    }

    await appointment.save();

    // Log update
    await auditService.log({
      userId: req.user._id,
      action: 'APPOINTMENT_UPDATED',
      resource: 'appointment',
      resourceId: id,
      metadata: { status, assignedAgent, quotedPrice }
    });

    res.json({
      success: true,
      data: { appointment },
      message: 'Appointment updated successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

// Convert appointment to booking (admin)
const convertToBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      finalPrice,
      paymentMethod,
      paymentSchedule,
      customizations,
      startDate,
      endDate,
      travelers
    } = req.body;

    const appointment = await TripAppointment.findById(id).populate('user');
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: { message: 'Appointment not found' }
      });
    }

    if (appointment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: { message: 'Appointment must be completed before conversion' }
      });
    }

    // Create booking from appointment
    const booking = new TripBooking({
      user: appointment.user._id,
      appointmentId: appointment._id,
      trip: {
        tripId: appointment.trip.tripId,
        title: appointment.trip.title,
        destination: appointment.trip.destination,
        duration: appointment.trip.duration,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      },
      customer: appointment.customer,
      travelers: {
        count: travelers?.count || appointment.customer.travelers,
        adults: travelers?.adults || appointment.customer.travelers,
        children: travelers?.children || 0,
        infants: travelers?.infants || 0,
        details: travelers?.details || []
      },
      pricing: {
        basePrice: appointment.trip.estimatedPrice,
        pricePerPerson: appointment.trip.estimatedPrice,
        totalTravelers: travelers?.count || appointment.customer.travelers,
        customizations: customizations || [],
        finalAmount: finalPrice,
        currency: appointment.trip.currency
      },
      payment: {
        method: paymentMethod,
        status: 'pending',
        schedule: paymentSchedule || [{
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          amount: finalPrice,
          description: 'Full payment'
        }],
        remainingAmount: finalPrice
      },
      management: {
        assignedAgent: appointment.consultation.assignedAgent,
        createdBy: req.user._id
      },
      source: 'phone'
    });

    await booking.save();

    // Update appointment as converted
    await appointment.convertToBooking(booking._id, finalPrice);

    // Log conversion
    await auditService.log({
      userId: req.user._id,
      action: 'APPOINTMENT_CONVERTED_TO_BOOKING',
      resource: 'booking',
      resourceId: booking._id.toString(),
      metadata: {
        appointmentId: appointment._id,
        finalPrice,
        paymentMethod
      }
    });

    res.status(201).json({
      success: true,
      data: {
        booking: {
          id: booking._id,
          reference: booking.bookingReference,
          status: booking.status,
          finalAmount: booking.pricing.finalAmount,
          paymentStatus: booking.payment.status
        }
      },
      message: 'Appointment converted to booking successfully'
    });

  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to convert appointment to booking' }
    });
  }
};

// Get all bookings (admin)
const getAllBookings = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      paymentStatus,
      assignedAgent,
      search 
    } = req.query;

    const query = {};
    
    if (status) query.status = status;
    if (paymentStatus) query['payment.status'] = paymentStatus;
    if (assignedAgent) query['management.assignedAgent'] = assignedAgent;

    if (search) {
      query.$or = [
        { bookingReference: { $regex: search, $options: 'i' } },
        { 'customer.firstName': { $regex: search, $options: 'i' } },
        { 'customer.lastName': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } }
      ];
    }

    const bookings = await TripBooking.find(query)
      .populate('user', 'email profile')
      .populate('management.assignedAgent', 'profile.firstName profile.lastName email')
      .populate('appointmentId', 'appointmentReference')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await TripBooking.countDocuments(query);

    // Get booking statistics
    const stats = await TripBooking.getBookingStats();

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        stats
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

// Record payment (admin)
const recordPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, method, transactionId, notes } = req.body;

    const booking = await TripBooking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: { message: 'Booking not found' }
      });
    }

    await booking.addPayment(amount, method, transactionId, req.user._id);

    // Log payment
    await auditService.log({
      userId: req.user._id,
      action: 'PAYMENT_RECORDED',
      resource: 'booking',
      resourceId: id,
      metadata: { amount, method, transactionId }
    });

    res.json({
      success: true,
      data: { booking },
      message: 'Payment recorded successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

// Update booking status (admin)
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const booking = await TripBooking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: { message: 'Booking not found' }
      });
    }

    const oldStatus = booking.status;
    booking.status = status;
    if (notes) booking.management.internalNotes = notes;
    booking.management.lastModifiedBy = req.user._id;

    await booking.save();

    // Log status change
    await auditService.log({
      userId: req.user._id,
      action: 'BOOKING_STATUS_UPDATED',
      resource: 'booking',
      resourceId: id,
      metadata: { oldStatus, newStatus: status, notes }
    });

    res.json({
      success: true,
      data: { booking },
      message: 'Booking status updated successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

module.exports = {
  getAllAppointments,
  updateAppointment,
  convertToBooking,
  getAllBookings,
  recordPayment,
  updateBookingStatus
};