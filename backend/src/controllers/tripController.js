const { Trip, City, Country, Category } = require('../models');

// Get all trips with filters
const getTrips = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      destination, 
      type, 
      priceRange, 
      duration,
      featured,
      search 
    } = req.query;

    const query = { status: 'published' };
    
    // Apply filters
    if (category) query.category = category;
    if (destination) query.primaryDestination = destination;
    if (type) query.type = type;
    if (priceRange) query['pricing.priceRange'] = priceRange;
    if (featured === 'true') query.featured = true;
    
    if (duration) {
      const [min, max] = duration.split('-').map(Number);
      query['duration.days'] = { $gte: min };
      if (max) query['duration.days'].$lte = max;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const trips = await Trip.find(query)
      .populate('primaryDestination', 'name country')
      .populate('category', 'name icon color')
      .populate('destinations', 'name')
      .sort({ featured: -1, priority: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Trip.countDocuments(query);

    // Transform for frontend
    const transformedTrips = trips.map(trip => ({
      id: trip._id,
      title: trip.title,
      slug: trip.slug,
      description: trip.description,
      destination: trip.primaryDestination?.name || 'Unknown',
      duration: trip.duration.days,
      price: trip.pricing.estimated || 0,
      priceRange: trip.pricing.priceRange,
      rating: trip.stats.rating || 4.5,
      reviews: trip.stats.reviewCount || 0,
      images: trip.images.map(img => img.url),
      category: trip.category?.name || 'General',
      difficulty: trip.difficulty,
      featured: trip.featured,
      type: trip.type,
      tags: trip.tags
    }));

    res.json({
      success: true,
      data: {
        trips: transformedTrips,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

// Get featured trips
const getFeaturedTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ 
      status: 'published', 
      featured: true 
    })
      .populate('primaryDestination', 'name country')
      .populate('category', 'name icon color')
      .sort({ priority: -1, createdAt: -1 })
      .limit(10);

    const transformedTrips = trips.map(trip => ({
      id: trip._id,
      title: trip.title,
      slug: trip.slug,
      description: trip.description,
      destination: trip.primaryDestination?.name || 'Unknown',
      duration: trip.duration.days,
      price: trip.pricing.estimated || 0,
      images: trip.images.map(img => img.url),
      category: trip.category?.name || 'General',
      rating: trip.stats.rating || 4.5,
      reviews: trip.stats.reviewCount || 0,
      featured: true
    }));

    res.json({
      success: true,
      data: { trips: transformedTrips }
    });
  } catch (error) {
    console.error('Get featured trips error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

// Get single trip details
const getTripDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const trip = await Trip.findOne({
      $or: [{ _id: id }, { slug: id }],
      status: 'published'
    })
      .populate('primaryDestination', 'name country timezone')
      .populate('destinations', 'name country')
      .populate('category', 'name icon color')
      .populate('createdBy', 'profile.firstName profile.lastName');

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: { message: 'Trip not found' }
      });
    }

    // Increment view count
    trip.stats.views += 1;
    await trip.save();

    // Transform for frontend
    const transformedTrip = {
      id: trip._id,
      title: trip.title,
      slug: trip.slug,
      description: trip.description,
      destination: trip.primaryDestination?.name || 'Unknown',
      destinations: trip.destinations.map(d => d.name),
      duration: trip.duration,
      pricing: trip.pricing,
      category: trip.category,
      tags: trip.tags,
      travelStyle: trip.travelStyle,
      difficulty: trip.difficulty,
      suitableFor: trip.suitableFor,
      itinerary: trip.itinerary,
      images: trip.images,
      customizable: trip.customizable,
      bookingInfo: trip.bookingInfo,
      stats: trip.stats,
      sharing: trip.sharing,
      featured: trip.featured,
      type: trip.type
    };

    res.json({
      success: true,
      data: { trip: transformedTrip }
    });
  } catch (error) {
    console.error('Get trip details error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

// Search trips
const searchTrips = async (req, res) => {
  try {
    const { q, category, destination, priceRange } = req.query;
    
    const query = { status: 'published' };
    
    if (q) {
      query.$text = { $search: q };
    }
    
    if (category) query.category = category;
    if (destination) query.primaryDestination = destination;
    if (priceRange) query['pricing.priceRange'] = priceRange;

    const trips = await Trip.find(query)
      .populate('primaryDestination', 'name')
      .populate('category', 'name icon')
      .sort({ score: { $meta: 'textScore' }, featured: -1 })
      .limit(20);

    const transformedTrips = trips.map(trip => ({
      id: trip._id,
      title: trip.title,
      slug: trip.slug,
      description: trip.description,
      destination: trip.primaryDestination?.name,
      duration: trip.duration.days,
      price: trip.pricing.estimated,
      images: trip.images.map(img => img.url),
      category: trip.category?.name
    }));

    res.json({
      success: true,
      data: { trips: transformedTrips }
    });
  } catch (error) {
    console.error('Search trips error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

module.exports = {
  getTrips,
  getFeaturedTrips,
  getTripDetails,
  searchTrips
};