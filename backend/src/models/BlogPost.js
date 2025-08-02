const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: String,
  excerpt: String,
  category: String,
  tags: [String],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  featuredImage: String,
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  readTime: Number,
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  publishedAt: Date
}, { timestamps: true });

blogPostSchema.index({ status: 1, publishedAt: -1 });
blogPostSchema.index({ category: 1 });
blogPostSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('BlogPost', blogPostSchema);