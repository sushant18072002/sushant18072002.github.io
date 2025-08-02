const express = require('express');
const router = express.Router();
const { auth, admin, optionalAuth } = require('../middleware/auth');
const {
  getAllTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
  getTagsByCategory,
  getPopularTags,
  getTagCategories,
  searchTags
} = require('../controllers/tagController');

// Public routes
router.get('/', getAllTags);
router.get('/popular', getPopularTags);
router.get('/categories', getTagCategories);
router.get('/search', searchTags);
router.get('/category/:category', getTagsByCategory);
router.get('/:id', getTagById);

// Admin only routes
router.post('/', auth, admin, createTag);
router.put('/:id', auth, admin, updateTag);
router.delete('/:id', auth, admin, deleteTag);

module.exports = router;