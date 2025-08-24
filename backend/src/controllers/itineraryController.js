const { Itinerary } = require('../models');

const createItinerary = async (req, res) => {
  try {
    const itineraryData = {
      ...req.body,
      userId: req.user.id
    };

    const itinerary = await Itinerary.create(itineraryData);
    res.status(201).json({ success: true, data: { itinerary } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getUserItineraries = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { userId: req.user.id };
    
    if (status) query.status = status;

    const itineraries = await Itinerary.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Itinerary.countDocuments(query);

    res.json({
      success: true,
      data: {
        itineraries,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getItineraryDetails = async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    
    if (!itinerary) {
      return res.status(404).json({ success: false, error: 'Itinerary not found' });
    }

    // Check access permissions
    if (itinerary.userId.toString() !== req.user.id && !itinerary.sharing.isPublic) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    res.json({ success: true, data: { itinerary } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    
    if (!itinerary) {
      return res.status(404).json({ success: false, error: 'Itinerary not found' });
    }

    if (itinerary.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const updatedItinerary = await Itinerary.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: { itinerary: updatedItinerary } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    
    if (!itinerary) {
      return res.status(404).json({ success: false, error: 'Itinerary not found' });
    }

    if (itinerary.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    await Itinerary.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Itinerary deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getPublicItineraries = async (req, res) => {
  try {
    const { destination, page = 1, limit = 10 } = req.query;
    const query = { 'sharing.isPublic': true, status: 'published' };
    
    if (destination) {
      query['destination.primary'] = new RegExp(destination, 'i');
    }

    const itineraries = await Itinerary.find(query)
      .populate('userId', 'profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Itinerary.countDocuments(query);

    res.json({
      success: true,
      data: {
        itineraries,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const shareItinerary = async (req, res) => {
  try {
    const { isPublic } = req.body;
    const itinerary = await Itinerary.findById(req.params.id);
    
    if (!itinerary) {
      return res.status(404).json({ success: false, error: 'Itinerary not found' });
    }

    if (itinerary.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const shareCode = isPublic ? Math.random().toString(36).substr(2, 9) : null;
    
    itinerary.sharing = {
      isPublic,
      shareCode
    };
    
    await itinerary.save();

    res.json({
      success: true,
      data: {
        shareCode,
        shareUrl: isPublic ? `${process.env.FRONTEND_URL}/itinerary/share/${shareCode}` : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getSharedItinerary = async (req, res) => {
  try {
    const { shareCode } = req.params;
    const itinerary = await Itinerary.findOne({ 'sharing.shareCode': shareCode })
      .populate('userId', 'profile.firstName profile.lastName');
    
    if (!itinerary) {
      return res.status(404).json({ success: false, error: 'Shared itinerary not found' });
    }

    res.json({ success: true, data: { itinerary } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// NEW: Featured itineraries for ItineraryHubPage
const getFeaturedItineraries = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    const itineraries = await Itinerary.find({
      'sharing.isPublic': true,
      status: 'published'
    })
    .populate('user', 'profile.firstName profile.lastName')
    .sort({ 'stats.likes': -1, 'stats.views': -1 })
    .limit(parseInt(limit));

    // Transform data to match frontend expectations
    const transformedItineraries = itineraries.map(itinerary => ({
      id: itinerary._id,
      title: itinerary.title,
      description: itinerary.description,
      image: itinerary.days?.[0]?.activities?.[0]?.images?.[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop',
      price: itinerary.budget?.total || 0,
      rating: 4.8, // Default rating
      reviews: itinerary.stats?.views || 0,
      duration: `${itinerary.duration?.days || 7} Days`,
      tags: itinerary.preferences?.interests || ['adventure'],
      badges: [itinerary.preferences?.travelStyle || 'Adventure']
    }));

    res.json({ success: true, data: { itineraries: transformedItineraries } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// NEW: Search public itineraries
const searchItineraries = async (req, res) => {
  try {
    const { q, destination, category, minPrice, maxPrice, duration } = req.query;
    
    const query = { 'sharing.isPublic': true, status: 'published' };
    
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (destination) {
      query['destination.cities'] = { $regex: destination, $options: 'i' };
    }
    
    if (category) {
      query['preferences.travelStyle'] = category;
    }
    
    if (minPrice || maxPrice) {
      query['budget.total'] = {};
      if (minPrice) query['budget.total'].$gte = parseFloat(minPrice);
      if (maxPrice) query['budget.total'].$lte = parseFloat(maxPrice);
    }
    
    if (duration) {
      query['duration.days'] = parseInt(duration);
    }

    const itineraries = await Itinerary.find(query)
      .populate('user', 'profile.firstName profile.lastName')
      .sort({ 'stats.likes': -1 })
      .limit(20);

    // Transform data
    const transformedItineraries = itineraries.map(itinerary => ({
      id: itinerary._id,
      title: itinerary.title,
      description: itinerary.description,
      image: itinerary.days?.[0]?.activities?.[0]?.images?.[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop',
      price: itinerary.budget?.total || 0,
      rating: 4.8,
      reviews: itinerary.stats?.views || 0,
      duration: `${itinerary.duration?.days || 7} Days`,
      tags: itinerary.preferences?.interests || ['adventure'],
      badges: [itinerary.preferences?.travelStyle || 'Adventure']
    }));

    res.json({ success: true, data: { itineraries: transformedItineraries } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// NEW: Get public itinerary details
const getPublicItineraryDetails = async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id)
      .populate('user', 'profile.firstName profile.lastName');
    
    if (!itinerary || !itinerary.sharing?.isPublic) {
      return res.status(404).json({ success: false, error: { message: 'Itinerary not found' } });
    }

    // Transform data
    const transformedItinerary = {
      id: itinerary._id,
      title: itinerary.title,
      description: itinerary.description,
      image: itinerary.days?.[0]?.activities?.[0]?.images?.[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop',
      price: itinerary.budget?.total || 0,
      rating: 4.8,
      reviews: itinerary.stats?.views || 0,
      duration: `${itinerary.duration?.days || 7} Days`,
      tags: itinerary.preferences?.interests || ['adventure'],
      badges: [itinerary.preferences?.travelStyle || 'Adventure']
    };

    res.json({ success: true, data: { itinerary: transformedItinerary } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

module.exports = {
  createItinerary,
  getUserItineraries,
  getItineraryDetails,
  updateItinerary,
  deleteItinerary,
  getPublicItineraries,
  shareItinerary,
  getSharedItinerary,
  getFeaturedItineraries,
  searchItineraries,
  getPublicItineraryDetails
};