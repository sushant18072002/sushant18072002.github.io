const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, admin } = require('../middleware/auth');

console.log('Admin routes file loaded');

// Debug middleware
router.use((req, res, next) => {
  console.log(`🔍 Admin route hit: ${req.method} ${req.path}`);
  next();
});

// TEMPORARILY DISABLE AUTH FOR TESTING
// router.use(auth, admin);

// Mock user for testing
router.use((req, res, next) => {
  req.user = { _id: '688f999b00e3dc1122f146c0', role: 'admin', email: 'admin@demo.com' };
  next();
});

// Test route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Admin routes working', user: req.user?.email });
});

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// User Management
router.get('/users', adminController.getUsers);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Booking Management
router.get('/bookings', adminController.getBookings);
router.put('/bookings/:id/status', adminController.updateBookingStatus);

// Trip Management (replaces packages)
console.log('Setting up trip routes...');
const adminTripController = require('../controllers/adminTripController');
router.get('/trips/:id', adminTripController.getAdminTrip);
router.get('/trips', adminTripController.getAdminTrips);
router.post('/trips', adminTripController.createTrip);
router.put('/trips/:id', adminTripController.updateTrip);
router.delete('/trips/:id', adminTripController.deleteTrip);
router.put('/trips/:id/featured', adminTripController.toggleFeatured);
router.post('/trips/:id/duplicate', adminTripController.duplicateTrip);

// Package routes (alias for trips for backward compatibility)
console.log('Setting up package routes (alias for trips)...');
router.get('/packages/:id', adminTripController.getAdminTrip);
router.get('/packages', adminTripController.getAdminTrips);
router.post('/packages', adminTripController.createTrip);
router.put('/packages/:id', adminTripController.updateTrip);
router.delete('/packages/:id', adminTripController.deleteTrip);
router.put('/packages/:id/featured', adminTripController.toggleFeatured);
router.post('/packages/:id/duplicate', adminTripController.duplicateTrip);

// Master Data Management
console.log('Setting up master data routes...');
router.use('/master', require('./admin/masterData.routes'));

console.log('Trip and master data routes set up complete');

