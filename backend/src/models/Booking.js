const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingReference: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['flight', 'hotel', 'package', 'activity', 'combo'], required: true },
  status: { 
    type: String, 
    enum: ['draft', 'pending', 'confirmed', 'completed', 'cancelled', 'refunded'], 
    default: 'draft' 
  },
  
  // Flight booking details
  flight: {
    flightId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight' },
    passengers: [{
      type: { type: String, enum: ['adult', 'child', 'infant'] },
      title: String,
      firstName: String,
      lastName: String,
      dateOfBirth: Date,
      passportNumber: String,
      nationality: String,
      seatPreference: String,
      mealPreference: String
    }],
    class: { type: String, enum: ['economy', 'business', 'first'] },
    seats: [String],
    baggage: {
      checkedBags: Number,
      carryOnBags: Number,
      extraWeight: Number
    }
  },
  
  // Hotel booking details
  hotel: {
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
    checkIn: Date,
    checkOut: Date,
    nights: Number,
    rooms: [{
      roomType: String,
      roomId: String,
      guests: Number,
      guestNames: [String],
      specialRequests: String
    }],
    totalGuests: {
      adults: Number,
      children: Number,
      infants: Number
    }
  },
  
  // Package booking details
  package: {
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
    startDate: Date,
    endDate: Date,
    duration: Number,
    travelers: Number,
    customizations: [{
      type: String,
      description: String,
      price: Number
    }]
  },
  
  // Activity booking details
  activity: {
    activityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity' },
    date: Date,
    timeSlot: String,
    participants: Number,
    participantDetails: [{
      name: String,
      age: Number,
      requirements: String
    }]
  },
  
  // Pricing breakdown
  pricing: {
    baseAmount: { type: Number, required: true },
    taxes: { type: Number, default: 0 },
    fees: { type: Number, default: 0 },
    discounts: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    breakdown: [{
      description: String,
      amount: Number,
      type: { type: String, enum: ['base', 'tax', 'fee', 'discount', 'addon'] }
    }]
  },
  
  // Payment information
  payment: {
    method: { type: String, enum: ['card', 'paypal', 'bank_transfer', 'wallet'] },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed', 'refunded'], default: 'pending' },
    transactionId: String,
    paymentIntentId: String,
    paidAmount: { type: Number, default: 0 },
    refundAmount: { type: Number, default: 0 },
    paymentDate: Date,
    refundDate: Date
  },
  
  // Contact and traveler information
  contact: {
    email: { type: String, required: true },
    phone: { type: String, required: true },
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    }
  },
  
  // Booking metadata
  source: { type: String, enum: ['web', 'mobile', 'api', 'admin'], default: 'web' },
  notes: String,
  adminNotes: String,
  cancellationReason: String,
  cancellationDate: Date,
  
  // Timestamps and tracking
  confirmedAt: Date,
  completedAt: Date,
  expiresAt: Date,
  
  // System fields
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Generate booking reference
bookingSchema.pre('save', function(next) {
  if (!this.bookingReference) {
    this.bookingReference = 'BK' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

// Indexes
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ bookingReference: 1 });
bookingSchema.index({ status: 1, type: 1 });
bookingSchema.index({ 'payment.status': 1 });
bookingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Booking', bookingSchema);