const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  description: String,
  shortDescription: { type: String, maxlength: 200 },
  
  // Classification
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subcategory: String,
  tags: [String],
  
  // Location
  city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
  country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },
  address: String,
  coordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number] // [longitude, latitude]
  },
  
  // Activity Details
  type: { 
    type: String, 
    enum: ['sightseeing', 'adventure', 'cultural', 'food', 'shopping', 'entertainment', 'transport', 'accommodation', 'wellness'],
    required: true 
  },
  duration: {
    min: Number, // minutes
    max: Number,
    typical: Number
  },
  
  // Difficulty & Requirements
  difficulty: { type: String, enum: ['easy', 'moderate', 'challenging'], default: 'easy' },
  fitnessLevel: { type: String, enum: ['low', 'moderate', 'high'], default: 'low' },
  ageRestrictions: {
    minAge: Number,
    maxAge: Number,
    childFriendly: { type: Boolean, default: true }
  },
  
  // Pricing
  pricing: {
    currency: { type: String, default: 'USD' },
    adult: Number,
    child: Number,
    senior: Number,
    group: Number,
    priceType: { type: String, enum: ['per-person', 'per-group', 'per-hour'], default: 'per-person' },
    includes: [String],
    excludes: [String]
  },
  
  // Availability
  availability: {
    seasonal: { type: Boolean, default: false },
    months: [String],
    daysOfWeek: [Number], // 0=Sunday, 6=Saturday
    timeSlots: [{
      start: String, // "09:00"
      end: String,   // "17:00"
      capacity: Number
    }],
    advanceBooking: Number, // days
    instantConfirmation: { type: Boolean, default: true }
  },
  
  // What to Expect
  highlights: [String],
  includes: [String],
  excludes: [String],
  whatToBring: [String],
  
  // Logistics
  meetingPoint: String,
  transportation: {
    included: { type: Boolean, default: false },
    type: String,
    pickupAvailable: { type: Boolean, default: false }
  },
  
  // Media
  images: [{
    url: String,
    alt: String,
    category: { type: String, enum: ['main', 'gallery', 'map', 'menu'], default: 'gallery' },
    isPrimary: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
  }],
  
  // Reviews & Ratings
  rating: {
    overall: { type: Number, default: 0, min: 0, max: 5 },
    breakdown: {
      value: Number,
      service: Number,
      organization: Number,
      safety: Number
    },
    reviewCount: { type: Number, default: 0 }
  },
  
  // Provider Information
  provider: {
    name: String,
    contact: {
      phone: String,
      email: String,
      website: String
    },
    verified: { type: Boolean, default: false }
  },
  
  // Template Usage
  isTemplate: { type: Boolean, default: true },
  usageCount: { type: Number, default: 0 },
  
  // Status
  status: { type: String, enum: ['active', 'inactive', 'seasonal'], default: 'active' },
  featured: { type: Boolean, default: false },
  
  // SEO
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  }
}, { timestamps: true });

// Generate slug
activitySchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

// Indexes
activitySchema.index({ 'coordinates': '2dsphere' });
activitySchema.index({ city: 1, status: 1 });
activitySchema.index({ category: 1, type: 1 });
activitySchema.index({ featured: 1, rating: -1 });
activitySchema.index({ slug: 1 });

module.exports = mongoose.model('Activity', activitySchema);