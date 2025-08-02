const mongoose = require('mongoose');

const airportSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true }, // IATA code
  icaoCode: { type: String, uppercase: true }, // ICAO code
  name: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  timezone: String,
  location: {
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number] // [longitude, latitude]
    },
    elevation: Number // in meters
  },
  terminals: [{
    name: String,
    airlines: [String], // Airline codes
    facilities: [String]
  }],
  facilities: {
    wifi: { type: Boolean, default: false },
    lounges: [String],
    restaurants: [String],
    shops: [String],
    hotels: [String],
    parking: {
      available: { type: Boolean, default: true },
      capacity: Number,
      rates: mongoose.Schema.Types.Mixed
    },
    transportation: {
      taxi: { type: Boolean, default: true },
      bus: { type: Boolean, default: false },
      train: { type: Boolean, default: false },
      metro: { type: Boolean, default: false },
      rental_car: { type: Boolean, default: false }
    }
  },
  runways: [{
    designation: String,
    length: Number, // in meters
    width: Number, // in meters
    surface: String
  }],
  statistics: {
    passengers_annual: Number,
    flights_annual: Number,
    cargo_annual: Number, // in tons
    ranking: {
      global: Number,
      regional: Number
    }
  },
  contact: {
    phone: String,
    website: String,
    email: String
  },
  status: { type: String, enum: ['active', 'inactive', 'under_construction'], default: 'active' },
  type: { 
    type: String, 
    enum: ['international', 'domestic', 'regional', 'military', 'private'], 
    default: 'international' 
  }
}, { timestamps: true });

airportSchema.index({ code: 1 });
airportSchema.index({ city: 1, country: 1 });
airportSchema.index({ 'location.coordinates': '2dsphere' });
airportSchema.index({ name: 'text', city: 'text' });

module.exports = mongoose.model('Airport', airportSchema);