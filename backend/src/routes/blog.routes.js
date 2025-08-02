const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

// @desc    Get all blog posts
// @route   GET /api/v1/blog/posts
// @access  Public
router.get('/posts', blogController.getBlogPosts);

// @desc    Get blog post details
// @route   GET /api/v1/blog/posts/:id
// @access  Public
router.get('/posts/:id', blogController.getBlogPostDetails);

// @desc    Get blog categories
// @route   GET /api/v1/blog/categories
// @access  Public
router.get('/categories', blogController.getBlogCategories);

// @desc    Get blog tags
// @route   GET /api/v1/blog/tags
// @access  Public
router.get('/tags', blogController.getBlogTags);

// @desc    Get featured blog posts
// @route   GET /api/v1/blog/featured
// @access  Public
router.get('/featured', blogController.getFeaturedBlogPosts);

// @desc    Like blog post
// @route   POST /api/v1/blog/posts/:id/like
// @access  Public
router.post('/posts/:id/like', blogController.likeBlogPost);

module.exports = router;