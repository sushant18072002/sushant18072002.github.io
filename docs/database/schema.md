# Database Schema

## 👤 Users Collection

```javascript
{
  _id: ObjectId("..."),
  email: "john@example.com",
  password: "$2b$10$...", // bcrypt hashed
  profile: {
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: ISODate("1990-05-15"),
    phone: "+1234567890",
    avatar: "https://s3.amazonaws.com/avatars/user123.jpg",
    nationality: "US",
    passport: {
      number: "A12345678",
      expiry: ISODate("2030-05-15"),
      country: "US"
    },
    address: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "US"
    }
  },
  preferences: {
    currency: "USD",
    language: "en",
    timezone: "America/New_York",
    notifications: {
      email: true,
      sms: false,
      push: true,
      marketing: false
    },
    travel: {
      seatPreference: "window", // window|aisle|middle
      mealPreference: "vegetarian",
      budgetRange: "mid-range", // budget|mid-range|luxury
      interests: ["culture", "food", "adventure"],
      travelStyle: "relaxed", // fast-paced|relaxed|luxury
      accommodationType: "hotel" // hotel|hostel|apartment|resort
    }
  },
  stats: {
    totalBookings: 15,
    totalSpent: 25000,
    countriesVisited: 12,
    favoriteDestinations: ["Paris", "Tokyo", "Bali"],
    averageRating: 4.8
  },
  verification: {
    email: {
      verified: true,
      verifiedAt: ISODate("2022-01-15")
    },
    phone: {
      verified: false,
      verifiedAt: null
    },
    identity: {
      verified: false,
      documents: []
    }
  },
  subscription: {
    plan: "premium", // free|premium|enterprise
    startDate: ISODate("2024-01-01"),
    endDate: ISODate("2024-12-31"),
    autoRenew: true
  },
  createdAt: ISODate("2022-01-15"),
  updatedAt: ISODate("2024-12-15"),
  lastLoginAt: ISODate("2024-12-15"),
  status: "active" // active|suspended|deleted
}
```

## ✈️ Flights Collection

```javascript
{
  _id: ObjectId("..."),
  flightNumber: "EK205",
  airline: {
    code: "EK",
    name: "Emirates",
    logo: "https://s3.amazonaws.com/airlines/emirates.png"
  },
  aircraft: {
    type: "Boeing 777-300ER",
    configuration: {
      economy: 354,
      business: 42,
      first: 14
    }
  },
  route: {
    departure: {
      airport: {
        code: "DXB",
        name: "Dubai International Airport",
        city: "Dubai",
        country: "UAE",
        timezone: "Asia/Dubai",
        coordinates: {
          type: "Point",
          coordinates: [55.3644, 25.2532]
        }
      },
      terminal: "3",
      gate: "A15",
      scheduledTime: ISODate("2024-12-20T14:30:00Z"),
      estimatedTime: ISODate("2024-12-20T14:30:00Z"),
      actualTime: null
    },
    arrival: {
      airport: {
        code: "JFK",
        name: "John F. Kennedy International Airport",
        city: "New York",
        country: "US",
        timezone: "America/New_York",
        coordinates: {
          type: "Point",
          coordinates: [-73.7781, 40.6413]
        }
      },
      terminal: "4",
      gate: "B12",
      scheduledTime: ISODate("2024-12-20T19:45:00Z"),
      estimatedTime: ISODate("2024-12-20T19:45:00Z"),
      actualTime: null
    }
  },
  duration: {
    total: 915, // minutes
    formatted: "15h 15m"
  },
  stops: [],
  pricing: {
    economy: {
      basePrice: 980,
      taxes: 270,
      totalPrice: 1250,
      currency: "USD",
      availability: 15,
      fareClass: "Y",
      restrictions: {
        refundable: false,
        changeable: true,
        changeFee: 150
      }
    },
    business: {
      basePrice: 3500,
      taxes: 450,
      totalPrice: 3950,
      currency: "USD",
      availability: 3,
      fareClass: "J",
      restrictions: {
        refundable: true,
        changeable: true,
        changeFee: 0
      }
    }
  },
  amenities: {
    wifi: true,
    entertainment: true,
    meals: ["breakfast", "lunch", "dinner"],
    power: true,
    usb: true
  },
  baggage: {
    carryOn: {
      weight: 7,
      dimensions: "55x40x20",
      unit: "kg"
    },
    checked: {
      economy: {
        pieces: 1,
        weight: 30,
        unit: "kg"
      },
      business: {
        pieces: 2,
        weight: 32,
        unit: "kg"
      }
    }
  },
  status: "scheduled", // scheduled|delayed|cancelled|boarding|departed|arrived
  operatingDays: [1, 2, 3, 4, 5, 6, 7], // 1=Monday, 7=Sunday
  validFrom: ISODate("2024-01-01"),
  validTo: ISODate("2024-12-31"),
  createdAt: ISODate("2024-01-01"),
  updatedAt: ISODate("2024-12-15")
}
```

