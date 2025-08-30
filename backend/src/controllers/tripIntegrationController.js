const { Trip, Flight, Hotel, City } = require('../models');

// Get flight options for a trip
const getTripFlights = async (req, res) => {
  try {
    const { id } = req.params;
    const { departureDate, returnDate, passengers = 1 } = req.query;
    
    const trip = await Trip.findById(id).populate('destinations');
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: { message: 'Trip not found' }
      });
    }

    // Get airports for trip destinations
    const cities = await City.find({ 
      _id: { $in: trip.destinations } 
    }).populate('airports');

    const flightOptions = [];
    
    // Find flights between destinations
    for (let i = 0; i < cities.length - 1; i++) {
      const fromCity = cities[i];
      const toCity = cities[i + 1];
      
      const flights = await Flight.find({
        'route.departure.airport': { $in: fromCity.airports },
        'route.arrival.airport': { $in: toCity.airports },
        'route.departure.scheduledTime': {
          $gte: new Date(departureDate),
          $lte: new Date(returnDate)
        },
        status: 'scheduled'
      })
        .populate('airline', 'name code logo')
        .populate('route.departure.airport', 'name code city')
        .populate('route.arrival.airport', 'name code city')
        .limit(10);

      flightOptions.push({
        route: `${fromCity.name} → ${toCity.name}`,
        flights: flights.map(flight => ({
          id: flight._id,
          flightNumber: flight.flightNumber,
          airline: flight.airline,
          departure: flight.route.departure,
          arrival: flight.route.arrival,
          duration: flight.duration.scheduled,
          pricing: {
            economy: flight.pricing.economy.totalPrice,
            business: flight.pricing.business?.totalPrice,
            first: flight.pricing.first?.totalPrice
          }
        }))
      });
    }

    res.json({
      success: true,
      data: { flightOptions }
    });
  } catch (error) {
    console.error('Get trip flights error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

// Get hotel options for a trip
const getTripHotels = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut, guests = 2, priceRange } = req.query;
    
    const trip = await Trip.findById(id).populate('destinations');
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: { message: 'Trip not found' }
      });
    }

    const hotelOptions = [];
    
    // Find hotels in each destination
    for (const destination of trip.destinations) {
      const query = {
        'location.city': destination._id,
        status: 'active'
      };
      
      if (priceRange) {
        const [min, max] = priceRange.split('-').map(Number);
        query['pricing.priceRange.min'] = { $gte: min };
        if (max) query['pricing.priceRange.max'] = { $lte: max };
      }

      const hotels = await Hotel.find(query)
        .populate('location.city', 'name')
        .sort({ 'rating.overall': -1, featured: -1 })
        .limit(10);

      hotelOptions.push({
        destination: destination.name,
        hotels: hotels.map(hotel => ({
          id: hotel._id,
          name: hotel.name,
          starRating: hotel.starRating,
          rating: hotel.rating.overall,
          reviewCount: hotel.rating.reviewCount,
          priceRange: hotel.pricing.priceRange,
          amenities: hotel.amenities.general?.slice(0, 5) || [],
          images: hotel.images.gallery?.slice(0, 3) || [],
          location: {
            address: hotel.location.address.street,
            distanceFromCenter: hotel.location.distanceFromCenter
          }
        }))
      });
    }

    res.json({
      success: true,
      data: { hotelOptions }
    });
  } catch (error) {
    console.error('Get trip hotels error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

// Customize trip with flights and hotels
const customizeTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      selectedFlights, 
      selectedHotels, 
      selectedActivities,
      travelers,
      specialRequests 
    } = req.body;
    
    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: { message: 'Trip not found' }
      });
    }

    // Calculate total pricing
    let totalPrice = trip.pricing.estimated || 0;
    const breakdown = { ...trip.pricing.breakdown };
    
    // Add flight costs
    if (selectedFlights?.length) {
      const flightCosts = await Promise.all(
        selectedFlights.map(async (flightId) => {
          const flight = await Flight.findById(flightId);
          return flight?.pricing.economy.totalPrice || 0;
        })
      );
      breakdown.flights = flightCosts.reduce((sum, cost) => sum + cost, 0);
    }
    
    // Add hotel costs
    if (selectedHotels?.length) {
      const hotelCosts = await Promise.all(
        selectedHotels.map(async (selection) => {
          const hotel = await Hotel.findById(selection.hotelId);
          const nights = selection.nights || 1;
          const roomRate = hotel?.pricing.averageNightlyRate || 0;
          return roomRate * nights;
        })
      );
      breakdown.accommodation = hotelCosts.reduce((sum, cost) => sum + cost, 0);
    }

    // Recalculate total
    totalPrice = Object.values(breakdown).reduce((sum, cost) => sum + (cost || 0), 0);

    // Create customized trip data
    const customizedTrip = {
      baseTrip: trip._id,
      title: `${trip.title} (Customized)`,
      customizations: {
        flights: selectedFlights,
        hotels: selectedHotels,
        activities: selectedActivities,
        travelers,
        specialRequests
      },
      pricing: {
        ...trip.pricing,
        estimated: totalPrice,
        breakdown
      },
      customizedAt: new Date()
    };

    res.json({
      success: true,
      data: { 
        customizedTrip,
        quote: {
          totalPrice,
          breakdown,
          validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }
      }
    });
  } catch (error) {
    console.error('Customize trip error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

// Get booking quote for customized trip
const getTripQuote = async (req, res) => {
  try {
    const { 
      tripId,
      selectedFlights,
      selectedHotels,
      travelers,
      departureDate 
    } = req.body;
    
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: { message: 'Trip not found' }
      });
    }

    // Calculate detailed pricing
    const breakdown = {
      baseTrip: trip.pricing.estimated || 0,
      flights: 0,
      hotels: 0,
      activities: 0,
      taxes: 0,
      fees: 0
    };

    // Calculate flight costs
    if (selectedFlights?.length) {
      for (const flightSelection of selectedFlights) {
        const flight = await Flight.findById(flightSelection.flightId);
        if (flight) {
          const classPrice = flight.pricing[flightSelection.class || 'economy'];
          breakdown.flights += (classPrice?.totalPrice || 0) * (travelers?.adults || 1);
        }
      }
    }

    // Calculate hotel costs
    if (selectedHotels?.length) {
      for (const hotelSelection of selectedHotels) {
        const hotel = await Hotel.findById(hotelSelection.hotelId);
        if (hotel) {
          const roomRate = hotel.pricing.averageNightlyRate || 0;
          const nights = hotelSelection.nights || 1;
          const rooms = hotelSelection.rooms || 1;
          breakdown.hotels += roomRate * nights * rooms;
        }
      }
    }

    // Calculate taxes and fees (10% of subtotal)
    const subtotal = Object.values(breakdown).reduce((sum, cost) => sum + cost, 0);
    breakdown.taxes = subtotal * 0.08; // 8% tax
    breakdown.fees = 50; // Booking fee

    const total = subtotal + breakdown.taxes + breakdown.fees;

    res.json({
      success: true,
      data: {
        quote: {
          breakdown,
          subtotal,
          total,
          currency: trip.pricing.currency || 'USD',
          validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
          travelers
        }
      }
    });
  } catch (error) {
    console.error('Get trip quote error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

module.exports = {
  getTripFlights,
  getTripHotels,
  customizeTrip,
  getTripQuote
};