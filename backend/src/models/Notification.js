const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: [
      'booking_confirmation', 'booking_cancelled', 'booking_modified',
      'payment_success', 'payment_failed', 'refund_processed',
      'price_alert', 'price_drop', 'deal_alert',
      'trip_reminder', 'check_in_reminder', 'departure_reminder',
      'system_update', 'maintenance', 'security_alert',
      'promotion', 'newsletter', 'survey',
      'review_request', 'loyalty_update'
    ], 
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  
  // Rich content
  content: {
    html: String,
    actionUrl: String,
    actionText: String,
    imageUrl: String
  },
  
  // Related entities
  relatedEntity: {
    type: { type: String, enum: ['booking', 'flight', 'hotel', 'package', 'user'] },
    id: mongoose.Schema.Types.ObjectId
  },
  
  // Notification metadata
  data: mongoose.Schema.Types.Mixed,
  isRead: { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  
  // Delivery channels
  channels: [{
    type: { type: String, enum: ['in_app', 'email', 'sms', 'push'] },
    status: { type: String, enum: ['pending', 'sent', 'delivered', 'failed'], default: 'pending' },
    sentAt: Date,
    deliveredAt: Date,
    error: String
  }],
  
  // Scheduling
  scheduledFor: Date,
  expiresAt: Date,
  
  // Tracking
  readAt: Date,
  clickedAt: Date,
  
  // System fields
  source: { type: String, enum: ['system', 'admin', 'api'], default: 'system' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Indexes
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
notificationSchema.index({ type: 1, priority: 1 });
notificationSchema.index({ 'relatedEntity.type': 1, 'relatedEntity.id': 1 });

module.exports = mongoose.model('Notification', notificationSchema);