## 🏨 Hotels Collection

```javascript
{
  _id: ObjectId("..."),
  name: "Grand Plaza Hotel",
  description: "Luxury hotel in the heart of Paris with stunning city views",
  starRating: 5,
  rating: {
    overall: 4.8,
    breakdown: {
      cleanliness: 4.9,
      service: 4.8,
      location: 4.7,
      value: 4.6,
      amenities: 4.8
    },
    reviewCount: 1247
  },
  location: {
    address: {
      street: "123 Champs-Élysées",
      city: "Paris",
      state: "Île-de-France",
      zipCode: "75008",
      country: "France"
    },
    coordinates: {
      type: "Point",
      coordinates: [2.3522, 48.8566]
    },
    landmarks: [
      {
        name: "Eiffel Tower",
        distance: 0.5,
        unit: "km",
        walkingTime: 6
      },
      {
        name: "Louvre Museum",
        distance: 1.2,
        unit: "km",
        walkingTime: 15
      }
    ],
    transportation: {
      nearestMetro: {
        name: "Charles de Gaulle - Étoile",
        distance: 0.2,
        lines: ["1", "2", "6"]
      },
      airport: {
        name: "Charles de Gaulle Airport",
        distance: 35,
        unit: "km",
        travelTime: 45
      }
    }
  },
  contact: {
    phone: "+33 1 23 45 67 89",
    email: "info@grandplaza.com",
    website: "https://grandplaza.com"
  },
  images: [
    {
      url: "https://s3.amazonaws.com/hotels/grand-plaza/exterior.jpg",
      type: "exterior",
      caption: "Hotel exterior view"
    },
    {
      url: "https://s3.amazonaws.com/hotels/grand-plaza/lobby.jpg",
      type: "lobby",
      caption: "Elegant lobby"
    }
  ],
  amenities: {
    general: [
      "Free WiFi", "24-hour front desk", "Concierge service",
      "Room service", "Laundry service", "Currency exchange"
    ],
    recreation: [
      "Swimming pool", "Fitness center", "Spa", "Sauna"
    ],
    dining: [
      "Restaurant", "Bar", "Room service", "Breakfast buffet"
    ],
    business: [
      "Business center", "Meeting rooms", "Conference facilities"
    ],
    accessibility: [
      "Wheelchair accessible", "Elevator", "Accessible parking"
    ]
  },
  rooms: [
    {
      type: "Deluxe Room",
      description: "Spacious room with city view",
      size: 35,
      sizeUnit: "sqm",
      maxOccupancy: 2,
      beds: [
        {
          type: "King",
          count: 1
        }
      ],
      amenities: [
        "Air conditioning", "Minibar", "Safe", "Flat-screen TV",
        "Coffee machine", "Balcony"
      ],
      images: [
        "https://s3.amazonaws.com/hotels/grand-plaza/deluxe-room.jpg"
      ],
      pricing: {
        baseRate: 320,
        currency: "USD",
        taxesIncluded: false,
        taxes: 16,
        totalRate: 336
      },
      availability: {
        total: 20,
        available: 5
      }
    }
  ],
  policies: {
    checkIn: {
      from: "15:00",
      to: "23:00"
    },
    checkOut: {
      until: "11:00"
    },
    cancellation: {
      free: 24, // hours before check-in
      policy: "Free cancellation until 24 hours before check-in"
    },
    children: {
      allowed: true,
      freeAge: 12,
      policy: "Children under 12 stay free"
    },
    pets: {
      allowed: false,
      fee: 0,
      policy: "Pets not allowed"
    },
    smoking: {
      allowed: false,
      areas: ["designated outdoor areas"]
    },
    payment: {
      methods: ["credit_card", "debit_card", "cash"],
      deposit: 100,
      currency: "USD"
    }
  },
  sustainability: {
    certified: true,
    certifications: ["Green Key", "EarthCheck"],
    practices: [
      "Energy-efficient lighting",
      "Water conservation",
      "Waste reduction",
      "Local sourcing"
    ]
  },
  createdAt: ISODate("2023-01-01"),
  updatedAt: ISODate("2024-12-15"),
  status: "active" // active|inactive|maintenance
}
```

