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
  itinerary: {
    overview: String,
    days: [{
      day: Number,
      title: String,
      description: String,
      activities: [String]
    }]
  },
  images: [String],
  category: String,
  rating: {
    overall: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 }
  },
  availability: {
    startDates: [Date],
    maxBookings: Number,
    currentBookings: { type: Number, default: 0 }
  },
  featured: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

packageSchema.index({ category: 1, 'price.amount': 1 });
packageSchema.index({ featured: 1 });

module.exports = mongoose.model('Package', packageSchema);