const { CorporateBooking, Company, User, Flight, Hotel, Trip } = require('../models');
const auditService = require('../services/auditService');

// Create corporate booking
const createCorporateBooking = async (req, res) => {
  try {
    const {
      type,
      corporate,
      travelers,
      bookingDetails,
      travelDates,
      specialRequests
    } = req.body;

    // Verify user belongs to a company
    if (!req.user.corporate?.company) {
      return res.status(403).json({
        success: false,
        error: { message: 'User not associated with any company' }
      });
    }

    const company = await Company.findById(req.user.corporate.company);
    if (!company) {
      return res.status(404).json({
        success: false,
        error: { message: 'Company not found' }
      });
    }

    // Calculate pricing with corporate discounts
    const pricing = await calculateCorporatePricing(type, bookingDetails, company, travelers.length);

    // Check budget limits
    const budgetCheck = await checkBudgetLimits(company, corporate.department, pricing.total);
    if (!budgetCheck.allowed) {
      return res.status(400).json({
        success: false,
        error: { message: budgetCheck.message }
      });
    }

    // Determine if approval is required
    const requiresApproval = determineApprovalRequirement(company, pricing.total, req.user);

    const bookingData = {
      company: company._id,
      bookedBy: req.user._id,
      type,
      corporate: {
        ...corporate,
        approval: {
          required: requiresApproval,
          status: requiresApproval ? 'pending' : 'auto-approved'
        },
        budget: {
          allocated: budgetCheck.allocated,
          spent: pricing.total,
          remaining: budgetCheck.remaining - pricing.total
        }
      },
      travelers: travelers.map((traveler, index) => ({
        ...traveler,
        isPrimary: index === 0
      })),
      bookingDetails,
      pricing,
      travelDates,
      status: requiresApproval ? 'pending-approval' : 'approved',
      metadata: {
        source: 'web',
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
      }
    };

    const booking = new CorporateBooking(bookingData);
    await booking.save();

    // Update company budget
    await company.updateBudgetSpent(corporate.department, pricing.total);

    // Send approval notification if required
    if (requiresApproval) {
      await sendApprovalNotification(booking, company);
    }

    await auditService.log({
      userId: req.user._id,
      action: 'CORPORATE_BOOKING_CREATED',
      resource: 'corporate-booking',
      resourceId: booking._id.toString(),
      metadata: { 
        company: company.name,
        type: booking.type,
        amount: pricing.total,
        requiresApproval
      }
    });

    res.status(201).json({
      success: true,
      data: { 
        booking,
        requiresApproval,
        message: requiresApproval ? 'Booking created and sent for approval' : 'Booking created and auto-approved'
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

// Get company bookings
const getCompanyBookings = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      department,
      type,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    if (!req.user.corporate?.company) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied' }
      });
    }

    const query = { company: req.user.corporate.company };
    
    // Add filters
    if (status) query.status = status;
    if (department) query['corporate.department'] = department;
    if (type) query.type = type;
    if (startDate || endDate) {
      query['travelDates.departure'] = {};
      if (startDate) query['travelDates.departure'].$gte = new Date(startDate);
      if (endDate) query['travelDates.departure'].$lte = new Date(endDate);
    }

    // Role-based filtering
    if (req.user.role === 'corporate-user') {
      // Regular employees can only see their own bookings
      query.bookedBy = req.user._id;
    } else if (req.user.corporate.department && !req.user.corporate.canApprove) {
      // Department users can see department bookings
      query['corporate.department'] = req.user.corporate.department;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const bookings = await CorporateBooking.find(query)
      .populate('bookedBy', 'profile.firstName profile.lastName email')
      .populate('corporate.approval.approvedBy', 'profile.firstName profile.lastName')
      .populate('travelers.user', 'profile.firstName profile.lastName email')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await CorporateBooking.countDocuments(query);

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

// Approve/Reject booking
const approveBooking = async (req, res) => {
  try {
    const { action, notes, reason } = req.body; // action: 'approve' or 'reject'
    
    const booking = await CorporateBooking.findById(req.params.id)
      .populate('company')
      .populate('bookedBy', 'profile.firstName profile.lastName email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: { message: 'Booking not found' }
      });
    }

    // Check if user can approve
    if (!canUserApprove(req.user, booking)) {
      return res.status(403).json({
        success: false,
        error: { message: 'Not authorized to approve this booking' }
      });
    }

    if (booking.corporate.approval.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: { message: 'Booking is not pending approval' }
      });
    }

    if (action === 'approve') {
      await booking.approve(req.user._id, notes);
      
      // Send confirmation to booker
      await sendBookingConfirmation(booking);
      
      await auditService.log({
        userId: req.user._id,
        action: 'CORPORATE_BOOKING_APPROVED',
        resource: 'corporate-booking',
        resourceId: booking._id.toString()
      });
    } else if (action === 'reject') {
      await booking.reject(req.user._id, reason);
      
      // Send rejection notification
      await sendBookingRejection(booking, reason);
      
      await auditService.log({
        userId: req.user._id,
        action: 'CORPORATE_BOOKING_REJECTED',
        resource: 'corporate-booking',
        resourceId: booking._id.toString(),
        metadata: { reason }
      });
    }

    res.json({
      success: true,
      data: { 
        booking,
        message: `Booking ${action}d successfully`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Get pending approvals
const getPendingApprovals = async (req, res) => {
  try {
    if (!req.user.corporate?.canApprove) {
      return res.status(403).json({
        success: false,
        error: { message: 'Not authorized to view approvals' }
      });
    }

    const bookings = await CorporateBooking.find({
      company: req.user.corporate.company,
      'corporate.approval.status': 'pending',
      'pricing.total': { $lte: req.user.corporate.approvalLimit || 999999 }
    })
    .populate('bookedBy', 'profile.firstName profile.lastName email corporate.department')
    .populate('travelers.user', 'profile.firstName profile.lastName')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { bookings }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Get booking analytics
const getBookingAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;
    
    if (!req.user.corporate?.company) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied' }
      });
    }

    const matchQuery = { company: req.user.corporate.company };
    
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }
    
    if (department) {
      matchQuery['corporate.department'] = department;
    }

    const analytics = await CorporateBooking.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalSpent: { $sum: '$pricing.total' },
          avgBookingValue: { $avg: '$pricing.total' },
          bookingsByStatus: {
            $push: {
              status: '$status',
              amount: '$pricing.total'
            }
          },
          bookingsByType: {
            $push: {
              type: '$type',
              amount: '$pricing.total'
            }
          },
          bookingsByDepartment: {
            $push: {
              department: '$corporate.department',
              amount: '$pricing.total'
            }
          }
        }
      }
    ]);

    // Get department-wise breakdown
    const departmentStats = await CorporateBooking.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$corporate.department',
          count: { $sum: 1 },
          totalSpent: { $sum: '$pricing.total' },
          avgSpent: { $avg: '$pricing.total' }
        }
      },
      { $sort: { totalSpent: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: analytics[0] || {},
        departmentStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Helper functions
const calculateCorporatePricing = async (type, bookingDetails, company, travelerCount) => {
  let basePrice = 0;
  
  // Get base price based on booking type
  switch (type) {
    case 'flight':
      if (bookingDetails.flight?.flightId) {
        const flight = await Flight.findById(bookingDetails.flight.flightId);
        basePrice = flight?.pricing?.[bookingDetails.flight.class]?.totalPrice || 0;
      }
      break;
    case 'hotel':
      if (bookingDetails.hotel?.hotelId) {
        const hotel = await Hotel.findById(bookingDetails.hotel.hotelId);
        basePrice = hotel?.pricing?.priceRange?.min || 0;
        basePrice *= bookingDetails.hotel.nights || 1;
      }
      break;
    case 'trip':
      if (bookingDetails.trip?.tripId) {
        const trip = await Trip.findById(bookingDetails.trip.tripId);
        basePrice = trip?.pricing?.finalPrice || trip?.pricing?.estimated || 0;
      }
      break;
  }

  basePrice *= travelerCount;

  // Apply corporate discount
  let corporateDiscount = { amount: 0 };
  const corporateRate = company.corporateRates.find(rate => 
    rate.category === type && 
    new Date() >= rate.validFrom && 
    new Date() <= rate.validTo
  );

  if (corporateRate) {
    if (corporateRate.discountType === 'percentage') {
      corporateDiscount = {
        type: 'percentage',
        value: corporateRate.discountValue,
        amount: (basePrice * corporateRate.discountValue) / 100
      };
    } else {
      corporateDiscount = {
        type: 'fixed',
        value: corporateRate.discountValue,
        amount: corporateRate.discountValue * travelerCount
      };
    }
  }

  const taxes = (basePrice - corporateDiscount.amount) * 0.18; // 18% tax
  const fees = 99; // Service fee

  return {
    basePrice,
    corporateDiscount,
    taxes,
    fees,
    total: basePrice - corporateDiscount.amount + taxes + fees,
    currency: 'USD'
  };
};

const checkBudgetLimits = async (company, department, amount) => {
  const deptBudget = company.settings.budgetControls.departmentBudgets.find(
    b => b.department === department
  );

  if (!deptBudget) {
    return { allowed: true, message: 'No budget limit set' };
  }

  const remaining = deptBudget.annualBudget - deptBudget.spentAmount;
  
  if (amount > remaining) {
    return { 
      allowed: false, 
      message: `Booking amount exceeds department budget. Available: ${remaining}`,
      allocated: deptBudget.annualBudget,
      spent: deptBudget.spentAmount,
      remaining
    };
  }

  return { 
    allowed: true,
    allocated: deptBudget.annualBudget,
    spent: deptBudget.spentAmount,
    remaining
  };
};

const determineApprovalRequirement = (company, amount, user) => {
  if (!company.settings.travelPolicy.requireApproval) {
    return false;
  }

  const userApprovalLimit = user.corporate?.approvalLimit || 0;
  return amount > userApprovalLimit;
};

const canUserApprove = (user, booking) => {
  if (!user.corporate?.canApprove) return false;
  if (user.corporate.company.toString() !== booking.company.toString()) return false;
  
  const approvalLimit = user.corporate.approvalLimit || 0;
  return booking.pricing.total <= approvalLimit;
};

const sendApprovalNotification = async (booking, company) => {
  // Implementation for sending approval notifications
  console.log(`Approval notification sent for booking ${booking.bookingReference}`);
};

const sendBookingConfirmation = async (booking) => {
  // Implementation for sending booking confirmation
  console.log(`Booking confirmation sent for ${booking.bookingReference}`);
};

const sendBookingRejection = async (booking, reason) => {
  // Implementation for sending rejection notification
  console.log(`Booking rejection sent for ${booking.bookingReference}: ${reason}`);
};

module.exports = {
  createCorporateBooking,
  getCompanyBookings,
  approveBooking,
  getPendingApprovals,
  getBookingAnalytics
};