// Flight Management
router.get('/flights', async (req, res) => {
  try {
    const { Flight } = require('../models');
    const flights = await Flight.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: { flights } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});
router.post('/flights', async (req, res) => {
  try {
    const { Flight } = require('../models');
    const flight = await Flight.create(req.body);
    res.status(201).json({ success: true, data: { flight } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Hotel Management
router.get('/hotels', async (req, res) => {
  try {
    const { Hotel } = require('../models');
    const hotels = await Hotel.find().populate('location.city location.country').sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: { hotels } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});
router.post('/hotels', async (req, res) => {
  try {
    const { Hotel } = require('../models');
    const hotel = await Hotel.create(req.body);
    res.status(201).json({ success: true, data: { hotel } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

router.put('/hotels/:id', async (req, res) => {
  try {
    const { Hotel } = require('../models');
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!hotel) {
      return res.status(404).json({ success: false, error: { message: 'Hotel not found' } });
    }
    res.json({ success: true, data: { hotel } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

router.delete('/hotels/:id', async (req, res) => {
  try {
    const { Hotel } = require('../models');
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) {
      return res.status(404).json({ success: false, error: { message: 'Hotel not found' } });
    }
    res.json({ success: true, message: 'Hotel deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Flight Management
router.get('/flights', async (req, res) => {
  try {
    const { Flight } = require('../models');
    const flights = await Flight.find()
      .populate('airline', 'name code')
      .populate('route.departure.airport', 'code name')
      .populate('route.arrival.airport', 'code name')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: { flights } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/flights', async (req, res) => {
  try {
    const { Flight, Airline, Airport } = require('../models');
    
    // Find or create airline
    let airline = await Airline.findOne({ code: req.body.airline || 'XX' });
    if (!airline) {
      airline = await Airline.create({
        name: 'Unknown Airline',
        code: req.body.airline || 'XX',
        country: 'Unknown'
      });
    }
    
    // Find or create airports
    let depAirport = await Airport.findOne({ code: req.body.route.departure.airport });
    if (!depAirport) {
      depAirport = await Airport.create({
        code: req.body.route.departure.airport,
        name: `${req.body.route.departure.airport} Airport`,
        city: 'Unknown',
        country: 'Unknown',
        location: { coordinates: { type: 'Point', coordinates: [0, 0] } }
      });
    }
    
    let arrAirport = await Airport.findOne({ code: req.body.route.arrival.airport });
    if (!arrAirport) {
      arrAirport = await Airport.create({
        code: req.body.route.arrival.airport,
        name: `${req.body.route.arrival.airport} Airport`,
        city: 'Unknown',
        country: 'Unknown',
        location: { coordinates: { type: 'Point', coordinates: [0, 0] } }
      });
    }
    
    // Create flight with proper references
    const flightData = {
      ...req.body,
      airline: airline._id,
      route: {
        departure: {
          ...req.body.route.departure,
          airport: depAirport._id
        },
        arrival: {
          ...req.body.route.arrival,
          airport: arrAirport._id
        }
      }
    };
    
    const flight = await Flight.create(flightData);
    res.status(201).json({ success: true, data: { flight } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

router.put('/flights/:id', async (req, res) => {
  try {
    const { Flight, Airline, Airport } = require('../models');
    
    // Handle airline reference
    if (req.body.airline && typeof req.body.airline === 'string') {
      const airline = await Airline.findById(req.body.airline);
      if (!airline) {
        return res.status(400).json({ success: false, error: { message: 'Invalid airline ID' } });
      }
    }
    
    // Handle airport references
    if (req.body.route?.departure?.airport) {
      const depAirport = await Airport.findById(req.body.route.departure.airport);
      if (!depAirport) {
        return res.status(400).json({ success: false, error: { message: 'Invalid departure airport ID' } });
      }
    }
    
    if (req.body.route?.arrival?.airport) {
      const arrAirport = await Airport.findById(req.body.route.arrival.airport);
      if (!arrAirport) {
        return res.status(400).json({ success: false, error: { message: 'Invalid arrival airport ID' } });
      }
    }
    
    const flight = await Flight.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    )
    .populate('airline', 'name code')
    .populate('route.departure.airport', 'name code city')
    .populate('route.arrival.airport', 'name code city');
    
    if (!flight) {
      return res.status(404).json({ success: false, error: { message: 'Flight not found' } });
    }
    
    res.json({ success: true, data: { flight } });
  } catch (error) {
    console.error('Flight update error:', error);
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

router.delete('/flights/:id', async (req, res) => {
  try {
    const { Flight } = require('../models');
    const flight = await Flight.findByIdAndDelete(req.params.id);
    if (!flight) {
      return res.status(404).json({ success: false, error: { message: 'Flight not found' } });
    }
    res.json({ success: true, message: 'Flight deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Hotel public routes
router.get('/hotels/popular-destinations', async (req, res) => {
  try {
    const { Hotel } = require('../models');
    const destinations = await Hotel.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$location.city', count: { $sum: 1 }, avgPrice: { $avg: '$pricing.averageNightlyRate' } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);
    res.json({ success: true, data: { destinations } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.get('/hotels/deals', async (req, res) => {
  try {
    const { Hotel } = require('../models');
    const deals = await Hotel.find({ status: 'active', featured: true }).limit(6);
    res.json({ success: true, data: { deals } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});



// Analytics
router.get('/analytics/overview', adminController.getAnalyticsOverview);
router.get('/analytics', adminController.getAnalyticsOverview);

// Support Management
router.get('/support/tickets', adminController.getSupportTickets);
router.put('/support/tickets/:id', adminController.updateSupportTicket);

// Content Management
router.post('/content/blog', adminController.createBlogPost);

// Homepage Content Management
const homeController = require('../controllers/homeController');
router.get('/home/content', homeController.getHomeContent);
router.put('/home/content', homeController.updateHomeContent);

// Settings
router.put('/settings', adminController.updateSettings);

module.exports = router;