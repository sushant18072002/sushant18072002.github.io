const { User, Booking, Review, Notification, PriceAlert, Itinerary } = require('../models');

// Customer Dashboard Overview
const getCustomerDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get dashboard data in parallel
    const [
      upcomingBookings,
      recentBookings,
      bookingStats,
      notifications,
      priceAlerts,
      itineraries,
      loyaltyInfo,
      recentReviews
    ] = await Promise.all([
      // Upcoming bookings
      Booking.find({
        user: userId,
        status: { $in: ['confirmed', 'pending'] },
        $or: [
          { 'flight.flightId': { $exists: true }, 'route.departure.scheduledTime': { $gte: now } },
          { 'hotel.hotelId': { $exists: true }, 'hotel.checkIn': { $gte: now } },
          { 'package.packageId': { $exists: true }, 'package.startDate': { $gte: now } }
        ]
      })
      .populate('flight.flightId', 'flightNumber airline route')
      .populate('hotel.hotelId', 'name location')
      .populate('package.packageId', 'name destinations')
      .sort({ createdAt: -1 })
      .limit(5),

      // Recent bookings
      Booking.find({ user: userId })
        .populate('flight.flightId', 'flightNumber airline')
        .populate('hotel.hotelId', 'name location')
        .populate('package.packageId', 'name')
        .sort({ createdAt: -1 })
        .limit(5),

      // Booking statistics
      Booking.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            totalSpent: { $sum: '$pricing.totalAmount' },
            completedBookings: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            cancelledBookings: {
              $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
            },
            recentBookings: {
              $sum: { $cond: [{ $gte: ['$createdAt', thirtyDaysAgo] }, 1, 0] }
            }
          }
        }
      ]),

      // Unread notifications
      Notification.find({ user: userId, isRead: false })
        .sort({ createdAt: -1 })
        .limit(5),

      // Active price alerts
      PriceAlert.find({ user: userId, isActive: true })
        .sort({ createdAt: -1 })
        .limit(3),

      // Recent itineraries
      Itinerary.find({ user: userId })
        .sort({ updatedAt: -1 })
        .limit(3),

      // Loyalty information
      User.findById(userId).select('loyaltyPoints totalBookings totalSpent'),

      // Recent reviews
      Review.find({ user: userId })
        .populate('entityId')
        .sort({ createdAt: -1 })
        .limit(3)
    ]);

    // Calculate loyalty tier
    const loyaltyTier = calculateLoyaltyTier(loyaltyInfo.loyaltyPoints);

    // Format response
    const dashboardData = {
      overview: {
        totalBookings: bookingStats[0]?.totalBookings || 0,
        totalSpent: bookingStats[0]?.totalSpent || 0,
        completedBookings: bookingStats[0]?.completedBookings || 0,
        recentBookings: bookingStats[0]?.recentBookings || 0,
        loyaltyPoints: loyaltyInfo.loyaltyPoints,
        loyaltyTier
      },
      upcomingBookings: upcomingBookings.map(booking => ({
        id: booking._id,
        type: booking.type,
        bookingReference: booking.bookingReference,
        status: booking.status,
        totalAmount: booking.pricing.totalAmount,
        currency: booking.pricing.currency,
        details: getBookingDetails(booking),
        createdAt: booking.createdAt
      })),
      recentBookings: recentBookings.slice(0, 3),
      notifications: notifications,
      priceAlerts: priceAlerts,
      itineraries: itineraries,
      recentReviews: recentReviews,
      quickActions: [
        { type: 'search_flights', label: 'Search Flights', icon: 'plane' },
        { type: 'search_hotels', label: 'Search Hotels', icon: 'bed' },
        { type: 'create_itinerary', label: 'Plan Trip', icon: 'map' },
        { type: 'view_bookings', label: 'My Bookings', icon: 'calendar' }
      ]
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Get booking analytics for customer
const getBookingAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '12m' } = req.query;

    let dateFilter = {};
    const now = new Date();

    switch (period) {
      case '3m':
        dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
        break;
      case '6m':
        dateFilter = { $gte: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000) };
        break;
      case '12m':
        dateFilter = { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
        break;
    }

    const analytics = await Booking.aggregate([
      { $match: { user: userId, createdAt: dateFilter } },
      {
        $facet: {
          monthlySpending: [
            {
              $group: {
                _id: {
                  year: { $year: '$createdAt' },
                  month: { $month: '$createdAt' }
                },
                totalSpent: { $sum: '$pricing.totalAmount' },
                bookingCount: { $sum: 1 }
              }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
          ],
          bookingsByType: [
            {
              $group: {
                _id: '$type',
                count: { $sum: 1 },
                totalSpent: { $sum: '$pricing.totalAmount' }
              }
            }
          ],
          bookingsByStatus: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ],
          topDestinations: [
            { $match: { type: 'flight' } },
            {
              $group: {
                _id: '$flight.route.arrival.airport.city',
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      data: { analytics: analytics[0] }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Get travel preferences insights
const getTravelInsights = async (req, res) => {
  try {
    const userId = req.user._id;

    const insights = await Booking.aggregate([
      { $match: { user: userId, status: 'completed' } },
      {
        $facet: {
          preferredClass: [
            { $match: { type: 'flight' } },
            { $group: { _id: '$flight.class', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
          ],
          averageSpending: [
            {
              $group: {
                _id: '$type',
                avgSpending: { $avg: '$pricing.totalAmount' },
                count: { $sum: 1 }
              }
            }
          ],
          seasonalTrends: [
            {
              $group: {
                _id: { $month: '$createdAt' },
                count: { $sum: 1 }
              }
            },
            { $sort: { '_id': 1 } }
          ],
          bookingLeadTime: [
            { $match: { type: 'flight' } },
            {
              $project: {
                leadTime: {
                  $divide: [
                    { $subtract: ['$flight.route.departure.scheduledTime', '$createdAt'] },
                    1000 * 60 * 60 * 24 // Convert to days
                  ]
                }
              }
            },
            {
              $group: {
                _id: null,
                avgLeadTime: { $avg: '$leadTime' }
              }
            }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      data: { insights: insights[0] }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Helper functions
const calculateLoyaltyTier = (points) => {
  if (points >= 50000) return { name: 'Platinum', benefits: ['Priority boarding', 'Lounge access', 'Free upgrades'] };
  if (points >= 25000) return { name: 'Gold', benefits: ['Priority check-in', 'Extra baggage', 'Seat selection'] };
  if (points >= 10000) return { name: 'Silver', benefits: ['Priority support', 'Early booking access'] };
  return { name: 'Bronze', benefits: ['Points earning', 'Member discounts'] };
};

const getBookingDetails = (booking) => {
  switch (booking.type) {
    case 'flight':
      return {
        flightNumber: booking.flight.flightId?.flightNumber,
        route: booking.flight.flightId?.route,
        passengers: booking.flight.passengers?.length || 1,
        class: booking.flight.class
      };
    case 'hotel':
      return {
        hotelName: booking.hotel.hotelId?.name,
        location: booking.hotel.hotelId?.location,
        checkIn: booking.hotel.checkIn,
        checkOut: booking.hotel.checkOut,
        nights: booking.hotel.nights,
        rooms: booking.hotel.rooms?.length || 1
      };
    case 'package':
      return {
        packageName: booking.package.packageId?.name,
        destinations: booking.package.packageId?.destinations,
        startDate: booking.package.startDate,
        duration: booking.package.duration,
        travelers: booking.package.travelers
      };
    default:
      return {};
  }
};

module.exports = {
  getCustomerDashboard,
  getBookingAnalytics,
  getTravelInsights
};