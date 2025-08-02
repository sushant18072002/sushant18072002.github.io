const { User, Booking, Itinerary } = require('../models');
const auditService = require('../services/auditService');

const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get dashboard statistics
    const [upcomingBookings, totalBookings, totalItineraries] = await Promise.all([
      Booking.countDocuments({ 
        userId, 
        status: 'confirmed',
        'travel.departureDate': { $gte: new Date() }
      }),
      Booking.countDocuments({ userId }),
      Itinerary.countDocuments({ userId })
    ]);
    
    // Get next trip
    const nextTrip = await Booking.findOne({
      userId,
      status: 'confirmed',
      'travel.departureDate': { $gte: new Date() }
    }).sort({ 'travel.departureDate': 1 });
    
    // Get recent bookings
    const recentBookings = await Booking.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('items.flightId items.hotelId', 'name flightNumber');
    
    res.json({
      success: true,
      data: {
        stats: {
          upcomingTrips: upcomingBookings,
          totalBookings,
          totalItineraries,
          loyaltyPoints: req.user.loyaltyPoints || 0
        },
        nextTrip: nextTrip ? {
          destination: nextTrip.destination,
          date: nextTrip.travel?.departureDate,
          daysUntil: Math.ceil((nextTrip.travel?.departureDate - new Date()) / (1000 * 60 * 60 * 24))
        } : null,
        recentBookings
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { profile, preferences } = req.body;
    const userId = req.user._id;
    
    const updateData = {};
    if (profile) updateData.profile = { ...req.user.profile, ...profile };
    if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };
    updateData.updatedAt = new Date();
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
    
    // Log profile update
    await auditService.logUserAction(
      userId,
      'PROFILE_UPDATE',
      'user',
      userId.toString(),
      { profile, preferences },
      req
    );
    
    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const getBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const userId = req.user._id;
    
    const filter = { userId };
    if (status) filter.status = status;
    
    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('items.flightId items.hotelId', 'name flightNumber');
    
    const total = await Booking.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        bookings,
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

const getTripsTimeline = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const userId = req.user._id;
    
    const bookings = await Booking.find({
      userId,
      status: { $in: ['confirmed', 'completed'] },
      'travel.departureDate': {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${parseInt(year) + 1}-01-01`)
      }
    }).sort({ 'travel.departureDate': 1 });
    
    // Group by month
    const timeline = {};
    bookings.forEach(booking => {
      const month = booking.travel.departureDate.getMonth();
      const monthName = new Date(0, month).toLocaleString('en', { month: 'long' });
      
      if (!timeline[monthName]) {
        timeline[monthName] = [];
      }
      
      timeline[monthName].push({
        id: booking._id,
        destination: booking.destination,
        dates: `${booking.travel.departureDate.toLocaleDateString()} - ${booking.travel.returnDate?.toLocaleDateString() || 'One way'}`,
        status: booking.status
      });
    });
    
    res.json({ success: true, data: { timeline } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const updatePreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const preferences = req.body;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          preferences: { ...req.user.preferences, ...preferences },
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    ).select('-password');
    
    // Log preferences update
    await auditService.logUserAction(
      userId,
      'PREFERENCES_UPDATE',
      'user',
      userId.toString(),
      preferences,
      req
    );
    
    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Admin functions
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, role } = req.query;
    
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

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }
    
    res.json({ success: true, data: { user } });
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
    
    // Log admin user update
    await auditService.logUserAction(
      req.user._id,
      'ADMIN_USER_UPDATE',
      'user',
      userId,
      updateData,
      req
    );
    
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
    
    // Log admin user deletion
    await auditService.logUserAction(
      req.user._id,
      'ADMIN_USER_DELETE',
      'user',
      userId,
      { reason: 'Admin deletion' },
      req
    );
    
    res.json({ success: true, data: { message: 'User deleted successfully' } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

module.exports = {
  getDashboard,
  getProfile,
  updateProfile,
  getBookings,
  getTripsTimeline,
  updatePreferences,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};