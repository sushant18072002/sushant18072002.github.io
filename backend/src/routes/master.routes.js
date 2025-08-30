const express = require('express');
const { Airline, Airport, Category, Country, City, Activity } = require('../models');
const router = express.Router();

// Airlines
router.get('/airlines', async (req, res) => {
  try {
    const airlines = await Airline.find({ status: 'active' }).sort({ name: 1 });
    res.json({ success: true, data: { airlines } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/airlines', async (req, res) => {
  try {
    const airline = await Airline.create(req.body);
    res.status(201).json({ success: true, data: { airline } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

router.put('/airlines/:id', async (req, res) => {
  try {
    const airline = await Airline.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: { airline } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Airports
router.get('/airports', async (req, res) => {
  try {
    const airports = await Airport.find({ status: 'active' }).sort({ name: 1 });
    res.json({ success: true, data: { airports } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/airports', async (req, res) => {
  try {
    const airport = await Airport.create(req.body);
    res.status(201).json({ success: true, data: { airport } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

router.put('/airports/:id', async (req, res) => {
  try {
    const airport = await Airport.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: { airport } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Categories
router.get('/categories', async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { active: true };
    if (type) filter.type = type;
    
    const categories = await Category.find(filter).sort({ order: 1, name: 1 });
    res.json({ success: true, data: { categories } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: { category } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: { category } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Admin Categories
router.get('/admin/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 });
    res.json({ success: true, data: { categories } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/admin/categories', async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.json({ success: true, data: { category } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.put('/admin/categories/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: { category } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Countries
router.get('/countries', async (req, res) => {
  try {
    const countries = await Country.find({ status: 'active' }).sort({ name: 1 });
    res.json({ success: true, data: { countries } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/countries', async (req, res) => {
  try {
    const country = await Country.create(req.body);
    res.status(201).json({ success: true, data: { country } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Admin Countries
router.get('/admin/countries', async (req, res) => {
  try {
    const countries = await Country.find().sort({ name: 1 });
    res.json({ success: true, data: { countries } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/admin/countries', async (req, res) => {
  try {
    const country = new Country(req.body);
    await country.save();
    res.json({ success: true, data: { country } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.put('/admin/countries/:id', async (req, res) => {
  try {
    const country = await Country.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: { country } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.delete('/admin/countries/:id', async (req, res) => {
  try {
    await Country.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: { message: 'Country deleted' } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Cities
router.get('/cities', async (req, res) => {
  try {
    const { country } = req.query;
    const filter = { status: 'active' };
    if (country) filter.country = country;
    
    const cities = await City.find(filter)
      .populate('country', 'name code flag')
      .sort({ name: 1 });
    res.json({ success: true, data: { cities } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/cities', async (req, res) => {
  try {
    const city = await City.create(req.body);
    res.status(201).json({ success: true, data: { city } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Admin Cities
router.get('/admin/cities', async (req, res) => {
  try {
    const cities = await City.find().populate('country', 'name flag').sort({ name: 1 });
    res.json({ success: true, data: { cities } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/admin/cities', async (req, res) => {
  try {
    const city = new City(req.body);
    await city.save();
    await city.populate('country', 'name flag');
    res.json({ success: true, data: { city } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.put('/admin/cities/:id', async (req, res) => {
  try {
    const city = await City.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('country', 'name flag');
    res.json({ success: true, data: { city } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Activities
router.get('/activities', async (req, res) => {
  try {
    const { city, type, category } = req.query;
    const filter = { status: 'active' };
    if (city) filter.city = city;
    if (type) filter.type = type;
    if (category) filter.category = category;
    
    const activities = await Activity.find(filter)
      .populate('category', 'name icon')
      .populate('city', 'name')
      .sort({ name: 1 });
    res.json({ success: true, data: { activities } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/activities', async (req, res) => {
  try {
    const activity = await Activity.create(req.body);
    res.status(201).json({ success: true, data: { activity } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

router.put('/activities/:id', async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: { activity } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Admin Activities
router.get('/admin/activities', async (req, res) => {
  try {
    const activities = await Activity.find()
      .populate('category', 'name icon')
      .populate('city', 'name')
      .sort({ name: 1 });
    res.json({ success: true, data: { activities } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/admin/activities', async (req, res) => {
  try {
    const activity = new Activity(req.body);
    await activity.save();
    await activity.populate(['category', 'city']);
    res.json({ success: true, data: { activity } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.put('/admin/activities/:id', async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('category', 'name icon')
      .populate('city', 'name');
    res.json({ success: true, data: { activity } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

module.exports = router;