const mongoose = require('mongoose');

const searchLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionId: String,
  searchType: { type: String, enum: ['flight', 'hotel', 'package', 'global'], required: true },
  query: {
    // Flight search parameters
    origin: String,
    destination: String,
    departureDate: Date,
    returnDate: Date,
    passengers: {
      adults: Number,
      children: Number,
      infants: Number
    },
    class: String,
    
    // Hotel search parameters
    location: String,
    checkIn: Date,
    checkOut: Date,
    rooms: Number,
    guests: Number,
    
    // General search
    keywords: String,
    filters: mongoose.Schema.Types.Mixed
  },
  results: {
    count: Number,
    topResults: [mongoose.Schema.Types.Mixed], // Store top 5 results for analysis
    averagePrice: Number,
    priceRange: {
      min: Number,
      max: Number
    }
  },
  userInteraction: {
    clickedResults: [String], // IDs of clicked results
    bookingMade: Boolean,
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    timeSpent: Number, // seconds on results page
    refinements: Number // number of times search was refined
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    device: String,
    location: {
      country: String,
      city: String
    }
  }
}, { timestamps: true });

searchLogSchema.index({ userId: 1, createdAt: -1 });
searchLogSchema.index({ searchType: 1, createdAt: -1 });
searchLogSchema.index({ 'query.origin': 1, 'query.destination': 1 });
searchLogSchema.index({ 'query.location': 1 });

module.exports = mongoose.model('SearchLog', searchLogSchema);