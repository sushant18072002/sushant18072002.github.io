const { Destination, Country, City, Activity } = require('../models');
const auditService = require('../services/auditService');

const getAllDestinations = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      country, 
      featured, 
      search, 
      sortBy = 'priority',
      sortOrder = 'desc',
      tags 
    } = req.query;

    const query = { status: 'active' };
    
    if (country) query.country = country;
    if (featured !== undefined) query.featured = featured === 'true';
    if (tags) query.tags = { $in: tags.split(',') };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const destinations = await Destination.find(query)
      .populate('country', 'name code currency timezone')
      .populate('cities', 'name')
      .select('-attractions -climate -transportation') // Exclude heavy fields for list view
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Destination.countDocuments(query);

    // Update view stats if user is authenticated
    if (req.user) {
      await auditService.log({
        userId: req.user._id,
        action: 'DESTINATIONS_VIEWED',
        resource: 'destination',
        metadata: { search, filters: { country, featured, tags } }
      });
    }

    res.json({
      success: true,
      data: {
        destinations,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const getDestinationById = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id)
      .populate('country', 'name code currency timezone language')
      .populate('cities', 'name attractions population')
      .populate('topAttractions', 'name description images rating price');

    if (!destination || destination.status !== 'active') {
      return res.status(404).json({
        success: false,
        error: { message: 'Destination not found' }
      });
    }

    // Increment view count
    await Destination.findByIdAndUpdate(req.params.id, { $inc: { 'stats.views': 1 } });

    // Log view if user is authenticated
    if (req.user) {
      await auditService.log({
        userId: req.user._id,
        action: 'DESTINATION_VIEWED',
        resource: 'destination',
        resourceId: req.params.id
      });
    }

    res.json({ success: true, data: { destination } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const createDestination = async (req, res) => {
  try {
    // Generate slug from name
    const slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const destination = new Destination({
      ...req.body,
      slug,
      createdBy: req.user._id
    });

    await destination.save();
    await destination.populate('country', 'name code');

    await auditService.log({
      userId: req.user._id,
      action: 'DESTINATION_CREATED',
      resource: 'destination',
      resourceId: destination._id.toString(),
      metadata: { name: destination.name }
    });

    res.status(201).json({
      success: true,
      data: { destination }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: { message: 'Destination name or slug already exists' }
      });
    }
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

const updateDestination = async (req, res) => {
  try {
    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    ).populate('country', 'name code');

    if (!destination) {
      return res.status(404).json({
        success: false,
        error: { message: 'Destination not found' }
      });
    }

    await auditService.log({
      userId: req.user._id,
      action: 'DESTINATION_UPDATED',
      resource: 'destination',
      resourceId: req.params.id,
      metadata: { name: destination.name }
    });

    res.json({ success: true, data: { destination } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

const deleteDestination = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        error: { message: 'Destination not found' }
      });
    }

    // Soft delete by changing status
    destination.status = 'inactive';
    destination.updatedBy = req.user._id;
    await destination.save();

    await auditService.log({
      userId: req.user._id,
      action: 'DESTINATION_DELETED',
      resource: 'destination',
      resourceId: req.params.id,
      metadata: { name: destination.name }
    });

    res.json({
      success: true,
      data: { message: 'Destination deleted successfully' }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const getDestinationCities = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id)
      .populate('cities', 'name description images attractions population coordinates');
    
    if (!destination) {
      return res.status(404).json({
        success: false,
        error: { message: 'Destination not found' }
      });
    }

    res.json({
      success: true,
      data: { cities: destination.cities }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const getFeaturedDestinations = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const destinations = await Destination.find({ 
      featured: true, 
      status: 'active' 
    })
      .populate('country', 'name code')
      .select('name shortDescription images.hero stats.averageRating stats.totalReviews')
      .sort({ priority: -1, 'stats.averageRating': -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: { destinations }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const searchDestinations = async (req, res) => {
  try {
    const { q, lat, lng, radius = 50 } = req.query;

    let query = { status: 'active' };

    if (q) {
      query.$text = { $search: q };
    }

    if (lat && lng) {
      query.coordinates = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      };
    }

    const destinations = await Destination.find(query)
      .populate('country', 'name code')
      .select('name shortDescription images.hero coordinates stats.averageRating')
      .limit(20);

    res.json({
      success: true,
      data: { destinations }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

module.exports = {
  getAllDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
  getDestinationCities,
  getFeaturedDestinations,
  searchDestinations
};