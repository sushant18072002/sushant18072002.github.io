# Database Collections - Detailed Schema & Operations

## 📊 Complete Database Schema (25 Collections)

### 1. Users Collection
**Purpose:** Store user accounts and profiles

```javascript
// Schema: models/User.js
{
  _id: ObjectId,
  email: String, // unique, required
  password: String, // hashed
  status: String, // 'active', 'inactive', 'deleted'
  
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    dateOfBirth: Date,
    avatar: String // URL to profile image
  },
  
  preferences: {
    currency: String, // 'USD', 'EUR', etc.
    language: String, // 'en', 'fr', etc.
    notifications: {
      email: Boolean,
      sms: Boolean,
      push: Boolean
    }
  },
  
  loyaltyPoints: Number,
  
  security: {
    mfa: {
      enabled: Boolean,
      secret: String,
      backupCodes: [String]
    },
    loginAttempts: Number,
    lockedUntil: Date
  },
  
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date
}

// Indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "status": 1 });
db.users.createIndex({ "createdAt": -1 });
```

**CRUD Operations:**
```javascript
// Create user
POST /api/v1/auth/register
{ email, password, firstName, lastName }

// Read user profile
GET /api/v1/users/:userId/profile

// Update preferences
PATCH /api/v1/users/:userId/preferences
{ currency: "EUR", notifications: { email: true } }

// Soft delete
DELETE /api/v1/users/:userId/account
```

### 2. Flights Collection
**Purpose:** Store flight schedules and pricing

```javascript
// Schema: models/Flight.js
{
  _id: ObjectId,
  flightNumber: String, // 'AA123'
  
  airline: {
    code: String, // 'AA'
    name: String, // 'American Airlines'
    logo: String  // URL to logo
  },
  
  aircraft: {
    type: String, // 'Boeing 737'
    capacity: {
      economy: Number,
      business: Number,
      first: Number
    }
  },
  
  route: {
    departure: {
      airport: {
        code: String, // 'JFK'
        name: String, // 'John F. Kennedy International'
        city: String, // 'New York'
        country: String // 'United States'
      },
      scheduledTime: Date,
      actualTime: Date,
      terminal: String,
      gate: String
    },
    arrival: {
      airport: {
        code: String,
        name: String,
        city: String,
        country: String
      },
      scheduledTime: Date,
      actualTime: Date,
      terminal: String,
      gate: String
    }
  },
  
  pricing: {
    economy: {
      basePrice: Number,
      taxes: Number,
      totalPrice: Number,
      availability: Number
    },
    business: {
      basePrice: Number,
      taxes: Number,
      totalPrice: Number,
      availability: Number
    },
    priceHistory: [{
      price: Number,
      timestamp: Date,
      source: String
    }],
    lastUpdated: Date
  },
  
  status: String, // 'scheduled', 'delayed', 'cancelled'
  amenities: [String], // ['WiFi', 'Meals', 'Entertainment']
  
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.flights.createIndex({ 
  "route.departure.airport.code": 1,
  "route.arrival.airport.code": 1,
  "route.departure.scheduledTime": 1 
});
db.flights.createIndex({ "flightNumber": 1 });
db.flights.createIndex({ "status": 1 });
```

**CRUD Operations:**
```javascript
// Import flights (System)
POST /api/v1/admin/flights/import
[{ flightNumber, airline, route, pricing }]

// Search flights
GET /api/v1/flights/search?from=JFK&to=LAX&date=2024-12-20

// Update pricing
PATCH /api/v1/flights/:id/pricing
{ economy: { totalPrice: 450 } }

// Update status
PATCH /api/v1/flights/:id/status
{ status: "delayed", newDepartureTime: "10:30" }
```

### 3. Hotels Collection
**Purpose:** Store hotel information and room details

