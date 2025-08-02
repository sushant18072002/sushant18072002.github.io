const { Flight, PriceAlert, SearchLog, Airport } = require('../models');
const { success, error, paginated } = require('../utils/response');

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

    const filter = {
      'route.departure.airport': from,
      'route.arrival.airport': to,
      'route.departure.scheduledTime': {
        $gte: new Date(departDate),
        $lt: new Date(new Date(departDate).getTime() + 24 * 60 * 60 * 1000)
      },
      status: 'scheduled'
    };

    if (maxPrice) filter[`pricing.${flightClass}.totalPrice`] = { $lte: parseFloat(maxPrice) };
    if (airlines) filter.airline = { $in: airlines.split(',') };
    if (stops !== undefined) filter.stops = { $lte: parseInt(stops) };

    let sortCriteria = {};
    switch (sort) {
      case 'price': sortCriteria[`pricing.${flightClass}.totalPrice`] = 1; break;
      case 'duration': sortCriteria['duration.scheduled'] = 1; break;
      case 'departure': sortCriteria['route.departure.scheduledTime'] = 1; break;
      default: sortCriteria[`pricing.${flightClass}.totalPrice`] = 1;
    }

    const flights = await Flight.find(filter)
      .populate('airline', 'name code logo')
      .populate('route.departure.airport', 'code name city')
      .populate('route.arrival.airport', 'code name city')
      .sort(sortCriteria)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Flight.countDocuments(filter);

    await SearchLog.create({
      user: req.user?._id,
      type: 'flight',
      query: { from, to, departDate, passengers, class: flightClass },
      resultsCount: flights.length
    });

    return paginated(res, { flights }, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const getFilters = async (req, res) => {
  try {
    const { from, to, date } = req.query;
    
    const matchFilter = {};
    if (from) matchFilter['route.departure.airport'] = from;
    if (to) matchFilter['route.arrival.airport'] = to;
    if (date) {
      matchFilter['route.departure.scheduledTime'] = {
        $gte: new Date(date),
        $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
      };
    }

    const [priceRange, airlines, stops] = await Promise.all([
      Flight.aggregate([
        { $match: matchFilter },
        { $group: {
          _id: null,
          minPrice: { $min: '$pricing.economy.totalPrice' },
          maxPrice: { $max: '$pricing.economy.totalPrice' }
        }}
      ]),
      Flight.aggregate([
        { $match: matchFilter },
        { $lookup: { from: 'airlines', localField: 'airline', foreignField: '_id', as: 'airlineInfo' } },
        { $unwind: '$airlineInfo' },
        { $group: { _id: '$airline', name: { $first: '$airlineInfo.name' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Flight.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$stops', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ])
    ]);

    return success(res, {
      priceRange: priceRange[0] || { minPrice: 0, maxPrice: 5000 },
      airlines: airlines.map(a => ({ id: a._id, name: a.name, count: a.count })),
      stops: stops.map(s => ({ value: s._id, label: s._id === 0 ? 'Non-stop' : `${s._id} stop${s._id > 1 ? 's' : ''}`, count: s.count }))
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const getFlightDetails = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id)
      .populate('airline', 'name code logo services policies')
      .populate('route.departure.airport', 'code name city country terminal')
      .populate('route.arrival.airport', 'code name city country terminal');
    
    if (!flight) return error(res, 'Flight not found', 404);

    await Flight.findByIdAndUpdate(req.params.id, { $inc: { 'stats.views': 1 } });

    return success(res, { flight });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const getFlightSeats = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) return error(res, 'Flight not found', 404);

    const seatMap = {
      economy: {
        available: flight.pricing.economy.availability,
        total: flight.aircraft?.configuration?.economy || 0,
        price: flight.pricing.economy.totalPrice
      },
      business: flight.pricing.business ? {
        available: flight.pricing.business.availability,
        total: flight.aircraft?.configuration?.business || 0,
        price: flight.pricing.business.totalPrice
      } : null,
      first: flight.pricing.first ? {
        available: flight.pricing.first.availability,
        total: flight.aircraft?.configuration?.first || 0,
        price: flight.pricing.first.totalPrice
      } : null
    };

    return success(res, { seatMap });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const createPriceAlert = async (req, res) => {
  try {
    const { route, targetPrice, email = true, sms = false } = req.body;

    const priceAlert = await PriceAlert.create({
      user: req.user._id,
      type: 'flight',
      route,
      targetPrice,
      notifications: { email, sms },
      isActive: true
    });

    return success(res, { priceAlert }, 'Price alert created', 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const getPriceAlerts = async (req, res) => {
  try {
    const priceAlerts = await PriceAlert.find({ user: req.user._id, isActive: true })
      .sort({ createdAt: -1 });

    return success(res, { priceAlerts });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const deletePriceAlert = async (req, res) => {
  try {
    const priceAlert = await PriceAlert.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isActive: false },
      { new: true }
    );

    if (!priceAlert) return error(res, 'Price alert not found', 404);

    return success(res, null, 'Price alert deleted');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const compareFlights = async (req, res) => {
  try {
    const { flightIds } = req.body;
    
    if (!flightIds || flightIds.length < 2) {
      return error(res, 'At least 2 flights required for comparison', 400);
    }

    const flights = await Flight.find({ _id: { $in: flightIds } })
      .populate('airline', 'name code logo');

    if (flights.length !== flightIds.length) {
      return error(res, 'Some flights not found', 404);
    }

    return success(res, { flights });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const createFlight = async (req, res) => {
  try {
    const flight = await Flight.create({ ...req.body, createdBy: req.user._id });
    return success(res, { flight }, 'Flight created', 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const updateFlight = async (req, res) => {
  try {
    const flight = await Flight.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    if (!flight) return error(res, 'Flight not found', 404);
    return success(res, { flight }, 'Flight updated');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const deleteFlight = async (req, res) => {
  try {
    const flight = await Flight.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled', updatedBy: req.user._id },
      { new: true }
    );

    if (!flight) return error(res, 'Flight not found', 404);
    return success(res, null, 'Flight deleted');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const bulkImportFlights = async (req, res) => {
  try {
    const { flights } = req.body;
    
    if (!flights || !Array.isArray(flights)) {
      return error(res, 'Flights array required', 400);
    }

    const result = await Flight.insertMany(flights, { ordered: false });

    return success(res, { 
      imported: result.length,
      flights: result
    }, `${result.length} flights imported`, 201);
  } catch (err) {
    return error(res, err.message, 500);
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