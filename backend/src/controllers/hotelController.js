const { Hotel } = require('../models');

const searchHotels = async (req, res) => {
  try {
    const { location, checkIn, checkOut, guests, minPrice, maxPrice, starRating } = req.query;
    
    const query = {
      'location.address.city': new RegExp(location, 'i'),
      status: 'active'
    };

    if (guests) {
      query['rooms.maxOccupancy'] = { $gte: parseInt(guests) };
    }

    if (minPrice || maxPrice) {
      query['rooms.pricing.baseRate'] = {};
      if (minPrice) query['rooms.pricing.baseRate'].$gte = parseInt(minPrice);
      if (maxPrice) query['rooms.pricing.baseRate'].$lte = parseInt(maxPrice);
    }

    if (starRating) {
      query.starRating = { $in: starRating.split(',').map(Number) };
    }

    const hotels = await Hotel.find(query)
      .sort({ 'rating.overall': -1 })
      .limit(50);

    res.json({
      success: true,
      data: {
        hotels,
        count: hotels.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getHotelDetails = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    
    if (!hotel) {
      return res.status(404).json({ success: false, error: 'Hotel not found' });
    }

    res.json({ success: true, data: { hotel } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAvailability = async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;
    const hotel = await Hotel.findById(req.params.id);
    
    if (!hotel) {
      return res.status(404).json({ success: false, error: 'Hotel not found' });
    }

    // Simulate availability check
    const availableRooms = hotel.rooms.map(room => ({
      ...room.toObject(),
      available: Math.max(0, room.availability - Math.floor(Math.random() * 3))
    }));

    res.json({
      success: true,
      data: {
        rooms: availableRooms,
        checkIn,
        checkOut
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getNearbyHotels = async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query;
    
    const hotels = await Hotel.find({
      'location.coordinates': {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      },
      status: 'active'
    }).limit(20);

    res.json({ success: true, data: { hotels } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Admin only
const createHotel = async (req, res) => {
  try {
    const hotel = await Hotel.create(req.body);
    res.status(201).json({ success: true, data: { hotel } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!hotel) {
      return res.status(404).json({ success: false, error: 'Hotel not found' });
    }

    res.json({ success: true, data: { hotel } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    
    if (!hotel) {
      return res.status(404).json({ success: false, error: 'Hotel not found' });
    }

    res.json({ success: true, message: 'Hotel deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getHotelAmenities = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ success: false, error: 'Hotel not found' });
    }

    res.json({ success: true, data: { amenities: hotel.amenities } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getHotelPhotos = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ success: false, error: 'Hotel not found' });
    }

    res.json({ success: true, data: { photos: hotel.images } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getHotelDeals = async (req, res) => {
  try {
    const deals = await Hotel.find({
      'pricing.priceRange.min': { $lt: 100 },
      status: 'active'
    })
    .select('name images pricing rating location')
    .sort({ 'pricing.priceRange.min': 1 })
    .limit(20);

    res.json({ success: true, data: { deals } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getPopularDestinations = async (req, res) => {
  try {
    const destinations = await Hotel.aggregate([
      { $group: { _id: '$location.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'cities', localField: '_id', foreignField: '_id', as: 'cityInfo' } }
    ]);

    res.json({ success: true, data: { destinations } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const searchLocations = async (req, res) => {
  try {
    const { q } = req.query;
    const { City } = require('../models');
    
    const locations = await City.find({
      name: { $regex: q, $options: 'i' }
    })
    .populate('country', 'name')
    .select('name country')
    .limit(10);

    res.json({ success: true, data: { locations } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const compareHotels = async (req, res) => {
  try {
    const { hotelIds } = req.body;
    
    if (!hotelIds || hotelIds.length < 2) {
      return res.status(400).json({ success: false, error: 'At least 2 hotels required' });
    }

    const hotels = await Hotel.find({ _id: { $in: hotelIds } });
    res.json({ success: true, data: { hotels } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getFilters = async (req, res) => {
  try {
    const { destination } = req.query;
    
    const matchFilter = {};
    if (destination) matchFilter['location.city'] = new RegExp(destination, 'i');

    const [priceRange, starRatings, amenities] = await Promise.all([
      Hotel.aggregate([
        { $match: matchFilter },
        { $group: { _id: null, minPrice: { $min: '$pricing.priceRange.min' }, maxPrice: { $max: '$pricing.priceRange.max' } } }
      ]),
      Hotel.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$starRating', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Hotel.aggregate([
        { $match: matchFilter },
        { $unwind: '$amenities.general' },
        { $group: { _id: '$amenities.general', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      success: true,
      data: {
        priceRange: priceRange[0] || { minPrice: 0, maxPrice: 1000 },
        starRatings: starRatings.map(s => ({ rating: s._id, count: s.count })),
        amenities: amenities.map(a => ({ name: a._id, count: a.count }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getHotelRooms = async (req, res) => {
  try {
    const { checkIn, checkOut, guests = 2 } = req.query;
    const hotel = await Hotel.findById(req.params.id);
    
    if (!hotel) {
      return res.status(404).json({ success: false, error: 'Hotel not found' });
    }

    const availableRooms = hotel.rooms.filter(room => 
      room.maxOccupancy >= guests && room.availability > 0
    );

    res.json({ success: true, data: { rooms: availableRooms, checkIn, checkOut } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const addHotelReview = async (req, res) => {
  try {
    const { Review } = require('../models');
    const { rating, title, content, ratingBreakdown } = req.body;

    const review = new Review({
      user: req.user._id,
      entityType: 'hotel',
      entityId: req.params.id,
      rating,
      title,
      content,
      ratingBreakdown
    });

    await review.save();
    await review.populate('user', 'profile.firstName profile.lastName');

    res.status(201).json({ success: true, data: { review } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getHotelReviews = async (req, res) => {
  try {
    const { Review } = require('../models');
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ entityType: 'hotel', entityId: req.params.id })
      .populate('user', 'profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ entityType: 'hotel', entityId: req.params.id });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createPriceAlert = async (req, res) => {
  try {
    const { PriceAlert } = require('../models');
    const { hotelId, checkIn, checkOut, targetPrice } = req.body;

    const priceAlert = await PriceAlert.create({
      user: req.user._id,
      type: 'hotel',
      criteria: { hotelId, checkIn, checkOut, targetPrice },
      isActive: true
    });

    res.status(201).json({ success: true, data: { priceAlert } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deletePriceAlert = async (req, res) => {
  try {
    const { PriceAlert } = require('../models');
    
    const priceAlert = await PriceAlert.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isActive: false },
      { new: true }
    );

    if (!priceAlert) {
      return res.status(404).json({ success: false, error: 'Price alert not found' });
    }

    res.json({ success: true, data: { message: 'Price alert deleted successfully' } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  searchHotels,
  getHotelDetails,
  getAvailability,
  getNearbyHotels,
  createHotel,
  updateHotel,
  deleteHotel,
  getHotelAmenities,
  getHotelPhotos,
  getHotelDeals,
  getPopularDestinations,
  searchLocations,
  compareHotels,
  getFilters,
  getHotelRooms,
  addHotelReview,
  getHotelReviews,
  createPriceAlert,
  deletePriceAlert
};