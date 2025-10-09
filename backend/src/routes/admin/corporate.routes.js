const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const { Company, CorporateBooking, User } = require('../../models');

// Admin middleware to check admin role
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: { message: 'Admin access required' } });
  }
  next();
};

// Get all companies
router.get('/companies', auth, adminOnly, async (req, res) => {
  try {
    const companies = await Company.find()
      .populate('admins.user', 'email profile')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { companies }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Get all corporate bookings
router.get('/bookings', auth, adminOnly, async (req, res) => {
  try {
    const bookings = await CorporateBooking.find()
      .populate('company', 'name')
      .populate('bookedBy', 'email profile')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: { bookings }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Activate/Suspend company
router.post('/companies/:id/:action', auth, adminOnly, async (req, res) => {
  try {
    const { id, action } = req.params;
    
    if (!['activate', 'suspend'].includes(action)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid action' } });
    }

    const status = action === 'activate' ? 'active' : 'suspended';
    
    await Company.findByIdAndUpdate(id, { status });
    
    res.json({
      success: true,
      data: { message: `Company ${action}d successfully` }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Get corporate analytics
router.get('/analytics', auth, adminOnly, async (req, res) => {
  try {
    const totalCompanies = await Company.countDocuments();
    const activeCompanies = await Company.countDocuments({ status: 'active' });
    const totalBookings = await CorporateBooking.countDocuments();
    const totalRevenue = await CorporateBooking.aggregate([
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalCompanies,
        activeCompanies,
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

module.exports = router;