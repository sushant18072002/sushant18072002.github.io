const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['page_view', 'search', 'booking', 'user_action', 'conversion'], 
    required: true 
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionId: String,
  event: { type: String, required: true }, // e.g., 'flight_search', 'hotel_booking'
  data: {
    page: String,
    searchQuery: mongoose.Schema.Types.Mixed,
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    revenue: Number,
    currency: String,
    source: String, // traffic source
    medium: String, // marketing medium
    campaign: String, // campaign name
    device: String,
    browser: String,
    os: String,
    country: String,
    city: String
  },
  metadata: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

analyticsSchema.index({ type: 1, timestamp: -1 });
analyticsSchema.index({ userId: 1, timestamp: -1 });
analyticsSchema.index({ event: 1, timestamp: -1 });
analyticsSchema.index({ 'data.source': 1, timestamp: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);