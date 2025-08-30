const { City, Country, Trip, Hotel } = require('../models');

// Get featured destinations
const getFeaturedDestinations = async (req, res) => {
  try {
    const destinations = await City.find({ 
      status: 'active',
      featured: true 
    })
      .populate('country', 'name flag')
      .sort({ priority: -1, createdAt: -1 })
      .limit(8)
      .select('name description images popularFor bestTimeToVisit coordinates country');

    const formattedDestinations = destinations.map(dest => ({
      id: dest._id,
      name: dest.name,
      location: dest.country?.name || 'Unknown',
      description: dest.description,
      image: dest.images?.[0] || `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop`,
      popularFor: dest.popularFor || [],
      bestTimeToVisit: dest.bestTimeToVisit || [],
      coordinates: dest.coordinates
    }));

    res.json({
      success: true,
      data: { destinations: formattedDestinations }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

// Get destination spotlight with pricing
const getDestinationSpotlight = async (req, res) => {
  try {
    const destinations = await City.find({ 
      status: 'active' 
    })
      .populate('country', 'name flag')
      .sort({ createdAt: -1 })
      .limit(6)
      .select('name description images popularFor country');

    if (destinations.length === 0) {
      return res.json({
        success: true,
        data: {
          title: 'Explore amazing destinations worldwide',
          subtitle: 'Discover breathtaking places and unique experiences',
          destinations: []
        }
      });
    }

    // Get pricing data from trips for these destinations
    const destinationIds = destinations.map(d => d._id);
    const tripPricing = await Trip.find({
      primaryDestination: { $in: destinationIds },
      status: 'published'
    })
      .select('primaryDestination pricing')
      .populate('primaryDestination', '_id');

    // Create pricing map
    const pricingMap = {};
    tripPricing.forEach(trip => {
      const destId = trip.primaryDestination?._id?.toString();
      if (destId && trip.pricing?.estimated) {
        if (!pricingMap[destId] || trip.pricing.estimated < pricingMap[destId]) {
          pricingMap[destId] = trip.pricing.estimated;
        }
      }
    });

    const formattedDestinations = destinations.slice(0, 4).map((dest, index) => {
      const destId = dest._id.toString();
      const basePrice = pricingMap[destId] || (200 + index * 50);
      const hasDiscount = index % 3 === 0;
      
      return {
        id: dest._id,
        name: dest.name,
        location: dest.country?.name || 'Beautiful Location',
        price: basePrice,
        image: dest.images?.[0] || `https://images.unsplash.com/photo-${index % 2 === 0 ? '1506905925346-21bda4d32df4' : '1464822759844-d150baec3e5e'}?w=400&h=400&fit=crop`,
        discount: hasDiscount ? `${15 + index * 5}% off` : null,
        popularFor: dest.popularFor || []
      };
    });

    const spotlightCountry = destinations[0]?.country?.name || 'the world';
    const spotlightActivity = destinations[0]?.popularFor?.[0] || 'amazing destinations';

    res.json({
      success: true,
      data: {
        title: `Explore ${spotlightActivity} in ${spotlightCountry}`,
        subtitle: 'Discover breathtaking places and unique experiences',
        destinations: formattedDestinations
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

// Get destination details
const getDestinationDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    let destination;
    
    // Check if id is a valid ObjectId
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // It's an ObjectId
      destination = await City.findById(id)
        .populate('country', 'name flag currency')
        .populate('state', 'name');
    } else {
      // It might be a trip slug, redirect to trip API
      return res.status(404).json({
        success: false,
        error: { message: 'Invalid destination ID. Use /api/trips/{slug} for trip details.' }
      });
    }

    if (!destination) {
      return res.status(404).json({
        success: false,
        error: { message: 'Destination not found' }
      });
    }

    // Get related trips and hotels
    const [relatedTrips, relatedHotels] = await Promise.all([
      Trip.find({ 
        $or: [
          { primaryDestination: id },
          { destinations: id }
        ],
        status: 'published' 
      })
        .populate('primaryDestination', 'name')
        .populate('category', 'name icon')
        .limit(6)
        .select('title slug description duration pricing images stats'),
      
      Hotel.find({ 
        'location.city': id,
        status: 'active' 
      })
        .populate('location.city', 'name')
        .populate('location.country', 'name')
        .limit(6)
        .select('name description starRating pricing images rating')
    ]);

    // If we have trips, redirect to the first trip
    if (relatedTrips.length > 0) {
      return res.json({
        success: true,
        data: {
          trip: relatedTrips[0], // Return first trip as main content
          destination,
          relatedTrips: relatedTrips.slice(1),
          relatedHotels
        }
      });
    }

    // Otherwise return destination info
    res.json({
      success: true,
      data: {
        destination: {
          id: destination._id,
          name: destination.name,
          description: destination.description,
          location: {
            country: destination.country?.name,
            state: destination.state?.name,
            coordinates: destination.coordinates
          },
          images: destination.images || [],
          popularFor: destination.popularFor || [],
          bestTimeToVisit: destination.bestTimeToVisit || [],
          currency: destination.country?.currency,
          pricing: destination.pricing,
          stats: destination.stats
        },
        relatedTrips,
        relatedHotels
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

module.exports = {
  getFeaturedDestinations,
  getDestinationSpotlight,
  getDestinationDetails
};