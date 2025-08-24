const { Package, Destination, Activity } = require('../models');

const getPackages = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, featured, search, minPrice, maxPrice } = req.query;
    
    const query = { status: 'active' };
    if (category) query.category = category;
    if (featured) query.featured = featured === 'true';
    if (search) query.$text = { $search: search };
    if (minPrice || maxPrice) {
      query['price.amount'] = {};
      if (minPrice) query['price.amount'].$gte = parseFloat(minPrice);
      if (maxPrice) query['price.amount'].$lte = parseFloat(maxPrice);
    }

    const packages = await Package.find(query)
      .sort({ featured: -1, 'rating.overall': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Package.countDocuments(query);

    // Transform data for frontend compatibility
    const transformedPackages = packages.map(pkg => ({
      id: pkg._id,
      title: pkg.title,
      description: pkg.description,
      destination: pkg.destinations?.join(', ') || '',
      duration: pkg.duration,
      price: pkg.price?.amount || 0,
      originalPrice: pkg.price?.originalPrice,
      rating: pkg.rating?.overall || 4.5,
      reviews: pkg.rating?.reviewCount || 0,
      images: pkg.images?.map(img => {
        if (typeof img === 'string') return img;
        return img.url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop';
      }) || ['https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop'],
      highlights: pkg.highlights || [],
      inclusions: pkg.includes || [],
      category: pkg.category || 'general',
      difficulty: 'Easy',
      bestTime: 'Year Round'
    }));

    res.json({
      success: true,
      data: {
        packages: transformedPackages,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const getPackageDetails = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);

    if (!pkg || pkg.status !== 'active') {
      return res.status(404).json({ success: false, error: { message: 'Package not found' } });
    }

    // Transform data for frontend compatibility
    const transformedPackage = {
      id: pkg._id,
      title: pkg.title,
      description: pkg.description,
      destination: pkg.destinations?.join(', ') || '',
      duration: pkg.duration,
      price: pkg.price?.amount || 0,
      originalPrice: pkg.price?.originalPrice,
      rating: pkg.rating?.overall || 4.8,
      reviews: pkg.rating?.reviewCount || 0,
      images: pkg.images?.map(img => {
        if (typeof img === 'string') return img;
        return img.url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop';
      }) || ['https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop'],
      highlights: pkg.highlights || [],
      inclusions: pkg.includes || [],
      category: pkg.category || 'general',
      difficulty: 'Easy',
      bestTime: 'Year Round'
    };

    res.json({ success: true, data: { package: transformedPackage } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const getPackageCategories = async (req, res) => {
  try {
    const categories = await Package.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({ success: true, data: { categories } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const getFeaturedPackages = async (req, res) => {
  try {
    const packages = await Package.find({ featured: true, status: 'active' })
      .populate('destinations')
      .sort({ 'rating.overall': -1 })
      .limit(6);

    res.json({ success: true, data: { packages } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const searchPackages = async (req, res) => {
  try {
    const { q, destination, duration, budget, category } = req.query;
    
    const query = { status: 'active' };
    if (q) query.$text = { $search: q };
    if (destination) query.destinations = { $in: [destination] };
    if (duration) query.duration = parseInt(duration);
    if (budget) query['price.amount'] = { $lte: parseFloat(budget) };
    if (category) query.category = category;

    const packages = await Package.find(query)
      .populate('destinations')
      .sort({ 'rating.overall': -1 })
      .limit(20);

    res.json({ success: true, data: { packages } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const customizePackage = async (req, res) => {
  try {
    const { customizations } = req.body;
    const package = await Package.findById(req.params.id);

    if (!package) {
      return res.status(404).json({ success: false, error: { message: 'Package not found' } });
    }

    // Calculate customized price
    let totalPrice = package.price.amount;
    customizations.forEach(custom => {
      totalPrice += custom.additionalCost || 0;
    });

    const customizedPackage = {
      ...package.toObject(),
      customizations,
      customizedPrice: totalPrice,
      originalPrice: package.price.amount
    };

    res.json({ success: true, data: { package: customizedPackage } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const getPackageItinerary = async (req, res) => {
  try {
    const package = await Package.findById(req.params.id)
      .populate('destinations');

    if (!package) {
      return res.status(404).json({ success: false, error: { message: 'Package not found' } });
    }

    res.json({ success: true, data: { itinerary: package.itinerary } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const sendPackageInquiry = async (req, res) => {
  try {
    const { name, email, phone, message, travelDate, travelers } = req.body;
    
    // Here you would typically send an email or create a lead record
    // For now, we'll just return success
    
    res.json({
      success: true,
      data: { message: 'Inquiry sent successfully. We will contact you soon.' }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

module.exports = {
  getPackages,
  getPackageDetails,
  getPackageCategories,
  getFeaturedPackages,
  searchPackages,
  customizePackage,
  getPackageItinerary,
  sendPackageInquiry
};