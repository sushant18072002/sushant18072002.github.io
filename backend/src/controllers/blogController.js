const { BlogPost } = require('../models');

const getBlogPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tag } = req.query;
    
    const query = { status: 'published' };
    if (category) query.category = category;
    if (tag) query.tags = { $in: [tag] };

    const posts = await BlogPost.find(query)
      .populate('author', 'profile.firstName profile.lastName')
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await BlogPost.countDocuments(query);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const getBlogPostDetails = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id)
      .populate('author', 'profile.firstName profile.lastName profile.avatar');

    if (!post || post.status !== 'published') {
      return res.status(404).json({ success: false, error: { message: 'Post not found' } });
    }

    // Increment views
    await BlogPost.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({ success: true, data: { post } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const getBlogCategories = async (req, res) => {
  try {
    const categories = await BlogPost.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({ success: true, data: { categories } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const getBlogTags = async (req, res) => {
  try {
    const tags = await BlogPost.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.json({ success: true, data: { tags } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const getFeaturedBlogPosts = async (req, res) => {
  try {
    const posts = await BlogPost.find({ 
      status: 'published',
      views: { $gt: 100 }
    })
    .populate('author', 'profile.firstName profile.lastName')
    .select('title excerpt featuredImage publishedAt readTime views')
    .sort({ views: -1 })
    .limit(6);

    res.json({ success: true, data: { posts } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const likeBlogPost = async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ success: false, error: { message: 'Post not found' } });
    }

    res.json({ success: true, data: { likes: post.likes } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

module.exports = {
  getBlogPosts,
  getBlogPostDetails,
  getBlogCategories,
  getBlogTags,
  getFeaturedBlogPosts,
  likeBlogPost
};