const { Trip, City, Category } = require('../models');

// Get all trips for admin
const getAdminTrips = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      type, 
      category,
      search 
    } = req.query;

    const query = {};
    
    // Sanitize and validate inputs
    const allowedStatuses = ['draft', 'published', 'archived'];
    const allowedTypes = ['featured', 'ai-generated', 'custom', 'user-created'];
    
    if (status && allowedStatuses.includes(status)) query.status = status;
    if (type && allowedTypes.includes(type)) query.type = type;
    if (category && /^[0-9a-fA-F]{24}$/.test(category)) query.category = category;
    
    if (search) {
      // Sanitize search input to prevent regex injection
      const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: sanitizedSearch, $options: 'i' } },
        { description: { $regex: sanitizedSearch, $options: 'i' } }
      ];
    }

    const trips = await Trip.find(query)
      .populate('primaryDestination', 'name country')
      .populate('category', 'name icon')
      .populate('createdBy', 'profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Trip.countDocuments(query);

    res.json({
      success: true,
      data: {
        trips,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get admin trips error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

// Get single trip for admin
const getAdminTrip = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid trip ID format' }
      });
    }
    
    const trip = await Trip.findById(id)
      .populate({
        path: 'primaryDestination',
        select: 'name country',
        populate: {
          path: 'country',
          select: 'name flag'
        }
      })
      .populate({
        path: 'destinations',
        select: 'name country',
        populate: {
          path: 'country',
          select: 'name flag'
        }
      })
      .populate('category', 'name icon')
      .populate('createdBy', 'profile.firstName profile.lastName');

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: { message: 'Trip not found' }
      });
    }

    res.json({
      success: true,
      data: { trip }
    });
  } catch (error) {
    console.error('Get admin trip error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

// Create trip
const createTrip = async (req, res) => {
  try {
    // Whitelist allowed fields to prevent mass assignment
    const allowedFields = [
      'title', 'description', 'primaryDestination', 'destinations', 'countries',
      'duration', 'type', 'category', 'tags', 'travelStyle', 'difficulty',
      'suitableFor', 'groupSize', 'physicalRequirements', 'pricing', 'itinerary',
      'customizable', 'includedServices', 'travelInfo', 'bookingInfo',
      'availability', 'images', 'sharing', 'featured', 'priority', 'status'
    ];
    
    const tripData = {
      createdBy: req.user?._id || '688f999b00e3dc1122f146c0'
    };
    
    // Only include whitelisted fields
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        tripData[field] = req.body[field];
      }
    });

    // Generate slug if not provided
    if (!tripData.slug && tripData.title) {
      tripData.slug = tripData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now();
    }

    // Ensure required fields have defaults
    if (!tripData.primaryDestination) {
      tripData.primaryDestination = '68ab6f7e267048960e730b67'; // Default Tokyo
    }
    
    if (!tripData.duration) {
      tripData.duration = { days: 7, nights: 6 };
    }
    
    if (!tripData.pricing) {
      tripData.pricing = {
        estimated: 1500,
        currency: 'USD',
        priceRange: 'mid-range'
      };
    }

    const trip = new Trip(tripData);
    await trip.save();

    await trip.populate([
      {
        path: 'primaryDestination',
        select: 'name country',
        populate: {
          path: 'country',
          select: 'name flag'
        }
      },
      { path: 'category', select: 'name icon' }
    ]);

    res.status(201).json({
      success: true,
      data: { trip }
    });
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message }
    });
  }
};

// Update trip
const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    
    const trip = await Trip.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
      .populate({
        path: 'primaryDestination',
        select: 'name country',
        populate: {
          path: 'country',
          select: 'name flag'
        }
      })
      .populate('category', 'name icon');

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: { message: 'Trip not found' }
      });
    }

    res.json({
      success: true,
      data: { trip }
    });
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message }
    });
  }
};

// Delete trip
const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;
    
    const trip = await Trip.findByIdAndUpdate(
      id,
      { status: 'archived' },
      { new: true }
    );

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: { message: 'Trip not found' }
      });
    }

    res.json({
      success: true,
      data: { message: 'Trip archived successfully' }
    });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

// Toggle featured status
const toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    
    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: { message: 'Trip not found' }
      });
    }

    trip.featured = !trip.featured;
    await trip.save();

    res.json({
      success: true,
      data: { 
        trip: { 
          _id: trip._id, 
          featured: trip.featured 
        } 
      }
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

// Duplicate trip
const duplicateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    
    const originalTrip = await Trip.findById(id);
    if (!originalTrip) {
      return res.status(404).json({
        success: false,
        error: { message: 'Trip not found' }
      });
    }

    const duplicatedTrip = new Trip({
      ...originalTrip.toObject(),
      _id: undefined,
      title: `${originalTrip.title} (Copy)`,
      slug: `${originalTrip.slug}-copy-${Date.now()}`,
      featured: false,
      status: 'draft',
      createdBy: req.user._id,
      stats: {
        views: 0,
        likes: 0,
        copies: 0,
        bookings: 0,
        rating: 0,
        reviewCount: 0
      }
    });

    await duplicatedTrip.save();

    res.status(201).json({
      success: true,
      data: { trip: duplicatedTrip }
    });
  } catch (error) {
    console.error('Duplicate trip error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message }
    });
  }
};

const uploadTripImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'No images uploaded' }
      });
    }

    const images = req.files.map((file, index) => ({
      url: `/uploads/${file.filename}`,
      alt: req.body[`alt_${index}`] || `Trip image ${index + 1}`,
      isPrimary: index === 0,
      order: index
    }));

    res.json({
      success: true,
      data: { images }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

module.exports = {
  getAdminTrips,
  getAdminTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  toggleFeatured,
  duplicateTrip,
  uploadTripImages
};