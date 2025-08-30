const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true },
  type: { 
    type: String, 
    enum: ['flight', 'hotel', 'trip', 'activity', 'general', 'adventure'], 
    required: true,
    index: true 
  },
  description: String,
  icon: String,
  color: String,
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  metadata: {
    flightSpecific: {
      cabinClass: { type: String, enum: ['economy', 'premium-economy', 'business', 'first'] },
      serviceLevel: { type: String, enum: ['basic', 'standard', 'premium', 'luxury'] }
    },
    hotelSpecific: {
      starRating: { type: Number, min: 1, max: 5 },
      propertyType: { type: String, enum: ['hotel', 'resort', 'apartment', 'villa', 'hostel'] }
    },
    adventureSpecific: {
      places: { type: String, default: '0 places' },
      difficulty: { type: String, enum: ['easy', 'moderate', 'challenging', 'extreme'] }
    }
  },
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

categorySchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

categorySchema.index({ type: 1, active: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ slug: 1 });

module.exports = mongoose.model('Category', categorySchema);