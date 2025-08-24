const { 
  Destination, 
  Hotel, 
  Flight, 
  Package, 
  Activity,
  Tag,
  SearchLog 
} = require('../models');

// Global search across all entities
const globalSearch = async (req, res) => {
  try {
    const { 
      q, 
      type, 
      limit = 10,
      lat,
      lng,
      radius = 50,
      priceMin,
      priceMax,
      rating,
      tags
    } = req.query;

    if (!q && !lat) {
      return res.status(400).json({
        success: false,
        error: { message: 'Search query or location is required' }
      });
    }

    const results = {};
    const searchPromises = [];

    // Build base query
    let baseQuery = {};
    if (q) {
      baseQuery.$text = { $search: q };
    }

    // Location-based search
    if (lat && lng) {
      baseQuery.coordinates = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radius * 1000
        }
      };
    }

    // Price filter
    if (priceMin || priceMax) {
      baseQuery.price = {};
      if (priceMin) baseQuery.price.$gte = parseFloat(priceMin);
      if (priceMax) baseQuery.price.$lte = parseFloat(priceMax);
    }

    // Rating filter
    if (rating) {
      baseQuery['stats.averageRating'] = { $gte: parseFloat(rating) };
    }

    // Tags filter
    if (tags) {
      baseQuery.tags = { $in: tags.split(',') };
    }

    // Search destinations
    if (!type || type === 'destinations') {
      searchPromises.push(
        Destination.find({ ...baseQuery, status: 'active' })
          .populate('country', 'name code')
          .select('name shortDescription images.hero stats.averageRating coordinates')
          .limit(parseInt(limit))
          .then(destinations => {
            results.destinations = destinations;
          })
      );
    }

    // Search hotels
    if (!type || type === 'hotels') {
      searchPromises.push(
        Hotel.find({ ...baseQuery, status: 'active' })
          .populate('destination', 'name')
          .select('name description images rating price location')
          .limit(parseInt(limit))
          .then(hotels => {
            results.hotels = hotels;
          })
      );
    }

    // Search flights
    if (!type || type === 'flights') {
      const flightQuery = { ...baseQuery, status: 'active' };
      delete flightQuery.coordinates; // Flights don't use coordinates in the same way
      
      searchPromises.push(
        Flight.find(flightQuery)
          .populate('airline', 'name code')
          .populate('departure.airport', 'name code city')
          .populate('arrival.airport', 'name code city')
          .select('airline departure arrival price duration')
          .limit(parseInt(limit))
          .then(flights => {
            results.flights = flights;
          })
      );
    }

    // Search packages
    if (!type || type === 'packages') {
      searchPromises.push(
        Package.find({ ...baseQuery, status: 'active' })
          .populate('destinations', 'name')
          .select('name description images price duration rating')
          .limit(parseInt(limit))
          .then(packages => {
            results.packages = packages;
          })
      );
    }

    // Search activities
    if (!type || type === 'activities') {
      searchPromises.push(
        Activity.find({ ...baseQuery, status: 'active' })
          .populate('destination', 'name')
          .select('name description images price rating duration')
          .limit(parseInt(limit))
          .then(activities => {
            results.activities = activities;
          })
      );
    }

    await Promise.all(searchPromises);

    // Log search if user is authenticated
    if (req.user) {
      await SearchLog.create({
        user: req.user._id,
        query: q,
        filters: {
          type,
          location: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null,
          priceRange: { min: priceMin, max: priceMax },
          rating,
          tags: tags ? tags.split(',') : []
        },
        resultsCount: Object.values(results).reduce((sum, arr) => sum + arr.length, 0),
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: {
        query: q,
        results,
        totalResults: Object.values(results).reduce((sum, arr) => sum + arr.length, 0)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Search suggestions/autocomplete
const getSearchSuggestions = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: { suggestions: [] }
      });
    }

    const suggestions = [];

    // Get destination suggestions
    const destinations = await Destination.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } }
      ],
      status: 'active'
    })
    .populate('country', 'name')
    .select('name country')
    .limit(5);

    destinations.forEach(dest => {
      suggestions.push({
        type: 'destination',
        text: `${dest.name}, ${dest.country.name}`,
        value: dest.name,
        id: dest._id
      });
    });

    // Get city suggestions from destinations
    const cities = await Destination.aggregate([
      { $match: { status: 'active' } },
      { $unwind: '$cities' },
      { $lookup: { from: 'cities', localField: 'cities', foreignField: '_id', as: 'cityInfo' } },
      { $unwind: '$cityInfo' },
      { $match: { 'cityInfo.name': { $regex: q, $options: 'i' } } },
      { $limit: 3 },
      { $project: { cityName: '$cityInfo.name', destinationName: '$name' } }
    ]);

    cities.forEach(city => {
      suggestions.push({
        type: 'city',
        text: `${city.cityName}, ${city.destinationName}`,
        value: city.cityName,
        id: city._id
      });
    });

    // Get popular tags
    const tags = await Tag.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { displayName: { $regex: q, $options: 'i' } }
      ],
      status: 'active'
    })
    .sort({ usageCount: -1 })
    .limit(3)
    .select('name displayName category');

    tags.forEach(tag => {
      suggestions.push({
        type: 'tag',
        text: tag.displayName,
        value: tag.name,
        category: tag.category,
        id: tag._id
      });
    });

    // Limit total suggestions
    const limitedSuggestions = suggestions.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: { suggestions: limitedSuggestions }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Advanced search with filters
