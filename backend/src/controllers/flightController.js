const { Flight, PriceAlert, SearchLog, Airport } = require('../models');
const { success, error, paginated } = require('../utils/response');
const auditService = require('../services/auditService');

const searchFlights = async (req, res) => {
  try {
    const { 
      from, 
      to, 
      departDate, 
      returnDate, 
      passengers = 1, 
      class: flightClass = 'economy',
      maxPrice,
      airlines,
      stops,
      sort = 'price',
      page = 1,
      limit = 20
    } = req.query;

    // Build search filter
    const filter = {
      'route.departure.airport.code': from.toUpperCase(),
      'route.arrival.airport.code': to.toUpperCase(),
      'route.departure.scheduledTime': {
        $gte: new Date(departDate),
        $lt: new Date(new Date(departDate).getTime() + 24 * 60 * 60 * 1000)
      },
      status: 'scheduled'
    };

    // Add optional filters
    if (maxPrice) {
      filter[`pricing.${flightClass}.totalPrice`] = { $lte: parseFloat(maxPrice) };
    }
    
    if (airlines && airlines.length > 0) {
      filter['airline.code'] = { $in: airlines.split(',') };
    }
    
    if (stops !== undefined) {
      filter['stops'] = { $lte: parseInt(stops) };
    }

    // Build sort criteria
    let sortCriteria = {};
    switch (sort) {
      case 'price':
        sortCriteria[`pricing.${flightClass}.totalPrice`] = 1;
        break;
      case 'duration':
        sortCriteria['duration.total'] = 1;
        break;
      case 'departure':
        sortCriteria['route.departure.scheduledTime'] = 1;
        break;
      default:
        sortCriteria[`pricing.${flightClass}.totalPrice`] = 1;
    }

    // Execute search
    const flights = await Flight.find(filter)
      .sort(sortCriteria)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('airline', 'name logo');

    const total = await Flight.countDocuments(filter);

    // Log search
    await SearchLog.create({
      userId: req.user?._id,
      type: 'flight',
      query: { from, to, departDate, returnDate, passengers, class: flightClass },
      resultsCount: flights.length,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    return paginated(res, { flights }, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }, 'Flights retrieved successfully');
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const getFilters = async (req, res) => {
  try {
    const { from, to, date } = req.query;
    
    const matchFilter = {};
    if (from) matchFilter['route.departure.airport.code'] = from.toUpperCase();
    if (to) matchFilter['route.arrival.airport.code'] = to.toUpperCase();
    if (date) {
      matchFilter['route.departure.scheduledTime'] = {
        $gte: new Date(date),
        $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
      };
    }

    const [priceRange, airlines, stops] = await Promise.all([
      // Price range
      Flight.aggregate([
        { $match: matchFilter },
        { $group: {
          _id: null,
          minPrice: { $min: '$pricing.economy.totalPrice' },
          maxPrice: { $max: '$pricing.economy.totalPrice' }
        }}
      ]),
      
      // Airlines
      Flight.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$airline.code', name: { $first: '$airline.name' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Stops
      Flight.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$stops', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        priceRange: priceRange[0] || { minPrice: 0, maxPrice: 5000 },
        airlines: airlines.map(a => ({ code: a._id, name: a.name, count: a.count })),
        stops: stops.map(s => ({ value: s._id, label: s._id === 0 ? 'Non-stop' : `${s._id} stop${s._id > 1 ? 's' : ''}`, count: s.count }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const getFlightDetails = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id)
      .populate('airline', 'name logo policies');
    
    if (!flight) {
      return res.status(404).json({ success: false, error: { message: 'Flight not found' } });
    }

    res.json({ success: true, data: { flight } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const getFlightSeats = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    
    if (!flight) {
      return res.status(404).json({ success: false, error: { message: 'Flight not found' } });
    }

    // Generate seat map (simplified)
    const seatMap = {
      economy: {
        available: flight.pricing.economy.availability,
        total: flight.aircraft.configuration.economy,
        price: flight.pricing.economy.totalPrice
      },
      business: flight.pricing.business ? {
        available: flight.pricing.business.availability,
        total: flight.aircraft.configuration.business,
        price: flight.pricing.business.totalPrice
      } : null,
      first: flight.pricing.first ? {
        available: flight.pricing.first.availability,
        total: flight.aircraft.configuration.first,
        price: flight.pricing.first.totalPrice
      } : null
    };

    res.json({ success: true, data: { seatMap } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const createPriceAlert = async (req, res) => {
  try {
    const { route, targetPrice, email = true, sms = false } = req.body;
    const userId = req.user._id;

    const priceAlert = await PriceAlert.create({
      userId,
      type: 'flight',
      route,
      targetPrice,
      notifications: { email, sms },
      isActive: true
    });

    res.status(201).json({ success: true, data: { priceAlert } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const getPriceAlerts = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const priceAlerts = await PriceAlert.find({ userId, isActive: true })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { priceAlerts } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const deletePriceAlert = async (req, res) => {
  try {
    const alertId = req.params.id;
    const userId = req.user._id;

    const priceAlert = await PriceAlert.findOneAndUpdate(
      { _id: alertId, userId },
      { isActive: false },
      { new: true }
    );

    if (!priceAlert) {
      return res.status(404).json({ success: false, error: { message: 'Price alert not found' } });
    }

    res.json({ success: true, data: { message: 'Price alert deleted successfully' } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const compareFlights = async (req, res) => {
  try {
    const { flightIds } = req.body;
    
    if (!flightIds || flightIds.length < 2) {
      return res.status(400).json({ success: false, error: { message: 'At least 2 flights required for comparison' } });
    }

    const flights = await Flight.find({ _id: { $in: flightIds } })
      .populate('airline', 'name logo');

    if (flights.length !== flightIds.length) {
      return res.status(404).json({ success: false, error: { message: 'Some flights not found' } });
    }

    res.json({ success: true, data: { flights } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Admin functions
const createFlight = async (req, res) => {
  try {
    const flight = await Flight.create(req.body);
    
    // Log flight creation
    await auditService.logUserAction(
      req.user._id,
      'FLIGHT_CREATE',
      'flight',
      flight._id.toString(),
      req.body,
      req
    );

    res.status(201).json({ success: true, data: { flight } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const updateFlight = async (req, res) => {
  try {
    const flightId = req.params.id;
    
    const flight = await Flight.findByIdAndUpdate(
      flightId,
      { $set: { ...req.body, updatedAt: new Date() } },
      { new: true, runValidators: true }
    );

    if (!flight) {
      return res.status(404).json({ success: false, error: { message: 'Flight not found' } });
    }

    // Log flight update
    await auditService.logUserAction(
      req.user._id,
      'FLIGHT_UPDATE',
      'flight',
      flightId,
      req.body,
      req
    );

    res.json({ success: true, data: { flight } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const deleteFlight = async (req, res) => {
  try {
    const flightId = req.params.id;
    
    const flight = await Flight.findByIdAndDelete(flightId);

    if (!flight) {
      return res.status(404).json({ success: false, error: { message: 'Flight not found' } });
    }

    // Log flight deletion
    await auditService.logUserAction(
      req.user._id,
      'FLIGHT_DELETE',
      'flight',
      flightId,
      { flightNumber: flight.flightNumber },
      req
    );

    res.json({ success: true, data: { message: 'Flight deleted successfully' } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const bulkImportFlights = async (req, res) => {
  try {
    const { flights } = req.body;
    
    if (!flights || !Array.isArray(flights)) {
      return res.status(400).json({ success: false, error: { message: 'Flights array required' } });
    }

    const result = await Flight.insertMany(flights, { ordered: false });

    // Log bulk import
    await auditService.logUserAction(
      req.user._id,
      'FLIGHTS_BULK_IMPORT',
      'flight',
      null,
      { count: result.length },
      req
    );

    res.status(201).json({ 
      success: true, 
      data: { 
        message: `${result.length} flights imported successfully`,
        imported: result.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

module.exports = {
  searchFlights,
  getFilters,
  getFlightDetails,
  getFlightSeats,
  createPriceAlert,
  getPriceAlerts,
  deletePriceAlert,
  compareFlights,
  createFlight,
  updateFlight,
  deleteFlight,
  bulkImportFlights
};