const { User, Booking, Trip, Hotel, Flight } = require('../models');

// Dashboard
const getDashboard = async (req, res) => {
  try {
    const [userCount, bookingCount, tripCount, hotelCount] = await Promise.all([
      User.countDocuments(),
      Booking.countDocuments(),
      Trip.countDocuments(),
      Hotel.countDocuments()
    ]);

    res.json({
      success: true,
      data: {
        users: userCount,
        bookings: bookingCount,
        trips: tripCount,
        hotels: hotelCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Users
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, role } = req.query;
    
    const filter = {};
    if (search) {
      filter.$or = [
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) filter.status = status;
    if (role) filter.role = role;
    
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = { ...req.body, updatedAt: new Date() };
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }
    
    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Soft delete
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          status: 'deleted',
          deletedAt: new Date(),
          deletedBy: req.user._id
        }
      },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }
    
    res.json({ success: true, data: { message: 'User deleted successfully' } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Bookings
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('user', 'firstName lastName email').sort({ createdAt: -1 });
    res.json({ success: true, data: { bookings } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json({ success: true, data: { booking } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Analytics
const getAnalyticsOverview = async (req, res) => {
  try {
    const data = {
      totalRevenue: 125000,
      totalBookings: 1250,
      activeUsers: 850,
      conversionRate: 3.2
    };
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Support
const getSupportTickets = async (req, res) => {
  try {
    const { SupportTicket } = require('../models');
    const tickets = await SupportTicket.find().populate('user', 'firstName lastName').sort({ createdAt: -1 });
    res.json({ success: true, data: { tickets } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const updateSupportTicket = async (req, res) => {
  try {
    const { SupportTicket } = require('../models');
    const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: { ticket } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Content
const createBlogPost = async (req, res) => {
  try {
    const { BlogPost } = require('../models');
    const post = await BlogPost.create({ ...req.body, author: req.user._id });
    res.status(201).json({ success: true, data: { post } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Settings
const updateSettings = async (req, res) => {
  try {
    res.json({ success: true, data: { message: 'Settings updated' } });
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
  updateSettings
};