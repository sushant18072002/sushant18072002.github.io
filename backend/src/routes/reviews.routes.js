const express = require('express');
const router = express.Router();
const { auth, admin, optionalAuth } = require('../middleware/auth');
const { reviewValidation } = require('../middleware/validation');
const {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  toggleHelpfulVote,
  getReviewStats,
  addAdminResponse
} = require('../controllers/reviewController');

router.get('/', optionalAuth, getAllReviews);
router.get('/stats/:entityType/:entityId', getReviewStats);
router.get('/:id', getReviewById);
router.post('/', auth, reviewValidation, createReview);
router.put('/:id', auth, updateReview);
router.delete('/:id', auth, deleteReview);
router.post('/:id/helpful', auth, toggleHelpfulVote);
router.post('/:id/admin-response', auth, admin, addAdminResponse);

module.exports = router;
