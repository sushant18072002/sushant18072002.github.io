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

module.exports = {
  createItinerary,
  getUserItineraries,
  getItineraryDetails,
  updateItinerary,
  deleteItinerary,
  getPublicItineraries,
  shareItinerary,
  getSharedItinerary
};