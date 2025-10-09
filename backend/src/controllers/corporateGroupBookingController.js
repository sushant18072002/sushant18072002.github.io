const { TripBooking, Trip, User } = require('../models');

// Create corporate group booking (like MakeMyTrip)
const createCorporateGroupBooking = async (req, res) => {
  try {
    const {
      type,
      itemId,
      companyDetails,
      travelers,
      totalTravelers,
      specialRequests,
      totalAmount,
      bookingDetails
    } = req.body;

    // Generate booking reference
    const bookingReference = `CORP-GRP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Create corporate group trip booking
    const booking = new TripBooking({
      bookingReference,
      user: req.user._id,
      // Trip information
      trip: {
        tripId: itemId,
        title: bookingDetails.title,
        destination: bookingDetails.destination,
        duration: {
          days: parseInt(bookingDetails.duration?.split(' ')[0]) || 5,
          nights: parseInt(bookingDetails.duration?.split(' ')[0]) - 1 || 4
        }
      },

      // Customer information (primary contact)
      customer: {
        firstName: companyDetails.contactPerson.split(' ')[0] || 'Contact',
        lastName: companyDetails.contactPerson.split(' ').slice(1).join(' ') || 'Person',
        email: companyDetails.contactEmail,
        phone: companyDetails.contactPhone
      },

      // Travelers information
      travelers: {
        count: totalTravelers,
        adults: totalTravelers,
        children: 0,
        infants: 0,
        details: travelers.map(traveler => ({
          type: 'adult',
          firstName: traveler.firstName,
          lastName: traveler.lastName,
          nationality: traveler.nationality || 'Indian'
        }))
      },

      // Pricing breakdown
      pricing: {
        basePrice: bookingDetails.pricePerPerson,
        pricePerPerson: bookingDetails.pricePerPerson,
        totalTravelers: totalTravelers,
        
        // Group discount
        discounts: [{
          type: 'percentage',
          percentage: 5,
          amount: Math.round((bookingDetails.pricePerPerson * totalTravelers) * 0.05),
          description: 'Corporate Group Discount (5%)'
        }],
        
        subtotal: bookingDetails.pricePerPerson * totalTravelers,
        totalDiscount: Math.round((bookingDetails.pricePerPerson * totalTravelers) * 0.05),
        finalAmount: Math.round(totalAmount * 0.95),
        currency: bookingDetails.currency || 'USD'
      },

      // Payment information
      payment: {
        method: 'bank-transfer',
        status: 'pending'
      },

      // Corporate preferences
      preferences: {
        accommodation: {
          specialRequests: specialRequests
        }
      },

      // Status
      status: 'draft',
      
      // Source
      source: 'website',
      
      // Metadata
      metadata: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        conversionSource: 'corporate-group-booking'
      },

      // Management info
      management: {
        tags: ['corporate', 'group-booking'],
        internalNotes: `Corporate booking for ${companyDetails.companyName}. GST: ${companyDetails.gstNumber || 'N/A'}. Contact: ${companyDetails.contactPerson}`
      }
    });

    await booking.save();

    // Add corporate metadata to the booking
    booking.metadata.companyDetails = {
      companyName: companyDetails.companyName,
      gstNumber: companyDetails.gstNumber,
      billingAddress: companyDetails.billingAddress
    };
    await booking.save();

    // Send confirmation email (implement as needed)
    // await sendCorporateBookingConfirmation(booking);

    res.status(201).json({
      success: true,
      data: {
        booking: {
          _id: booking._id,
          bookingReference: booking.bookingReference,
          status: booking.status,
          totalAmount: booking.pricing.finalAmount,
          travelers: booking.travelers.count,
          companyName: companyDetails.companyName
        },
        message: 'Corporate group booking created successfully'
      }
    });

  } catch (error) {
    console.error('Corporate group booking error:', error);
    res.status(500).json({
      success: false,
      error: { 
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    });
  }
};

// Get corporate group bookings for user
const getCorporateGroupBookings = async (req, res) => {
  try {
    const bookings = await TripBooking.find({
      user: req.user._id,
      'management.tags': 'corporate'
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { bookings }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

// Get corporate group booking by ID
const getCorporateGroupBookingById = async (req, res) => {
  try {
    const booking = await TripBooking.findById(req.params.id);

    if (!booking || !booking.management?.tags?.includes('corporate')) {
      return res.status(404).json({
        success: false,
        error: { message: 'Corporate booking not found' }
      });
    }

    // Check if user owns the booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied' }
      });
    }

    res.json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

module.exports = {
  createCorporateGroupBooking,
  getCorporateGroupBookings,
  getCorporateGroupBookingById
};