```javascript
// Schema: models/Hotel.js
{
  _id: ObjectId,
  name: String, // 'Grand Plaza Hotel'
  starRating: Number, // 1-5
  
  location: {
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    coordinates: {
      type: "Point",
      coordinates: [Number, Number] // [longitude, latitude]
    }
  },
  
  contact: {
    phone: String,
    email: String,
    website: String
  },
  
  rooms: [{
    type: String, // 'Standard', 'Deluxe', 'Suite'
    count: Number, // Total rooms of this type
    maxOccupancy: Number,
    size: Number, // Square meters
    amenities: [String],
    pricing: {
      baseRate: Number,
      currency: String,
      taxRate: Number
    },
    images: [String] // URLs to room images
  }],
  
  amenities: [String], // Hotel amenities
  policies: {
    checkIn: String, // '15:00'
    checkOut: String, // '11:00'
    cancellation: String,
    petPolicy: String
  },
  
  rating: {
    overall: Number, // Average rating
    reviewCount: Number,
    breakdown: {
      cleanliness: Number,
      service: Number,
      location: Number,
      value: Number
    }
  },
  
  images: [String], // URLs to hotel images
  description: String,
  
  status: String, // 'active', 'inactive'
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.hotels.createIndex({ "location.coordinates": "2dsphere" });
db.hotels.createIndex({ "location.address.city": 1 });
db.hotels.createIndex({ "starRating": 1 });
db.hotels.createIndex({ "rating.overall": -1 });
```

**CRUD Operations:**
```javascript
// Add hotel (Admin)
POST /api/v1/admin/hotels
{ name, starRating, location, rooms, amenities }

// Search hotels
GET /api/v1/hotels/search?location=Paris&checkIn=2024-12-20

// Update room availability
PATCH /api/v1/hotels/:id/rooms/availability
{ roomType: "Standard", available: 5 }

// Add review
POST /api/v1/hotels/:id/reviews
{ rating: 5, title: "Great stay!", content: "..." }
```

### 4. Bookings Collection
**Purpose:** Store all booking records

```javascript
// Schema: models/Booking.js
{
  _id: ObjectId,
  bookingReference: String, // 'TRV-ABC123'
  userId: ObjectId, // Reference to Users
  
  type: String, // 'flight', 'hotel', 'package'
  status: String, // 'pending', 'confirmed', 'cancelled', 'completed'
  
  items: [{
    type: String, // 'flight', 'hotel'
    itemId: ObjectId, // Reference to Flight/Hotel
    details: {
      // Flight booking details
      flightNumber: String,
      departureTime: Date,
      arrivalTime: Date,
      passengers: [{
        firstName: String,
        lastName: String,
        dateOfBirth: Date,
        passportNumber: String,
        seatNumber: String
      }],
      
      // Hotel booking details
      hotelName: String,
      roomType: String,
      checkIn: Date,
      checkOut: Date,
      guests: Number,
      roomNumber: String
    }
  }],
  
  pricing: {
    subtotal: Number,
    taxes: Number,
    fees: Number,
    total: Number,
    currency: String,
    breakdown: [{
      item: String,
      amount: Number
    }]
  },
  
  payment: {
    method: String, // 'card', 'paypal'
    transactionId: String,
    status: String, // 'pending', 'completed', 'failed'
    paidAt: Date
  },
  
  contact: {
    email: String,
    phone: String
  },
  
  statusHistory: [{
    status: String,
    timestamp: Date,
    reason: String
  }],
  
  createdAt: Date,
  updatedAt: Date,
  confirmedAt: Date,
  cancelledAt: Date
}

// Indexes
db.bookings.createIndex({ "userId": 1, "createdAt": -1 });
db.bookings.createIndex({ "bookingReference": 1 }, { unique: true });
db.bookings.createIndex({ "status": 1 });
db.bookings.createIndex({ "type": 1 });
```

**CRUD Operations:**
```javascript
// Create booking
POST /api/v1/bookings
{ userId, type: "flight", items: [...], pricing: {...} }

// Get booking details
GET /api/v1/bookings/:id

// Update status
PATCH /api/v1/bookings/:id/status
{ status: "confirmed", confirmationCode: "ABC123" }

// Cancel booking
DELETE /api/v1/bookings/:id
{ reason: "User requested cancellation" }
```

### 5. Itineraries Collection
**Purpose:** Store AI-generated and custom itineraries

