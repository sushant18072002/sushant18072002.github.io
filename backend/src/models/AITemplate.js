const mongoose = require('mongoose');

const aiTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { 
    type: String, 
    enum: ['adventure', 'relaxation', 'cultural', 'business', 'family', 'romantic', 'budget', 'luxury', 'solo', 'group'],
    required: true 
  },
  description: { type: String, required: true },
  duration: {
    min: { type: Number, required: true }, // minimum days
    max: { type: Number, required: true }, // maximum days
    optimal: Number // optimal duration
  },
  budget: {
    range: { type: String, enum: ['budget', 'mid-range', 'luxury', 'ultra-luxury'], required: true },
    estimatedCost: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'USD' }
    }
  },
  destinations: {
    preferred: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destination' }],
    excluded: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destination' }],
    climate: [String], // tropical, temperate, cold, desert
    terrain: [String] // beach, mountain, city, countryside
  },
  activities: {
    included: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }],
    categories: [String], // adventure, cultural, food, nature
    intensity: { type: String, enum: ['low', 'moderate', 'high'], default: 'moderate' }
  },
  accommodation: {
    types: [String], // hotel, resort, hostel, apartment, villa
    starRating: {
      min: { type: Number, min: 1, max: 5 },
      max: { type: Number, min: 1, max: 5 }
    },
    amenities: [String]
  },
  transportation: {
    preferred: [String], // flight, train, bus, car, cruise
    class: [String], // economy, business, first
    flexibility: { type: String, enum: ['fixed', 'flexible', 'very_flexible'], default: 'flexible' }
  },
  itinerary: {
    structure: { type: String, enum: ['packed', 'balanced', 'relaxed'], default: 'balanced' },
    dailyActivities: {
      min: { type: Number, default: 1 },
      max: { type: Number, default: 3 }
    },
    freeTime: { type: Number, default: 2 }, // hours per day
    restDays: { type: Boolean, default: false }
  },
  preferences: {
    groupSize: {
      min: { type: Number, default: 1 },
      max: { type: Number, default: 10 }
    },
    ageGroups: [String], // children, teens, adults, seniors
    interests: [String],
    dietaryRestrictions: [String],
    accessibility: [String],
    languages: [String]
  },
  prompts: {
    initial: { type: String, required: true }, // Initial AI prompt
    refinement: [String], // Follow-up prompts for refinement
    customization: [String] // Prompts for customization
  },
  metadata: {
    popularity: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 }, // percentage of successful bookings
    averageRating: { type: Number, default: 0 },
    usageCount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tags: [String],
    seasonality: [Number] // months when template is most relevant
  },
  isActive: { type: Boolean, default: true },
  isPublic: { type: Boolean, default: true }
}, { timestamps: true });

aiTemplateSchema.index({ category: 1, isActive: 1 });
aiTemplateSchema.index({ 'budget.range': 1, 'duration.min': 1, 'duration.max': 1 });
aiTemplateSchema.index({ 'metadata.popularity': -1 });

module.exports = mongoose.model('AITemplate', aiTemplateSchema);