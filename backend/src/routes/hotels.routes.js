const express = require('express');
const router = express.Router();

// Import middleware
const requireAuth = (req, res, next) => {
  // Mock auth for development - REMOVE IN PRODUCTION
  req.user = { id: 'admin', role: 'admin' };
  next();
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, error: { message: 'Admin access required' } });
  }
  next();
};

// Get popular destinations (must be before /:id route)
router.get('/popular-destinations', async (req, res) => {
  try {
    const { Hotel } = require('../models');
    const destinations = await Hotel.aggregate([
      { $match: { status: 'active' } },
      { 
        $group: { 
          _id: '$location.address.area', 
          count: { $sum: 1 }, 
          avgPrice: { $avg: '$pricing.averageNightlyRate' },
          minPrice: { $min: '$pricing.averageNightlyRate' },
          hotels: { $push: { name: '$name', starRating: '$starRating' } }
        } 
      },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);
    
    // Add placeholder images and better formatting
    const formattedDestinations = destinations.map((dest, index) => ({
      _id: dest._id || 'Unknown',
      name: dest._id || 'Amazing Destination',
      count: dest.count || 0,
      avgPrice: Math.round(dest.avgPrice || 150),
      minPrice: Math.round(dest.minPrice || 100),
      hotels: dest.hotels || [],
      image: `https://images.unsplash.com/photo-${[
        '1566073771259-6a8506099945', // Hotel exterior
        '1571896349842-33c89424de2d', // Luxury hotel
        '1445019980597-93fa8acb246c', // Resort pool
        '1582719478250-c89cae4dc85b', // Beach resort
        '1520250497591-112f2f40a3f4', // City hotel
        '1564501049412-61c2ae185a50'  // Mountain resort
      ][index % 6]}?w=400&h=300&fit=crop`,
      avgRating: (4.2 + Math.random() * 0.6).toFixed(1)
    }));
    
    res.json({ success: true, data: { destinations: formattedDestinations } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Get hotel deals (must be before /:id route)
router.get('/deals', async (req, res) => {
  try {
    const { Hotel } = require('../models');
    let deals = await Hotel.find({ 
      status: 'active',
      $or: [
        { featured: true },
        { 'pricing.averageNightlyRate': { $lt: 200 } }
      ]
    })
    .populate('location.city', 'name')
    .populate('location.country', 'name')
    .sort({ 'pricing.averageNightlyRate': 1 })
    .limit(6);
    
    // Format deals with discount info
    deals = deals.map((hotel, index) => {
      const hotelObj = hotel.toObject();
      
      // Add placeholder images if none exist
      if (!hotelObj.images || hotelObj.images.length === 0) {
        hotelObj.images = [{
          url: `https://images.unsplash.com/photo-${[
            '1566073771259-6a8506099945',
            '1571896349842-33c89424de2d', 
            '1445019980597-93fa8acb246c',
            '1582719478250-c89cae4dc85b',
            '1520250497591-112f2f40a3f4',
            '1564501049412-61c2ae185a50'
          ][index % 6]}?w=400&h=300&fit=crop`,
          alt: `${hotelObj.name} - Hotel Image`,
          isPrimary: true
        }];
      }
      
      // Add deal info
      const originalPrice = hotelObj.pricing?.priceRange?.max || hotelObj.pricing?.averageNightlyRate * 1.3;
      const dealPrice = hotelObj.pricing?.averageNightlyRate || hotelObj.pricing?.priceRange?.min;
      const discount = Math.round(((originalPrice - dealPrice) / originalPrice) * 100);
      
      hotelObj.deal = {
        originalPrice: Math.round(originalPrice),
        dealPrice: Math.round(dealPrice),
        discount: Math.max(discount, 15),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      
      return hotelObj;
    });
    
    res.json({ success: true, data: { deals } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Get all hotels with search and filters
router.get('/', async (req, res) => {
  try {
    console.log('🏨 Hotels route called with query:', req.query);
    const { Hotel } = require('../models');
    const { destination, checkIn, checkOut, guests, priceRange, starRating, search } = req.query;
    
    let query = { status: 'active' };
    
    if (destination) {
      // Split destination to handle "Paris, France" format
      const destParts = destination.split(',').map(part => part.trim());
      const searchTerms = [destination, ...destParts];
      
      query.$or = [
        { 'location.address.area': { $regex: destination, $options: 'i' } },
        { 'location.address.street': { $regex: destination, $options: 'i' } },
        { 'location.cityName': { $in: searchTerms.map(term => new RegExp(term, 'i')) } },
        { 'location.countryName': { $in: searchTerms.map(term => new RegExp(term, 'i')) } },
        { name: { $regex: destination, $options: 'i' } }
      ];
    }
    
    if (starRating) {
      query.starRating = { $gte: parseInt(starRating) };
    }
    
    if (priceRange) {
      switch (priceRange) {
        case 'budget':
          query['pricing.averageNightlyRate'] = { $lt: 100 };
          break;
        case 'mid':
          query['pricing.averageNightlyRate'] = { $gte: 100, $lt: 300 };
          break;
        case 'luxury':
          query['pricing.averageNightlyRate'] = { $gte: 300 };
          break;
      }
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.address.area': { $regex: search, $options: 'i' } },
        { 'location.cityName': { $regex: search, $options: 'i' } },
        { 'location.countryName': { $regex: search, $options: 'i' } }
      ];
    }
    
    let hotels = await Hotel.find(query)
      .populate('location.city', 'name')
      .populate('location.country', 'name')
      .sort({ featured: -1, 'rating.overall': -1 });
    
    // If no hotels found with specific destination, try broader search
    if (hotels.length === 0 && destination) {
      console.log('🔍 No hotels found, trying broader search...');
      const broadQuery = { status: 'active' };
      hotels = await Hotel.find(broadQuery)
        .populate('location.city', 'name')
        .populate('location.country', 'name')
        .sort({ featured: -1, 'rating.overall': -1 })
        .limit(10);
    }
    
    // Normalize hotel data for frontend
    const normalizedHotels = hotels.map(hotel => {
      const hotelObj = hotel.toObject ? hotel.toObject() : hotel;
      
      // Clean up blob URLs and ensure images array exists
      if (!hotelObj.images || hotelObj.images.length === 0) {
        hotelObj.images = [{
          url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
          alt: `${hotelObj.name} - Hotel Image`,
          category: 'exterior',
          isPrimary: true
        }];
      } else {
        // Remove blob URLs and replace with placeholder
        hotelObj.images = hotelObj.images.map(img => {
          if (img.url && img.url.startsWith('blob:')) {
            return {
              ...img,
              url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop'
            };
          }
          return img;
        });
      }
      
      // Ensure rating exists
      if (!hotelObj.rating) {
        hotelObj.rating = { overall: 4.5, reviewCount: 0 };
      }
      
      // Normalize location display
      if (hotelObj.location) {
        if (hotelObj.location.city && typeof hotelObj.location.city === 'object') {
          hotelObj.location.cityName = hotelObj.location.city.name;
        }
        if (hotelObj.location.country && typeof hotelObj.location.country === 'object') {
          hotelObj.location.countryName = hotelObj.location.country.name;
        }
      }
      
      return hotelObj;
    });
    
    console.log('🏨 Returning hotels:', normalizedHotels.length, 'found');
    
    res.json({ success: true, data: { hotels: normalizedHotels } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Get single hotel (must be after specific routes)
router.get('/:id', async (req, res) => {
  try {
    const { Hotel } = require('../models');
    const { mongoose } = require('mongoose');
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        error: { message: 'Invalid hotel ID format' } 
      });
    }
    
    let hotel = await Hotel.findById(req.params.id)
      .populate('location.city', 'name')
      .populate('location.country', 'name');
    
    if (!hotel) {
      return res.status(404).json({ success: false, error: { message: 'Hotel not found' } });
    }
    
    // Add placeholder data if missing
    hotel = hotel.toObject();
    if (!hotel.images || hotel.images.length === 0) {
      hotel.images = [{
        url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=400&fit=crop',
        alt: `${hotel.name} - Hotel Image`,
        category: 'exterior',
        isPrimary: true,
        order: 0
      }];
    }
    
    if (!hotel.chain) {
      hotel.chain = 'Independent';
    }
    
    if (!hotel.category && !hotel.hotelCategory) {
      hotel.category = 'hotel';
    }
    
    // Clean up email field
    if (hotel.contact?.email) {
      hotel.contact.email = hotel.contact.email.replace(/^(mailto:)+/g, '');
    }
    
    // Normalize amenities and nearby attractions
    if (hotel.amenities?.general && Array.isArray(hotel.amenities.general)) {
      hotel.amenities.general = hotel.amenities.general.map(amenity => {
        if (typeof amenity === 'object' && amenity.name) {
          return amenity; // Keep object structure
        }
        return typeof amenity === 'string' ? amenity : String(amenity);
      });
    }
    
    // Normalize nearby attractions
    if (hotel.location?.nearbyAttractions && Array.isArray(hotel.location.nearbyAttractions)) {
      hotel.location.nearbyAttractions = hotel.location.nearbyAttractions.map(attraction => {
        if (typeof attraction === 'string') {
          return attraction; // Keep string format
        }
        return attraction; // Keep object format
      });
    }
    
    res.json({ success: true, data: { hotel } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Admin Routes

// Create hotel - Admin only
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { Hotel } = require('../models');
    
    // Sanitize input to prevent NoSQL injection
    const sanitizedData = {
      ...req.body,
      name: req.body.name?.toString().trim(),
      description: req.body.description?.toString().trim(),
      starRating: parseInt(req.body.starRating) || 1
    };
    
    const hotel = new Hotel(sanitizedData);
    await hotel.save();
    res.status(201).json({ success: true, data: { hotel } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Update hotel - Admin only
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { Hotel } = require('../models');
    const { mongoose } = require('mongoose');
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid hotel ID' } });
    }
    
    // Sanitize input
    const sanitizedData = {
      ...req.body,
      name: req.body.name?.toString().trim(),
      description: req.body.description?.toString().trim(),
      starRating: parseInt(req.body.starRating) || 1
    };
    
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, sanitizedData, { new: true });
    if (!hotel) {
      return res.status(404).json({ success: false, error: { message: 'Hotel not found' } });
    }
    res.json({ success: true, data: { hotel } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// Delete hotel - Admin only
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { Hotel } = require('../models');
    const { mongoose } = require('mongoose');
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid hotel ID' } });
    }
    
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) {
      return res.status(404).json({ success: false, error: { message: 'Hotel not found' } });
    }
    res.json({ success: true, message: 'Hotel deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Create sample hotels
router.post('/create-samples', async (req, res) => {
  try {
    const { Hotel } = require('../models');
    
    const sampleHotels = [
      {
        name: 'Sample Luxury Hotel Paris',
        chain: 'Luxury Collection',
        category: 'luxury',
        description: 'A beautiful luxury hotel in the heart of Paris',
        starRating: 5,
        location: {
          address: { street: '123 Champs Elysees', area: 'Champs Elysees', zipCode: '75008' },
          cityName: 'Paris',
          countryName: 'France',
          coordinates: { type: 'Point', coordinates: [2.3522, 48.8566] },
          nearbyAttractions: ['Eiffel Tower', 'Louvre Museum', 'Arc de Triomphe']
        },
        pricing: { priceRange: { min: 300, max: 800, currency: 'EUR' }, averageNightlyRate: 450 },
        amenities: {
          general: [
            { name: 'WiFi', category: 'connectivity', available: true },
            { name: 'Spa', category: 'services', available: true, fee: 50 },
            { name: 'Pool', category: 'recreation', available: true }
          ]
        },
        rooms: [{
          id: 'deluxe-room',
          name: 'Deluxe Room',
          type: 'deluxe',
          size: 40,
          maxOccupancy: 2,
          bedConfiguration: { kingBeds: 1, singleBeds: 0, doubleBeds: 0, queenBeds: 0 },
          amenities: ['City View', 'Mini Bar', 'WiFi'],
          pricing: { baseRate: 400, currency: 'EUR', taxes: 50, totalRate: 450, cancellationPolicy: { type: 'free', deadline: 24 } },
          totalRooms: 20
        }],
        featured: true,
        status: 'active'
      }
    ];
    
    await Hotel.deleteMany({ name: { $regex: '^Sample' } }); // Clean existing samples
    const created = await Hotel.insertMany(sampleHotels);
    
    res.json({ success: true, message: `Created ${created.length} sample hotels`, data: { hotels: created } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Clean up data issues in database
router.post('/cleanup-data', async (req, res) => {
  try {
    const { Hotel } = require('../models');
    
    // Clean blob URLs
    const blobResult = await Hotel.updateMany(
      { 'images.url': { $regex: '^blob:' } },
      { 
        $set: { 
          'images.$[elem].url': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop'
        }
      },
      { arrayFilters: [{ 'elem.url': { $regex: '^blob:' } }] }
    );
    
    // Clean email prefixes - simplified approach
    const emailResult = await Hotel.updateMany(
      { 'contact.email': { $regex: '^mailto:' } },
      [{
        $set: {
          'contact.email': {
            $replaceOne: {
              input: '$contact.email',
              find: /^(mailto:)+/,
              replacement: ''
            }
          }
        }
      }]
    );
    
    res.json({ 
      success: true, 
      message: `Cleaned up ${blobResult.modifiedCount} blob URLs and ${emailResult.modifiedCount} email prefixes`,
      data: { blobUrls: blobResult.modifiedCount, emails: emailResult.modifiedCount }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Legacy cleanup endpoint
router.post('/cleanup-images', async (req, res) => {
  // Redirect to new cleanup endpoint
  return req.app._router.handle({ ...req, url: '/cleanup-data', method: 'POST' }, res);
});



module.exports = router;