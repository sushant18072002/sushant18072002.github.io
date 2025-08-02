const { Tag } = require('../models');
const auditService = require('../services/auditService');

// Get all tags
const getAllTags = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      category, 
      featured, 
      search,
      sortBy = 'usageCount',
      sortOrder = 'desc'
    } = req.query;

    const query = { status: 'active' };
    
    if (category) query.category = category;
    if (featured !== undefined) query.featured = featured === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { displayName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const tags = await Tag.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Tag.countDocuments(query);

    res.json({
      success: true,
      data: {
        tags,
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

// Get tag by ID or slug
const getTagById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to find by ID first, then by slug
    let tag = await Tag.findById(id);
    if (!tag) {
      tag = await Tag.findOne({ 'seo.slug': id, status: 'active' });
    }

    if (!tag) {
      return res.status(404).json({
        success: false,
        error: { message: 'Tag not found' }
      });
    }

    res.json({ success: true, data: { tag } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Create new tag (admin only)
const createTag = async (req, res) => {
  try {
    const tag = new Tag({
      ...req.body,
      createdBy: req.user._id
    });

    await tag.save();

    await auditService.log({
      userId: req.user._id,
      action: 'TAG_CREATED',
      resource: 'tag',
      resourceId: tag._id.toString(),
      metadata: { name: tag.name, category: tag.category }
    });

    res.status(201).json({
      success: true,
      data: { tag }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: { message: 'Tag name already exists' }
      });
    }
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

// Update tag (admin only)
const updateTag = async (req, res) => {
  try {
    const tag = await Tag.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    if (!tag) {
      return res.status(404).json({
        success: false,
        error: { message: 'Tag not found' }
      });
    }

    await auditService.log({
      userId: req.user._id,
      action: 'TAG_UPDATED',
      resource: 'tag',
      resourceId: req.params.id,
      metadata: { name: tag.name }
    });

    res.json({ success: true, data: { tag } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

// Delete tag (admin only)
const deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);

    if (!tag) {
      return res.status(404).json({
        success: false,
        error: { message: 'Tag not found' }
      });
    }

    // Soft delete
    tag.status = 'inactive';
    tag.updatedBy = req.user._id;
    await tag.save();

    await auditService.log({
      userId: req.user._id,
      action: 'TAG_DELETED',
      resource: 'tag',
      resourceId: req.params.id,
      metadata: { name: tag.name }
    });

    res.json({
      success: true,
      data: { message: 'Tag deleted successfully' }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Get tags by category
const getTagsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { featured, limit = 20 } = req.query;

    const query = { category, status: 'active' };
    if (featured !== undefined) query.featured = featured === 'true';

    const tags = await Tag.find(query)
      .sort({ featured: -1, usageCount: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: { tags }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Get popular tags
const getPopularTags = async (req, res) => {
  try {
    const { limit = 20, category } = req.query;
    
    const query = { status: 'active' };
    if (category) query.category = category;

    const tags = await Tag.find(query)
      .sort({ usageCount: -1, featured: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: { tags }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Get tag categories
const getTagCategories = async (req, res) => {
  try {
    const categories = await Tag.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalUsage: { $sum: '$usageCount' }
        }
      },
      { $sort: { totalUsage: -1 } }
    ]);

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Increment tag usage count
const incrementTagUsage = async (tagIds) => {
  try {
    if (!Array.isArray(tagIds)) tagIds = [tagIds];
    
    await Tag.updateMany(
      { _id: { $in: tagIds } },
      { $inc: { usageCount: 1 } }
    );
  } catch (error) {
    console.error('Error incrementing tag usage:', error);
  }
};

// Search tags
const searchTags = async (req, res) => {
  try {
    const { q, category, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: { message: 'Search query is required' }
      });
    }

    const query = {
      status: 'active',
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { displayName: { $regex: q, $options: 'i' } }
      ]
    };

    if (category) query.category = category;

    const tags = await Tag.find(query)
      .sort({ usageCount: -1 })
      .limit(parseInt(limit))
      .select('name displayName category color usageCount');

    res.json({
      success: true,
      data: { tags }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

module.exports = {
  getAllTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
  getTagsByCategory,
  getPopularTags,
  getTagCategories,
  searchTags,
  incrementTagUsage
};