## 📋 Bookings Collection

```javascript
{
  _id: ObjectId("..."),
  bookingReference: "TRV-ABC123456",
  userId: ObjectId("..."),
  type: "flight", // flight|hotel|package|itinerary
  status: "confirmed", // pending|confirmed|cancelled|completed|refunded
  items: [
    {
      type: "flight",
      flightId: ObjectId("..."),
      flightNumber: "EK205",
      passengers: [
        {
          title: "Mr",
          firstName: "John",
          lastName: "Doe",
          dateOfBirth: ISODate("1990-05-15"),
          passport: {
            number: "A12345678",
            expiry: ISODate("2030-05-15"),
            nationality: "US"
          },
          seatNumber: "12A",
          mealPreference: "vegetarian",
          specialRequests: ["wheelchair assistance"]
        }
      ],
      fareClass: "economy",
      baggage: {
        carryOn: 1,
        checked: 1
      }
    }
  ],
  pricing: {
    subtotal: 1250,
    taxes: 180,
    fees: 25,
    discount: 50,
    total: 1405,
    currency: "USD",
    breakdown: [
      {
        description: "Flight EK205",
        amount: 1250
      },
      {
        description: "Taxes and fees",
        amount: 180
      },
      {
        description: "Booking fee",
        amount: 25
      },
      {
        description: "Loyalty discount",
        amount: -50
      }
    ]
  },
  payment: {
    method: "credit_card", // credit_card|debit_card|paypal|bank_transfer
    status: "completed", // pending|completed|failed|refunded
    transactionId: "TXN_789012345",
    gateway: "stripe",
    installments: {
      enabled: false,
      plan: null
    },
    paidAt: ISODate("2024-12-15T10:30:00Z"),
    refunds: []
  },
  contact: {
    email: "john@example.com",
    phone: "+1234567890",
    emergencyContact: {
      name: "Jane Doe",
      phone: "+1234567891",
      relationship: "spouse"
    }
  },
  dates: {
    departure: ISODate("2024-12-20T14:30:00Z"),
    return: ISODate("2024-12-25T10:15:00Z")
  },
  cancellation: {
    allowed: true,
    deadline: ISODate("2024-12-18T23:59:59Z"),
    penalty: 50,
    refundAmount: 1355,
    policy: "50 USD cancellation fee applies"
  },
  modifications: {
    allowed: true,
    fee: 150,
    restrictions: ["date change allowed", "name change not allowed"]
  },
  documents: [
    {
      type: "e-ticket",
      url: "https://s3.amazonaws.com/bookings/tickets/TRV-ABC123456.pdf",
      generatedAt: ISODate("2024-12-15T10:35:00Z")
    },
    {
      type: "invoice",
      url: "https://s3.amazonaws.com/bookings/invoices/TRV-ABC123456.pdf",
      generatedAt: ISODate("2024-12-15T10:35:00Z")
    }
  ],
  notifications: {
    confirmationSent: true,
    remindersSent: 0,
    checkInReminder: false
  },
  metadata: {
    source: "web", // web|mobile|api
    userAgent: "Mozilla/5.0...",
    ipAddress: "192.168.1.1",
    affiliate: null,
    campaign: "summer_sale_2024"
  },
  createdAt: ISODate("2024-12-15T10:30:00Z"),
  updatedAt: ISODate("2024-12-15T10:35:00Z"),
  completedAt: null
}
```

