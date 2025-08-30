const { Country, State, City, Category, Activity } = require('../models');

// Countries
const getCountries = async (req, res) => {
  try {
    const countries = await Country.find({ status: 'active' })
      .sort({ name: 1 });

    res.json({
      success: true,
      data: { countries }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

// States by country
const getStatesByCountry = async (req, res) => {
  try {
    const { countryId } = req.params;
    
    const states = await State.find({ 
      country: countryId, 
      status: 'active' 
    })
      .populate('country', 'name code')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: { states }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

// Cities by state or country
const getCities = async (req, res) => {
  try {
    const { stateId, countryId, search } = req.query;
    
    const query = { status: 'active' };
    
    if (stateId) query.state = stateId;
    if (countryId) query.country = countryId;
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const cities = await City.find(query)
      .populate('state', 'name code')
      .populate('country', 'name code')
      .sort({ name: 1 })
      .limit(50);

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

// Categories
const getCategories = async (req, res) => {
  try {
    const { type } = req.query;
    
    const query = { status: 'active' };
    if (type) query.type = type;

    const categories = await Category.find(query)
      .populate('parentCategory', 'name')
      .sort({ order: 1, name: 1 });

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
};

// Activities
const getActivities = async (req, res) => {
  try {
    const { cityId, categoryId, search } = req.query;
    
    const query = { status: 'active' };
    
    if (cityId) query.city = cityId;
    if (categoryId) query.category = categoryId;
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const activities = await Activity.find(query)
      .populate('city', 'name country')
      .populate('category', 'name icon')
      .sort({ rating: -1, name: 1 })
      .limit(50);

    res.json({
      success: true,
      data: { activities }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

module.exports = {
  getCountries,
  getStatesByCountry,
  getCities,
  getCategories,
  getActivities
};