const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true }, // e.g., 'CREATE_BOOKING', 'UPDATE_PROFILE'
  resource: { type: String, required: true }, // e.g., 'booking', 'user', 'flight'
  resourceId: { type: String }, // ID of the affected resource
  method: { type: String, enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
  endpoint: String,
  ipAddress: String,
  userAgent: String,
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },
  metadata: mongoose.Schema.Types.Mixed, // Additional context data
  status: { type: String, enum: ['success', 'failure'], default: 'success' },
  errorMessage: String,
  duration: Number, // Request duration in milliseconds
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);