const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed,
  type: { 
    type: String, 
    enum: ['string', 'number', 'boolean', 'object', 'array'], 
    required: true 
  },
  category: { 
    type: String, 
    enum: ['general', 'payment', 'email', 'ai', 'security', 'api', 'ui'], 
    required: true 
  },
  description: String,
  isPublic: { type: Boolean, default: false }, // Can be accessed by frontend
  isEditable: { type: Boolean, default: true },
  validation: {
    required: { type: Boolean, default: false },
    min: Number,
    max: Number,
    pattern: String,
    options: [String] // For enum-like settings
  },
  metadata: {
    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    environment: { type: String, enum: ['development', 'staging', 'production'], default: 'production' }
  }
}, { timestamps: true });

settingSchema.index({ category: 1, isPublic: 1 });
settingSchema.index({ key: 1 });

module.exports = mongoose.model('Setting', settingSchema);