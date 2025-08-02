const { 
  User, 
  Booking, 
  Flight, 
  Hotel, 
  Package, 
  Destination,
  Review,
  SupportTicket,
  BlogPost,
  Setting,
  Analytics,
  AuditLog
} = require('../models');
const auditService = require('../services/auditService');

// Dashboard Overview
const getDashboard = async (req, res) => {
  try {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get key metrics
    const [
      totalUsers,
      totalBookings,
      totalRevenue,
      pendingBookings,
      recentUsers,
      recentBookings,
      topDestinations,
      reviewStats
    ] = await Promise.all([
      User.countDocuments({ status: 'active' }),
      Booking.countDocuments(),
      Booking.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Booking.countDocuments({ status: 'pending' }),
      User.find({ createdAt: { $gte: lastWeek } }).limit(5).select('email profile createdAt'),
      Booking.find({ createdAt: { $gte: lastWeek } }).populate('user', 'email').limit(5),
      Destination.find({ featured: true }).limit(5).select('name stats'),
      Review.aggregate([
        { $group: { _id: null, avgRating: { $avg: '$rating' }, total: { $sum: 1 } } }
      ])
    ]);

    // Monthly growth
    const monthlyGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: lastMonth } } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalBookings,
          totalRevenue: totalRevenue[0]?.total || 0,
          pendingBookings,
          monthlyUserGrowth: monthlyGrowth[0]?.count || 0,
          averageRating: reviewStats[0]?.avgRating || 0,
          totalReviews: reviewStats[0]?.total || 0
        },
        recent: {
          users: recentUsers,
          bookings: recentBookings
        },
        topDestinations
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// User Management
const getUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      role, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(query)
      .select('-password -verification -passwordReset')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
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

const updateUser = async (req, res) => {
  try {
    const { status, role, profile } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status, role, profile },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    await auditService.log({
      userId: req.user._id,
      action: 'USER_UPDATED_BY_ADMIN',
      resource: 'user',
      resourceId: req.params.id,
      metadata: { changes: { status, role } }
    });

    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    // Soft delete by changing status
    user.status = 'suspended';
    await user.save();

    await auditService.log({
      userId: req.user._id,
      action: 'USER_SUSPENDED_BY_ADMIN',
      resource: 'user',
      resourceId: req.params.id
    });

    res.json({
      success: true,
      data: { message: 'User suspended successfully' }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Booking Management
const getBookings = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      type,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const bookings = await Booking.find(query)
      .populate('user', 'email profile.firstName profile.lastName')
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

const updateBookingStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { 
        status, 
        adminNotes: notes,
        updatedBy: req.user._id 
      },
      { new: true }
    ).populate('user', 'email profile.firstName profile.lastName');

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: { message: 'Booking not found' }
      });
    }

    await auditService.log({
      userId: req.user._id,
      action: 'BOOKING_STATUS_UPDATED',
      resource: 'booking',
      resourceId: req.params.id,
      metadata: { oldStatus: booking.status, newStatus: status }
    });

    res.json({ success: true, data: { booking } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

// Analytics
const getAnalyticsOverview = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case '7d':
        dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case '30d':
        dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        break;
      case '90d':
        dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
        break;
      case '1y':
        dateFilter = { $gte: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()) };
        break;
    }

    const [userGrowth, bookingTrends, revenueTrends] = await Promise.all([
      User.aggregate([
        { $match: { createdAt: dateFilter } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Booking.aggregate([
        { $match: { createdAt: dateFilter } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Booking.aggregate([
        { $match: { createdAt: dateFilter, status: 'completed' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$totalAmount' }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        userGrowth,
        bookingTrends,
        revenueTrends
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Content Management
const createBlogPost = async (req, res) => {
  try {
    const blogPost = new BlogPost({
      ...req.body,
      author: req.user._id
    });

    await blogPost.save();
    await blogPost.populate('author', 'profile.firstName profile.lastName');

    await auditService.log({
      userId: req.user._id,
      action: 'BLOG_POST_CREATED',
      resource: 'blogpost',
      resourceId: blogPost._id.toString()
    });

    res.status(201).json({
      success: true,
      data: { blogPost }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

// Support Ticket Management
const getSupportTickets = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      priority,
      category,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const tickets = await SupportTicket.find(query)
      .populate('user', 'email profile.firstName profile.lastName')
      .populate('assignedTo', 'profile.firstName profile.lastName')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SupportTicket.countDocuments(query);

    res.json({
      success: true,
      data: {
        tickets,
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

const updateSupportTicket = async (req, res) => {
  try {
    const { status, priority, assignedTo, response } = req.body;
    
    const updateData = { status, priority, assignedTo };
    
    if (response) {
      updateData.$push = {
        responses: {
          message: response,
          respondedBy: req.user._id,
          respondedAt: new Date()
        }
      };
    }

    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('user', 'email profile.firstName profile.lastName')
     .populate('assignedTo', 'profile.firstName profile.lastName');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: { message: 'Support ticket not found' }
      });
    }

    await auditService.log({
      userId: req.user._id,
      action: 'SUPPORT_TICKET_UPDATED',
      resource: 'supportticket',
      resourceId: req.params.id
    });

    res.json({ success: true, data: { ticket } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

// Settings Management
const updateSettings = async (req, res) => {
  try {
    const settings = await Setting.findOneAndUpdate(
      {},
      { ...req.body, updatedBy: req.user._id },
      { new: true, upsert: true }
    );

    await auditService.log({
      userId: req.user._id,
      action: 'SETTINGS_UPDATED',
      resource: 'setting',
      resourceId: settings._id.toString()
    });

    res.json({ success: true, data: { settings } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

// Entity Management (Flights, Hotels, Packages)
const createFlight = async (req, res) => {
  try {
    const flight = new Flight({
      ...req.body,
      createdBy: req.user._id
    });

    await flight.save();

    await auditService.log({
      userId: req.user._id,
      action: 'FLIGHT_CREATED',
      resource: 'flight',
      resourceId: flight._id.toString()
    });

    res.status(201).json({ success: true, data: { flight } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

const updateFlight = async (req, res) => {
  try {
    const flight = await Flight.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    if (!flight) {
      return res.status(404).json({
        success: false,
        error: { message: 'Flight not found' }
      });
    }

    await auditService.log({
      userId: req.user._id,
      action: 'FLIGHT_UPDATED',
      resource: 'flight',
      resourceId: req.params.id
    });

    res.json({ success: true, data: { flight } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

const deleteFlight = async (req, res) => {
  try {
    const flight = await Flight.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive', updatedBy: req.user._id },
      { new: true }
    );

    if (!flight) {
      return res.status(404).json({
        success: false,
        error: { message: 'Flight not found' }
      });
    }

    await auditService.log({
      userId: req.user._id,
      action: 'FLIGHT_DELETED',
      resource: 'flight',
      resourceId: req.params.id
    });

    res.json({
      success: true,
      data: { message: 'Flight deleted successfully' }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Similar functions for hotels and packages would follow the same pattern
const createHotel = async (req, res) => {
  try {
    const hotel = new Hotel({
      ...req.body,
      createdBy: req.user._id
    });

    await hotel.save();

    await auditService.log({
      userId: req.user._id,
      action: 'HOTEL_CREATED',
      resource: 'hotel',
      resourceId: hotel._id.toString()
    });

    res.status(201).json({ success: true, data: { hotel } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

const updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    if (!hotel) {
      return res.status(404).json({
        success: false,
        error: { message: 'Hotel not found' }
      });
    }

    await auditService.log({
      userId: req.user._id,
      action: 'HOTEL_UPDATED',
      resource: 'hotel',
      resourceId: req.params.id
    });

    res.json({ success: true, data: { hotel } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

const deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive', updatedBy: req.user._id },
      { new: true }
    );

    if (!hotel) {
      return res.status(404).json({
        success: false,
        error: { message: 'Hotel not found' }
      });
    }

    await auditService.log({
      userId: req.user._id,
      action: 'HOTEL_DELETED',
      resource: 'hotel',
      resourceId: req.params.id
    });

    res.json({
      success: true,
      data: { message: 'Hotel deleted successfully' }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

module.exports = {
  getDashboard,
  getUsers,
  updateUser,
  deleteUser,
  getBookings,
  updateBookingStatus,
  getAnalyticsOverview,
  getSupportTickets,
  updateSupportTicket,
  createBlogPost,
  updateSettings,
  createFlight,
  updateFlight,
  deleteFlight,
  createHotel,
  updateHotel,
  deleteHotel
};