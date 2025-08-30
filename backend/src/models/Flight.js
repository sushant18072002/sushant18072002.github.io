const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  flightNumber: { type: String, required: true, index: true },
  airline: { type: mongoose.Schema.Types.ObjectId, ref: 'Airline', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  flightCategory: { type: String, enum: ['domestic', 'international', 'charter'], default: 'domestic' },
  flightType: { type: String, enum: ['direct', 'connecting', 'codeshare'], default: 'direct' },
  featured: { type: Boolean, default: false },
  aircraft: {
    type: { type: String },
    model: { type: String },
    registration: { type: String },
    configuration: {
      economy: Number,
      premiumEconomy: Number,
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
  distance: { type: Number }, // kilometers
  layovers: [{
    airport: { type: mongoose.Schema.Types.ObjectId, ref: 'Airport' },
    duration: Number, // minutes
    terminal: String
  }],
  images: [{
    url: String,
    alt: String,
    category: { type: String, enum: ['aircraft', 'cabin', 'meal', 'seat-map', 'amenity', 'other'], default: 'aircraft' },
    isPrimary: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
  }],
  pricing: {
    economy: {
      fareClass: { type: String, default: 'Y' },
      basePrice: { type: Number, required: true },
      taxes: { type: Number, default: 0 },
      fees: { type: Number, default: 0 },
      totalPrice: { type: Number, required: true },
      availability: { type: Number, default: 0 },
      baggage: {
        included: { type: Number, default: 0 },
        additional: { price: Number, weight: Number }
      },
      restrictions: {
        refundable: { type: Boolean, default: false },
        changeable: { type: Boolean, default: true },
        changeFee: { type: Number, default: 0 }
      }
    },
    premiumEconomy: {
      fareClass: { type: String, default: 'W' },
      basePrice: Number,
      taxes: { type: Number, default: 0 },
      fees: { type: Number, default: 0 },
      totalPrice: Number,
      availability: { type: Number, default: 0 },
      baggage: {
        included: { type: Number, default: 1 },
        additional: { price: Number, weight: Number }
      },
      restrictions: {
        refundable: { type: Boolean, default: true },
        changeable: { type: Boolean, default: true },
        changeFee: { type: Number, default: 0 }
      }
    },
    business: {
      fareClass: { type: String, default: 'C' },
      basePrice: Number,
      taxes: { type: Number, default: 0 },
      fees: { type: Number, default: 0 },
      totalPrice: Number,
      availability: { type: Number, default: 0 },
      baggage: {
        included: { type: Number, default: 2 },
        additional: { price: Number, weight: Number }
      },
      restrictions: {
        refundable: { type: Boolean, default: true },
        changeable: { type: Boolean, default: true },
        changeFee: { type: Number, default: 0 }
      }
    },
    first: {
      fareClass: { type: String, default: 'F' },
      basePrice: Number,
      taxes: { type: Number, default: 0 },
      fees: { type: Number, default: 0 },
      totalPrice: Number,
      availability: { type: Number, default: 0 },
      baggage: {
        included: { type: Number, default: 3 },
        additional: { price: Number, weight: Number }
      },
      restrictions: {
        refundable: { type: Boolean, default: true },
        changeable: { type: Boolean, default: true },
        changeFee: { type: Number, default: 0 }
      }
    }
  },
  services: {
    meals: [{ 
      class: { type: String, enum: ['economy', 'premium-economy', 'business', 'first'] },
      type: String, 
      description: String,
      included: { type: Boolean, default: true },
      price: Number
    }],
    entertainment: [{
      type: { type: String, enum: ['movies', 'tv', 'music', 'games', 'reading'] },
      description: String,
      available: { type: Boolean, default: true }
    }],
    wifi: { 
      available: Boolean, 
      price: Number,
      speed: String,
      coverage: { type: String, enum: ['full', 'partial'] }
    },
    powerOutlets: {
      available: Boolean,
      type: { type: String, enum: ['AC', 'USB', 'both'] },
      location: String
    },
    seatSelection: { 
      free: Boolean, 
      price: Number,
      advanceBooking: { type: Boolean, default: true }
    },
    baggage: {
      carryOn: {
        included: { type: Boolean, default: true },
        weight: Number,
        dimensions: String
      },
      checked: {
        included: Number,
        additionalFee: Number,
        maxWeight: Number
      }
    }
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
  seo: {
    slug: String,
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
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