## 🗺️ Itineraries Collection

```javascript
{
  _id: ObjectId("..."),
  title: "Romantic Paris Getaway",
  description: "A perfect 5-day romantic escape in the City of Love",
  userId: ObjectId("..."),
  type: "ai_generated", // ai_generated|custom|template
  status: "published", // draft|published|archived
  visibility: "private", // private|public|shared
  destination: {
    primary: "Paris, France",
    countries: ["France"],
    cities: ["Paris"],
    coordinates: {
      type: "Point",
      coordinates: [2.3522, 48.8566]
    }
  },
  duration: {
    days: 5,
    nights: 4
  },
  travelers: {
    adults: 2,
    children: 0,
    infants: 0
  },
  budget: {
    estimated: 2850,
    breakdown: {
      accommodation: 1200,
      activities: 800,
      meals: 600,
      transportation: 250
    },
    currency: "USD",
    range: "mid-range" // budget|mid-range|luxury
  },
  dates: {
    startDate: ISODate("2024-12-20"),
    endDate: ISODate("2024-12-24"),
    flexible: false
  },
  days: [
    {
      day: 1,
      date: ISODate("2024-12-20"),
      theme: "Arrival & City Introduction",
      activities: [
        {
          time: "14:00",
          title: "Hotel Check-in",
          description: "Settle into your romantic suite at Grand Plaza Hotel",
          duration: 60, // minutes
          cost: 0,
          location: {
            name: "Grand Plaza Hotel",
            address: "123 Champs-Élysées, Paris",
            coordinates: {
              type: "Point",
              coordinates: [2.3522, 48.8566]
            }
          },
          type: "accommodation",
          bookingRequired: false,
          bookingInfo: null,
          images: ["https://s3.amazonaws.com/activities/hotel-checkin.jpg"],
          tips: ["Arrive after 3 PM for check-in", "Ask for room upgrade"]
        },
        {
          time: "16:00",
          title: "Seine River Cruise",
          description: "Romantic boat ride along the Seine with champagne service",
          duration: 120,
          cost: 120,
          location: {
            name: "Pont Neuf",
            address: "Pont Neuf, Paris",
            coordinates: {
              type: "Point",
              coordinates: [2.3414, 48.8566]
            }
          },
          type: "activity",
          bookingRequired: true,
          bookingInfo: {
            provider: "Seine Cruises",
            website: "https://seine-cruises.com",
            phone: "+33 1 23 45 67 89"
          },
          images: ["https://s3.amazonaws.com/activities/seine-cruise.jpg"],
          tips: ["Book sunset cruise for best experience", "Dress warmly in winter"]
        }
      ],
      meals: [
        {
          time: "19:30",
          type: "dinner",
          restaurant: {
            name: "Le Jules Verne",
            cuisine: "French Fine Dining",
            priceRange: "$$$",
            rating: 4.9,
            location: "Eiffel Tower, 2nd Floor",
            reservationRequired: true
          },
          estimatedCost: 200
        }
      ],
      transportation: [
        {
          from: "Charles de Gaulle Airport",
          to: "Grand Plaza Hotel",
          method: "taxi",
          duration: 45,
          cost: 60
        }
      ],
      notes: "First day should be relaxed to recover from travel"
    }
  ],
  recommendations: {
    restaurants: [
      {
        name: "Le Jules Verne",
        cuisine: "French Fine Dining",
        priceRange: "$$$",
        rating: 4.9,
        speciality: "Michelin starred restaurant in Eiffel Tower",
        reservationRequired: true
      }
    ],
    hotels: [
      {
        name: "Hotel Plaza Athénée",
        rating: 5,
        pricePerNight: 450,
        features: ["Spa", "Michelin Restaurant", "Eiffel Tower View"]
      }
    ],
    activities: [
      {
        name: "Louvre Museum Skip-the-Line Tour",
        duration: 180,
        cost: 65,
        rating: 4.8,
        category: "culture"
      }
    ]
  },
  tips: [
    "Book restaurant reservations well in advance",
    "Purchase museum passes for skip-the-line access",
    "Pack comfortable walking shoes for cobblestone streets",
    "Learn basic French phrases for better local interaction"
  ],
  packing: {
    essentials: ["Passport", "Travel insurance", "Comfortable shoes"],
    weather: ["Light jacket", "Umbrella", "Layers for variable weather"],
    activities: ["Camera", "Portable charger", "Day backpack"]
  },
  ai: {
    generated: true,
    model: "gpt-4",
    confidence: 0.92,
    prompt: "Romantic getaway in Paris for 5 days with my partner",
    preferences: {
      budget: "mid-range",
      interests: ["culture", "food", "romance"],
      travelStyle: "relaxed"
    },
    generatedAt: ISODate("2024-12-15T10:30:00Z"),
    refinements: 2
  },
  sharing: {
    shareCode: "ITN_SHARE_ABC123",
    sharedWith: [],
    publicUrl: "https://travelai.com/itinerary/share/ABC123",
    allowComments: true,
    allowCopying: true
  },
  stats: {
    views: 156,
    likes: 23,
    copies: 8,
    bookings: 3
  },
  tags: ["romantic", "paris", "culture", "food", "luxury", "couples"],
  createdAt: ISODate("2024-12-15T10:30:00Z"),
  updatedAt: ISODate("2024-12-15T11:45:00Z"),
  publishedAt: ISODate("2024-12-15T11:45:00Z")
}
```

