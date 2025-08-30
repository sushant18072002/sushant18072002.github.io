const { City, Country, State } = require('../models');

// Search locations (cities) for autocomplete
const searchLocations = async (req, res) => {
  try {
    const { q: query } = req.query;
    
    if (!query || query.length < 2) {
      return res.json({
        success: true,
        data: { locations: [] }
      });
    }

    const locations = await City.find({
      $and: [
        { status: 'active' },
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { 'country.name': { $regex: query, $options: 'i' } }
          ]
        }
      ]
    })
      .populate('country', 'name code')
      .populate('state', 'name')
      .select('name country state popularFor')
      .limit(10)
      .sort({ featured: -1, name: 1 });

    const formattedLocations = locations.map(location => ({
      _id: location._id,
      name: location.name,
      country: location.country?.name || 'Unknown',
      state: location.state?.name,
      type: 'city',
      popularFor: location.popularFor || []
    }));

    res.json({
      success: true,
      data: { locations: formattedLocations }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

// Get all cities with optional filtering
const getCities = async (req, res) => {
  try {
    const { countryId, stateId, featured, search, limit = 50 } = req.query;
    
    const query = { status: 'active' };
    
    if (countryId) query.country = countryId;
    if (stateId) query.state = stateId;
    if (featured === 'true') query.featured = true;
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const cities = await City.find(query)
      .populate('country', 'name code flag')
      .populate('state', 'name')
      .select('name country state featured popularFor images pricing stats')
      .sort({ featured: -1, name: 1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: { cities }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

// Get city details
const getCityDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const city = await City.findById(id)
      .populate('country', 'name code flag currency')
      .populate('state', 'name');

    if (!city) {
      return res.status(404).json({
        success: false,
        error: { message: 'City not found' }
      });
    }

    res.json({
      success: true,
      data: { city }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

module.exports = {
  searchLocations,
  getCities,
  getCityDetails
};