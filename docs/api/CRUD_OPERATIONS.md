# CRUD Operations & Database Management

## 📊 Complete CRUD Operations by Collection

### 1. Users Collection

#### Create User
```http
POST /api/v1/users
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "hashedPassword",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  }
}
```

#### Read User
```http
GET /api/v1/users/:id
GET /api/v1/users/profile (current user)
GET /api/v1/users?page=1&limit=20&search=john (admin only)
```

#### Update User
```http
PUT /api/v1/users/:id
PATCH /api/v1/users/profile (partial update)

{
  "profile": {
    "firstName": "John Updated",
    "preferences": {
      "currency": "EUR",
      "language": "en"
    }
  }
}
```

#### Delete User
```http
DELETE /api/v1/users/:id (soft delete)
DELETE /api/v1/users/:id/permanent (hard delete - admin only)
```

### 2. Flights Collection

#### Create Flight
```http
POST /api/v1/flights
{
  "flightNumber": "EK205",
  "airline": {
    "code": "EK",
    "name": "Emirates"
  },
  "route": {
    "departure": {
      "airport": {
        "code": "DXB",
        "name": "Dubai International Airport"
      },
      "scheduledTime": "2024-12-20T14:30:00Z"
    },
    "arrival": {
      "airport": {
        "code": "JFK", 
        "name": "John F. Kennedy International Airport"
      },
      "scheduledTime": "2024-12-20T19:45:00Z"
    }
  },
  "pricing": {
    "economy": {
      "basePrice": 980,
      "taxes": 270,
      "totalPrice": 1250
    }
  }
}
```

#### Read Flights
```http
GET /api/v1/flights/search?from=DXB&to=JFK&date=2024-12-20
GET /api/v1/flights/:id
GET /api/v1/flights?airline=EK&status=scheduled
```

#### Update Flight
```http
PUT /api/v1/flights/:id
PATCH /api/v1/flights/:id/status
PATCH /api/v1/flights/:id/pricing
```

#### Delete Flight
```http
DELETE /api/v1/flights/:id
```

### 3. Hotels Collection

#### Create Hotel
```http
POST /api/v1/hotels
{
  "name": "Grand Plaza Hotel",
  "starRating": 5,
  "location": {
    "address": {
      "street": "123 Main St",
      "city": "Paris",
      "country": "France"
    },
    "coordinates": {
      "type": "Point",
      "coordinates": [2.3522, 48.8566]
    }
  },
  "rooms": [
    {
      "type": "Deluxe Room",
      "maxOccupancy": 2,
      "pricing": {
        "baseRate": 320,
        "currency": "USD"
      }
    }
  ]
}
```

#### Read Hotels
```http
GET /api/v1/hotels/search?location=Paris&checkIn=2024-12-20&checkOut=2024-12-25
GET /api/v1/hotels/:id
GET /api/v1/hotels/:id/rooms
GET /api/v1/hotels/:id/availability?checkIn=2024-12-20&checkOut=2024-12-25
```

#### Update Hotel
```http
PUT /api/v1/hotels/:id
PATCH /api/v1/hotels/:id/rooms
PATCH /api/v1/hotels/:id/pricing
```

#### Delete Hotel
```http
DELETE /api/v1/hotels/:id
```

### 4. Bookings Collection

#### Create Booking
```http
POST /api/v1/bookings
{
  "userId": "user123",
  "type": "flight",
  "items": [
    {
      "type": "flight",
      "flightId": "flight123",
      "passengers": [
        {
          "firstName": "John",
          "lastName": "Doe",
          "dateOfBirth": "1990-05-15"
        }
      ]
    }
  ],
  "pricing": {
    "total": 1250,
    "currency": "USD"
  }
}
```

#### Read Bookings
```http
GET /api/v1/bookings?userId=user123
GET /api/v1/bookings/:id
GET /api/v1/bookings/:id/details
GET /api/v1/bookings/search?status=confirmed&dateFrom=2024-01-01
```

#### Update Booking
```http
PUT /api/v1/bookings/:id
PATCH /api/v1/bookings/:id/status
PATCH /api/v1/bookings/:id/passengers
```

#### Delete Booking (Cancel)
```http
DELETE /api/v1/bookings/:id (cancel booking)
POST /api/v1/bookings/:id/cancel (with cancellation reason)
```

