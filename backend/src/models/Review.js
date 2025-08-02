const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  entityType: { type: String, enum: ['hotel', 'flight', 'package', 'destination', 'booking'], required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'entityType' },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  rating: { type: Number, min: 1, max: 5, required: true },
  ratingBreakdown: {
    cleanliness: { type: Number, min: 1, max: 5 },
    service: { type: Number, min: 1, max: 5 },
    location: { type: Number, min: 1, max: 5 },
    value: { type: Number, min: 1, max: 5 },
    comfort: { type: Number, min: 1, max: 5 }
  },
  title: { type: String, required: true, maxlength: 200 },
  content: { type: String, required: true, maxlength: 2000 },
  images: [String],
  helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  verified: { type: Boolean, default: false },
  status: { type: String, enum: ['published', 'pending', 'rejected'], default: 'published' },
  adminResponse: {
    content: String,
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    respondedAt: Date
  }
}, { timestamps: true });

// Indexes
reviewSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ verified: 1 });

module.exports = mongoose.model('Review', reviewSchema);