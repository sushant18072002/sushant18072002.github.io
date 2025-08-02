const { Airline, Airport, Country, City, Currency, Setting } = require('../models');
const auditService = require('../services/auditService');

// Airlines Management
const getAirlines = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      country, 
      alliance, 
      status = 'active',
      search 
    } = req.query;

    const query = { status };
    if (country) query.country = country;
    if (alliance) query.alliance = alliance;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const airlines = await Airline.find(query)
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Airline.countDocuments(query);

    res.json({
      success: true,
      data: {
        airlines,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const createAirline = async (req, res) => {
  try {
    const airline = new Airline({
      ...req.body,
      createdBy: req.user._id
    });

    await airline.save();

    await auditService.log({
      userId: req.user._id,
      action: 'AIRLINE_CREATED',
      resource: 'airline',
      resourceId: airline._id.toString(),
      metadata: { code: airline.code, name: airline.name }
    });

    res.status(201).json({
      success: true,
      data: { airline }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: { message: 'Airline code already exists' }
      });
    }
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

const updateAirline = async (req, res) => {
  try {
    const airline = await Airline.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    if (!airline) {
      return res.status(404).json({
        success: false,
        error: { message: 'Airline not found' }
      });
    }

    await auditService.log({
      userId: req.user._id,
      action: 'AIRLINE_UPDATED',
      resource: 'airline',
      resourceId: req.params.id
    });

    res.json({ success: true, data: { airline } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

// Airports Management
const getAirports = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      country, 
      city, 
      type,
      search 
    } = req.query;

    const query = {};
    if (country) query.country = country;
    if (city) query.city = city;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }

    const airports = await Airport.find(query)
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Airport.countDocuments(query);

    res.json({
      success: true,
      data: {
        airports,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const createAirport = async (req, res) => {
  try {
    const airport = new Airport({
      ...req.body,
      createdBy: req.user._id
    });

    await airport.save();

    await auditService.log({
      userId: req.user._id,
      action: 'AIRPORT_CREATED',
      resource: 'airport',
      resourceId: airport._id.toString(),
      metadata: { code: airport.code, name: airport.name }
    });

    res.status(201).json({
      success: true,
      data: { airport }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

// Countries Management
const getCountries = async (req, res) => {
  try {
    const { search, region, status = 'active' } = req.query;

    const query = { status };
    if (region) query.region = region;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const countries = await Country.find(query)
      .select('code name officialName capital region currencies flags')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: { countries }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const createCountry = async (req, res) => {
  try {
    const country = new Country({
      ...req.body,
      createdBy: req.user._id
    });

    await country.save();

    await auditService.log({
      userId: req.user._id,
      action: 'COUNTRY_CREATED',
      resource: 'country',
      resourceId: country._id.toString(),
      metadata: { code: country.code, name: country.name }
    });

    res.status(201).json({
      success: true,
      data: { country }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

// Cities Management
const getCities = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      country, 
      popular,
      search 
    } = req.query;

    const query = { status: 'active' };
    if (country) query.country = country;
    if (popular) query['tourism.isPopular'] = popular === 'true';
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const cities = await City.find(query)
      .populate('country', 'name code')
      .select('name country demographics.population tourism.isPopular images')
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await City.countDocuments(query);

    res.json({
      success: true,
      data: {
        cities,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Currencies Management
const getCurrencies = async (req, res) => {
  try {
    const { active = true } = req.query;
    
    const query = {};
    if (active) query.active = active === 'true';

    const currencies = await Currency.find(query)
      .sort({ code: 1 });

    res.json({
      success: true,
      data: { currencies }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const updateCurrencyRates = async (req, res) => {
  try {
    const { rates } = req.body;

    // Update multiple currency rates
    const updatePromises = Object.entries(rates).map(([code, rate]) =>
      Currency.findOneAndUpdate(
        { code },
        { 
          rate: rate.rate,
          lastUpdated: new Date(),
          updatedBy: req.user._id
        },
        { new: true }
      )
    );

    await Promise.all(updatePromises);

    await auditService.log({
      userId: req.user._id,
      action: 'CURRENCY_RATES_UPDATED',
      resource: 'currency',
      metadata: { updatedCurrencies: Object.keys(rates) }
    });

    res.json({
      success: true,
      data: { message: 'Currency rates updated successfully' }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Settings Management
const getSettings = async (req, res) => {
  try {
    const settings = await Setting.findOne().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { settings: settings || {} }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const updateSettings = async (req, res) => {
  try {
    const settings = await Setting.findOneAndUpdate(
      {},
      { ...req.body, updatedBy: req.user._id },
      { new: true, upsert: true }
    );

    await auditService.log({
      userId: req.user._id,
      action: 'SETTINGS_UPDATED',
      resource: 'setting',
      resourceId: settings._id.toString()
    });

    res.json({
      success: true,
      data: { settings }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

// Bulk data operations
const bulkImportData = async (req, res) => {
  try {
    const { type, data } = req.body;
    let result;

    switch (type) {
      case 'airlines':
        result = await Airline.insertMany(data, { ordered: false });
        break;
      case 'airports':
        result = await Airport.insertMany(data, { ordered: false });
        break;
      case 'countries':
        result = await Country.insertMany(data, { ordered: false });
        break;
      case 'cities':
        result = await City.insertMany(data, { ordered: false });
        break;
      default:
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid data type' }
        });
    }

    await auditService.log({
      userId: req.user._id,
      action: 'BULK_DATA_IMPORT',
      resource: type,
      metadata: { count: result.length }
    });

    res.json({
      success: true,
      data: { 
        message: `${result.length} ${type} imported successfully`,
        imported: result.length
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

module.exports = {
  // Airlines
  getAirlines,
  createAirline,
  updateAirline,
  
  // Airports
  getAirports,
  createAirport,
  
  // Countries
  getCountries,
  createCountry,
  
  // Cities
  getCities,
  
  // Currencies
  getCurrencies,
  updateCurrencyRates,
  
  // Settings
  getSettings,
  updateSettings,
  
  // Bulk operations
  bulkImportData
};