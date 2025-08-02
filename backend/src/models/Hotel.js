import { Schema, model } from 'mongoose';

const hotelSchema = new Schema({
  name: { type: String, required: true, index: true },
  description: { type: String, required: true },
  shortDescription: { type: String, maxlength: 300 },
  starRating: { type: Number, min: 1, max: 5, required: true },
  
  location: {
    destination: { type: Schema.Types.ObjectId, ref: 'Destination' },
    city: { type: Schema.Types.ObjectId, ref: 'City', required: true },
    country: { type: Schema.Types.ObjectId, ref: 'Country', required: true },
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
    nearbyAttractions: [{
      name: String,
      distance: Number,
      type: String
    }]
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
    images: [String],
    pricing: {
      baseRate: { type: Number, required: true },
      currency: { type: String, default: 'USD' },
      taxes: { type: Number, default: 0 },
      fees: { type: Number, default: 0 },
      totalRate: { type: Number, required: true },
      cancellationPolicy: {
        type: { type: String, enum: ['free', 'partial', 'non-refundable'] },
        deadline: Number, // hours before check-in
        fee: Number
      }
    },
    availability: { type: Number, default: 0 },
    totalRooms: { type: Number, required: true }
  }],
  
  amenities: {
    general: [String],
    business: [String],
    connectivity: [String],
    food: [String],
    recreation: [String],
    services: [String],
    accessibility: [String]
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
  
  images: {
    hero: String,
    gallery: [String],
    roomImages: [{
      roomType: String,
      images: [String]
    }]
  },
  
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
    priceRange: {
      min: Number,
      max: Number,
      currency: String
    },
    averageNightlyRate: Number
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
  
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Generate slug from name
hotelSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.seo.slug) {
    this.seo.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
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

export default model('Hotel', hotelSchema);