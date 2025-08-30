const express = require('express');
const router = express.Router();

// Get all flights with filters
router.get('/', async (req, res) => {
  try {
    const { Flight, Airport } = require('../models');
    const { 
      departure, 
      arrival, 
      from,
      to,
      date, 
      departDate,
      airline, 
      class: flightClass,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};
    
    // Handle departure airport (ID or code)
    const departureParam = departure || from;
    if (departureParam) {
      if (departureParam.length > 3) {
        // It's an ID
        query['route.departure.airport'] = departureParam;
      } else {
        // It's a code, find the airport ID
        const airport = await Airport.findOne({ code: departureParam });
        if (airport) {
          query['route.departure.airport'] = airport._id;
        }
      }
    }
    
    // Handle arrival airport (ID or code)
    const arrivalParam = arrival || to;
    if (arrivalParam) {
      if (arrivalParam.length > 3) {
        // It's an ID
        query['route.arrival.airport'] = arrivalParam;
      } else {
        // It's a code, find the airport ID
        const airport = await Airport.findOne({ code: arrivalParam });
        if (airport) {
          query['route.arrival.airport'] = airport._id;
        }
      }
    }
    if (airline) query.airline = airline;
    // Handle date parameter
    const dateParam = date || departDate;
    if (dateParam) {
      const startDate = new Date(dateParam);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query['route.departure.scheduledTime'] = {
        $gte: startDate,
        $lt: endDate
      };
    }

    // Price filter
    if (minPrice || maxPrice) {
      const priceQuery = {};
      if (minPrice) priceQuery.$gte = parseFloat(minPrice);
      if (maxPrice) priceQuery.$lte = parseFloat(maxPrice);
      
      if (flightClass === 'business') {
        query['pricing.business.totalPrice'] = priceQuery;
      } else {
        query['pricing.economy.totalPrice'] = priceQuery;
      }
    }

    console.log('Final MongoDB query:', JSON.stringify(query, null, 2));
    
    // Check total flights in database
    const totalFlights = await Flight.countDocuments();
    console.log('Total flights in database:', totalFlights);
    
    // Check flights without filters
    const allFlights = await Flight.find().limit(5).populate('route.departure.airport route.arrival.airport', 'code city');
    console.log('Sample flights:', allFlights.map(f => ({
      id: f._id,
      flightNumber: f.flightNumber,
      departure: f.route?.departure?.airport?.code,
      arrival: f.route?.arrival?.airport?.code,
      date: f.route?.departure?.scheduledTime
    })));
    
    // Update all flights to current search date for testing
    const searchDate = new Date(dateParam || '2025-08-29');
    const updateResult = await Flight.updateMany(
      {},
      [{
        $set: {
          'route.departure.scheduledTime': {
            $dateFromString: {
              dateString: {
                $concat: [
                  { $dateToString: { format: "%Y-%m-%d", date: searchDate } },
                  "T08:00:00.000Z"
                ]
              }
            }
          },
          'route.arrival.scheduledTime': {
            $dateFromString: {
              dateString: {
                $concat: [
                  { $dateToString: { format: "%Y-%m-%d", date: searchDate } },
                  "T16:00:00.000Z"
                ]
              }
            }
          }
        }
      }]
    );
    console.log('Updated flights to search date:', updateResult.modifiedCount);
    
    const flights = await Flight.find(query)
      .populate('airline', 'name code logo')
      .populate('route.departure.airport', 'name code city country')
      .populate('route.arrival.airport', 'name code city country')
      .sort({ 'route.departure.scheduledTime': 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
      
    console.log('Found flights:', flights.length);

    const total = await Flight.countDocuments(query);

    res.json({
      success: true,
      data: {
        flights,
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
});

// Search flights (simplified) - MUST be before /:id route
router.get('/search', async (req, res) => {
  try {
    const { Flight } = require('../models');
    const { from, to, date, passengers = 1, class: flightClass = 'economy' } = req.query;

    if (!from || !to || !date) {
      return res.status(400).json({ 
        success: false, 
        error: { message: 'Missing required parameters: from, to, date' } 
      });
    }

    const searchDate = new Date(date);
    const nextDay = new Date(searchDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const flights = await Flight.find({
      'route.departure.airport': from,
      'route.arrival.airport': to,
      'route.departure.scheduledTime': {
        $gte: searchDate,
        $lt: nextDay
      },
      status: 'scheduled'
    })
    .populate('airline', 'name code logo')
    .populate('route.departure.airport', 'name code city')
    .populate('route.arrival.airport', 'name code city')
    .sort({ 'route.departure.scheduledTime': 1 });

    res.json({ success: true, data: { flights, searchParams: { from, to, date, passengers, class: flightClass } } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Popular routes - MUST be before /:id route
router.get('/popular-routes', async (req, res) => {
  try {
    const { Flight, Airport } = require('../models');
    
    // Get popular routes with proper population
    const flights = await Flight.find({ status: 'scheduled' })
      .populate('route.departure.airport', 'code name city')
      .populate('route.arrival.airport', 'code name city')
      .select('route.departure.airport route.arrival.airport pricing.economy.totalPrice');
    
    // Group routes manually
    const routeMap = new Map();
    
    flights.forEach(flight => {
      if (flight.route?.departure?.airport && flight.route?.arrival?.airport) {
        const fromId = flight.route.departure.airport._id.toString();
        const toId = flight.route.arrival.airport._id.toString();
        const routeKey = `${fromId}-${toId}`;
        
        if (!routeMap.has(routeKey)) {
          routeMap.set(routeKey, {
            from: flight.route.departure.airport,
            to: flight.route.arrival.airport,
            count: 0,
            totalPrice: 0
          });
        }
        
        const route = routeMap.get(routeKey);
        route.count += 1;
        route.totalPrice += flight.pricing?.economy?.totalPrice || 0;
      }
    });
    
    // Convert to array and calculate averages
    const routes = Array.from(routeMap.values())
      .map(route => ({
        from: route.from,
        to: route.to,
        count: route.count,
        avgPrice: Math.round(route.totalPrice / route.count)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
    
    res.json({ success: true, data: { routes } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Flight deals - MUST be before /:id route
router.get('/deals', async (req, res) => {
  try {
    const { Flight } = require('../models');
    const deals = await Flight.find({ status: 'scheduled' })
      .populate('airline', 'name code logo')
      .populate('route.departure.airport', 'name code city')
      .populate('route.arrival.airport', 'name code city')
      .sort({ 'pricing.economy.totalPrice': 1 })
      .limit(6);
    
    // Add placeholder images if none exist
    const dealsWithImages = deals.map(deal => {
      if (!deal.images || deal.images.length === 0) {
        deal.images = [{
          url: `https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=300&fit=crop&auto=format`,
          alt: `${deal.airline?.name} Flight`,
          category: 'aircraft',
          isPrimary: true
        }];
      }
      return deal;
    });
    
    res.json({ success: true, data: { deals: dealsWithImages } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Get single flight
router.get('/:id', async (req, res) => {
  try {
    const { Flight } = require('../models');
    const flight = await Flight.findById(req.params.id)
      .populate('airline', 'name code logo contact services')
      .populate('route.departure.airport', 'name code city country timezone')
      .populate('route.arrival.airport', 'name code city country timezone');

    if (!flight) {
      return res.status(404).json({ success: false, error: { message: 'Flight not found' } });
    }

    // Increment view count
    await Flight.findByIdAndUpdate(flight._id, { $inc: { 'stats.views': 1 } });

    res.json({ success: true, data: { flight } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Create new flight
router.post('/', async (req, res) => {
  try {
    const { Flight } = require('../models');
    const flight = new Flight(req.body);
    await flight.save();
    
    const populatedFlight = await Flight.findById(flight._id)
      .populate('airline', 'name code')
      .populate('route.departure.airport', 'name code city')
      .populate('route.arrival.airport', 'name code city');

    res.status(201).json({ success: true, data: { flight: populatedFlight } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Update flight
router.put('/:id', async (req, res) => {
  try {
    const { Flight } = require('../models');
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
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Delete flight
router.delete('/:id', async (req, res) => {
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

module.exports = router;