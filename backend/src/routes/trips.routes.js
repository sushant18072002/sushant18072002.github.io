const express = require('express');
const router = express.Router();

// Get featured trips
router.get('/featured', async (req, res) => {
  try {
    const { Trip } = require('../models');
    const trips = await Trip.find({ featured: true, status: 'published' })
      .sort({ priority: -1, createdAt: -1 })
      .limit(6);
    
    // Safely populate each trip
    for (const trip of trips) {
      try {
        await trip.populate([
          { path: 'category', select: 'name icon color' },
          { path: 'primaryDestination', select: 'name' }
        ]);
      } catch (populateError) {
        console.warn('Populate error for featured trip:', trip._id, populateError.message);
      }
    }
    
    res.json({ success: true, data: { trips } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Get all trips with filters
router.get('/', async (req, res) => {
  try {
    const { Trip, Category } = require('../models');
    const { category, priceRange, duration, search } = req.query;
    
    let query = { status: 'published' };
    
    if (category) {
      try {
        // Look up category by slug or name to get ObjectId
        const categoryDoc = await Category.findOne({
          $or: [
            { slug: category, type: 'trip' },
            { slug: { $regex: new RegExp(category, 'i') }, type: 'trip' },
            { name: { $regex: new RegExp(category, 'i') }, type: 'trip' }
          ]
        });
        
        if (categoryDoc) {
          query.category = categoryDoc._id;
        } else {
          // If no category found, search by tags or travel style instead
          query.$or = [
            { tags: { $in: [new RegExp(category, 'i')] } },
            { travelStyle: { $regex: new RegExp(category, 'i') } }
          ];
        }
      } catch (error) {
        console.error('Category lookup error:', error);
        // Fallback to tag/style search if category lookup fails
        query.$or = [
          { tags: { $in: [new RegExp(category, 'i')] } },
          { travelStyle: { $regex: new RegExp(category, 'i') } }
        ];
      }
    }
    if (search) {
      // Sanitize search input to prevent regex injection
      const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: sanitizedSearch, $options: 'i' } },
        { description: { $regex: sanitizedSearch, $options: 'i' } },
        { tags: { $in: [new RegExp(sanitizedSearch, 'i')] } }
      ];
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const trips = await Trip.find(query)
      .sort({ featured: -1, createdAt: -1 })
      .limit(limit)
      .skip(skip);
    
    // Safely populate each trip
    for (const trip of trips) {
      try {
        await trip.populate([
          { path: 'category', select: 'name icon color' },
          { path: 'primaryDestination', select: 'name' }
        ]);
      } catch (populateError) {
        console.warn('Populate error for trip:', trip._id, populateError.message);
      }
    }
    
    const total = await Trip.countDocuments(query);
    
    res.json({ 
      success: true, 
      data: { 
        trips,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Get all trip slugs (MUST be before /:id route)
router.get('/slugs', async (req, res) => {
  try {
    const { Trip } = require('../models');
    const trips = await Trip.find({ status: 'published' }, 'slug title')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({ 
      success: true, 
      data: { 
        slugs: trips.map(trip => ({
          slug: trip.slug,
          title: trip.title
        }))
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Get trip by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { Trip } = require('../models');
    const trip = await Trip.findOne({ slug: req.params.slug, status: 'published' });
    
    if (!trip) {
      return res.status(404).json({ success: false, error: { message: 'Trip not found' } });
    }
    
    // Safely populate fields
    try {
      await trip.populate([
        { path: 'category', select: 'name icon color' },
        { path: 'primaryDestination', select: 'name' },
        { path: 'destinations', select: 'name' },
        { path: 'countries', select: 'name' }
      ]);
    } catch (populateError) {
      console.warn('Populate error for trip:', trip._id, populateError.message);
    }
    
    // Increment view count
    await Trip.findByIdAndUpdate(trip._id, { $inc: { 'stats.views': 1 } });
    
    res.json({ success: true, data: { trip } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Get single trip by ID or slug
router.get('/:identifier', async (req, res) => {
  try {
    const { Trip } = require('../models');
    const { identifier } = req.params;
    
    let trip;
    
    // Check if identifier is a valid ObjectId
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      // It's an ObjectId
      trip = await Trip.findById(identifier);
    } else {
      // It's a slug
      trip = await Trip.findOne({ slug: identifier, status: 'published' });
    }
    
    if (!trip) {
      return res.status(404).json({ success: false, error: { message: 'Trip not found' } });
    }
    
    // Safely populate fields with error handling
    try {
      await trip.populate([
        { path: 'category', select: 'name icon color' },
        { path: 'primaryDestination', select: 'name' },
        { path: 'destinations', select: 'name' },
        { path: 'countries', select: 'name' }
      ]);
    } catch (populateError) {
      console.warn('Populate error for trip:', trip._id, populateError.message);
      // Continue without populate if there are invalid references
    }
    
    // Increment view count
    await Trip.findByIdAndUpdate(trip._id, { $inc: { 'stats.views': 1 } });
    
    res.json({ success: true, data: { trip } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Debug: Get categories
router.get('/debug/categories', async (req, res) => {
  try {
    const { Category } = require('../models');
    const categories = await Category.find({ type: 'adventure' }).select('name slug type');
    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
});

// Create sample trips
router.post('/create-samples', async (req, res) => {
  try {
    const { Trip } = require('../models');
    
    // Clear existing sample trips
    await Trip.deleteMany({ title: { $regex: '^Sample' } });
    
    const sampleTrips = [
      {
        title: 'Sample Tokyo Adventure',
        description: 'Explore the vibrant culture and modern attractions of Tokyo',
        primaryDestination: '68ab6f7e267048960e730b67',
        duration: { days: 5, nights: 4 },
        pricing: { estimated: 1800, currency: 'USD', priceRange: 'mid-range' },
        category: '68ab6f7e267048960e730b4a',
        tags: ['culture', 'food', 'city'],
        travelStyle: 'cultural',
        difficulty: 'easy',
        featured: true,
        status: 'published',
        type: 'featured',
        suitableFor: { couples: true, families: true, soloTravelers: true, groups: true },
        images: [{ url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400', alt: 'Tokyo', isPrimary: true }]
      },
      {
        title: 'Sample Paris Romance',
        description: 'A romantic getaway in the City of Love',
        primaryDestination: '68ab6f7e267048960e730b66',
        duration: { days: 4, nights: 3 },
        pricing: { estimated: 2200, currency: 'EUR', priceRange: 'luxury' },
        category: '68ab6f7e267048960e730b49',
        tags: ['romance', 'culture', 'art'],
        travelStyle: 'luxury',
        difficulty: 'easy',
        featured: true,
        status: 'published',
        type: 'featured',
        suitableFor: { couples: true, families: false, soloTravelers: false, groups: false },
        images: [{ url: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400', alt: 'Paris', isPrimary: true }]
      }
    ];
    
    const created = await Trip.insertMany(sampleTrips);
    res.json({ success: true, message: `Created ${created.length} sample trips`, data: { trips: created } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

module.exports = router;