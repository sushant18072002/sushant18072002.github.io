const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

router.get('/posts', blogController.getBlogPosts);
router.get('/posts/:id', blogController.getBlogPostDetails);
router.get('/categories', blogController.getBlogCategories);
router.get('/tags', blogController.getBlogTags);
router.get('/featured', blogController.getFeaturedBlogPosts);
router.post('/posts/:id/like', blogController.likeBlogPost);

module.exports = router;