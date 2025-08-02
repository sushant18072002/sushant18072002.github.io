const mongoose = require('mongoose');

const priceAlertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['flight', 'hotel'], required: true },
  alertName: String,
  criteria: {
    // Flight criteria
    origin: String,
    destination: String,
    departureDate: Date,
    returnDate: Date,
    passengers: {
      adults: { type: Number, default: 1 },
      children: { type: Number, default: 0 },
      infants: { type: Number, default: 0 }
    },
    class: { type: String, enum: ['economy', 'business', 'first'] },
    
    // Hotel criteria
    location: String,
    checkIn: Date,
    checkOut: Date,
    rooms: { type: Number, default: 1 },
    guests: { type: Number, default: 2 },
    starRating: Number,
    
    // Price criteria
    targetPrice: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    priceType: { type: String, enum: ['below', 'above', 'exact'], default: 'below' }
  },
  isActive: { type: Boolean, default: true },
  frequency: { type: String, enum: ['immediate', 'daily', 'weekly'], default: 'daily' },
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true }
  },
  lastChecked: Date,
  lastTriggered: Date,
  triggerCount: { type: Number, default: 0 },
  expiresAt: Date,
  metadata: {
    createdFrom: String, // 'search_results', 'manual', 'ai_suggestion'
    originalSearchId: { type: mongoose.Schema.Types.ObjectId, ref: 'SearchLog' }
  }
}, { timestamps: true });

priceAlertSchema.index({ userId: 1, isActive: 1 });
priceAlertSchema.index({ type: 1, isActive: 1, lastChecked: 1 });
priceAlertSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('PriceAlert', priceAlertSchema);