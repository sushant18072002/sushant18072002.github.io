# Page-by-Page API Analysis & Missing Endpoints

## 🏠 1. Home Page (index.html)

### Components Analyzed:
- Hero section with live counter
- Search widget (3 tabs: Flights, Hotels, Complete Trip)
- Adventure categories
- Destination slider
- Planning options
- Featured packages
- How it works section
- Trust signals & social proof
- Blog section

### Missing APIs Identified:

#### Live Statistics
```http
GET /api/v1/stats/live
Response: {
  "dreamsPlannedToday": 2847,
  "activeUsers": 1234,
  "bookingsToday": 156,
  "happyTravelers": 50000
}
```

#### Hero Search Widget APIs
```http
# Flight Search from Hero
POST /api/v1/search/flights/quick
{
  "from": "New York",
  "to": "Paris", 
  "departDate": "2024-12-20",
  "returnDate": "2024-12-27",
  "travelers": 2
}

# Hotel Search from Hero  
POST /api/v1/search/hotels/quick
{
  "location": "Paris",
  "checkIn": "2024-12-20",
  "checkOut": "2024-12-27", 
  "guests": 2
}

# Complete Trip AI Search
POST /api/v1/ai/trip-quick-generate
{
  "prompt": "Romantic getaway in Paris",
  "when": "2024-12-20",
  "duration": "1 week",
  "travelers": "Couple",
  "budget": "Mid-range"
}
```

#### Adventure Categories
```http
GET /api/v1/categories/adventures
Response: {
  "categories": [
    {
      "id": "luxury",
      "name": "Luxury resort at the sea",
      "icon": "🏖️",
      "placesCount": 9326,
      "averagePrice": 450,
      "popularDestinations": ["Maldives", "Bora Bora", "Santorini"]
    },
    {
      "id": "camping", 
      "name": "Camping amidst the wild",
      "icon": "🏕️",
      "placesCount": 12326,
      "averagePrice": 80,
      "popularDestinations": ["Yellowstone", "Banff", "Patagonia"]
    }
  ]
}

POST /api/v1/categories/adventures/:id/search
```

#### Destination Slider
```http
GET /api/v1/destinations/featured?category=mountains&region=new-zealand
Response: {
  "destinations": [
    {
      "id": "nz-mountain-1",
      "name": "Mountain house",
      "image": "https://...",
      "badge": "20% off",
      "rating": 650111,
      "price": 190,
      "location": "Queenstown, New Zealand"
    }
  ]
}
```

#### Featured Packages
```http
GET /api/v1/packages/featured?limit=4
Response: {
  "packages": [
    {
      "id": "japan-adventure",
      "title": "Japan Adventure", 
      "destinations": ["Tokyo", "Kyoto", "Osaka"],
      "duration": 7,
      "price": 2890,
      "image": "https://...",
      "rating": 4.9,
      "reviewCount": 124
    }
  ]
}
```

#### Blog Articles for Homepage
```http
GET /api/v1/blog/posts/featured?limit=3
Response: {
  "posts": [
    {
      "id": "travel-planning-2024",
      "title": "Ultimate Travel Planning Guide 2024",
      "excerpt": "Everything you need to know...",
      "category": "Planning",
      "publishDate": "2024-12-15",
      "readTime": "8 min",
      "image": "https://..."
    }
  ]
}
```

## ✈️ 2. Flights Page (flights.html)

### Components Analyzed:
- Flight search form
- Search results with filters
- Flight comparison
- Price alerts
- Booking flow

### Missing APIs:

#### Airport Autocomplete
```http
GET /api/v1/airports/autocomplete?q=new&limit=5
Response: {
  "airports": [
    {
      "code": "JFK",
      "name": "John F. Kennedy International Airport",
      "city": "New York",
      "country": "United States"
    }
  ]
}
```

#### Flight Filters
```http
GET /api/v1/flights/filters?from=JFK&to=CDG&date=2024-12-20
Response: {
  "airlines": [
    {"code": "AF", "name": "Air France", "count": 12},
    {"code": "DL", "name": "Delta", "count": 8}
  ],
  "priceRange": {"min": 450, "max": 2500},
  "duration": {"min": "7h 30m", "max": "15h 45m"},
  "stops": [
    {"value": 0, "label": "Non-stop", "count": 5},
    {"value": 1, "label": "1 stop", "count": 15}
  ]
}
```

#### Price Alerts
```http
POST /api/v1/flights/price-alerts
{
  "userId": "user123",
  "route": {
    "from": "JFK",
    "to": "CDG"
  },
  "targetPrice": 800,
  "dateRange": {
    "start": "2024-12-01",
    "end": "2024-12-31"
  }
}

GET /api/v1/flights/price-alerts?userId=user123
DELETE /api/v1/flights/price-alerts/:alertId
```

## 🏨 3. Hotels Page (hotels.html)

### Missing APIs:

#### Location Autocomplete with Suggestions
```http
GET /api/v1/locations/autocomplete?q=par&type=city
Response: {
  "suggestions": [
    {
      "id": "paris-france",
      "name": "Paris",
      "country": "France",
      "type": "city",
      "coordinates": [2.3522, 48.8566],
      "popularAreas": ["Champs-Élysées", "Marais", "Montmartre"]
    }
  ]
}
```

