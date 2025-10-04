const mongoose = require('mongoose');

const tripBookingSchema = new mongoose.Schema({
  // Reference and identification
  bookingReference: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'TripAppointment' },

  // Trip information
  trip: {
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
    title: { type: String, required: true },
    destination: { type: String, required: true },
    duration: {
      days: { type: Number, required: true },
      nights: { type: Number, required: true }
    },
    startDate: Date,
    endDate: Date,
    category: String,
    difficulty: String
  },

  // Customer information
  customer: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },

  // Travelers information
  travelers: {
    count: { type: Number, required: true, min: 1 },
    adults: { type: Number, default: 1 },
    children: { type: Number, default: 0 },
    infants: { type: Number, default: 0 },
    details: [{
      type: { type: String, enum: ['adult', 'child', 'infant'] },
      firstName: String,
      lastName: String,
      dateOfBirth: Date,
      passportNumber: String,
      nationality: String,
      dietaryRequirements: String,
      medicalConditions: String
    }]
  },

  // Booking status workflow
  status: {
    type: String,
    enum: [
      'draft',              // Initial booking creation
      'pending-payment',    // Waiting for payment
      'payment-received',   // Payment received, processing
      'confirmed',          // Booking confirmed
      'documents-sent',     // Travel documents sent
      'in-progress',        // Trip is happening
      'completed',          // Trip completed
      'cancelled',          // Cancelled before trip
      'refunded',          // Refund processed
      'no-show'            // Customer didn't show up
    ],
    default: 'draft'
  },

  // Pricing breakdown
  pricing: {
    basePrice: { type: Number, required: true },
    pricePerPerson: Number,
    totalTravelers: Number,
    
    // Additional costs
    addOns: [{
      name: String,
      description: String,
      price: Number,
      quantity: { type: Number, default: 1 }
    }],
    
    // Customizations from consultation
    customizations: [{
      type: String,
      description: String,
      price: Number
    }],

    // Discounts
    discounts: [{
      type: { type: String, enum: ['percentage', 'fixed', 'promotional'] },
      amount: Number,
      percentage: Number,
      code: String,
      description: String
    }],

    // Totals
    subtotal: Number,
    taxes: Number,
    fees: Number,
    totalDiscount: Number,
    finalAmount: { type: Number, required: true },
    currency: { type: String, default: 'USD' }
  },

  // Payment information
  payment: {
    method: { 
      type: String, 
      enum: ['bank-transfer', 'credit-card', 'cash', 'cheque', 'upi', 'wallet', 'installments'],
      default: 'bank-transfer'
    },
    status: {
      type: String,
      enum: ['pending', 'partial', 'completed', 'failed', 'refunded', 'cancelled'],
      default: 'pending'
    },
    
    // Payment schedule for installments
    schedule: [{
      dueDate: Date,
      amount: Number,
      description: String,
      status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' },
      paidDate: Date,
      paymentMethod: String,
      transactionId: String,
      notes: String
    }],

    // Payment history
    transactions: [{
      transactionId: String,
      amount: Number,
      method: String,
      status: String,
      processedAt: Date,
      processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      notes: String,
      receiptUrl: String
    }],

    totalPaid: { type: Number, default: 0 },

    paymentDeadline: Date,
    refundAmount: { type: Number, default: 0 }
  },

  // Booking customizations and preferences
  preferences: {
    accommodation: {
      type: { type: String, enum: ['standard', 'deluxe', 'luxury', 'budget'] },
      roomType: { type: String, enum: ['single', 'double', 'twin', 'suite'] },
      specialRequests: String
    },
    transportation: {
      type: { type: String, enum: ['economy', 'premium', 'luxury'] },
      preferences: String
    },
    meals: {
      plan: { type: String, enum: ['none', 'breakfast', 'half-board', 'full-board', 'all-inclusive'] },
      dietaryRequirements: [String],
      allergies: [String]
    },
    activities: {
      included: [String],
      optional: [String],
      excluded: [String]
    }
  },

  // Documents and communication
  documents: [{
    type: { type: String, enum: ['itinerary', 'voucher', 'invoice', 'receipt', 'passport-copy', 'visa', 'insurance'] },
    name: String,
    url: String,
    uploadedAt: Date,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],

  communications: [{
    type: { type: String, enum: ['email', 'sms', 'call', 'whatsapp'] },
    direction: { type: String, enum: ['inbound', 'outbound'] },
    subject: String,
    content: String,
    timestamp: { type: Date, default: Date.now },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['sent', 'delivered', 'read', 'failed'] }
  }],

  // Admin and agent information
  management: {
    assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    tags: [String],
    internalNotes: String
  },

  // Cancellation information
  cancellation: {
    reason: String,
    requestedAt: Date,
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    refundPolicy: String,
    refundAmount: Number,
    cancellationFee: Number
  },

  // System metadata
  source: { type: String, enum: ['website', 'mobile-app', 'admin', 'api', 'phone'], default: 'website' },
  metadata: {
    userAgent: String,
    ipAddress: String,
    referrer: String,
    conversionSource: String
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
tripBookingSchema.index({ user: 1, createdAt: -1 });
tripBookingSchema.index({ bookingReference: 1 });
tripBookingSchema.index({ status: 1 });
tripBookingSchema.index({ 'trip.startDate': 1 });
tripBookingSchema.index({ 'payment.status': 1 });
tripBookingSchema.index({ 'management.assignedAgent': 1 });

// Virtuals
tripBookingSchema.virtual('customer.fullName').get(function() {
  return `${this.customer.firstName} ${this.customer.lastName}`;
});

tripBookingSchema.virtual('payment.balance').get(function() {
  return this.pricing.finalAmount - (this.payment.totalPaid || 0);
});

// Pre-save middleware
tripBookingSchema.pre('save', function(next) {
  if (!this.bookingReference) {
    this.bookingReference = `TRV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  

  
  next();
});

// Methods
tripBookingSchema.methods.addPayment = function(amount, method, transactionId, processedBy) {
  this.payment.transactions.push({
    transactionId,
    amount,
    method,
    status: 'completed',
    processedAt: new Date(),
    processedBy
  });
  
  this.payment.totalPaid += amount;
  
  if (this.payment.totalPaid >= this.pricing.finalAmount) {
    this.payment.status = 'completed';
    this.status = 'confirmed';
  } else {
    this.payment.status = 'partial';
  }
  
  return this.save();
};

tripBookingSchema.methods.cancel = function(reason, requestedBy) {
  this.status = 'cancelled';
  this.cancellation = {
    reason,
    requestedAt: new Date(),
    requestedBy
  };
  return this.save();
};

// Statics
tripBookingSchema.statics.getBookingStats = async function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$pricing.finalAmount' }
      }
    }
  ]);
};

module.exports = mongoose.model('TripBooking', tripBookingSchema);