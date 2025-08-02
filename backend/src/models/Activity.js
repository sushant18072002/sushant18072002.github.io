const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['adventure', 'cultural', 'food', 'nature', 'entertainment', 'sports', 'wellness', 'shopping'],
    required: true 
  },
  location: {
    destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true },
    address: {
      street: String,
      city: String,
      country: String,
      zipCode: String
    },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number] // [longitude, latitude]
    }
  },
  pricing: {
    adult: { type: Number, required: true },
    child: Number,
    senior: Number,
    currency: { type: String, default: 'USD' },
    priceType: { type: String, enum: ['per_person', 'per_group', 'per_hour'], default: 'per_person' }
  },
  duration: {
    hours: Number,
    days: Number,
    description: String
  },
  availability: {
    schedule: [{
      dayOfWeek: { type: Number, min: 0, max: 6 }, // 0 = Sunday
      startTime: String,
      endTime: String,
      maxCapacity: Number
    }],
    seasonality: {
      available: { type: Boolean, default: true },
      bestMonths: [Number], // 1-12
      closedMonths: [Number]
    }
  },
  features: {
    difficulty: { type: String, enum: ['easy', 'moderate', 'challenging', 'expert'] },
    minAge: Number,
    maxGroupSize: Number,
    languages: [String],
    includes: [String],
    excludes: [String],
    requirements: [String]
  },
  media: {
    images: [String],
    videos: [String],
    virtualTour: String
  },
  rating: {
    overall: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 }
  },
  provider: {
    name: String,
    contact: {
      email: String,
      phone: String,
      website: String
    },
    license: String
  },
  status: { type: String, enum: ['active', 'inactive', 'seasonal'], default: 'active' },
  tags: [String]
}, { timestamps: true });

activitySchema.index({ 'location.coordinates': '2dsphere' });
activitySchema.index({ category: 1, status: 1 });
activitySchema.index({ 'location.destination': 1 });

module.exports = mongoose.model('Activity', activitySchema);