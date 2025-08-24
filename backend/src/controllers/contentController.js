const { Destination, Hotel, Flight, Package, BlogPost, User, Booking } = require('../models');

const getHomeStats = async (req, res) => {
  try {
    const [
      totalDestinations,
      totalHotels,
      totalFlights,
      totalUsers,
      totalBookings
    ] = await Promise.all([
      Destination.countDocuments({ status: 'active' }),
      Hotel.countDocuments({ status: 'active' }),
      Flight.countDocuments({ status: 'scheduled' }),
      User.countDocuments({ status: 'active' }),
      Booking.countDocuments({ status: { $in: ['confirmed', 'completed'] } })
    ]);

    const stats = {
      destinations: totalDestinations,
      hotels: totalHotels,
      flights: totalFlights,
      users: totalUsers,
      bookings: totalBookings,
      satisfaction: 4.8
    };

    res.json({ success: true, data: { stats } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const getFeaturedDestinations = async (req, res) => {
  try {
    const destinations = await Destination.find({ 
      featured: true, 
      status: 'active' 
    })
    .populate('country', 'name')
    .select('name shortDescription images stats')
    .sort({ priority: -1 })
    .limit(6);

    res.json({ success: true, data: { destinations } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const getTravelCategories = async (req, res) => {
  try {
    const categories = [
      {
        id: 'adventure',
        name: 'Adventure Travel',
        description: 'Thrilling experiences and outdoor activities',
        image: '/images/categories/adventure.jpg',
        count: 150
      },
      {
        id: 'cultural',
        name: 'Cultural Tours',
        description: 'Explore history, art, and local traditions',
        image: '/images/categories/cultural.jpg',
        count: 200
      },
      {
        id: 'beach',
        name: 'Beach Holidays',
        description: 'Relax on pristine beaches and tropical islands',
        image: '/images/categories/beach.jpg',
        count: 180
      },
      {
        id: 'city',
        name: 'City Breaks',
        description: 'Urban adventures and metropolitan experiences',
        image: '/images/categories/city.jpg',
        count: 220
      }
    ];

    res.json({ success: true, data: { categories } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const getDeals = async (req, res) => {
  try {
    const [flightDeals, hotelDeals, packageDeals] = await Promise.all([
      Flight.find({ 'pricing.economy.totalPrice': { $lt: 300 } })
        .populate('airline', 'name logo')
        .populate('route.departure.airport', 'code name city')
        .populate('route.arrival.airport', 'code name city')
        .limit(5),
      Hotel.find({ 'pricing.priceRange.min': { $lt: 100 } })
        .select('name images pricing rating location')
        .limit(5),
      Package.find({ 'price.discount': { $gt: 0 } })
        .select('title images price duration destinations')
        .limit(5)
    ]);

    const deals = {
      flights: flightDeals,
      hotels: hotelDeals,
      packages: packageDeals
    };

    res.json({ success: true, data: { deals } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const getLatestBlogPosts = async (req, res) => {
  try {
    const posts = await BlogPost.find({ status: 'published' })
      .populate('author', 'profile.firstName profile.lastName')
      .select('title excerpt featuredImage publishedAt readTime')
      .sort({ publishedAt: -1 })
      .limit(6);

    res.json({ success: true, data: { posts } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const getTestimonials = async (req, res) => {
  try {
    const testimonials = [
      {
        id: 1,
        name: 'Sarah Johnson',
        location: 'New York, USA',
        rating: 5,
        comment: 'Amazing experience! The AI-powered itinerary was perfect for our family trip.',
        avatar: '/images/testimonials/sarah.jpg',
        trip: 'Family Trip to Europe'
      },
      {
        id: 2,
        name: 'Michael Chen',
        location: 'Toronto, Canada',
        rating: 5,
        comment: 'Best travel platform I\'ve used. Great deals and excellent customer service.',
        avatar: '/images/testimonials/michael.jpg',
        trip: 'Business Trip to Asia'
      },
      {
        id: 3,
        name: 'Emma Wilson',
        location: 'London, UK',
        rating: 5,
        comment: 'The personalized recommendations were spot on. Will definitely use again!',
        avatar: '/images/testimonials/emma.jpg',
        trip: 'Solo Adventure in South America'
      }
    ];

    res.json({ success: true, data: { testimonials } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

module.exports = {
  getHomeStats,
  getFeaturedDestinations,
  getTravelCategories,
  getDeals,
  getLatestBlogPosts,
  getTestimonials
};