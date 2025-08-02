const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  flightNumber: { type: String, required: true, index: true },
  airline: { type: mongoose.Schema.Types.ObjectId, ref: 'Airline', required: true },
  aircraft: {
    type: String,
    model: String,
    configuration: {
      economy: Number,
      business: Number,
      first: Number,
      total: Number
    }
  },
  route: {
    departure: {
      airport: { type: mongoose.Schema.Types.ObjectId, ref: 'Airport', required: true },
      scheduledTime: { type: Date, required: true },
      actualTime: Date,
      terminal: String,
      gate: String
    },
    arrival: {
      airport: { type: mongoose.Schema.Types.ObjectId, ref: 'Airport', required: true },
      scheduledTime: { type: Date, required: true },
      actualTime: Date,
      terminal: String,
      gate: String
    }
  },
  duration: {
    scheduled: Number, // minutes
    actual: Number
  },
  pricing: {
    economy: {
      basePrice: { type: Number, required: true },
      taxes: { type: Number, default: 0 },
      fees: { type: Number, default: 0 },
      totalPrice: { type: Number, required: true },
      availability: { type: Number, default: 0 },
      baggage: {
        included: { type: Number, default: 0 },
        additional: { price: Number, weight: Number }
      }
    },
    business: {
      basePrice: Number,
      taxes: { type: Number, default: 0 },
      fees: { type: Number, default: 0 },
      totalPrice: Number,
      availability: { type: Number, default: 0 },
      baggage: {
        included: { type: Number, default: 1 },
        additional: { price: Number, weight: Number }
      }
    },
    first: {
      basePrice: Number,
      taxes: { type: Number, default: 0 },
      fees: { type: Number, default: 0 },
      totalPrice: Number,
      availability: { type: Number, default: 0 },
      baggage: {
        included: { type: Number, default: 2 },
        additional: { price: Number, weight: Number }
      }
    }
  },
  services: {
    meals: [{ class: String, type: String, description: String }],
    entertainment: [String],
    wifi: { available: Boolean, price: Number },
    powerOutlets: Boolean,
    seatSelection: { free: Boolean, price: Number }
  },
  policies: {
    cancellation: {
      allowed: Boolean,
      fee: Number,
      timeLimit: Number // hours before departure
    },
    modification: {
      allowed: Boolean,
      fee: Number,
      timeLimit: Number
    },
    refund: {
      allowed: Boolean,
      percentage: Number,
      timeLimit: Number
    }
  },
  status: { 
    type: String, 
    enum: ['scheduled', 'delayed', 'cancelled', 'boarding', 'departed', 'arrived'], 
    default: 'scheduled' 
  },
  operatingDays: [{ type: Number, min: 0, max: 6 }], // 0=Sunday, 6=Saturday
  validFrom: Date,
  validTo: Date,
  tags: [String],
  stats: {
    bookings: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Indexes for efficient searching
flightSchema.index({ 'route.departure.airport': 1, 'route.arrival.airport': 1, 'route.departure.scheduledTime': 1 });
flightSchema.index({ airline: 1, status: 1 });
flightSchema.index({ flightNumber: 1, 'route.departure.scheduledTime': 1 });
flightSchema.index({ 'pricing.economy.totalPrice': 1 });
flightSchema.index({ validFrom: 1, validTo: 1 });
flightSchema.index({ operatingDays: 1 });
flightSchema.index({ tags: 1 });

// Text search index
flightSchema.index({ 
  flightNumber: 'text',
  'route.departure.airport': 'text',
  'route.arrival.airport': 'text'
});

module.exports = mongoose.model('Flight', flightSchema);