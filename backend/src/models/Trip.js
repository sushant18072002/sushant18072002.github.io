const mongoose = require('mongoose');
const crypto = require('crypto');

const tripSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  description: String,
  
  // Location Information
  primaryDestination: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
  destinations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'City' }],
  countries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Country' }],
  
  // Basic Information
  duration: {
    days: { type: Number, required: true },
    nights: { type: Number, required: true }
  },
  
  // Trip Classification
  type: { 
    type: String, 
    enum: ['featured', 'ai-generated', 'custom', 'user-created'], 
    default: 'featured' 
  },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  tags: [String],
  highlights: [String],
  includes: [String],
  excludes: [String],
  travelStyle: { 
    type: String, 
    enum: ['adventure', 'luxury', 'cultural', 'relaxed', 'business'] 
  },
  difficulty: { 
    type: String, 
    enum: ['easy', 'moderate', 'challenging'] 
  },
  
  // Target Audience
  suitableFor: {
    couples: { type: Boolean, default: false },
    families: { type: Boolean, default: false },
    soloTravelers: { type: Boolean, default: false },
    groups: { type: Boolean, default: false }
  },
  
  // Group Size Constraints
  groupSize: {
    min: { type: Number, default: 1 },
    max: { type: Number, default: 20 },
    recommended: { type: Number, default: 4 }
  },
  
  // Physical Requirements
  physicalRequirements: {
    fitnessLevel: { type: String, enum: ['low', 'moderate', 'high'], default: 'low' },
    walkingDistance: Number, // km per day
    altitude: Number, // meters
    specialNeeds: [String]
  },
  
  // Pricing Information
  pricing: {
    currency: { type: String, default: 'USD' },
    basePrice: Number, // Cost price
    sellPrice: Number, // Selling price to customers
    discountPercent: { type: Number, default: 0 }, // Discount percentage
    discountAmount: { type: Number, default: 0 }, // Fixed discount amount
    finalPrice: Number, // Final price after discount
    estimated: Number, // Legacy field for compatibility
    breakdown: {
      flights: { type: Number, default: 0 },
      accommodation: { type: Number, default: 0 },
      activities: { type: Number, default: 0 },
      food: { type: Number, default: 0 },
      transport: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    },
    priceRange: { 
      type: String, 
      enum: ['budget', 'mid-range', 'luxury'] 
    },
    profitMargin: Number, // Profit margin percentage
    taxIncluded: { type: Boolean, default: true }
  },
  
  // Day-by-day Itinerary
  itinerary: [{
    day: { type: Number, required: true },
    title: String,
    description: String,
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
    locationName: String, // For custom location names
    activities: [{
      // Reference to master activity (if using template)
      activityRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity' },
      
      // Custom activity details (if not using template)
      time: String,
      title: String,
      description: String,
      type: { 
        type: String, 
        enum: ['transport', 'activity', 'meal', 'accommodation', 'free-time', 'sightseeing', 'adventure', 'cultural', 'food', 'shopping', 'entertainment', 'wellness'] 
      },
      duration: Number,
      location: String,
      
      // Pricing (can override master activity pricing)
      estimatedCost: {
        currency: String,
        amount: Number,
        perPerson: { type: Boolean, default: true }
      },
      
      // Trip-specific settings
      included: { type: Boolean, default: true },
      optional: { type: Boolean, default: false },
      customNotes: String,
      alternatives: [String],
      
      // Booking details
      bookingRequired: { type: Boolean, default: false },
      bookingDeadline: Number, // days before trip
      capacity: Number,
      
      // Custom overrides
      customTitle: String, // Override activity name for this trip
      customDescription: String, // Override description
      customDuration: Number, // Override duration
      customPrice: Number // Override price
    }],
    estimatedCost: {
      currency: String,
      amount: Number
    },
    tips: [String]
  }],
  
  // Customization Settings
  customizable: {
    duration: { type: Boolean, default: true },
    activities: { type: Boolean, default: true },
    accommodation: { type: Boolean, default: true },
    dates: { type: Boolean, default: true },
    groupSize: { type: Boolean, default: true }
  },
  
  // Included Services
  includedServices: {
    flights: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Flight' }],
    hotels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' }],
    activities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }],
    transport: [String],
    meals: [String],
    guides: { type: Boolean, default: false }
  },
  
  // Travel Information
  travelInfo: {
    bestTimeToVisit: {
      months: [String],
      weather: String,
      temperature: { min: Number, max: Number },
      rainfall: String
    },
    visaRequirements: {
      required: { type: Boolean, default: false },
      countries: [String],
      processingTime: String,
      cost: Number
    },
    healthRequirements: {
      vaccinations: [String],
      healthInsurance: { type: Boolean, default: false },
      medicalFacilities: String
    },
    safetyInformation: {
      level: { type: String, enum: ['low', 'moderate', 'high'], default: 'low' },
      warnings: [String],
      emergencyContacts: [String]
    },
    localCulture: {
      language: [String],
      currency: String,
      customs: [String],
      etiquette: [String]
    },
    packingList: {
      essentials: [String],
      clothing: [String],
      equipment: [String],
      optional: [String]
    }
  },
  
  // Booking Information
  bookingInfo: {
    instantBook: { type: Boolean, default: false },
    requiresApproval: { type: Boolean, default: true },
    advanceBooking: { type: Number, default: 7 },
    cancellationPolicy: String,
    paymentTerms: String,
    depositRequired: { type: Number, default: 50 }, // percentage
    finalPaymentDue: { type: Number, default: 30 } // days before departure
  },
  
  // Availability (for featured trips)
  availability: {
    startDates: [Date],
    maxBookings: { type: Number, default: 20 },
    currentBookings: [{
      date: Date,
      booked: { type: Number, default: 0 }
    }],
    seasonal: { type: Boolean, default: false },
    blackoutDates: [Date]
  },
  
  // Media & Content
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
  }],
  
  // Social & Sharing
  sharing: {
    isPublic: { type: Boolean, default: true },
    shareCode: { type: String, unique: true, sparse: true },
    allowCopy: { type: Boolean, default: true },
    allowComments: { type: Boolean, default: true }
  },
  
  // Statistics
  stats: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    copies: { type: Number, default: 0 },
    bookings: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 }
  },
  
  // AI Generation (if applicable)
  aiGeneration: {
    prompt: String,
    model: String,
    generatedAt: Date,
    confidence: Number,
    userFeedback: String
  },
  
  // Metadata
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  template: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  quickAccess: { type: Boolean, default: false },
  priority: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived'], 
    default: 'draft' 
  }
}, { timestamps: true });

// Generate slug from title
tripSchema.pre('save', function(next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substr(2, 5);
  }
  
  // Generate share code if public
  if (this.sharing.isPublic && !this.sharing.shareCode) {
    this.sharing.shareCode = crypto.randomBytes(5).toString('hex').toUpperCase();
  }
  
  next();
});

// Calculate total estimated price
tripSchema.virtual('totalEstimatedPrice').get(function() {
  if (!this.pricing.breakdown) return this.pricing.estimated || 0;
  
  const breakdown = this.pricing.breakdown;
  return (breakdown.flights || 0) + 
         (breakdown.accommodation || 0) + 
         (breakdown.activities || 0) + 
         (breakdown.food || 0) + 
         (breakdown.transport || 0) + 
         (breakdown.other || 0);
});

// Indexes for performance
tripSchema.index({ status: 1, featured: -1 });
tripSchema.index({ primaryDestination: 1 });
tripSchema.index({ category: 1 });
tripSchema.index({ type: 1 });
tripSchema.index({ 'sharing.shareCode': 1 });
tripSchema.index({ slug: 1 });

module.exports = mongoose.model('Trip', tripSchema);