const { Review, Booking, User } = require('../models');
const auditService = require('../services/auditService');

const getAllReviews = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      entityType, 
      entityId, 
      rating, 
      verified,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status = 'published'
    } = req.query;

    const query = { status };
    
    if (entityType) query.entityType = entityType;
    if (entityId) query.entityId = entityId;
    if (rating) query.rating = parseInt(rating);
    if (verified !== undefined) query.verified = verified === 'true';

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reviews = await Review.find(query)
      .populate('user', 'profile.firstName profile.lastName profile.avatar')
      .populate('entityId')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(query);
    
    // Calculate statistics
    const stats = await Review.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    const ratingCounts = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: stats[0]?.ratingDistribution.filter(r => r === rating).length || 0
    }));

    res.json({
      success: true,
      data: {
        reviews,
        stats: {
          total,
          averageRating: stats[0]?.avgRating || 0,
          ratingDistribution: ratingCounts
        },
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'profile.firstName profile.lastName profile.avatar')
      .populate('entityId')
      .populate('adminResponse.respondedBy', 'profile.firstName profile.lastName');

    if (!review) {
      return res.status(404).json({
        success: false,
        error: { message: 'Review not found' }
      });
    }

    res.json({ success: true, data: { review } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const createReview = async (req, res) => {
  try {
    const { entityType, entityId, rating, title, content, ratingBreakdown, images } = req.body;

    // Check if user has already reviewed this entity
    const existingReview = await Review.findOne({
      user: req.user._id,
      entityType,
      entityId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: { message: 'You have already reviewed this item' }
      });
    }

    // For bookings, verify user has actually booked and completed
    let verified = false;
    if (entityType === 'booking') {
      const booking = await Booking.findOne({
        _id: entityId,
        user: req.user._id,
        status: 'completed'
      });
      verified = !!booking;
    } else {
      // For other entities, check if user has any completed booking related to it
      const relatedBooking = await Booking.findOne({
        user: req.user._id,
        status: 'completed',
        $or: [
          { 'flight.id': entityId },
          { 'hotel.id': entityId },
          { 'package.id': entityId }
        ]
      });
      verified = !!relatedBooking;
    }

    const review = new Review({
      user: req.user._id,
      entityType,
      entityId,
      rating,
      title,
      content,
      ratingBreakdown,
      images: images || [],
      verified
    });

    await review.save();
    await review.populate('user', 'profile.firstName profile.lastName profile.avatar');

    // Update entity's rating statistics
    await updateEntityRatingStats(entityType, entityId);

    await auditService.log({
      userId: req.user._id,
      action: 'REVIEW_CREATED',
      resource: 'review',
      resourceId: review._id.toString(),
      metadata: { entityType, entityId, rating }
    });

    res.status(201).json({
      success: true,
      data: { review }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: { message: 'Review not found' }
      });
    }

    // Check if user owns the review or is admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Not authorized to update this review' }
      });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'profile.firstName profile.lastName profile.avatar');

    // Update entity's rating statistics
    await updateEntityRatingStats(review.entityType, review.entityId);

    await auditService.log({
      userId: req.user._id,
      action: 'REVIEW_UPDATED',
      resource: 'review',
      resourceId: req.params.id,
      metadata: { entityType: review.entityType, entityId: review.entityId }
    });

    res.json({ success: true, data: { review: updatedReview } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: { message: 'Review not found' }
      });
    }

    // Check if user owns the review or is admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Not authorized to delete this review' }
      });
    }

    const entityType = review.entityType;
    const entityId = review.entityId;

    await Review.findByIdAndDelete(req.params.id);

    // Update entity's rating statistics
    await updateEntityRatingStats(entityType, entityId);

    await auditService.log({
      userId: req.user._id,
      action: 'REVIEW_DELETED',
      resource: 'review',
      resourceId: req.params.id,
      metadata: { entityType, entityId }
    });

    res.json({
      success: true,
      data: { message: 'Review deleted successfully' }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const toggleHelpfulVote = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: { message: 'Review not found' }
      });
    }

    // Check if user already voted
    const alreadyVoted = review.helpfulVotes.includes(req.user._id);
    
    if (alreadyVoted) {
      // Remove vote
      review.helpfulVotes = review.helpfulVotes.filter(
        id => id.toString() !== req.user._id.toString()
      );
    } else {
      // Add vote
      review.helpfulVotes.push(req.user._id);
    }

    await review.save();

    res.json({
      success: true,
      data: {
        helpful: !alreadyVoted,
        helpfulCount: review.helpfulVotes.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const getReviewStats = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;

    const stats = await Review.aggregate([
      { 
        $match: { 
          entityType, 
          entityId: require('mongoose').Types.ObjectId(entityId),
          status: 'published'
        } 
      },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          verifiedReviews: {
            $sum: { $cond: ['$verified', 1, 0] }
          },
          ratingDistribution: {
            $push: '$rating'
          },
          averageBreakdown: {
            $avg: {
              cleanliness: '$ratingBreakdown.cleanliness',
              service: '$ratingBreakdown.service',
              location: '$ratingBreakdown.location',
              value: '$ratingBreakdown.value',
              comfort: '$ratingBreakdown.comfort'
            }
          }
        }
      }
    ]);

    const ratingCounts = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: stats[0]?.ratingDistribution.filter(r => r === rating).length || 0
    }));

    res.json({
      success: true,
      data: {
        totalReviews: stats[0]?.totalReviews || 0,
        averageRating: stats[0]?.averageRating || 0,
        verifiedReviews: stats[0]?.verifiedReviews || 0,
        ratingDistribution: ratingCounts,
        averageBreakdown: stats[0]?.averageBreakdown || {}
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const addAdminResponse = async (req, res) => {
  try {
    const { content } = req.body;
    
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        adminResponse: {
          content,
          respondedBy: req.user._id,
          respondedAt: new Date()
        }
      },
      { new: true }
    ).populate('adminResponse.respondedBy', 'profile.firstName profile.lastName');

    if (!review) {
      return res.status(404).json({
        success: false,
        error: { message: 'Review not found' }
      });
    }

    await auditService.log({
      userId: req.user._id,
      action: 'REVIEW_ADMIN_RESPONSE',
      resource: 'review',
      resourceId: req.params.id
    });

    res.json({ success: true, data: { review } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

// Helper function to update entity rating statistics
const updateEntityRatingStats = async (entityType, entityId) => {
  try {
    const stats = await Review.aggregate([
      { 
        $match: { 
          entityType, 
          entityId: require('mongoose').Types.ObjectId(entityId),
          status: 'published'
        } 
      },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    const { totalReviews = 0, averageRating = 0 } = stats[0] || {};

    // Update the entity's stats based on type
    const models = {
      hotel: require('../models').Hotel,
      flight: require('../models').Flight,
      package: require('../models').Package,
      destination: require('../models').Destination
    };

    if (models[entityType]) {
      await models[entityType].findByIdAndUpdate(entityId, {
        'stats.totalReviews': totalReviews,
        'stats.averageRating': averageRating
      });
    }
  } catch (error) {
    console.error('Error updating entity rating stats:', error);
  }
};

module.exports = {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  toggleHelpfulVote,
  getReviewStats,
  addAdminResponse
};