const { User, Booking } = require('../models');
const auditService = require('../services/auditService');

// Create trip appointment (no payment required)
const createTripAppointment = async (req, res) => {
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

    // Generate appointment reference
    const appointmentRef = `TRV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Create appointment booking
    const appointmentData = {
      user: req.user._id,
      type: 'trip-appointment',
      status: 'appointment-scheduled',
      bookingReference: appointmentRef,
      
      // Trip information
      trip: {
        tripId,
        title: tripInfo?.title,
        destination: tripInfo?.destination,
        duration: tripInfo?.duration,
        estimatedPrice: tripInfo?.price
      },

      // Customer details
      customerInfo: {
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        email: customerInfo.email,
        phone: customerInfo.phone
      },

      // Appointment details
      appointment: {
        preferredDate: new Date(bookingDetails.preferredDate),
        timeSlot: bookingDetails.timeSlot,
        travelers: bookingDetails.travelers || 1,
        specialRequests: bookingDetails.specialRequests,
        status: 'scheduled',
        scheduledAt: new Date()
      },

      // Pricing (estimated, no payment yet)
      pricing: {
        currency: 'USD',
        estimatedAmount: (tripInfo?.price || 0) * (bookingDetails.travelers || 1),
        travelers: bookingDetails.travelers || 1,
        pricePerPerson: tripInfo?.price || 0,
        paymentStatus: 'pending-consultation'
      },

      // Metadata
      metadata: {
        source: 'website',
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        appointmentType: 'consultation-call'
      }
    };

    const appointment = new Booking(appointmentData);
    await appointment.save();

    // Update user profile with phone if not exists
    if (customerInfo.phone && (!req.user.profile?.phone || req.user.profile.phone !== customerInfo.phone)) {
      await User.findByIdAndUpdate(req.user._id, {
        $set: {
          'profile.phone': customerInfo.phone,
          'profile.firstName': customerInfo.firstName,
          'profile.lastName': customerInfo.lastName
        }
      });
    }

    // Log appointment creation
    await auditService.log({
      userId: req.user._id,
      action: 'TRIP_APPOINTMENT_CREATED',
      resource: 'booking',
      resourceId: appointment._id.toString(),
      metadata: {
        tripId,
        appointmentRef,
        preferredDate: bookingDetails.preferredDate,
        timeSlot: bookingDetails.timeSlot,
        travelers: bookingDetails.travelers
      }
    });

    // TODO: Send confirmation email/SMS
    // TODO: Add to calendar system
    // TODO: Notify sales team

    res.status(201).json({
      success: true,
      data: {
        appointment: {
          id: appointment._id,
          reference: appointmentRef,
          status: 'scheduled',
          preferredDate: bookingDetails.preferredDate,
          timeSlot: bookingDetails.timeSlot,
          customerInfo: {
            name: `${customerInfo.firstName} ${customerInfo.lastName}`,
            email: customerInfo.email,
            phone: customerInfo.phone
          },
          tripInfo: {
            title: tripInfo?.title,
            destination: tripInfo?.destination,
            estimatedPrice: (tripInfo?.price || 0) * (bookingDetails.travelers || 1)
          }
        }
      },
      message: 'Appointment scheduled successfully'
    });

  } catch (error) {
    console.error('Trip appointment creation error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to schedule appointment' }
    });
  }
};

// Get user's trip appointments
const getUserAppointments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = {
      user: req.user._id,
      type: 'trip-appointment'
    };

    if (status) {
      query['appointment.status'] = status;
    }

    const appointments = await Booking.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

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

// Update appointment status (admin)
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, followUpDate } = req.body;

    const appointment = await Booking.findById(id);
    if (!appointment || appointment.type !== 'trip-appointment') {
      return res.status(404).json({
        success: false,
        error: { message: 'Appointment not found' }
      });
    }

    // Update appointment status
    appointment.appointment.status = status;
    if (notes) appointment.appointment.notes = notes;
    if (followUpDate) appointment.appointment.followUpDate = new Date(followUpDate);
    appointment.appointment.lastUpdated = new Date();

    // Update main booking status based on appointment status
    const statusMapping = {
      'scheduled': 'appointment-scheduled',
      'completed': 'consultation-completed',
      'cancelled': 'appointment-cancelled',
      'rescheduled': 'appointment-rescheduled',
      'converted': 'booking-confirmed'
    };

    if (statusMapping[status]) {
      appointment.status = statusMapping[status];
    }

    await appointment.save();

    // Log status update
    await auditService.log({
      userId: req.user._id,
      action: 'APPOINTMENT_STATUS_UPDATED',
      resource: 'booking',
      resourceId: id,
      metadata: { oldStatus: appointment.appointment.status, newStatus: status, notes }
    });

    res.json({
      success: true,
      data: { appointment },
      message: 'Appointment status updated successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

// Convert appointment to actual booking (after consultation)
const convertAppointmentToBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { finalPrice, paymentMethod, customizations } = req.body;

    const appointment = await Booking.findById(id);
    if (!appointment || appointment.type !== 'trip-appointment') {
      return res.status(404).json({
        success: false,
        error: { message: 'Appointment not found' }
      });
    }

    // Update to actual booking
    appointment.type = 'trip';
    appointment.status = 'confirmed';
    appointment.pricing.finalAmount = finalPrice;
    appointment.pricing.paymentStatus = 'completed';
    appointment.payment = {
      method: paymentMethod,
      status: 'completed',
      paymentDate: new Date(),
      amount: finalPrice
    };

    if (customizations) {
      appointment.customizations = customizations;
    }

    appointment.appointment.status = 'converted';
    appointment.appointment.convertedAt = new Date();

    await appointment.save();

    // Log conversion
    await auditService.log({
      userId: req.user._id,
      action: 'APPOINTMENT_CONVERTED_TO_BOOKING',
      resource: 'booking',
      resourceId: id,
      metadata: { finalPrice, paymentMethod }
    });

    res.json({
      success: true,
      data: { booking: appointment },
      message: 'Appointment converted to booking successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

// Get available time slots for a date
const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: { message: 'Date parameter required' }
      });
    }

    // Get existing appointments for the date
    const existingAppointments = await Booking.find({
      type: 'trip-appointment',
      'appointment.preferredDate': {
        $gte: new Date(date),
        $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
      },
      'appointment.status': { $in: ['scheduled', 'rescheduled'] }
    });

    // All available slots
    const allSlots = [
      '09:00 AM - 10:00 AM',
      '10:30 AM - 11:30 AM',
      '12:00 PM - 01:00 PM',
      '02:00 PM - 03:00 PM',
      '03:30 PM - 04:30 PM',
      '05:00 PM - 06:00 PM'
    ];

    // Remove booked slots
    const bookedSlots = existingAppointments.map(apt => apt.appointment.timeSlot);
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    res.json({
      success: true,
      data: {
        date,
        availableSlots,
        bookedSlots,
        totalSlots: allSlots.length,
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

module.exports = {
  createTripAppointment,
  getUserAppointments,
  updateAppointmentStatus,
  convertAppointmentToBooking,
  getAvailableSlots
};