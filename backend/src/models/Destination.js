const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true },
  country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
  cities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'City' }],
  description: { type: String, required: true },
  shortDescription: { type: String, maxlength: 300 },
  coordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  images: {
    hero: String,
    gallery: [String]
  },
  topAttractions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }],
  attractions: [{
    name: { type: String, required: true },
    type: { type: String, enum: ['museum', 'park', 'monument', 'beach', 'mountain', 'temple', 'market', 'other'] },
    description: String,
    rating: { type: Number, min: 0, max: 5 },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number]
    },
    images: [String],
    entryFee: {
      adult: Number,
      child: Number,
      currency: String
    },
    openingHours: {
      monday: String,
      tuesday: String,
      wednesday: String,
      thursday: String,
      friday: String,
      saturday: String,
      sunday: String
    }
  }],
  climate: {
    bestTimeToVisit: {
      months: [{ type: String, enum: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] }],
      description: String
    },
    temperature: {
      summer: { min: Number, max: Number },
      winter: { min: Number, max: Number },
      unit: { type: String, enum: ['C', 'F'], default: 'C' }
    },
    rainfall: String
  },
  costs: {
    budgetPerDay: {
      budget: { type: Number, min: 0 },
      midRange: { type: Number, min: 0 },
      luxury: { type: Number, min: 0 }
    },
    currency: { type: String, default: 'USD' }
  },
  transportation: {
    airports: [String],
    publicTransport: [String],
    carRental: Boolean
  },
  tags: [String],
  featured: { type: Boolean, default: false },
  priority: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive', 'draft'], default: 'active' },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  stats: {
    views: { type: Number, default: 0 },
    bookings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

destinationSchema.index({ coordinates: '2dsphere' });
destinationSchema.index({ featured: 1, priority: 1 });
destinationSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Destination', destinationSchema);