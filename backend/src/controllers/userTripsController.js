const TripAppointment = require('../models/TripAppointment');
const TripBooking = require('../models/TripBooking');

// Get unified user trips (appointments + bookings)
const getUserTrips = async (req, res) => {
  try {
    console.log('🔄 Loading unified user trips for:', req.user._id);

    // Get user appointments
    const appointments = await TripAppointment.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    // Get user bookings
    const bookings = await TripBooking.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('appointmentId', 'appointmentReference')
      .lean();

    // Transform appointments to unified format (exclude converted ones that have bookings)
    const appointmentTrips = appointments
      .filter(apt => {
        // If appointment is converted, check if corresponding booking exists
        if (apt.status === 'converted' && apt.conversion?.bookingId) {
          // Only include if no booking found (booking might be deleted)
          return !bookings.some(booking => booking._id.toString() === apt.conversion.bookingId.toString());
        }
        // Include all non-converted appointments
        return true;
      })
      .map(apt => ({
      id: apt._id,
      type: 'appointment',
      reference: apt.appointmentReference,
      status: apt.status,
      title: apt.trip?.title || 'Trip Consultation',
      destination: apt.trip?.destination || 'Destination TBD',
      estimatedPrice: apt.pricing?.estimatedTotal || 0,
      currency: apt.trip?.currency || 'USD',
      date: apt.schedule?.preferredDate,
      timeSlot: apt.schedule?.timeSlot,
      travelers: apt.customer?.travelers || 1,
      customerInfo: apt.customer,
      createdAt: apt.createdAt,
      
      // Appointment specific
      appointmentDetails: {
        timeSlot: apt.schedule?.timeSlot,
        specialRequests: apt.specialRequests,
        consultation: apt.consultation
      },
      
      // Actions available
      actions: {
        canReschedule: ['scheduled', 'confirmed'].includes(apt.status),
        canCancel: ['scheduled', 'confirmed'].includes(apt.status),
        canViewDetails: true
      }
    }));

    // Transform bookings to unified format
    const bookingTrips = bookings.map(booking => ({
      id: booking._id,
      type: 'booking',
      reference: booking.bookingReference,
      status: booking.status,
      title: booking.trip?.title || 'Trip Booking',
      destination: booking.trip?.destination || 'Destination',
      finalPrice: booking.pricing?.finalAmount || 0,
      currency: booking.pricing?.currency || 'USD',
      startDate: booking.trip?.startDate,
      endDate: booking.trip?.endDate,
      travelers: booking.travelers?.count || 1,
      customerInfo: booking.customer,
      createdAt: booking.createdAt,
      
      // Booking specific
      bookingDetails: {
        paymentStatus: booking.payment?.status,
        totalPaid: booking.payment?.totalPaid || 0,
        remainingAmount: (booking.pricing?.finalAmount || 0) - (booking.payment?.totalPaid || 0),
        appointmentRef: booking.appointmentId?.appointmentReference
      },
      
      // Actions available
      actions: {
        canViewDetails: true,
        canDownloadReceipt: booking.payment?.status === 'completed',
        canMakePayment: booking.payment?.status === 'pending',
        canCancel: ['draft', 'pending-payment'].includes(booking.status)
      }
    }));

    // Combine and sort by creation date
    const allTrips = [...appointmentTrips, ...bookingTrips]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Add appointment reference to bookings for better context
    allTrips.forEach(trip => {
      if (trip.type === 'booking' && trip.bookingDetails?.appointmentRef) {
        const originalAppointment = appointments.find(apt => apt.appointmentReference === trip.bookingDetails.appointmentRef);
        if (originalAppointment) {
          trip.originalAppointment = {
            reference: originalAppointment.appointmentReference,
            date: originalAppointment.schedule?.preferredDate,
            timeSlot: originalAppointment.schedule?.timeSlot
          };
        }
      }
    });

    // Calculate statistics
    const stats = {
      totalTrips: allTrips.length,
      appointments: {
        total: appointmentTrips.length,
        scheduled: appointmentTrips.filter(t => t.status === 'scheduled').length,
        completed: appointmentTrips.filter(t => t.status === 'completed').length,
        converted: appointmentTrips.filter(t => t.status === 'converted').length
      },
      bookings: {
        total: bookingTrips.length,
        confirmed: bookingTrips.filter(t => t.status === 'confirmed').length,
        pending: bookingTrips.filter(t => t.status === 'draft' || t.status === 'pending-payment').length,
        completed: bookingTrips.filter(t => t.status === 'completed').length
      },
      totalValue: bookingTrips.reduce((sum, b) => sum + (b.finalPrice || 0), 0)
    };

    console.log('✅ Unified trips loaded:', {
      appointments: appointmentTrips.length,
      bookings: bookingTrips.length,
      total: allTrips.length
    });

    res.json({
      success: true,
      data: {
        trips: allTrips,
        stats
      }
    });

  } catch (error) {
    console.error('❌ User trips error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

// Get trip details (appointment or booking)
const getTripDetails = async (req, res) => {
  try {
    const { id, type } = req.params;

    let trip;
    if (type === 'appointment') {
      trip = await TripAppointment.findOne({ _id: id, user: req.user._id })
        .populate('conversion.bookingId', 'bookingReference status');
    } else if (type === 'booking') {
      trip = await TripBooking.findOne({ _id: id, user: req.user._id })
        .populate('appointmentId', 'appointmentReference');
    }

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: { message: 'Trip not found' }
      });
    }

    res.json({
      success: true,
      data: { trip }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

module.exports = {
  getUserTrips,
  getTripDetails
};