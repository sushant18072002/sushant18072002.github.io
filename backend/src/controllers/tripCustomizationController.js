const { Trip, Flight, Hotel } = require('../models');

// Get flight options for trip customization
const getTripFlights = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { departureDate, returnDate, passengers } = req.query;

    // Mock flight data since we don't have real flight integration
    const mockFlights = [
      {
        route: "Outbound Flight",
        flights: [
          {
            id: "FL001",
            flightNumber: "AA123",
            airline: { name: "American Airlines", code: "AA", logo: "/airlines/aa.png" },
            departure: {
              airport: { name: "John F. Kennedy International", code: "JFK" },
              scheduledTime: "08:00",
              terminal: "Terminal 1"
            },
            arrival: {
              airport: { name: "Tokyo Haneda", code: "HND" },
              scheduledTime: "14:30+1",
              terminal: "Terminal 2"
            },
            duration: 780,
            pricing: { economy: 850, business: 2400, first: 4200 }
          },
          {
            id: "FL002",
            flightNumber: "UA456",
            airline: { name: "United Airlines", code: "UA", logo: "/airlines/ua.png" },
            departure: {
              airport: { name: "John F. Kennedy International", code: "JFK" },
              scheduledTime: "15:30",
              terminal: "Terminal 4"
            },
            arrival: {
              airport: { name: "Tokyo Narita", code: "NRT" },
              scheduledTime: "19:45+1",
              terminal: "Terminal 1"
            },
            duration: 795,
            pricing: { economy: 920, business: 2650, first: 4800 }
          }
        ]
      }
    ];

    if (returnDate) {
      mockFlights.push({
        route: "Return Flight",
        flights: [
          {
            id: "FL003",
            flightNumber: "AA124",
            airline: { name: "American Airlines", code: "AA", logo: "/airlines/aa.png" },
            departure: {
              airport: { name: "Tokyo Haneda", code: "HND" },
              scheduledTime: "16:00",
              terminal: "Terminal 2"
            },
            arrival: {
              airport: { name: "John F. Kennedy International", code: "JFK" },
              scheduledTime: "14:30",
              terminal: "Terminal 1"
            },
            duration: 750,
            pricing: { economy: 850, business: 2400, first: 4200 }
          }
        ]
      });
    }

    res.json({
      success: true,
      data: { flightOptions: mockFlights }
    });
  } catch (error) {
    console.error('Get trip flights error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

// Get hotel options for trip customization
const getTripHotels = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { checkIn, checkOut, guests } = req.query;

    // Mock hotel data
    const mockHotels = [
      {
        destination: "Tokyo",
        hotels: [
          {
            id: "HT001",
            name: "Tokyo Grand Hotel",
            rating: 4.5,
            reviewCount: 1250,
            priceRange: { min: 180, max: 350, currency: "USD" },
            amenities: ["Free WiFi", "Pool", "Spa", "Restaurant", "Gym"],
            images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400"],
            location: {
              address: "1-1-1 Shibuya, Tokyo",
              distanceFromCenter: 2.5
            }
          },
          {
            id: "HT002",
            name: "Sakura Boutique Hotel",
            rating: 4.2,
            reviewCount: 890,
            priceRange: { min: 120, max: 220, currency: "USD" },
            amenities: ["Free WiFi", "Restaurant", "Concierge"],
            images: ["https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400"],
            location: {
              address: "2-3-4 Asakusa, Tokyo",
              distanceFromCenter: 5.2
            }
          }
        ]
      }
    ];

    res.json({
      success: true,
      data: { hotelOptions: mockHotels }
    });
  } catch (error) {
    console.error('Get trip hotels error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

// Customize trip
const customizeTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const customizations = req.body;

    // Store customization (in real app, save to database)
    const customizationId = `custom_${Date.now()}`;

    res.json({
      success: true,
      data: {
        customizationId,
        message: "Trip customization saved successfully"
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

// Get trip quote
const getTripQuote = async (req, res) => {
  try {
    const quoteData = req.body;

    // Calculate mock quote
    let totalPrice = 0;
    let breakdown = {
      flights: 0,
      hotels: 0,
      activities: 500,
      taxes: 0
    };

    // Calculate flight costs
    if (quoteData.selectedFlights) {
      breakdown.flights = quoteData.selectedFlights.length * 850 * quoteData.travelers.adults;
      if (quoteData.travelers.children > 0) {
        breakdown.flights += quoteData.selectedFlights.length * 650 * quoteData.travelers.children;
      }
    }

    // Calculate hotel costs
    if (quoteData.selectedHotels) {
      quoteData.selectedHotels.forEach(hotel => {
        breakdown.hotels += hotel.nights * hotel.rooms * 200; // Average $200/night
      });
    }

    breakdown.taxes = (breakdown.flights + breakdown.hotels + breakdown.activities) * 0.12;
    totalPrice = breakdown.flights + breakdown.hotels + breakdown.activities + breakdown.taxes;

    const quote = {
      id: `quote_${Date.now()}`,
      totalPrice: Math.round(totalPrice),
      currency: "USD",
      breakdown,
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      travelers: quoteData.travelers,
      departureDate: quoteData.departureDate
    };

    res.json({
      success: true,
      data: { quote }
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