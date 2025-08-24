const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: String,
  description: String,
  destinations: [String],
  duration: Number,
  price: {
    amount: Number,
    currency: String,
    originalPrice: Number,
    discount: Number
  },
  includes: [String],
  excludes: [String],
  highlights: [String], // Added for frontend compatibility
  itinerary: {
    overview: String,
    days: [{
      day: Number,
      title: String,
      description: String,
      activities: [String]
    }]
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
  }],
  category: String,
  rating: {
    overall: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 }
  },
  availability: {
    startDates: [Date],
    maxBookings: Number,
    currentBookings: { type: Number, default: 0 },
    calendar: [{
      date: Date,
      available: { type: Boolean, default: true },
      price: Number,
      maxBookings: Number,
      currentBookings: { type: Number, default: 0 }
    }],
    seasonalPricing: [{
      name: String,
      startDate: Date,
      endDate: Date,
      priceMultiplier: { type: Number, default: 1 },
      available: { type: Boolean, default: true }
    }]
  },
  featured: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

packageSchema.index({ category: 1, 'price.amount': 1 });
packageSchema.index({ featured: 1 });

module.exports = mongoose.model('Package', packageSchema);