const TripAppointment = require('../models/TripAppointment');
const TripBooking = require('../models/TripBooking');
const { User } = require('../models');
const auditService = require('../services/auditService');

// Create new appointment (customer-facing)
const createAppointment = async (req, res) => {
  try {
    const {
      tripId,
      customerInfo,
      bookingDetails,
      tripInfo
    } = req.body;

    // Validate required fields
    if (!tripId || !customerInfo?.phone || !bookingDetails?.preferredDate || !bookingDetails?.timeSlot) {
      return res.status(400).json({
        success: false,
        error: { message: 'Missing required fields: tripId, phone, preferredDate, timeSlot' }
      });
    }

    // Check slot availability
    const availableSlots = await TripAppointment.getAvailableSlots(bookingDetails.preferredDate);
    if (!availableSlots.includes(bookingDetails.timeSlot)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Selected time slot is not available' }
      });
    }

    // Create appointment
    const appointment = new TripAppointment({
      user: req.user._id,
      trip: {
        tripId,
        title: tripInfo?.title,
        destination: tripInfo?.destination,
        duration: tripInfo?.duration,
        estimatedPrice: tripInfo?.price,
        currency: tripInfo?.currency || 'USD'
      },
      customer: {
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        email: customerInfo.email,
        phone: customerInfo.phone,
        travelers: bookingDetails.travelers || 1
      },
      schedule: {
        preferredDate: new Date(bookingDetails.preferredDate),
        timeSlot: bookingDetails.timeSlot
      },
      specialRequests: bookingDetails.specialRequests,
      pricing: {
        estimatedTotal: (tripInfo?.price || 0) * (bookingDetails.travelers || 1)
      },
      source: 'website',
      metadata: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
      }
    });

    await appointment.save();

    // Update user profile if needed
    if (!req.user.profile?.phone) {
      await User.findByIdAndUpdate(req.user._id, {
        $set: {
          'profile.firstName': customerInfo.firstName,
          'profile.lastName': customerInfo.lastName,
          'profile.phone': customerInfo.phone
        }
      });
    }

    // Log appointment creation
    await auditService.log({
      userId: req.user._id,
      action: 'APPOINTMENT_CREATED',
      resource: 'appointment',
      resourceId: appointment._id.toString(),
      metadata: {
        tripId,
        appointmentRef: appointment.appointmentReference,
        preferredDate: bookingDetails.preferredDate,
        timeSlot: bookingDetails.timeSlot
      }
    });

    res.status(201).json({
      success: true,
      data: {
        appointment: {
          id: appointment._id,
          reference: appointment.appointmentReference,
          status: appointment.status,
          preferredDate: appointment.schedule.preferredDate,
          timeSlot: appointment.schedule.timeSlot,
          customer: appointment.customer,
          trip: appointment.trip
        }
      },
      message: 'Appointment scheduled successfully'
    });

  } catch (error) {
    console.error('Appointment creation error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to schedule appointment' }
    });
  }
};

// Get user appointments
const getUserAppointments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { user: req.user._id };
    if (status) query.status = status;

    const appointments = await TripAppointment.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('conversion.bookingId', 'bookingReference status');

    const total = await TripAppointment.countDocuments(query);

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

// Get available slots for a date
const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: { message: 'Date parameter required' }
      });
    }

    const availableSlots = await TripAppointment.getAvailableSlots(date);

    res.json({
      success: true,
      data: {
        date,
        availableSlots,
        availableCount: availableSlots.length
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

// Reschedule appointment (customer)
const rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { preferredDate, timeSlot } = req.body;

    const appointment = await TripAppointment.findOne({
      _id: id,
      user: req.user._id
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: { message: 'Appointment not found' }
      });
    }

    // Check if appointment can be rescheduled
    if (!['scheduled', 'confirmed'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Appointment cannot be rescheduled in current status' }
      });
    }

    // Check slot availability
    const availableSlots = await TripAppointment.getAvailableSlots(preferredDate);
    if (!availableSlots.includes(timeSlot)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Selected time slot is not available' }
      });
    }

    await appointment.reschedule(new Date(preferredDate), timeSlot);

    res.json({
      success: true,
      data: { appointment },
      message: 'Appointment rescheduled successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

// Cancel appointment (customer)
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const appointment = await TripAppointment.findOne({
      _id: id,
      user: req.user._id
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: { message: 'Appointment not found' }
      });
    }

    appointment.status = 'cancelled';
    appointment.customerNotes = reason;
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

module.exports = {
  createAppointment,
  getUserAppointments,
  getAvailableSlots,
  rescheduleAppointment,
  cancelAppointment
};