```javascript
// Schema: models/Itinerary.js
{
  _id: ObjectId,
  title: String, // 'Paris Romantic Getaway'
  userId: ObjectId, // Reference to Users
  
  type: String, // 'ai-generated', 'template', 'custom'
  status: String, // 'draft', 'published', 'booked'
  
  destination: {
    primary: String, // 'Paris, France'
    secondary: [String] // ['Versailles', 'Loire Valley']
  },
  
  duration: {
    days: Number,
    nights: Number
  },
  
  travelers: {
    adults: Number,
    children: Number,
    infants: Number
  },
  
  budget: {
    total: Number,
    currency: String,
    category: String // 'budget', 'mid-range', 'luxury'
  },
  
  days: [{
    day: Number,
    date: Date,
    location: String,
    activities: [{
      time: String, // '09:00'
      title: String,
      description: String,
      duration: Number, // minutes
      cost: Number,
      location: {
        name: String,
        address: String,
        coordinates: [Number, Number]
      },
      bookingRequired: Boolean,
      bookingUrl: String,
      category: String // 'sightseeing', 'dining', 'transport'
    }],
    accommodation: {
      name: String,
      checkIn: String,
      checkOut: String,
      cost: Number
    },
    transport: [{
      type: String, // 'flight', 'train', 'car'
      from: String,
      to: String,
      time: String,
      cost: Number
    }],
    totalCost: Number
  }],
  
  aiMetadata: {
    generatedBy: String, // 'template-engine'
    templateId: ObjectId,
    prompt: String,
    confidence: Number,
    refinements: [{
      type: String,
      description: String,
      timestamp: Date
    }]
  },
  
  sharing: {
    isPublic: Boolean,
    shareCode: String,
    views: Number,
    likes: Number,
    copies: Number
  },
  
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.itineraries.createIndex({ "userId": 1, "createdAt": -1 });
db.itineraries.createIndex({ "destination.primary": 1 });
db.itineraries.createIndex({ "type": 1 });
db.itineraries.createIndex({ "sharing.isPublic": 1, "sharing.likes": -1 });
```

**CRUD Operations:**
```javascript
// Create AI itinerary
POST /api/v1/ai/generate-trip
{ prompt: "Romantic Paris trip", duration: 5, budget: "mid-range" }

// Get user itineraries
GET /api/v1/users/:userId/itineraries

// Update itinerary
PATCH /api/v1/itineraries/:id
{ title: "Updated title", days: [...] }

// Delete itinerary
DELETE /api/v1/itineraries/:id
```

### 6. Reviews Collection
**Purpose:** Store user reviews for hotels, flights, packages

```javascript
// Schema: models/Review.js
{
  _id: ObjectId,
  userId: ObjectId, // Reference to Users
  
  targetType: String, // 'hotel', 'flight', 'package'
  targetId: ObjectId, // Reference to target item
  bookingId: ObjectId, // Reference to Booking
  
  rating: {
    overall: Number, // 1-5
    breakdown: {
      cleanliness: Number, // For hotels
      service: Number,
      location: Number,
      value: Number,
      comfort: Number, // For flights
      punctuality: Number // For flights
    }
  },
  
  title: String,
  content: String,
  
  helpful: {
    yes: Number,
    no: Number,
    voters: [ObjectId] // User IDs who voted
  },
  
  verified: Boolean, // True if user actually booked
  
  response: {
    content: String, // Business response
    respondedBy: String,
    respondedAt: Date
  },
  
  images: [String], // URLs to review images
  
  status: String, // 'published', 'pending', 'rejected'
  
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.reviews.createIndex({ "targetType": 1, "targetId": 1, "createdAt": -1 });
db.reviews.createIndex({ "userId": 1, "createdAt": -1 });
db.reviews.createIndex({ "rating.overall": -1 });
db.reviews.createIndex({ "verified": 1 });
```

**CRUD Operations:**
```javascript
// Add review
POST /api/v1/reviews
{ targetType: "hotel", targetId: "hotel123", rating: {...}, content: "..." }

// Get reviews for item
GET /api/v1/reviews?targetType=hotel&targetId=hotel123

// Mark review helpful
PATCH /api/v1/reviews/:id/helpful
{ helpful: true }

// Delete review
DELETE /api/v1/reviews/:id
```

### 7. Destinations Collection
**Purpose:** Store destination information and attractions

```javascript
// Schema: models/Destination.js
{
  _id: ObjectId,
  name: String, // 'Paris'
  country: String, // 'France'
  continent: String, // 'Europe'
  
  description: String,
  shortDescription: String,
  
  coordinates: {
    type: "Point",
    coordinates: [Number, Number]
  },
  
  images: [{
    url: String,
    caption: String,
    credit: String
  }],
  
  attractions: [{
    name: String,
    type: String, // 'landmark', 'museum', 'restaurant'
    description: String,
    rating: Number,
    coordinates: [Number, Number],
    openingHours: String,
    ticketPrice: Number,
    website: String
  }],
  
  bestTimeToVisit: {
    months: [String], // ['April', 'May', 'September']
    weather: String,
    events: [String]
  },
  
  transportation: {
    airport: {
      code: String,
      name: String,
      distance: Number // km from city center
    },
    publicTransport: [String], // ['Metro', 'Bus', 'Tram']
    averageTaxiFare: Number
  },
  
  costs: {
    budgetPerDay: {
      budget: Number,
      midRange: Number,
      luxury: Number
    },
    currency: String
  },
  
  featured: Boolean,
  priority: Number, // For featured destinations
  
  stats: {
    views: Number,
    searches: Number,
    bookings: Number
  },
  
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.destinations.createIndex({ "coordinates": "2dsphere" });
db.destinations.createIndex({ "country": 1 });
db.destinations.createIndex({ "featured": 1, "priority": 1 });
db.destinations.createIndex({ "name": "text", "description": "text" });
```

