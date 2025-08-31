const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  chain: { type: String }, // Hotel chain/brand
  category: { type: String, enum: ['luxury', 'business', 'boutique', 'resort', 'budget', 'extended-stay'] },
  hotelCategory: { type: String, enum: ['luxury', 'business', 'boutique', 'resort', 'budget', 'extended-stay'] },
  description: { type: String, required: true },
  shortDescription: { type: String, maxlength: 300 },
  starRating: { type: Number, min: 1, max: 5, required: true },
  
  location: {
    destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination' },
    city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
    country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },
    cityName: String,
    countryName: String,
    address: {
      street: { type: String, required: true },
      area: String,
      landmark: String,
      zipCode: String
    },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true } // [longitude, latitude]
    },
    distanceFromCenter: Number, // km
    nearbyAttractions: [
      mongoose.Schema.Types.Mixed // Allow both strings and objects
    ]
  },
  
  contact: {
    phone: String,
    email: String,
    website: String,
    checkIn: { type: String, default: '15:00' },
    checkOut: { type: String, default: '11:00' }
  },
  
  rooms: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['standard', 'deluxe', 'suite', 'villa', 'apartment'], required: true },
    size: Number, // square meters
    maxOccupancy: { type: Number, required: true },
    bedConfiguration: {
      singleBeds: { type: Number, default: 0 },
      doubleBeds: { type: Number, default: 0 },
      queenBeds: { type: Number, default: 0 },
      kingBeds: { type: Number, default: 0 }
    },
    amenities: [String],
    images: [{
      url: String,
      alt: String,
      isPrimary: { type: Boolean, default: false },
      order: { type: Number, default: 0 }
    }],
    pricing: {
      baseRate: { type: Number, required: true },
      currency: { type: String, default: 'USD' },
      currencySymbol: { type: String, default: '$' },
      taxes: { type: Number, default: 0 },
      fees: { type: Number, default: 0 },
      totalRate: { type: Number, required: true },
      cancellationPolicy: {
        type: { type: String, enum: ['free', 'partial', 'non-refundable'] },
        deadline: Number, // hours before check-in
        fee: Number
      }
    },
    availability: [{
      date: Date,
      available: Number,
      rate: Number
    }],
    totalRooms: { type: Number, required: true }
  }],
  
  amenities: {
    general: [mongoose.Schema.Types.Mixed], // Allow both strings and objects
    business: [mongoose.Schema.Types.Mixed],
    recreation: [mongoose.Schema.Types.Mixed],
    food: [mongoose.Schema.Types.Mixed],
    connectivity: [mongoose.Schema.Types.Mixed],
    services: [mongoose.Schema.Types.Mixed],
    accessibility: [mongoose.Schema.Types.Mixed]
  },
  
  policies: {
    checkIn: {
      from: String,
      to: String,
      minAge: Number
    },
    checkOut: {
      from: String,
      to: String
    },
    cancellation: {
      type: String,
      description: String
    },
    children: {
      allowed: Boolean,
      freeAge: Number,
      extraBedFee: Number
    },
    pets: {
      allowed: Boolean,
      fee: Number,
      restrictions: String
    },
    smoking: {
      allowed: Boolean,
      areas: [String]
    }
  },
  
  images: [{
    url: String,
    alt: String,
    category: { type: String, enum: ['exterior', 'lobby', 'room', 'amenity', 'dining', 'other'], default: 'other' },
    isPrimary: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
  }],
  
  rating: {
    overall: { type: Number, default: 0, min: 0, max: 5 },
    breakdown: {
      cleanliness: { type: Number, default: 0 },
      comfort: { type: Number, default: 0 },
      location: { type: Number, default: 0 },
      service: { type: Number, default: 0 },
      value: { type: Number, default: 0 },
      facilities: { type: Number, default: 0 }
    },
    reviewCount: { type: Number, default: 0 }
  },
  
  pricing: {
    currency: { type: String, default: 'USD', required: true },
    currencySymbol: { type: String, default: '$' },
    priceRange: {
      min: Number,
      max: Number
    },
    averageNightlyRate: Number,
    ratePlans: [{
      name: String,
      description: String,
      baseRate: Number,
      currency: { type: String, default: 'USD' },
      currencySymbol: { type: String, default: '$' },
      inclusions: [String],
      cancellationPolicy: String,
      prepayment: { type: Boolean, default: false }
    }]
  },
  
  tags: [String],
  featured: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  
  stats: {
    views: { type: Number, default: 0 },
    bookings: { type: Number, default: 0 },
    favorites: { type: Number, default: 0 }
  },
  
  status: { type: String, enum: ['active', 'inactive', 'maintenance'], default: 'active' },
  
  seo: {
    slug: String,
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Generate slug from name and set currency symbols
hotelSchema.pre('save', function(next) {
  const { getCurrencySymbol } = require('../utils/currency');
  
  // Generate slug
  if (this.isModified('name')) {
    if (!this.seo) {
      this.seo = {};
    }
    if (!this.seo.slug) {
      this.seo.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
  }
  
  // Set currency symbols automatically
  if (this.pricing && this.pricing.currency) {
    this.pricing.currencySymbol = getCurrencySymbol(this.pricing.currency);
  }
  
  // Set currency symbols for rooms
  if (this.rooms && Array.isArray(this.rooms)) {
    this.rooms.forEach(room => {
      if (room.pricing && room.pricing.currency) {
        room.pricing.currencySymbol = getCurrencySymbol(room.pricing.currency);
      }
    });
  }
  
  // Set currency symbols for rate plans
  if (this.pricing && this.pricing.ratePlans && Array.isArray(this.pricing.ratePlans)) {
    this.pricing.ratePlans.forEach(plan => {
      if (plan.currency) {
        plan.currencySymbol = getCurrencySymbol(plan.currency);
      }
    });
  }
  
  next();
});

// Indexes for efficient searching
hotelSchema.index({ 'location.coordinates': '2dsphere' });
hotelSchema.index({ 'location.city': 1, status: 1 });
hotelSchema.index({ 'location.country': 1 });
hotelSchema.index({ starRating: 1, 'rating.overall': -1 });
hotelSchema.index({ 'pricing.priceRange.min': 1, 'pricing.priceRange.max': 1 });
hotelSchema.index({ featured: 1, 'rating.overall': -1 });
hotelSchema.index({ tags: 1 });
hotelSchema.index({ 'seo.slug': 1 });

// Text search index
hotelSchema.index({ 
  name: 'text',
  description: 'text',
  'location.address.area': 'text',
  tags: 'text'
});

module.exports = mongoose.model('Hotel', hotelSchema);