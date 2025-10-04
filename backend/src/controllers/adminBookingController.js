const TripAppointment = require('../models/TripAppointment');
const TripBooking = require('../models/TripBooking');
const { User, Booking } = require('../models');

console.log('📋 Models loaded:');
console.log('- TripBooking model:', !!TripBooking);
console.log('- Booking model:', !!Booking);
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
    
    // Get actual trip data for accurate currency and pricing
    const { Trip } = require('../models');
    const actualTrip = await Trip.findById(appointment.trip.tripId);
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

    // Generate booking reference
    const bookingRef = `TRV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Create booking from appointment
    const booking = new TripBooking({
      bookingReference: bookingRef,
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
        basePrice: actualTrip?.pricing?.finalPrice || actualTrip?.pricing?.sellPrice || appointment.trip.estimatedPrice,
        pricePerPerson: actualTrip?.pricing?.finalPrice || actualTrip?.pricing?.sellPrice || appointment.trip.estimatedPrice,
        totalTravelers: travelers?.count || appointment.customer.travelers,
        customizations: customizations || [],
        finalAmount: finalPrice,
        currency: actualTrip?.pricing?.currency || appointment.trip.currency || 'USD'
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

    const savedBooking = await booking.save();
    console.log('✅ Booking saved successfully:');
    console.log('- ID:', savedBooking._id);
    console.log('- Reference:', savedBooking.bookingReference);
    console.log('- Status:', savedBooking.status);
    console.log('- Collection:', savedBooking.constructor.modelName);

    // Update appointment as converted
    await appointment.convertToBooking(booking._id, finalPrice);
    
    // Verify booking exists in database
    const verifyBooking = await TripBooking.findById(savedBooking._id);
    console.log('🔍 Verification - Booking exists:', !!verifyBooking);

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
    console.log('🔍 Admin getting all bookings...');
    
    const { 
      page = 1, 
      limit = 20, 
      status, 
      paymentStatus,
      assignedAgent,
      search 
    } = req.query;

    const query = {};
    console.log('Query params:', { status, paymentStatus, assignedAgent, search });
    console.log('Initial query:', query);
    
    // Test: Get ALL bookings first (no filters)
    const allBookingsTest = await TripBooking.find({});
    console.log('🧪 TEST - All bookings (no filter):', allBookingsTest.length);
    if (allBookingsTest.length > 0) {
      console.log('🧪 First booking user:', allBookingsTest[0].user);
      console.log('🧪 First booking status:', allBookingsTest[0].status);
    }
    
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

    // First, let's check if ANY bookings exist
    const totalBookingsInDB = await TripBooking.countDocuments({});
    console.log('📊 Total TripBookings in database:', totalBookingsInDB);
    
    // Also check old Booking model
    const totalOldBookings = await Booking.countDocuments({});
    console.log('📊 Total old Bookings in database:', totalOldBookings);
    
    if (totalBookingsInDB > 0) {
      const allBookings = await TripBooking.find({}).limit(3);
      console.log('📋 Sample bookings:', allBookings.map(b => ({ 
        id: b._id, 
        ref: b.bookingReference, 
        status: b.status,
        user: b.user 
      })));
    }

    const bookings = await TripBooking.find(query)
      .populate('user', 'email profile')
      .populate('management.assignedAgent', 'profile.firstName profile.lastName email')
      .populate('appointmentId', 'appointmentReference')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    console.log('📋 Admin found bookings:', bookings.length);
    if (bookings.length > 0) {
      console.log('First booking:', bookings[0]);
    }

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
    console.error('❌ Admin getting all bookings error:', error);
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
    console.log('🔄 Admin updating booking status...');
    console.log('Booking ID:', req.params.id);
    console.log('New status:', req.body.status);
    
    const { id } = req.params;
    const { status, notes } = req.body;

    const booking = await TripBooking.findById(id);
    if (!booking) {
      console.log('❌ Booking not found:', id);
      return res.status(404).json({
        success: false,
        error: { message: 'Booking not found' }
      });
    }

    console.log('✅ Found booking:', booking.bookingReference);
    console.log('Old status:', booking.status);
    
    const oldStatus = booking.status;
    booking.status = status;
    if (notes) booking.management.internalNotes = notes;
    booking.management.lastModifiedBy = req.user?._id;

    let updatedBooking;
    try {
      console.log('💾 Attempting to save booking...');
      console.log('Modified paths before save:', booking.modifiedPaths());
      console.log('Status before save:', booking.status);
      
      updatedBooking = await booking.save();
      
      console.log('✅ Booking save successful!');
      console.log('Status after save:', updatedBooking.status);
      console.log('Modified paths after save:', booking.modifiedPaths());
      
    } catch (saveError) {
      console.error('❌ Booking save failed:', saveError.message);
      console.error('Full error:', saveError);
      
      if (saveError.name === 'ValidationError') {
        console.error('❌ Validation errors:');
        Object.keys(saveError.errors).forEach(key => {
          console.error(`  - ${key}: ${saveError.errors[key].message}`);
        });
      }
      
      return res.status(400).json({
        success: false,
        error: { 
          message: 'Failed to save booking: ' + saveError.message,
          details: saveError.name === 'ValidationError' ? saveError.errors : null
        }
      });
    }

    // Try direct database update as fallback
    console.log('🔄 Attempting direct database update as verification...');
    const directUpdate = await TripBooking.findByIdAndUpdate(
      id, 
      { status: status, 'management.lastModifiedBy': req.user?._id },
      { new: true, runValidators: false }
    );
    
    console.log('✅ Direct update result:', {
      found: !!directUpdate,
      status: directUpdate?.status,
      success: directUpdate?.status === status
    });
    
    // Verify the update actually happened in database
    const freshBooking = await TripBooking.findById(id);
    console.log('✅ Final database verification:');
    console.log('- Fresh booking found:', !!freshBooking);
    console.log('- Fresh booking status:', freshBooking?.status);
    console.log('- Status actually changed:', freshBooking?.status === status);
    
    res.json({
      success: true,
      data: { booking: directUpdate || freshBooking },
      message: 'Booking status updated successfully'
    });

  } catch (error) {
    console.error('❌ Booking status update error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

// Get ALL bookings for admin (regardless of user)
const getAllBookingsForAdmin = async (req, res) => {
  try {
    console.log('🔍 Admin getting ALL bookings (no user filter)...');
    
    // Get ALL TripBookings without user filter
    const bookings = await TripBooking.find({})
      .sort({ createdAt: -1 })
      .populate('user', 'email profile')
      .populate('appointmentId', 'appointmentReference');

    console.log('✅ Admin found ALL bookings:', bookings.length);
    if (bookings.length > 0) {
      console.log('✅ First booking user:', bookings[0].user?.email);
      console.log('✅ First booking ref:', bookings[0].bookingReference);
      console.log('✅ First booking currency info:', {
        tripCurrency: bookings[0].trip?.currency,
        pricingCurrency: bookings[0].pricing?.currency,
        finalAmount: bookings[0].pricing?.finalAmount
      });
    }

    res.json({
      success: true,
      data: {
        bookings,
        total: bookings.length
      }
    });

  } catch (error) {
    console.error('❌ Admin bookings error:', error);
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
  getAllBookingsForAdmin,
  recordPayment,
  updateBookingStatus
};