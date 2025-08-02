const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['ai-generated', 'template', 'custom'], default: 'custom' },
  
  destination: {
    primary: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true },
    secondary: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destination' }],
    countries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Country' }],
    cities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'City' }]
  },
  
  duration: {
    days: { type: Number, required: true },
    nights: { type: Number, required: true }
  },
  
  dates: {
    startDate: Date,
    endDate: Date,
    flexible: { type: Boolean, default: false }
  },
  
  travelers: {
    adults: { type: Number, default: 1 },
    children: { type: Number, default: 0 },
    infants: { type: Number, default: 0 },
    total: { type: Number, required: true }
  },
  
  budget: {
    total: Number,
    perPerson: Number,
    currency: { type: String, default: 'USD' },
    range: { type: String, enum: ['budget', 'mid-range', 'luxury'] },
    breakdown: {
      accommodation: Number,
      food: Number,
      activities: Number,
      transport: Number,
      shopping: Number,
      other: Number
    }
  },
  
  preferences: {
    travelStyle: { type: String, enum: ['adventure', 'cultural', 'relaxed', 'luxury', 'business'] },
    interests: [String],
    accommodation: { type: String, enum: ['hotel', 'hostel', 'apartment', 'resort', 'any'] },
    transport: [String],
    dietary: [String],
    accessibility: [String]
  },
  
  days: [{
    day: { type: Number, required: true },
    date: Date,
    theme: String,
    location: {
      city: String,
      coordinates: [Number]
    },
    activities: [{
      id: String,
      type: { type: String, enum: ['activity', 'meal', 'transport', 'accommodation', 'free-time'] },
      title: { type: String, required: true },
      description: String,
      startTime: String,
      endTime: String,
      duration: Number, // minutes
      cost: {
        amount: Number,
        currency: String,
        perPerson: Boolean
      },
      location: {
        name: String,
        address: String,
        coordinates: [Number]
      },
      booking: {
        required: Boolean,
        url: String,
        phone: String,
        notes: String
      },
      tags: [String],
      rating: Number,
      images: [String]
    }],
    estimatedCost: Number,
    notes: String,
    tips: [String]
  }],
  
  recommendations: {
    accommodation: [{
      name: String,
      type: String,
      priceRange: String,
      rating: Number,
      reason: String
    }],
    restaurants: [{
      name: String,
      cuisine: String,
      priceRange: String,
      rating: Number
    }],
    activities: [{
      name: String,
      type: String,
      duration: Number,
      cost: Number
    }],
    transportation: [String],
    packing: [String],
    tips: [String]
  },
  
  aiGeneration: {
    prompt: String,
    model: String,
    generatedAt: Date,
    customizations: [{
      type: String,
      original: String,
      modified: String,
      modifiedAt: Date
    }]
  },
  
  status: { type: String, enum: ['draft', 'published', 'archived', 'booked'], default: 'draft' },
  
  sharing: {
    isPublic: { type: Boolean, default: false },
    shareCode: { type: String, unique: true, sparse: true },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    allowComments: { type: Boolean, default: false },
    allowCopy: { type: Boolean, default: true }
  },
  
  stats: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    copies: { type: Number, default: 0 },
    bookings: { type: Number, default: 0 }
  },
  
  tags: [String],
  images: [String],
  
  bookingInfo: {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    bookedAt: Date,
    totalCost: Number
  }
}, { timestamps: true });

// Generate share code
itinerarySchema.pre('save', function(next) {
  if (this.sharing.isPublic && !this.sharing.shareCode) {
    this.sharing.shareCode = Math.random().toString(36).substr(2, 10).toUpperCase();
  }
  next();
});

// Indexes
itinerarySchema.index({ user: 1, createdAt: -1 });
itinerarySchema.index({ 'destination.primary': 1 });
itinerarySchema.index({ 'sharing.shareCode': 1 });
itinerarySchema.index({ status: 1, 'sharing.isPublic': 1 });
itinerarySchema.index({ tags: 1 });
itinerarySchema.index({ 'preferences.travelStyle': 1 });

module.exports = mongoose.model('Itinerary', itinerarySchema);