const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  amount: {
    total: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    breakdown: {
      subtotal: Number,
      taxes: Number,
      fees: Number,
      discounts: Number
    }
  },
  
  method: {
    type: { type: String, enum: ['card', 'paypal', 'bank_transfer', 'wallet'], required: true },
    details: {
      cardLast4: String,
      cardBrand: String,
      paypalEmail: String,
      bankName: String
    }
  },
  
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'], 
    default: 'pending' 
  },
  
  gateway: {
    provider: { type: String, enum: ['stripe', 'paypal', 'razorpay'], default: 'stripe' },
    transactionId: String,
    paymentIntentId: String,
    chargeId: String
  },
  
  refund: {
    amount: Number,
    reason: String,
    refundId: String,
    processedAt: Date
  },
  
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceFingerprint: String
  },
  
  processedAt: Date,
  failureReason: String
}, { timestamps: true });

// Generate payment ID
paymentSchema.pre('save', function(next) {
  if (!this.paymentId) {
    this.paymentId = 'PAY' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

paymentSchema.index({ booking: 1 });
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ 'gateway.transactionId': 1 });

module.exports = mongoose.model('Payment', paymentSchema);