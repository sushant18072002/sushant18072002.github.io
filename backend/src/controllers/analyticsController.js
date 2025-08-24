const { SearchLog, Booking, User, Destination, Analytics } = require('../models');

const getSearchTrends = async (req, res) => {
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
    }

    const trends = await SearchLog.aggregate([
      { $match: { createdAt: dateFilter } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            type: '$searchType'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    const popularQueries = await SearchLog.aggregate([
      { $match: { createdAt: dateFilter } },
      { $group: { _id: '$query.keywords', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        trends,
        popularQueries: popularQueries.filter(q => q._id)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const getPopularDestinations = async (req, res) => {
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
    }

    const popularDestinations = await SearchLog.aggregate([
      { $match: { createdAt: dateFilter, searchType: { $in: ['flight', 'hotel'] } } },
      {
        $group: {
          _id: {
            destination: { $ifNull: ['$query.destination', '$query.location'] }
          },
          searches: { $sum: 1 },
          bookings: {
            $sum: { $cond: ['$userInteraction.bookingMade', 1, 0] }
          }
        }
      },
      { $sort: { searches: -1 } },
      { $limit: 20 }
    ]);

    const destinationStats = await Destination.aggregate([
      {
        $project: {
          name: 1,
          'stats.views': 1,
          'stats.bookings': 1,
          'stats.averageRating': 1
        }
      },
      { $sort: { 'stats.views': -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        searchPopularity: popularDestinations,
        destinationStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const getBookingPatterns = async (req, res) => {
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
    }

    const bookingPatterns = await Booking.aggregate([
      { $match: { createdAt: dateFilter } },
      {
        $facet: {
          byType: [
            { $group: { _id: '$type', count: { $sum: 1 }, revenue: { $sum: '$pricing.totalAmount' } } },
            { $sort: { count: -1 } }
          ],
          byDay: [
            {
              $group: {
                _id: { $dayOfWeek: '$createdAt' },
                count: { $sum: 1 },
                avgAmount: { $avg: '$pricing.totalAmount' }
              }
            },
            { $sort: { _id: 1 } }
          ],
          byHour: [
            {
              $group: {
                _id: { $hour: '$createdAt' },
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ],
          conversionRate: [
            {
              $group: {
                _id: null,
                totalBookings: { $sum: 1 },
                completedBookings: {
                  $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                }
              }
            }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      data: { patterns: bookingPatterns[0] }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const getUserBehavior = async (req, res) => {
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
    }

    const userBehavior = await User.aggregate([
      { $match: { createdAt: dateFilter } },
      {
        $facet: {
          registrationTrend: [
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                newUsers: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ],
          userSegments: [
            {
              $group: {
                _id: {
                  $switch: {
                    branches: [
                      { case: { $eq: ['$totalBookings', 0] }, then: 'New Users' },
                      { case: { $lte: ['$totalBookings', 2] }, then: 'Occasional Users' },
                      { case: { $lte: ['$totalBookings', 5] }, then: 'Regular Users' },
                      { case: { $gt: ['$totalBookings', 5] }, then: 'Power Users' }
                    ],
                    default: 'Unknown'
                  }
                },
                count: { $sum: 1 },
                avgSpent: { $avg: '$totalSpent' }
              }
            }
          ],
          activityMetrics: [
            {
              $group: {
                _id: null,
                avgBookingsPerUser: { $avg: '$totalBookings' },
                avgSpentPerUser: { $avg: '$totalSpent' },
                avgLoyaltyPoints: { $avg: '$loyaltyPoints' }
              }
            }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      data: { behavior: userBehavior[0] }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const getRevenueMetrics = async (req, res) => {
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
    }

    const revenueMetrics = await Booking.aggregate([
      { $match: { createdAt: dateFilter, status: { $in: ['completed', 'confirmed'] } } },
      {
        $facet: {
          dailyRevenue: [
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                revenue: { $sum: '$pricing.totalAmount' },
                bookings: { $sum: 1 },
                avgBookingValue: { $avg: '$pricing.totalAmount' }
              }
            },
            { $sort: { _id: 1 } }
          ],
          revenueByType: [
            {
              $group: {
                _id: '$type',
                revenue: { $sum: '$pricing.totalAmount' },
                bookings: { $sum: 1 },
                avgValue: { $avg: '$pricing.totalAmount' }
              }
            },
            { $sort: { revenue: -1 } }
          ],
          totalMetrics: [
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: '$pricing.totalAmount' },
                totalBookings: { $sum: 1 },
                avgBookingValue: { $avg: '$pricing.totalAmount' },
                maxBookingValue: { $max: '$pricing.totalAmount' },
                minBookingValue: { $min: '$pricing.totalAmount' }
              }
            }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      data: { revenue: revenueMetrics[0] }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

module.exports = {
  getSearchTrends,
  getPopularDestinations,
  getBookingPatterns,
  getUserBehavior,
  getRevenueMetrics
};