#### Hotel Amenities Filter
```http
GET /api/v1/hotels/amenities
Response: {
  "amenities": [
    {"id": "wifi", "name": "Free WiFi", "icon": "📶"},
    {"id": "pool", "name": "Swimming Pool", "icon": "🏊"},
    {"id": "gym", "name": "Fitness Center", "icon": "💪"},
    {"id": "spa", "name": "Spa", "icon": "🧘"}
  ]
}
```

#### Hotel Comparison
```http
POST /api/v1/hotels/compare
{
  "hotelIds": ["hotel1", "hotel2", "hotel3"],
  "checkIn": "2024-12-20",
  "checkOut": "2024-12-25"
}
```

## 🗺️ 4. Itinerary Master Hub (itinerary-master-hub.html)

### Missing APIs:

#### Itinerary Templates by Category
```http
GET /api/v1/itineraries/templates?category=romantic&destination=paris
Response: {
  "templates": [
    {
      "id": "paris-romantic-5d",
      "title": "Paris Romance - 5 Days",
      "description": "Perfect romantic getaway",
      "duration": 5,
      "price": 1890,
      "rating": 4.8,
      "usageCount": 1247,
      "preview": {
        "day1": "Arrival & Seine Cruise",
        "day2": "Louvre & Eiffel Tower"
      }
    }
  ]
}
```

#### Popular Itineraries
```http
GET /api/v1/itineraries/popular?period=month&limit=10
Response: {
  "itineraries": [
    {
      "id": "itin123",
      "title": "Best of Japan",
      "creator": "TravelExpert",
      "likes": 456,
      "copies": 89,
      "destinations": ["Tokyo", "Kyoto"],
      "duration": 10
    }
  ]
}
```

## 🤖 5. AI Itinerary Page (itinerary-ai.html)

### Missing APIs:

#### AI Conversation History
```http
GET /api/v1/ai/conversations?userId=user123
POST /api/v1/ai/conversations
{
  "userId": "user123",
  "message": "I want to visit Japan for 2 weeks",
  "context": {
    "previousItineraries": [],
    "preferences": {}
  }
}
```

#### AI Refinement
```http
POST /api/v1/ai/refine-itinerary
{
  "itineraryId": "itin123",
  "refinements": [
    {
      "type": "add_activity",
      "day": 2,
      "activity": "Visit Tokyo Skytree"
    },
    {
      "type": "change_budget",
      "newBudget": "luxury"
    }
  ]
}
```

## 📦 6. Packages Page (packages.html)

### Missing APIs:

#### Package Categories
```http
GET /api/v1/packages/categories
Response: {
  "categories": [
    {
      "id": "romantic",
      "name": "Romantic Getaways",
      "icon": "💕",
      "count": 156,
      "priceRange": {"min": 800, "max": 5000}
    },
    {
      "id": "adventure", 
      "name": "Adventure Tours",
      "icon": "🏔️",
      "count": 234,
      "priceRange": {"min": 600, "max": 4000}
    }
  ]
}
```

#### Package Customization
```http
POST /api/v1/packages/:id/customize
{
  "modifications": [
    {
      "type": "extend_duration",
      "additionalDays": 2
    },
    {
      "type": "upgrade_hotel",
      "hotelCategory": "luxury"
    }
  ]
}
```

## 🛠️ 7. Custom Builder (custom-builder.html)

### Missing APIs:

#### Step-by-Step Builder
```http
# Step 1: Destination Selection
POST /api/v1/builder/step1
{
  "destinations": ["Paris", "Rome"],
  "duration": 10
}

# Step 2: Accommodation Preferences  
POST /api/v1/builder/step2
{
  "builderId": "builder123",
  "accommodationType": "hotel",
  "budget": "mid-range",
  "amenities": ["wifi", "breakfast"]
}

# Step 3: Activities Selection
POST /api/v1/builder/step3
{
  "builderId": "builder123", 
  "interests": ["culture", "food", "nightlife"],
  "activities": ["louvre-museum", "eiffel-tower"]
}
```

#### Activity Recommendations by Interest
```http
GET /api/v1/activities/by-interest?destination=paris&interests=culture,food
Response: {
  "activities": [
    {
      "id": "louvre-museum",
      "name": "Louvre Museum",
      "category": "culture",
      "duration": 180,
      "price": 25,
      "rating": 4.8,
      "bookingRequired": true
    }
  ]
}
```

## 📞 8. Contact Page (contact.html)

### Missing APIs:

#### Support Categories with Response Times
```http
GET /api/v1/support/categories
Response: {
  "categories": [
    {
      "id": "booking",
      "name": "Booking & Payments", 
      "icon": "💳",
      "avgResponseTime": "2 minutes",
      "expertInfo": {
        "name": "Sarah Johnson",
        "title": "Senior Travel Advisor",
        "avatar": "https://...",
        "rating": 4.9,
        "countriesVisited": 127
      }
    }
  ]
}
```