const advancedSearch = async (req, res) => {
  try {
    const {
      q,
      type = 'destinations',
      page = 1,
      limit = 20,
      sortBy = 'relevance',
      sortOrder = 'desc',
      filters = {}
    } = req.body;

    let Model, populateFields, selectFields;

    // Determine model and fields based on type
    switch (type) {
      case 'destinations':
        Model = Destination;
        populateFields = 'country cities';
        selectFields = 'name shortDescription images stats coordinates tags';
        break;
      case 'hotels':
        Model = Hotel;
        populateFields = 'destination';
        selectFields = 'name description images rating price location amenities';
        break;
      case 'flights':
        Model = Flight;
        populateFields = 'airline departure.airport arrival.airport';
        selectFields = 'airline departure arrival price duration aircraft';
        break;
      case 'packages':
        Model = Package;
        populateFields = 'destinations';
        selectFields = 'name description images price duration rating inclusions';
        break;
      default:
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid search type' }
        });
    }

    // Build query
    let query = { status: 'active' };

    if (q) {
      query.$text = { $search: q };
    }

    // Apply filters
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        switch (key) {
          case 'priceMin':
            query.price = query.price || {};
            query.price.$gte = parseFloat(filters[key]);
            break;
          case 'priceMax':
            query.price = query.price || {};
            query.price.$lte = parseFloat(filters[key]);
            break;
          case 'rating':
            query['stats.averageRating'] = { $gte: parseFloat(filters[key]) };
            break;
          case 'tags':
            query.tags = { $in: Array.isArray(filters[key]) ? filters[key] : [filters[key]] };
            break;
          case 'location':
            if (filters[key].lat && filters[key].lng) {
              query.coordinates = {
                $near: {
                  $geometry: {
                    type: 'Point',
                    coordinates: [parseFloat(filters[key].lng), parseFloat(filters[key].lat)]
                  },
                  $maxDistance: (filters[key].radius || 50) * 1000
                }
              };
            }
            break;
          default:
            query[key] = filters[key];
        }
      }
    });

    // Build sort options
    let sortOptions = {};
    if (sortBy === 'relevance' && q) {
      sortOptions = { score: { $meta: 'textScore' } };
    } else {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    // Execute search
    const results = await Model.find(query)
      .populate(populateFields)
      .select(selectFields)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Model.countDocuments(query);

    // Get aggregated filter options for faceted search
    const facets = await Model.aggregate([
      { $match: query },
      {
        $facet: {
          priceRanges: [
            {
              $bucket: {
                groupBy: '$price',
                boundaries: [0, 100, 500, 1000, 5000, Infinity],
                default: 'Other',
                output: { count: { $sum: 1 } }
              }
            }
          ],
          ratings: [
            {
              $bucket: {
                groupBy: '$stats.averageRating',
                boundaries: [0, 1, 2, 3, 4, 5],
                default: 'Unrated',
                output: { count: { $sum: 1 } }
              }
            }
          ],
          popularTags: [
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        results,
        facets: facets[0],
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        },
        query: q,
        filters
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Get popular searches
const getPopularSearches = async (req, res) => {
  try {
    const { limit = 10, period = '30d' } = req.query;

    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case '7d':
        dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case '30d':
        dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        break;
      case '90d':
        dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
        break;
    }

    const popularSearches = await SearchLog.aggregate([
      { $match: { timestamp: dateFilter } },
      { $group: { _id: '$query', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      success: true,
      data: { popularSearches }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const getSearchHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const searchHistory = await SearchLog.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('query searchType createdAt resultsCount');

    const total = await SearchLog.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      data: {
        history: searchHistory,
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

const deleteSearchHistory = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (id) {
      // Delete specific search
      await SearchLog.findOneAndDelete({ _id: id, user: req.user._id });
      res.json({ success: true, data: { message: 'Search deleted from history' } });
    } else {
      // Delete all search history
      await SearchLog.deleteMany({ user: req.user._id });
      res.json({ success: true, data: { message: 'All search history deleted' } });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

module.exports = {
  globalSearch,
  getSearchSuggestions,
  advancedSearch,
  getPopularSearches,
  getSearchHistory,
  deleteSearchHistory
};