## 💬 Reviews Collection

```javascript
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),
  targetType: "hotel", // hotel|flight|activity|restaurant|itinerary
  targetId: ObjectId("..."),
  bookingId: ObjectId("..."),
  rating: {
    overall: 5,
    breakdown: {
      cleanliness: 5,
      service: 4,
      location: 5,
      value: 4,
      amenities: 5
    }
  },
  title: "Amazing stay in Paris!",
  content: "The hotel exceeded all expectations. The staff was incredibly friendly and the location was perfect for exploring the city. The room was spacious and clean with a beautiful view of the Eiffel Tower. Highly recommend!",
  pros: [
    "Excellent location",
    "Friendly staff",
    "Clean rooms",
    "Great view"
  ],
  cons: [
    "Expensive breakfast",
    "Small bathroom"
  ],
  images: [
    {
      url: "https://s3.amazonaws.com/reviews/user123/hotel456/room-view.jpg",
      caption: "View from our room"
    }
  ],
  helpful: {
    yes: 23,
    no: 2,
    voters: [ObjectId("..."), ObjectId("...")]
  },
  verified: true, // verified booking
  response: {
    from: "hotel_manager",
    content: "Thank you for your wonderful review! We're delighted you enjoyed your stay.",
    respondedAt: ISODate("2024-12-16T09:00:00Z")
  },
  moderation: {
    status: "approved", // pending|approved|rejected
    moderatedAt: ISODate("2024-12-15T12:00:00Z"),
    moderatedBy: ObjectId("...")
  },
  metadata: {
    stayDates: {
      checkIn: ISODate("2024-12-10"),
      checkOut: ISODate("2024-12-15")
    },
    roomType: "Deluxe Room",
    travelType: "couple", // solo|couple|family|business|friends
    source: "web"
  },
  createdAt: ISODate("2024-12-15T11:30:00Z"),
  updatedAt: ISODate("2024-12-15T12:00:00Z")
}
```