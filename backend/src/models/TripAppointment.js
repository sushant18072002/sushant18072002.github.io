const mongoose = require('mongoose');

const tripAppointmentSchema = new mongoose.Schema({
  // Reference and identification
  appointmentReference: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Trip information
  trip: {
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
    title: String,
    destination: String,
    duration: {
      days: Number,
      nights: Number
    },
    estimatedPrice: Number,
    currency: { type: String, default: 'USD' }
  },

  // Customer information
  customer: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    travelers: { type: Number, default: 1, min: 1 }
  },

  // Appointment scheduling
  schedule: {
    preferredDate: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    timezone: { type: String, default: 'UTC' },
    scheduledAt: { type: Date, default: Date.now },
    rescheduledCount: { type: Number, default: 0 }
  },

  // Appointment status and workflow
  status: {
    type: String,
    enum: [
      'scheduled',        // Initial appointment booked
      'confirmed',        // Admin confirmed the appointment
      'in-progress',      // Call is happening
      'completed',        // Call completed successfully
      'cancelled',        // Cancelled by customer/admin
      'no-show',         // Customer didn't show up
      'rescheduled',     // Moved to different time
      'converted'        // Converted to actual booking
    ],
    default: 'scheduled'
  },

  // Consultation details
  consultation: {
    assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    callDuration: Number, // in minutes
    callNotes: String,
    customerInterest: {
      type: String,
      enum: ['high', 'medium', 'low', 'not-interested'],
      default: 'medium'
    },
    followUpRequired: { type: Boolean, default: false },
    followUpDate: Date,
    customizations: [{
      type: String,
      description: String,
      additionalCost: Number
    }]
  },

  // Pricing and conversion
  pricing: {
    estimatedTotal: Number,
    quotedPrice: Number, // Final price quoted during call
    discount: {
      amount: Number,
      percentage: Number,
      reason: String
    },
    paymentTerms: String,
    validUntil: Date // Quote validity
  },

  // Communication history
  communications: [{
    type: { type: String, enum: ['call', 'email', 'sms', 'whatsapp'] },
    direction: { type: String, enum: ['inbound', 'outbound'] },
    timestamp: { type: Date, default: Date.now },
    duration: Number,
    notes: String,
    outcome: String,
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],

  // Special requests and notes
  specialRequests: String,
  internalNotes: String,
  customerNotes: String,

  // Conversion tracking
  conversion: {
    convertedToBooking: { type: Boolean, default: false },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    convertedAt: Date,
    conversionValue: Number,
    conversionAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },

  // System metadata
  source: { type: String, enum: ['website', 'mobile-app', 'admin', 'api'], default: 'website' },
  metadata: {
    userAgent: String,
    ipAddress: String,
    referrer: String,
    utmSource: String,
    utmMedium: String,
    utmCampaign: String
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
tripAppointmentSchema.index({ user: 1, createdAt: -1 });
tripAppointmentSchema.index({ appointmentReference: 1 });
tripAppointmentSchema.index({ status: 1 });
tripAppointmentSchema.index({ 'schedule.preferredDate': 1, 'schedule.timeSlot': 1 });
tripAppointmentSchema.index({ 'consultation.assignedAgent': 1 });
tripAppointmentSchema.index({ 'conversion.convertedToBooking': 1 });

// Virtual for customer full name
tripAppointmentSchema.virtual('customer.fullName').get(function() {
  return `${this.customer.firstName} ${this.customer.lastName}`;
});

// Virtual for appointment date/time display
tripAppointmentSchema.virtual('schedule.displayDateTime').get(function() {
  return `${this.schedule.preferredDate.toDateString()} at ${this.schedule.timeSlot}`;
});

// Pre-save middleware to generate reference
tripAppointmentSchema.pre('save', function(next) {
  if (!this.appointmentReference) {
    this.appointmentReference = `APT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }
  next();
});

// Methods
tripAppointmentSchema.methods.reschedule = function(newDate, newTimeSlot) {
  this.schedule.preferredDate = newDate;
  this.schedule.timeSlot = newTimeSlot;
  this.schedule.rescheduledCount += 1;
  this.status = 'rescheduled';
  return this.save();
};

tripAppointmentSchema.methods.complete = function(callNotes, customerInterest, quotedPrice) {
  this.status = 'completed';
  this.consultation.callNotes = callNotes;
  this.consultation.customerInterest = customerInterest;
  if (quotedPrice) this.pricing.quotedPrice = quotedPrice;
  return this.save();
};

tripAppointmentSchema.methods.convertToBooking = function(bookingId, conversionValue) {
  this.status = 'converted';
  this.conversion.convertedToBooking = true;
  this.conversion.bookingId = bookingId;
  this.conversion.convertedAt = new Date();
  this.conversion.conversionValue = conversionValue;
  return this.save();
};

// Statics
tripAppointmentSchema.statics.getAvailableSlots = async function(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const bookedSlots = await this.find({
    'schedule.preferredDate': { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['scheduled', 'confirmed', 'rescheduled'] }
  }).distinct('schedule.timeSlot');

  const allSlots = [
    '09:00 AM - 10:00 AM',
    '10:30 AM - 11:30 AM',
    '12:00 PM - 01:00 PM',
    '02:00 PM - 03:00 PM',
    '03:30 PM - 04:30 PM',
    '05:00 PM - 06:00 PM'
  ];

  return allSlots.filter(slot => !bookedSlots.includes(slot));
};

module.exports = mongoose.model('TripAppointment', tripAppointmentSchema);