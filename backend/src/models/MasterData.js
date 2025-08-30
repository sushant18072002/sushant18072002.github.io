const mongoose = require('mongoose');

// Countries Model
const countrySchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true }, // US, FR, JP
  code3: { type: String, required: true, unique: true }, // USA, FRA, JPN
  currency: { type: String, required: true }, // USD, EUR, JPY
  timezone: String, // America/New_York
  continent: String, // North America, Europe, Asia
  flag: String, // URL to flag image
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

// States/Provinces Model
const stateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: String, // CA, NY, etc.
  country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
  timezone: String,
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

// Cities Model
const citySchema = new mongoose.Schema({
  name: { type: String, required: true },
  state: { type: mongoose.Schema.Types.ObjectId, ref: 'State' },
  country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  timezone: String,
  description: String,
  images: [String],
  popularFor: [String], // ["beaches", "nightlife", "culture"]
  bestTimeToVisit: [String], // ["March", "April", "May"]
  featured: { type: Boolean, default: false },
  priority: { type: Number, default: 0 },
  pricing: {
    averagePrice: Number,
    priceRange: {
      min: Number,
      max: Number
    }
  },
  stats: {
    visitorsPerYear: Number,
    rating: { type: Number, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 }
  },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

// Indexes
countrySchema.index({ code: 1 });
countrySchema.index({ status: 1 });

stateSchema.index({ country: 1 });
stateSchema.index({ status: 1 });

citySchema.index({ country: 1, state: 1 });
citySchema.index({ name: 'text' });
citySchema.index({ status: 1 });

// Category indexes moved to Category.js

// Activity indexes moved to Activity.js

module.exports = {
  Country: mongoose.model('Country', countrySchema),
  State: mongoose.model('State', stateSchema),
  City: mongoose.model('City', citySchema)
};