**CRUD Operations:**
```javascript
// Add destination (Admin)
POST /api/v1/admin/destinations
{ name: "Tokyo", country: "Japan", description: "...", attractions: [...] }

// Search destinations
GET /api/v1/destinations/search?q=paris

// Get featured destinations
GET /api/v1/destinations/featured?limit=4

// Update destination stats
PATCH /api/v1/destinations/:id/stats
{ views: 1250, searches: 890 }
```

### 8. Packages Collection
**Purpose:** Store pre-made travel packages

```javascript
// Schema: models/Package.js
{
  _id: ObjectId,
  title: String, // 'Japan Adventure Package'
  slug: String, // 'japan-adventure-package'
  
  description: String,
  shortDescription: String,
  
  destinations: [String], // ['Tokyo', 'Kyoto', 'Osaka']
  duration: Number, // days
  
  price: {
    amount: Number,
    currency: String,
    originalPrice: Number, // For showing discounts
    discount: Number // percentage
  },
  
  includes: [String], // ['Flights', 'Hotels', 'Tours', 'Meals']
  excludes: [String], // ['Travel Insurance', 'Personal Expenses']
  
  itinerary: {
    overview: String,
    days: [{
      day: Number,
      title: String,
      description: String,
      activities: [String],
      meals: [String], // ['Breakfast', 'Lunch']
      accommodation: String
    }]
  },
  
  images: [{
    url: String,
    caption: String,
    isMain: Boolean
  }],
  
  category: String, // 'romantic', 'adventure', 'cultural'
  difficulty: String, // 'easy', 'moderate', 'challenging'
  
  groupSize: {
    min: Number,
    max: Number
  },
  
  rating: {
    overall: Number,
    reviewCount: Number
  },
  
  availability: {
    startDates: [Date],
    maxBookings: Number,
    currentBookings: Number
  },
  
  featured: Boolean,
  priority: Number,
  
  status: String, // 'active', 'inactive', 'sold-out'
  
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.packages.createIndex({ "category": 1, "price.amount": 1 });
db.packages.createIndex({ "destinations": 1 });
db.packages.createIndex({ "featured": 1, "priority": 1 });
db.packages.createIndex({ "rating.overall": -1 });
```

**CRUD Operations:**
```javascript
// Create package (Admin)
POST /api/v1/admin/packages
{ title: "Bali Escape", duration: 10, price: {...}, itinerary: {...} }

// Get packages
GET /api/v1/packages?category=romantic&maxPrice=3000

// Get package details
GET /api/v1/packages/:id/details

// Update package
PATCH /api/v1/admin/packages/:id
{ price: { amount: 1650 }, availability: {...} }
```

## 🔄 Data Relationships

### Primary Relationships
```javascript
// User -> Bookings (One to Many)
User._id -> Booking.userId

// User -> Itineraries (One to Many)
User._id -> Itinerary.userId

// User -> Reviews (One to Many)
User._id -> Review.userId

// Booking -> Reviews (One to One)
Booking._id -> Review.bookingId

// Flight/Hotel -> Bookings (One to Many)
Flight._id -> Booking.items.itemId
Hotel._id -> Booking.items.itemId
```

### Data Consistency Operations
```javascript
// When user is deleted, handle related data
const handleUserDeletion = async (userId) => {
  await Promise.all([
    // Anonymize reviews
    Review.updateMany(
      { userId },
      { $set: { userId: null, userDisplayName: "Anonymous" } }
    ),
    
    // Cancel pending bookings
    Booking.updateMany(
      { userId, status: 'pending' },
      { $set: { status: 'cancelled', cancelledAt: new Date() } }
    ),
    
    // Archive itineraries
    Itinerary.updateMany(
      { userId },
      { $set: { status: 'archived', archivedAt: new Date() } }
    )
  ]);
};
```

This detailed schema provides complete structure for all 25 collections with proper indexing and CRUD operations for efficient data management.