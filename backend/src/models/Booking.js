const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingReference: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['flight', 'hotel', 'package', 'activity', 'combo'], required: true },
  status: { 
    type: String, 
    enum: ['draft', 'pending', 'confirmed', 'completed', 'cancelled', 'refunded'], 
    default: 'draft' 
  },
  
  // Simplified flight booking
  flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight' },
  selectedClass: { type: String, enum: ['economy', 'premiumEconomy', 'business', 'first'] },
  bookingOption: { type: String, enum: ['flight', 'package'] },
  addOns: {
    seatUpgrade: { type: Boolean, default: false },
    insurance: { type: Boolean, default: false }
  },
  passengers: [{
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    dateOfBirth: Date,
    passportNumber: String
  }],
  contactInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String
  },
  pricing: {
    basePrice: Number,
    addOns: {
      seatUpgrade: { type: Number, default: 0 },
      insurance: { type: Number, default: 0 },
      hotelPackage: { type: Number, default: 0 }
    },
    total: Number
  },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  paymentMethod: String,

  
  // Booking metadata
  source: { type: String, enum: ['web', 'mobile', 'api', 'admin'], default: 'web' },
  notes: String,
  
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