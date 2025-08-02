const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type: { 
    type: String, 
    enum: ['welcome', 'booking_confirmation', 'password_reset', 'price_alert', 'trip_reminder', 'newsletter', 'support_response'],
    required: true 
  },
  subject: { type: String, required: true },
  htmlContent: { type: String, required: true },
  textContent: String,
  variables: [{ // Available template variables
    name: String,
    description: String,
    required: { type: Boolean, default: false },
    defaultValue: String
  }],
  isActive: { type: Boolean, default: true },
  language: { type: String, default: 'en' },
  category: String,
  metadata: {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    version: { type: Number, default: 1 },
    tags: [String]
  }
}, { timestamps: true });

emailTemplateSchema.index({ type: 1, isActive: 1 });
emailTemplateSchema.index({ name: 1 });

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema);