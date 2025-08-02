const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true }, // ISO 3166-1 alpha-2
  code3: { type: String, uppercase: true }, // ISO 3166-1 alpha-3
  numericCode: String, // ISO 3166-1 numeric
  name: { type: String, required: true },
  officialName: String,
  capital: String,
  region: String,
  subregion: String,
  languages: [{
    code: String,
    name: String,
    native: String
  }],
  currencies: [{
    code: String,
    name: String,
    symbol: String
  }],
  geography: {
    area: Number, // in km²
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number] // [longitude, latitude] of center
    },
    borders: [String], // Country codes
    coastline: Number, // in km
    terrain: String,
    climate: String
  },
  demographics: {
    population: Number,
    density: Number, // per km²
    growthRate: Number,
    lifeExpectancy: Number,
    literacyRate: Number
  },
  travel: {
    visaRequired: { type: Boolean, default: true },
    visaOnArrival: { type: Boolean, default: false },
    eVisa: { type: Boolean, default: false },
    vaccinations: [String],
    safetyLevel: { type: Number, min: 1, max: 5, default: 3 },
    bestTimeToVisit: [String], // months
    timeZones: [String],
    drivingSide: { type: String, enum: ['left', 'right'], default: 'right' },
    electricalPlugs: [String],
    emergencyNumbers: {
      police: String,
      fire: String,
      medical: String
    }
  },
  economy: {
    gdp: Number,
    gdpPerCapita: Number,
    currency: String,
    economicFreedom: Number,
    corruptionIndex: Number
  },
  tourism: {
    touristsAnnual: Number,
    tourismRevenue: Number,
    popularDestinations: [String],
    unesco_sites: Number,
    attractions: [String]
  },
  flags: {
    png: String,
    svg: String
  },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

countrySchema.index({ code: 1 });
countrySchema.index({ region: 1, subregion: 1 });
countrySchema.index({ name: 'text', officialName: 'text' });

module.exports = mongoose.model('Country', countrySchema);