### 5. Itineraries Collection

#### Create Itinerary
```http
POST /api/v1/itineraries
{
  "title": "Paris Getaway",
  "userId": "user123",
  "type": "custom",
  "destination": {
    "primary": "Paris, France"
  },
  "duration": {
    "days": 5,
    "nights": 4
  },
  "days": [
    {
      "day": 1,
      "date": "2024-12-20",
      "activities": [
        {
          "time": "14:00",
          "title": "Hotel Check-in",
          "duration": 60,
          "cost": 0
        }
      ]
    }
  ]
}
```

#### Read Itineraries
```http
GET /api/v1/itineraries?userId=user123
GET /api/v1/itineraries/:id
GET /api/v1/itineraries/templates
GET /api/v1/itineraries/search?destination=Paris&duration=5
```

#### Update Itinerary
```http
PUT /api/v1/itineraries/:id
PATCH /api/v1/itineraries/:id/days
PATCH /api/v1/itineraries/:id/activities
```

#### Delete Itinerary
```http
DELETE /api/v1/itineraries/:id
```

### 6. Reviews Collection

#### Create Review
```http
POST /api/v1/reviews
{
  "userId": "user123",
  "targetType": "hotel",
  "targetId": "hotel123",
  "bookingId": "booking123",
  "rating": {
    "overall": 5,
    "breakdown": {
      "cleanliness": 5,
      "service": 4,
      "location": 5
    }
  },
  "title": "Amazing stay!",
  "content": "The hotel exceeded expectations..."
}
```

#### Read Reviews
```http
GET /api/v1/reviews?targetType=hotel&targetId=hotel123
GET /api/v1/reviews/:id
GET /api/v1/reviews/user/:userId
```

#### Update Review
```http
PUT /api/v1/reviews/:id
PATCH /api/v1/reviews/:id/helpful (mark as helpful)
```

#### Delete Review
```http
DELETE /api/v1/reviews/:id
```

### 7. Destinations Collection

#### Create Destination
```http
POST /api/v1/destinations
{
  "name": "Paris",
  "country": "France",
  "description": "City of Light and Love",
  "coordinates": {
    "type": "Point",
    "coordinates": [2.3522, 48.8566]
  },
  "attractions": [
    {
      "name": "Eiffel Tower",
      "type": "landmark",
      "rating": 4.8
    }
  ],
  "bestTimeToVisit": {
    "months": ["April", "May", "September", "October"]
  }
}
```

#### Read Destinations
```http
GET /api/v1/destinations
GET /api/v1/destinations/:id
GET /api/v1/destinations/search?q=paris
GET /api/v1/destinations/popular
GET /api/v1/destinations/nearby?lat=48.8566&lng=2.3522&radius=50
```

#### Update Destination
```http
PUT /api/v1/destinations/:id
PATCH /api/v1/destinations/:id/attractions
```

#### Delete Destination
```http
DELETE /api/v1/destinations/:id
```

### 8. Packages Collection

#### Create Package
```http
POST /api/v1/packages
{
  "title": "Paris Romance Package",
  "description": "5-day romantic getaway",
  "duration": 5,
  "price": {
    "amount": 1890,
    "currency": "USD"
  },
  "includes": [
    "4 nights accommodation",
    "Daily breakfast",
    "City tour"
  ],
  "itinerary": {
    "day1": "Arrival and Seine cruise",
    "day2": "Louvre and Eiffel Tower"
  }
}
```

#### Read Packages
```http
GET /api/v1/packages
GET /api/v1/packages/:id
GET /api/v1/packages/featured
GET /api/v1/packages/search?destination=Paris&maxPrice=2000
```

#### Update Package
```http
PUT /api/v1/packages/:id
PATCH /api/v1/packages/:id/pricing
```

#### Delete Package
```http
DELETE /api/v1/packages/:id
```

### 9. Blog Posts Collection

#### Create Blog Post
```http
POST /api/v1/blog/posts
{
  "title": "Ultimate Travel Planning Guide 2024",
  "slug": "travel-planning-2024",
  "content": "Everything you need to know...",
  "excerpt": "Complete guide to planning your perfect trip",
  "category": "Planning",
  "tags": ["travel", "planning", "tips"],
  "author": "admin123",
  "featuredImage": "https://example.com/image.jpg",
  "status": "published"
}
```

