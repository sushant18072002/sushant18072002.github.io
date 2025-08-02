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

module.exports = {
  searchHotels,
  getHotelDetails,
  getAvailability,
  getNearbyHotels,
  createHotel,
  updateHotel,
  deleteHotel
};