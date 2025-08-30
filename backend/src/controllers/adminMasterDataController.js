const { Country, State, City, Category, Activity } = require('../models');

// Countries CRUD
const getAdminCountries = async (req, res) => {
  try {
    const countries = await Country.find().sort({ name: 1 });
    res.json({ success: true, data: { countries } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const createCountry = async (req, res) => {
  try {
    const country = new Country(req.body);
    await country.save();
    res.status(201).json({ success: true, data: { country } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

const updateCountry = async (req, res) => {
  try {
    const country = await Country.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!country) {
      return res.status(404).json({ success: false, error: { message: 'Country not found' } });
    }
    res.json({ success: true, data: { country } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

const deleteCountry = async (req, res) => {
  try {
    const country = await Country.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    );
    if (!country) {
      return res.status(404).json({ success: false, error: { message: 'Country not found' } });
    }
    res.json({ success: true, data: { message: 'Country deactivated' } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// States CRUD
const getAdminStates = async (req, res) => {
  try {
    const states = await State.find()
      .populate('country', 'name code')
      .sort({ name: 1 });
    res.json({ success: true, data: { states } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const createState = async (req, res) => {
  try {
    const state = new State(req.body);
    await state.save();
    await state.populate('country', 'name code');
    res.status(201).json({ success: true, data: { state } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

const updateState = async (req, res) => {
  try {
    const state = await State.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('country', 'name code');
    
    if (!state) {
      return res.status(404).json({ success: false, error: { message: 'State not found' } });
    }
    res.json({ success: true, data: { state } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

// Cities CRUD
const getAdminCities = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const cities = await City.find()
      .populate('state', 'name code')
      .populate('country', 'name code')
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
      
    const total = await City.countDocuments();
    
    res.json({
      success: true,
      data: {
        cities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const createCity = async (req, res) => {
  try {
    const city = new City(req.body);
    await city.save();
    await city.populate([
      { path: 'state', select: 'name code' },
      { path: 'country', select: 'name code' }
    ]);
    res.status(201).json({ success: true, data: { city } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

const updateCity = async (req, res) => {
  try {
    const city = await City.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'state', select: 'name code' },
      { path: 'country', select: 'name code' }
    ]);
    
    if (!city) {
      return res.status(404).json({ success: false, error: { message: 'City not found' } });
    }
    res.json({ success: true, data: { city } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

// Categories CRUD
const getAdminCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('parentCategory', 'name')
      .sort({ order: 1, name: 1 });
    res.json({ success: true, data: { categories } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const createCategory = async (req, res) => {
  try {
    // Generate slug from name
    if (!req.body.slug && req.body.name) {
      req.body.slug = req.body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    
    const category = new Category(req.body);
    await category.save();
    await category.populate('parentCategory', 'name');
    res.status(201).json({ success: true, data: { category } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('parentCategory', 'name');
    
    if (!category) {
      return res.status(404).json({ success: false, error: { message: 'Category not found' } });
    }
    res.json({ success: true, data: { category } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

// Activities CRUD
const getAdminActivities = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const activities = await Activity.find()
      .populate('city', 'name country')
      .populate('category', 'name icon')
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
      
    const total = await Activity.countDocuments();
    
    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const createActivity = async (req, res) => {
  try {
    const activity = new Activity(req.body);
    await activity.save();
    await activity.populate([
      { path: 'city', select: 'name country' },
      { path: 'category', select: 'name icon' }
    ]);
    res.status(201).json({ success: true, data: { activity } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

const updateActivity = async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'city', select: 'name country' },
      { path: 'category', select: 'name icon' }
    ]);
    
    if (!activity) {
      return res.status(404).json({ success: false, error: { message: 'Activity not found' } });
    }
    res.json({ success: true, data: { activity } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

module.exports = {
  // Countries
  getAdminCountries,
  createCountry,
  updateCountry,
  deleteCountry,
  
  // States
  getAdminStates,
  createState,
  updateState,
  
  // Cities
  getAdminCities,
  createCity,
  updateCity,
  
  // Categories
  getAdminCategories,
  createCategory,
  updateCategory,
  
  // Activities
  getAdminActivities,
  createActivity,
  updateActivity
};