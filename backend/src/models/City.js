const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
  state: String,
  region: String,
  location: {
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number] // [longitude, latitude]
    },
    elevation: Number, // in meters
    area: Number // in km²
  },
  demographics: {
    population: Number,
    density: Number,
    metropolitanPopulation: Number
  },
  travel: {
    airports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Airport' }],
    timeZone: String,
    climate: {
      type: String,
      averageTemp: {
        summer: Number,
        winter: Number
      },
      rainyMonths: [Number],
      bestVisitMonths: [Number]
    },
    transportation: {
      publicTransport: { type: Boolean, default: false },
      metro: { type: Boolean, default: false },
      bus: { type: Boolean, default: false },
      taxi: { type: Boolean, default: true },
      rideshare: { type: Boolean, default: false },
      bikeshare: { type: Boolean, default: false }
    }
  },
  tourism: {
    isPopular: { type: Boolean, default: false },
    touristRating: { type: Number, min: 0, max: 5 },
    attractions: [String],
    landmarks: [String],
    museums: [String],
    nightlife: { type: String, enum: ['none', 'limited', 'moderate', 'vibrant'], default: 'moderate' },
    shopping: { type: String, enum: ['limited', 'moderate', 'excellent'], default: 'moderate' },
    cuisine: [String],
    festivals: [{
      name: String,
      month: Number,
      description: String
    }]
  },
  accommodation: {
    averageHotelPrice: {
      budget: Number,
      midrange: Number,
      luxury: Number
    },
    hotelCount: Number,
    popularAreas: [String]
  },
  economy: {
    costOfLiving: { type: Number, min: 1, max: 5 }, // 1 = very cheap, 5 = very expensive
    currency: String,
    tipping: {
      expected: { type: Boolean, default: false },
      percentage: Number
    }
  },
  safety: {
    rating: { type: Number, min: 1, max: 5, default: 3 },
    crimeLevels: {
      petty: { type: String, enum: ['low', 'moderate', 'high'], default: 'moderate' },
      violent: { type: String, enum: ['low', 'moderate', 'high'], default: 'low' }
    },
    safeAreas: [String],
    areasToAvoid: [String]
  },
  images: [String],
  tags: [String], // e.g., 'beach', 'mountains', 'historic', 'modern'
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

citySchema.index({ name: 1, country: 1 });
citySchema.index({ 'location.coordinates': '2dsphere' });
citySchema.index({ country: 1, 'tourism.isPopular': 1 });
citySchema.index({ name: 'text' });

module.exports = mongoose.model('City', citySchema);