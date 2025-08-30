const { Trip, Hotel, City, Country, Booking } = require('../models');

// Get homepage featured content
const getFeaturedContent = async (req, res) => {
  try {
    const [featuredTrips, featuredHotels, popularDestinations] = await Promise.all([
      // Featured trips
      Trip.find({ status: 'published', featured: true })
        .populate('primaryDestination', 'name')
        .populate('category', 'name icon')
        .sort({ priority: -1 })
        .limit(6)
        .select('title slug description duration pricing images stats featured'),
      
      // Featured hotels
      Hotel.find({ status: 'active', featured: true })
        .populate('location.city', 'name')
        .populate('location.country', 'name')
        .sort({ 'rating.overall': -1 })
        .limit(4)
        .select('name description starRating location pricing images rating featured'),
      
      // Popular destinations
      City.find({ status: 'active' })
        .populate('country', 'name flag')
        .sort({ createdAt: -1 })
        .limit(8)
        .select('name description images popularFor bestTimeToVisit coordinates')
    ]);

    // Dynamic destination spotlight
    const destinationSpotlight = {
      title: popularDestinations.length > 0 ? 
        `Explore ${popularDestinations[0]?.popularFor?.[0] || 'amazing destinations'} in ${popularDestinations[0]?.country?.name || 'beautiful places'}` :
        'Explore amazing destinations worldwide',
      subtitle: 'Discover breathtaking places and unique experiences',
      destinations: popularDestinations.slice(0, 4).map((dest, index) => ({
        id: dest._id,
        name: dest.name,
        location: dest.country?.name || 'Beautiful Location',
        price: 190 + index * 40,
        image: dest.images?.[0] || `photo-${index % 2 === 0 ? '1506905925346-21bda4d32df4' : '1464822759844-d150baec3e5e'}`,
        discount: index % 3 === 0 ? `${15 + index * 5}% off` : null
      }))
    };

    // Adventure categories
    const adventureCategories = [
      {
        icon: '🏖️',
        title: 'Luxury resort at the sea',
        places: `${Math.floor(Math.random() * 5000) + 8000} places`,
        type: 'luxury',
      },
      {
        icon: '🏕️',
        title: 'Camping amidst the wild',
        places: `${Math.floor(Math.random() * 5000) + 10000} places`,
        type: 'camping',
      },
      {
        icon: '🏔️',
        title: 'Mountain adventures',
        places: `${Math.floor(Math.random() * 3000) + 7000} places`,
        type: 'mountain',
      },
    ];

    // Blog posts
    const blogPosts = [
      {
        id: 'travel-planning-2024',
        title: 'Ultimate Travel Planning Guide 2024',
        excerpt: 'Everything you need to know to plan your perfect trip',
        category: 'Planning',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        readTime: '8 min read',
        image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=350&h=200&fit=crop'
      },
      {
        id: 'budget-travel-tips',
        title: 'Travel More, Spend Less: Budget Secrets',
        excerpt: 'Smart strategies to explore the world without breaking the bank',
        category: 'Budget Tips',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        readTime: '7 min read',
        image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=350&h=200&fit=crop'
      },
      {
        id: 'best-destinations-2024',
        title: 'Top 10 Must-Visit Destinations 2024',
        excerpt: 'Discover the most amazing places to add to your travel bucket list',
        category: 'Destinations',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        readTime: '6 min read',
        image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=350&h=200&fit=crop'
      }
    ];

    res.json({
      success: true,
      data: {
        featuredTrips,
        featuredHotels,
        popularDestinations,
        destinationSpotlight,
        adventureCategories,
        blogPosts,
        heroImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&h=1080&fit=crop'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

// Get platform statistics
const getStats = async (req, res) => {
  try {
    const [tripCount, bookingCount, destinationCount] = await Promise.all([
      Trip.countDocuments({ status: 'published' }),
      Booking.countDocuments({ status: { $in: ['confirmed', 'completed'] } }),
      City.countDocuments({ status: 'active' })
    ]);

    // Calculate happy customers (unique users with completed bookings)
    const happyCustomers = await Booking.distinct('user', { 
      status: 'completed' 
    }).then(users => users.length);

    res.json({
      success: true,
      data: {
        totalTrips: tripCount,
        totalBookings: bookingCount,
        happyCustomers: happyCustomers,
        destinations: destinationCount,
        averageRating: 4.9,
        support: '24/7'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

// Get current deals and offers
const getDeals = async (req, res) => {
  try {
    const [tripDeals, hotelDeals] = await Promise.all([
      // Trip deals (discounted trips)
      Trip.find({ 
        status: 'published',
        'pricing.priceRange': 'budget'
      })
        .populate('primaryDestination', 'name')
        .populate('category', 'name icon')
        .sort({ 'pricing.estimated': 1 })
        .limit(4)
        .select('title slug description duration pricing images'),
      
      // Hotel deals (low price hotels)
      Hotel.find({
        status: 'active',
        'pricing.priceRange.min': { $lt: 150 }
      })
        .populate('location.city', 'name')
        .sort({ 'pricing.priceRange.min': 1 })
        .limit(4)
        .select('name location pricing images starRating')
    ]);

    res.json({
      success: true,
      data: {
        tripDeals,
        hotelDeals
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

// Admin: Get homepage content settings
const getHomeContent = async (req, res) => {
  try {
    // This would typically come from a settings/content management table
    // For now, return current featured items
    const [featuredTrips, featuredHotels, featuredDestinations] = await Promise.all([
      Trip.find({ featured: true }).select('_id title featured priority'),
      Hotel.find({ featured: true }).select('_id name featured'),
      City.find({ featured: true }).select('_id name featured')
    ]);

    res.json({
      success: true,
      data: {
        hero: {
          title: 'Air, sleep, dream',
          subtitle: 'Find and book a great experience.',
          backgroundImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&h=1080&fit=crop'
        },
        featuredTrips: featuredTrips.map(trip => ({
          id: trip._id,
          title: trip.title,
          featured: trip.featured,
          priority: trip.priority || 0
        })),
        featuredHotels: featuredHotels.map(hotel => ({
          id: hotel._id,
          name: hotel.name,
          featured: hotel.featured
        })),
        featuredDestinations: featuredDestinations.map(dest => ({
          id: dest._id,
          name: dest.name,
          featured: dest.featured
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

// Admin: Update homepage content settings
const updateHomeContent = async (req, res) => {
  try {
    const { featuredTrips, featuredHotels, featuredDestinations, hero } = req.body;

    // Update featured trips
    if (featuredTrips) {
      await Trip.updateMany({}, { featured: false });
      for (const trip of featuredTrips) {
        await Trip.findByIdAndUpdate(trip.id, { 
          featured: true, 
          priority: trip.priority || 0 
        });
      }
    }

    // Update featured hotels
    if (featuredHotels) {
      await Hotel.updateMany({}, { featured: false });
      for (const hotel of featuredHotels) {
        await Hotel.findByIdAndUpdate(hotel.id, { featured: true });
      }
    }

    // Update featured destinations
    if (featuredDestinations) {
      await City.updateMany({}, { featured: false });
      for (const dest of featuredDestinations) {
        await City.findByIdAndUpdate(dest.id, { featured: true });
      }
    }

    res.json({
      success: true,
      data: { message: 'Homepage content updated successfully' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

module.exports = {
  getFeaturedContent,
  getStats,
  getDeals,
  getHomeContent,
  updateHomeContent
};