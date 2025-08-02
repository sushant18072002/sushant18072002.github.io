const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  displayName: { 
    type: String, 
    required: true 
  },
  description: String,
  category: {
    type: String,
    enum: ['destination', 'activity', 'accommodation', 'transport', 'cuisine', 'culture', 'nature', 'adventure', 'relaxation', 'budget', 'luxury', 'family', 'solo', 'couple', 'group'],
    required: true
  },
  color: {
    type: String,
    default: '#3B82F6' // Default blue color
  },
  icon: String, // Icon class or name
  usageCount: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    slug: {
      type: String,
      unique: true
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Generate slug from name
tagSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.seo.slug) {
    this.seo.slug = this.name.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

tagSchema.index({ name: 1 });
tagSchema.index({ category: 1, featured: -1 });
tagSchema.index({ usageCount: -1 });
tagSchema.index({ 'seo.slug': 1 });

module.exports = mongoose.model('Tag', tagSchema);