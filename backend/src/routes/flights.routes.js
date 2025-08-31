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
      class: flightClass = 'economy',
      minPrice,
      maxPrice,
      stops,
      sort = 'price',
      page = 1,
      limit = 20
    } = req.query;
    
    // Validate and sanitize flightClass to prevent NoSQL injection
    const validClasses = ['economy', 'premiumEconomy', 'business', 'first'];
    const sanitizedClass = validClasses.includes(flightClass) ? flightClass : 'economy';

    const query = { status: 'scheduled' };
    
    // Handle departure airport (city name or code) with input sanitization
    const departureParam = departure || from;
    if (departureParam && typeof departureParam === 'string' && departureParam.trim().length > 0) {
      const sanitizedParam = departureParam.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const airport = await Airport.findOne({
        $or: [
          { code: sanitizedParam.toUpperCase() },
          { city: { $regex: new RegExp(sanitizedParam, 'i') } },
          { name: { $regex: new RegExp(sanitizedParam, 'i') } }
        ]
      });
      if (airport) {
        query['route.departure.airport'] = airport._id;
      }
    }
    
    // Handle arrival airport (city name or code) with input sanitization
    const arrivalParam = arrival || to;
    if (arrivalParam && typeof arrivalParam === 'string' && arrivalParam.trim().length > 0) {
      const sanitizedParam = arrivalParam.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const airport = await Airport.findOne({
        $or: [
          { code: sanitizedParam.toUpperCase() },
          { city: { $regex: new RegExp(sanitizedParam, 'i') } },
          { name: { $regex: new RegExp(sanitizedParam, 'i') } }
        ]
      });
      if (airport) {
        query['route.arrival.airport'] = airport._id;
      }
    }
    if (airline) query.airline = airline;
    // Handle date parameter with validation
    const dateParam = date || departDate;
    if (dateParam) {
      const startDate = new Date(dateParam);
      if (isNaN(startDate.getTime())) {
        return res.status(400).json({ success: false, error: { message: 'Invalid date format' } });
      }
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query['route.departure.scheduledTime'] = {
        $gte: startDate,
        $lt: endDate
      };
    }

    // Price filter with sanitized class
    if (maxPrice) {
      const priceQuery = { $lte: parseFloat(maxPrice) };
      if (minPrice) priceQuery.$gte = parseFloat(minPrice);
      
      const priceField = `pricing.${sanitizedClass}.totalPrice`;
      query[priceField] = priceQuery;
    }
    
    // Stops filter
    if (stops && stops !== 'any') {
      if (stops === '0') {
        query.flightType = 'direct';
      } else if (stops === '1') {
        query['layovers.0'] = { $exists: true };
        query['layovers.1'] = { $exists: false };
      } else if (stops === '2+') {
        query['layovers.1'] = { $exists: true };
      }
    }

    // Sort options with sanitized class
    let sortQuery = {};
    const validSorts = ['price', 'duration', 'departure', 'arrival'];
    const sanitizedSort = validSorts.includes(sort) ? sort : 'price';
    
    switch (sanitizedSort) {
      case 'price':
        sortQuery[`pricing.${sanitizedClass}.totalPrice`] = 1;
        break;
      case 'duration':
        sortQuery['duration.scheduled'] = 1;
        break;
      case 'departure':
        sortQuery['route.departure.scheduledTime'] = 1;
        break;
      case 'arrival':
        sortQuery['route.arrival.scheduledTime'] = 1;
        break;
      default:
        sortQuery[`pricing.${sanitizedClass}.totalPrice`] = 1;
    }
    
    const flights = await Flight.find(query)
      .populate('airline', 'name code logo')
      .populate('route.departure.airport', 'name code city country')
      .populate('route.arrival.airport', 'name code city country')
      .sort(sortQuery)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    // Ensure pricing data exists for selected class
    const processedFlights = flights.map(flight => {
      if (!flight.pricing[sanitizedClass] && flight.pricing.economy) {
        flight.pricing[sanitizedClass] = flight.pricing.economy;
      }
      return flight;
    });

    const total = await Flight.countDocuments(query);

    res.json({
      success: true,
      data: {
        flights: processedFlights,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        searchParams: {
          from: departureParam,
          to: arrivalParam,
          date: dateParam,
          class: flightClass,
          sort,
          stops
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
    const mongoose = require('mongoose');
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid flight ID format' } });
    }
    
    const flight = await Flight.findById(req.params.id)
      .populate('airline', 'name code logo contact services')
      .populate('route.departure.airport', 'name code city country timezone')
      .populate('route.arrival.airport', 'name code city country timezone')
      .populate('layovers.airport', 'name code city');

    if (!flight) {
      return res.status(404).json({ success: false, error: { message: 'Flight not found' } });
    }

    // Ensure all pricing classes have required fields with proper validation
    const processedFlight = flight.toObject();
    const classDefaults = {
      economy: { baggage: 0, refundable: false, changeFee: 150 },
      premiumEconomy: { baggage: 1, refundable: true, changeFee: 75 },
      business: { baggage: 2, refundable: true, changeFee: 0 },
      first: { baggage: 3, refundable: true, changeFee: 0 }
    };
    
    Object.keys(classDefaults).forEach(classType => {
      if (processedFlight.pricing[classType]) {
        const pricing = processedFlight.pricing[classType];
        const defaults = classDefaults[classType];
        
        // Ensure pricing structure
        if (!pricing.basePrice && pricing.totalPrice) {
          pricing.basePrice = Math.floor(pricing.totalPrice * 0.75);
          pricing.taxes = Math.floor(pricing.totalPrice * 0.20);
          pricing.fees = pricing.totalPrice - pricing.basePrice - pricing.taxes;
        }
        
        // Ensure restrictions
        if (!pricing.restrictions) {
          pricing.restrictions = {
            refundable: defaults.refundable,
            changeable: true,
            changeFee: defaults.changeFee
          };
        }
        
        // Ensure baggage
        if (!pricing.baggage) {
          pricing.baggage = { included: defaults.baggage };
        }
      }
    });

    // Ensure services exist
    if (!processedFlight.services) {
      processedFlight.services = {
        wifi: { available: true, price: 0 },
        meals: [{ class: 'economy', type: 'Standard', included: true }],
        baggage: { carryOn: { included: true } }
      };
    }

    // Increment view count asynchronously
    Flight.findByIdAndUpdate(flight._id, { $inc: { 'stats.views': 1 } }).catch(console.error);

    res.json({ success: true, data: { flight: processedFlight } });
  } catch (error) {
    console.error('Flight details error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
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

// Create sample flights for testing
router.post('/create-samples', async (req, res) => {
  try {
    const { Flight, Airport, Airline } = require('../models');
    
    // Clear existing flights
    await Flight.deleteMany({});
    
    // Get or create airports
    const airports = await Airport.find().limit(10);
    if (airports.length < 4) {
      return res.status(400).json({ success: false, error: { message: 'Need at least 4 airports in database' } });
    }
    
    // Get or create airlines
    const airlines = await Airline.find().limit(5);
    if (airlines.length < 2) {
      return res.status(400).json({ success: false, error: { message: 'Need at least 2 airlines in database' } });
    }
    
    const sampleFlights = [];
    const today = new Date();
    
    // Create flights for next 30 days
    for (let day = 0; day < 30; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);
      
      // Create multiple flights per day
      for (let i = 0; i < 5; i++) {
        const departureTime = new Date(flightDate);
        departureTime.setHours(8 + (i * 3), 0, 0, 0);
        
        const arrivalTime = new Date(departureTime);
        arrivalTime.setHours(departureTime.getHours() + 2 + Math.floor(Math.random() * 4));
        
        const fromAirport = airports[Math.floor(Math.random() * airports.length)];
        const toAirport = airports[Math.floor(Math.random() * airports.length)];
        
        if (fromAirport._id.toString() !== toAirport._id.toString()) {
          const airline = airlines[Math.floor(Math.random() * airlines.length)];
          const basePrice = 200 + Math.floor(Math.random() * 800);
          
          sampleFlights.push({
            flightNumber: `${airline.code}${1000 + Math.floor(Math.random() * 9000)}`,
            airline: airline._id,
            flightType: Math.random() > 0.7 ? 'connecting' : 'direct',
            route: {
              departure: {
                airport: fromAirport._id,
                scheduledTime: departureTime,
                terminal: Math.random() > 0.5 ? 'T1' : 'T2',
                gate: `A${Math.floor(Math.random() * 20) + 1}`
              },
              arrival: {
                airport: toAirport._id,
                scheduledTime: arrivalTime,
                terminal: Math.random() > 0.5 ? 'T1' : 'T2',
                gate: `B${Math.floor(Math.random() * 20) + 1}`
              }
            },
            duration: {
              scheduled: Math.floor((arrivalTime - departureTime) / (1000 * 60))
            },
            distance: 500 + Math.floor(Math.random() * 2000),
            aircraft: {
              type: 'Boeing',
              model: Math.random() > 0.5 ? '737-800' : 'A320',
              configuration: {
                economy: 150,
                business: 20,
                total: 170
              }
            },
            pricing: {
              economy: {
                basePrice: basePrice,
                taxes: Math.floor(basePrice * 0.15),
                fees: 25,
                totalPrice: Math.floor(basePrice * 1.15) + 25,
                availability: Math.floor(Math.random() * 50) + 10
              },
              business: {
                basePrice: basePrice * 3,
                taxes: Math.floor(basePrice * 3 * 0.15),
                fees: 50,
                totalPrice: Math.floor(basePrice * 3 * 1.15) + 50,
                availability: Math.floor(Math.random() * 10) + 2
              }
            },
            status: 'scheduled'
          });
        }
      }
    }
    
    const createdFlights = await Flight.insertMany(sampleFlights);
    
    res.json({
      success: true,
      message: `Created ${createdFlights.length} sample flights`,
      data: { count: createdFlights.length }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

module.exports = router;