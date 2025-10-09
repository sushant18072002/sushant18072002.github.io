const mongoose = require('mongoose');

const corporateBookingSchema = new mongoose.Schema({
  // Reference and identification
  bookingReference: { type: String, unique: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Booking type and details
  type: { 
    type: String, 
    enum: ['flight', 'hotel', 'package', 'trip', 'multi-city', 'group'], 
    required: true 
  },
  
  // Corporate-specific fields
  corporate: {
    department: { type: String, required: true },
    project: String,
    costCenter: String,
    purpose: { 
      type: String, 
      enum: ['business-meeting', 'conference', 'training', 'client-visit', 'team-building', 'other'],
      required: true 
    },
    purposeDescription: String,
    
    // Approval workflow
    approval: {
      required: { type: Boolean, default: true },
      status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected', 'auto-approved'], 
        default: 'pending' 
      },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      approvedAt: Date,
      rejectionReason: String,
      approvalNotes: String
    },

    // Budget tracking
    budget: {
      allocated: Number,
      spent: Number,
      remaining: Number,
      budgetCode: String,
      exceedsLimit: { type: Boolean, default: false }
    }
  },

  // Travelers (can be multiple for corporate bookings)
  travelers: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    employee: {
      employeeId: String,
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phone: String,
      department: String,
      designation: String
    },
    travelDetails: {
      passportNumber: String,
      passportExpiry: Date,
      visaRequired: Boolean,
      dietaryRequirements: String,
      specialRequests: String
    },
    isPrimary: { type: Boolean, default: false }
  }],

  // Booking details based on type
  bookingDetails: {
    // Flight booking
    flight: {
      flightId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight' },
      route: {
        from: String,
        to: String,
        departure: Date,
        return: Date,
        isRoundTrip: Boolean
      },
      class: { type: String, enum: ['economy', 'premium-economy', 'business', 'first'] },
      passengers: Number
    },

    // Hotel booking
    hotel: {
      hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
      checkIn: Date,
      checkOut: Date,
      nights: Number,
      rooms: [{
        type: String,
        count: Number,
        occupancy: Number
      }],
      specialRequests: String
    },

    // Trip/Package booking
    trip: {
      tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
      startDate: Date,
      endDate: Date,
      customizations: mongoose.Schema.Types.Mixed
    }
  },

  // Pricing with corporate rates
  pricing: {
    basePrice: { type: Number, required: true },
    corporateDiscount: {
      type: { type: String, enum: ['percentage', 'fixed'] },
      value: Number,
      amount: Number
    },
    taxes: Number,
    fees: Number,
    total: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    
    // Cost breakdown per traveler
    perTraveler: [{
      travelerId: mongoose.Schema.Types.ObjectId,
      basePrice: Number,
      discount: Number,
      total: Number
    }]
  },

  // Payment and billing
  payment: {
    method: { 
      type: String, 
      enum: ['corporate-card', 'invoice', 'advance', 'reimbursement'],
      default: 'corporate-card'
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    billingAddress: {
      company: String,
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    invoiceRequired: { type: Boolean, default: true },
    invoiceDetails: {
      invoiceNumber: String,
      issueDate: Date,
      dueDate: Date,
      gstNumber: String,
      poNumber: String
    }
  },

  // Booking status
  status: {
    type: String,
    enum: [
      'draft',
      'pending-approval', 
      'approved',
      'rejected',
      'confirmed',
      'in-progress',
      'completed',
      'cancelled',
      'refunded'
    ],
    default: 'draft'
  },

  // Travel dates and timeline
  travelDates: {
    departure: Date,
    return: Date,
    duration: Number // days
  },

  // Policy compliance
  policyCompliance: {
    compliant: { type: Boolean, default: true },
    violations: [{
      rule: String,
      description: String,
      severity: { type: String, enum: ['low', 'medium', 'high'] }
    }],
    overrideReason: String,
    overrideApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },

  // Documents and receipts
  documents: [{
    type: { 
      type: String, 
      enum: ['invoice', 'receipt', 'itinerary', 'voucher', 'expense-report', 'approval-form'] 
    },
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],

  // Communication and notes
  communications: [{
    type: { type: String, enum: ['email', 'sms', 'internal-note'] },
    subject: String,
    content: String,
    timestamp: { type: Date, default: Date.now },
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    to: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }],

  // Cancellation and modifications
  modifications: [{
    type: { type: String, enum: ['date-change', 'traveler-change', 'upgrade', 'cancellation'] },
    requestedAt: Date,
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    details: mongoose.Schema.Types.Mixed,
    additionalCost: Number
  }],

  // System metadata
  metadata: {
    source: { type: String, enum: ['web', 'mobile', 'api', 'admin'], default: 'web' },
    userAgent: String,
    ipAddress: String,
    bookingChannel: String
  },

  // Admin fields
  assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  tags: [String],
  internalNotes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
corporateBookingSchema.index({ company: 1, createdAt: -1 });
corporateBookingSchema.index({ bookedBy: 1 });
corporateBookingSchema.index({ bookingReference: 1 });
corporateBookingSchema.index({ status: 1 });
corporateBookingSchema.index({ 'corporate.department': 1 });
corporateBookingSchema.index({ 'corporate.approval.status': 1 });
corporateBookingSchema.index({ 'travelDates.departure': 1 });

// Pre-save middleware
corporateBookingSchema.pre('save', function(next) {
  if (!this.bookingReference) {
    this.bookingReference = `CORP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  next();
});

// Methods
corporateBookingSchema.methods.approve = function(approvedBy, notes) {
  this.corporate.approval.status = 'approved';
  this.corporate.approval.approvedBy = approvedBy;
  this.corporate.approval.approvedAt = new Date();
  this.corporate.approval.approvalNotes = notes;
  this.status = 'approved';
  return this.save();
};

corporateBookingSchema.methods.reject = function(rejectedBy, reason) {
  this.corporate.approval.status = 'rejected';
  this.corporate.approval.approvedBy = rejectedBy;
  this.corporate.approval.rejectionReason = reason;
  this.status = 'rejected';
  return this.save();
};

corporateBookingSchema.methods.addTraveler = function(travelerData) {
  this.travelers.push(travelerData);
  return this.save();
};

// Virtuals
corporateBookingSchema.virtual('primaryTraveler').get(function() {
  return this.travelers.find(t => t.isPrimary) || this.travelers[0];
});

corporateBookingSchema.virtual('totalTravelers').get(function() {
  return this.travelers.length;
});

// Statics
corporateBookingSchema.statics.getCompanyBookings = function(companyId, filters = {}) {
  return this.find({ company: companyId, ...filters })
    .populate('bookedBy', 'profile.firstName profile.lastName email')
    .populate('corporate.approval.approvedBy', 'profile.firstName profile.lastName')
    .sort({ createdAt: -1 });
};

corporateBookingSchema.statics.getPendingApprovals = function(companyId) {
  return this.find({ 
    company: companyId, 
    'corporate.approval.status': 'pending' 
  }).populate('bookedBy', 'profile.firstName profile.lastName email');
};

module.exports = mongoose.model('CorporateBooking', corporateBookingSchema);