#### Read Blog Posts
```http
GET /api/v1/blog/posts
GET /api/v1/blog/posts/:slug
GET /api/v1/blog/posts/category/:category
GET /api/v1/blog/posts/search?q=travel+tips
```

#### Update Blog Post
```http
PUT /api/v1/blog/posts/:id
PATCH /api/v1/blog/posts/:id/status
```

#### Delete Blog Post
```http
DELETE /api/v1/blog/posts/:id
```

### 10. Support Tickets Collection

#### Create Support Ticket
```http
POST /api/v1/support/tickets
{
  "userId": "user123",
  "category": "booking",
  "priority": "medium",
  "subject": "Flight booking issue",
  "description": "I'm having trouble with my booking...",
  "attachments": ["file1.jpg", "file2.pdf"]
}
```

#### Read Support Tickets
```http
GET /api/v1/support/tickets?userId=user123
GET /api/v1/support/tickets/:id
GET /api/v1/support/tickets/admin?status=open&priority=high
```

#### Update Support Ticket
```http
PUT /api/v1/support/tickets/:id
PATCH /api/v1/support/tickets/:id/status
PATCH /api/v1/support/tickets/:id/assign
```

#### Delete Support Ticket
```http
DELETE /api/v1/support/tickets/:id
```

## 🔄 Bulk Operations

### Bulk Create
```http
POST /api/v1/flights/bulk
[
  { flight1_data },
  { flight2_data },
  { flight3_data }
]
```

### Bulk Update
```http
PATCH /api/v1/flights/bulk
{
  "filter": { "airline": "EK" },
  "update": { "status": "delayed" }
}
```

### Bulk Delete
```http
DELETE /api/v1/flights/bulk
{
  "ids": ["flight1", "flight2", "flight3"]
}
```

## 📊 Advanced Query Operations

### Aggregation Queries
```http
GET /api/v1/bookings/analytics/revenue?period=monthly&year=2024
GET /api/v1/hotels/analytics/occupancy?city=Paris&month=12
GET /api/v1/flights/analytics/popular-routes?limit=10
```

### Search with Filters
```http
GET /api/v1/hotels/search?
  location=Paris&
  checkIn=2024-12-20&
  checkOut=2024-12-25&
  guests=2&
  minPrice=100&
  maxPrice=500&
  starRating=4,5&
  amenities=wifi,pool&
  sort=price&
  order=asc&
  page=1&
  limit=20
```

### Geospatial Queries
```http
GET /api/v1/hotels/nearby?
  lat=48.8566&
  lng=2.3522&
  radius=5&
  unit=km

GET /api/v1/destinations/within-bounds?
  neLat=48.9&
  neLng=2.4&
  swLat=48.8&
  swLng=2.3
```

## 🔐 Data Validation Rules

### User Data Validation
```javascript
const userValidation = {
  email: {
    required: true,
    format: 'email',
    unique: true
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
  },
  phone: {
    format: 'phone',
    optional: true
  }
};
```

### Booking Data Validation
```javascript
const bookingValidation = {
  userId: {
    required: true,
    exists: 'users'
  },
  items: {
    required: true,
    minItems: 1,
    maxItems: 10
  },
  pricing: {
    total: {
      required: true,
      min: 0
    }
  }
};
```

## 📈 Performance Optimization

### Database Indexes
```javascript
// MongoDB Indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.flights.createIndex({ 
  "route.departure.airport.code": 1,
  "route.arrival.airport.code": 1,
  "route.departure.scheduledTime": 1 
});
db.hotels.createIndex({ "location.coordinates": "2dsphere" });
db.bookings.createIndex({ "userId": 1, "createdAt": -1 });
```

### Caching Strategy
```javascript
// Redis Caching
const cacheKeys = {
  user: (id) => `user:${id}`,
  flightSearch: (params) => `flight_search:${hashParams(params)}`,
  hotelDetails: (id) => `hotel:${id}`,
  popularDestinations: 'destinations:popular'
};

// Cache TTL (Time To Live)
const cacheTTL = {
  user: 3600,        // 1 hour
  flightSearch: 300, // 5 minutes
  hotelDetails: 1800, // 30 minutes
  popularDestinations: 86400 // 24 hours
};
```