#### Live Chat Integration
```http
POST /api/v1/support/chat/start
{
  "userId": "user123",
  "category": "booking",
  "initialMessage": "I need help with my flight booking"
}

WebSocket: /api/v1/support/chat/:sessionId
```

#### FAQ Search
```http
GET /api/v1/support/faq/search?q=cancellation&category=booking
Response: {
  "results": [
    {
      "id": "faq123",
      "question": "What's your cancellation policy?",
      "answer": "Cancellation policies vary by service provider...",
      "category": "booking",
      "helpful": 156,
      "notHelpful": 12
    }
  ]
}
```

## 📝 9. Blog Page (blog.html)

### Missing APIs:

#### Blog Categories with Post Counts
```http
GET /api/v1/blog/categories
Response: {
  "categories": [
    {
      "id": "planning",
      "name": "Travel Planning",
      "count": 45,
      "description": "Tips and guides for planning your perfect trip"
    }
  ]
}
```

#### Related Posts
```http
GET /api/v1/blog/posts/:id/related?limit=3
Response: {
  "relatedPosts": [
    {
      "id": "post456",
      "title": "Budget Travel Tips",
      "excerpt": "Smart strategies...",
      "similarity": 0.85
    }
  ]
}
```

#### Blog Search with Filters
```http
GET /api/v1/blog/search?q=budget+travel&category=planning&dateFrom=2024-01-01
```

## 🔐 10. Auth Page (auth.html)

### Missing APIs:

#### Social Login
```http
POST /api/v1/auth/google
{
  "googleToken": "google_oauth_token"
}

POST /api/v1/auth/facebook  
{
  "facebookToken": "facebook_oauth_token"
}
```

#### Password Strength Check
```http
POST /api/v1/auth/check-password-strength
{
  "password": "userPassword123"
}
Response: {
  "strength": "strong",
  "score": 85,
  "suggestions": []
}
```

#### Email Verification
```http
POST /api/v1/auth/resend-verification
{
  "email": "user@example.com"
}

GET /api/v1/auth/verify-email?token=verification_token
```

## 👤 11. User Dashboard (dashboard.html)

### Missing APIs:

#### Dashboard Summary
```http
GET /api/v1/users/dashboard-summary
Response: {
  "upcomingTrips": 2,
  "totalBookings": 15,
  "totalSpent": 25000,
  "loyaltyPoints": 1250,
  "nextTrip": {
    "destination": "Paris",
    "date": "2024-12-20",
    "daysUntil": 5
  },
  "recentActivity": [
    {
      "type": "booking_confirmed",
      "description": "Flight to Paris confirmed",
      "date": "2024-12-15"
    }
  ]
}
```

#### Trip Timeline
```http
GET /api/v1/users/trips/timeline?year=2024
Response: {
  "timeline": [
    {
      "month": "January",
      "trips": [
        {
          "id": "trip123",
          "destination": "Tokyo",
          "dates": "Jan 15-22",
          "status": "completed"
        }
      ]
    }
  ]
}
```

#### Loyalty Program
```http
GET /api/v1/users/loyalty
Response: {
  "currentTier": "Gold",
  "points": 1250,
  "nextTier": "Platinum",
  "pointsToNextTier": 750,
  "benefits": [
    "Priority support",
    "Exclusive deals",
    "Free cancellation"
  ]
}
```

## 📊 Additional System APIs

### Analytics & Tracking
```http
POST /api/v1/analytics/track
{
  "event": "search_performed",
  "properties": {
    "searchType": "flight",
    "from": "NYC",
    "to": "PAR"
  },
  "userId": "user123",
  "sessionId": "session456"
}

GET /api/v1/analytics/popular-searches?period=week
GET /api/v1/analytics/conversion-funnel?startDate=2024-12-01
```

### Notifications
```http
GET /api/v1/notifications?userId=user123&unreadOnly=true
POST /api/v1/notifications/mark-read
{
  "notificationIds": ["notif1", "notif2"]
}

POST /api/v1/notifications/preferences
{
  "userId": "user123",
  "email": true,
  "push": false,
  "sms": true,
  "categories": {
    "bookingUpdates": true,
    "priceAlerts": true,
    "marketing": false
  }
}
```

### File Upload
```http
POST /api/v1/upload/avatar
Content-Type: multipart/form-data

POST /api/v1/upload/documents
Content-Type: multipart/form-data
```

### Currency & Localization
```http
GET /api/v1/currencies/rates?base=USD
GET /api/v1/localization/strings?lang=en&page=flights
```

## 🔄 Real-time APIs (WebSocket)

### Live Updates
```javascript
// WebSocket connections
ws://api.travelai.com/ws/price-updates
ws://api.travelai.com/ws/booking-status
ws://api.travelai.com/ws/chat-support
ws://api.travelai.com/ws/notifications

// Events
{
  "type": "price_drop",
  "data": {
    "flightId": "flight123",
    "oldPrice": 800,
    "newPrice": 650,
    "savings": 150
  }
}
```

This comprehensive analysis reveals 50+ additional APIs needed beyond the initial 80 endpoints, bringing the total to 130+ endpoints for a fully functional travel platform.