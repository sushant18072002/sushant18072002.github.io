const express = require('express');
const { Airline, Airport, Category, Country, State, City, Activity } = require('../../models');
const router = express.Router();

// Admin Activities
router.get('/activities', async (req, res) => {
  try {
    const activities = await Activity.find()
      .populate('category', 'name icon')
      .populate('city', 'name')
      .populate('country', 'name')
      .sort({ featured: -1, name: 1 });
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

router.put('/cities/:id', async (req, res) => {
  try {
    const city = await City.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: { city } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Admin Categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ type: 1, order: 1, name: 1 });
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

// Admin Countries
router.get('/countries', async (req, res) => {
  try {
    const countries = await Country.find().sort({ name: 1 });
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

router.put('/countries/:id', async (req, res) => {
  try {
    const country = await Country.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: { country } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Admin States
router.get('/states', async (req, res) => {
  try {
    const states = await State.find().populate('country', 'name').sort({ name: 1 });
    res.json({ success: true, data: { states } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/states', async (req, res) => {
  try {
    const state = await State.create(req.body);
    res.status(201).json({ success: true, data: { state } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Admin Cities
router.get('/cities', async (req, res) => {
  try {
    const cities = await City.find()
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

module.exports = router;