# Page-Specific APIs & CRUD Operations

## 🏠 HOME PAGE (index.html)

### Required APIs for Home Page

#### 1. Live Statistics Widget
```http
GET /api/v1/stats/live
Response: {
  "dreamsPlannedToday": 2847,
  "activeUsers": 1234,
  "totalBookings": 156789
}
```

#### 2. Hero Search Widget
```http
# Complete Trip AI Search
POST /api/v1/search/ai-trip
{
  "prompt": "Romantic getaway in Paris",
  "duration": "1 week",
  "travelers": "Couple",
  "budget": "Mid-range"
}

# Quick Flight Search
POST /api/v1/search/flights/quick
{
  "from": "NYC", "to": "PAR",
  "departDate": "2024-12-20", "passengers": 2
}

# Quick Hotel Search  
POST /api/v1/search/hotels/quick
{
  "location": "Paris", "checkIn": "2024-12-20",
  "checkOut": "2024-12-25", "guests": 2
}
```

#### 3. Adventure Categories
```http
GET /api/v1/categories/adventures
Response: {
  "categories": [
    {
      "id": "luxury", "name": "Luxury resort at the sea",
      "placesCount": 9326, "averagePrice": 450
    }
  ]
}
```

#### 4. Featured Destinations
```http
GET /api/v1/destinations/featured?limit=4
Response: {
  "destinations": [
    {
      "id": "nz-mountain-1", "name": "Mountain house",
      "price": 190, "discount": "20% off", "rating": 4.8
    }
  ]
}
```

#### 5. Featured Packages
```http
GET /api/v1/packages/featured?limit=4
Response: {
  "packages": [
    {
      "id": "japan-adventure", "title": "Japan Adventure",
      "duration": 7, "price": 2890, "rating": 4.9
    }
  ]
}
```

#### 6. Blog Articles
```http
GET /api/v1/blog/featured?limit=3
Response: {
  "posts": [
    {
      "id": "travel-planning-2024",
      "title": "Ultimate Travel Planning Guide 2024",
      "readTime": "8 min", "category": "Planning"
    }
  ]
}
```

### CRUD Operations for Home Page Data

#### Create Operations
```http
# Add new adventure category (Admin)
POST /api/v1/admin/categories
{
  "name": "Beach Resorts", "icon": "🏖️",
  "description": "Luxury beach destinations"
}

# Add featured destination (Admin)
POST /api/v1/admin/destinations/featured
{
  "destinationId": "dest123", "priority": 1,
  "discount": "25% off", "validUntil": "2024-12-31"
}
```

#### Read Operations
```http
# Get all categories with stats
GET /api/v1/categories?includeStats=true

# Get destination details
GET /api/v1/destinations/:id/details
```

#### Update Operations
```http
# Update category stats (System)
PATCH /api/v1/categories/:id/stats
{ "placesCount": 9500, "averagePrice": 460 }

# Update featured status
PATCH /api/v1/destinations/:id/featured
{ "featured": true, "priority": 2 }
```

#### Delete Operations
```http
# Remove from featured (Admin)
DELETE /api/v1/admin/destinations/:id/featured

# Soft delete category
DELETE /api/v1/admin/categories/:id
```

---

## ✈️ FLIGHTS PAGE (flights.html)

### Required APIs for Flights Page

#### 1. Flight Search
```http
POST /api/v1/flights/search
{
  "from": "NYC", "to": "LAX",
  "departDate": "2024-12-20", "returnDate": "2024-12-27",
  "passengers": 2, "class": "economy"
}
```

#### 2. Search Filters
```http
GET /api/v1/flights/filters?from=NYC&to=LAX&date=2024-12-20
Response: {
  "airlines": [{"code": "AA", "name": "American", "count": 12}],
  "priceRange": {"min": 450, "max": 2500},
  "stops": [{"value": 0, "label": "Non-stop", "count": 5}]
}
```

#### 3. Airport Autocomplete
```http
GET /api/v1/airports/search?q=new&limit=5
Response: {
  "airports": [
    {"code": "JFK", "name": "JFK International", "city": "New York"}
  ]
}
```

#### 4. Flight Details
```http
GET /api/v1/flights/:id/details
Response: {
  "flightNumber": "AA123", "aircraft": "Boeing 737",
  "amenities": ["WiFi", "Meals"], "baggage": "1 checked bag"
}
```

#### 5. Price Alerts
```http
POST /api/v1/flights/price-alerts
{
  "userId": "user123", "route": {"from": "NYC", "to": "LAX"},
  "targetPrice": 400, "email": true
}
```

### CRUD Operations for Flights

#### Create Operations
```http
# Import flight data (System)
POST /api/v1/admin/flights/import
[
  {
    "flightNumber": "AA123", "airline": "American Airlines",
    "route": {"from": "NYC", "to": "LAX"},
    "schedule": {"departure": "10:00", "arrival": "13:30"},
    "pricing": {"economy": 450, "business": 1200}
  }
]

# Create price alert
POST /api/v1/users/price-alerts
{
  "flightId": "flight123", "targetPrice": 400,
  "notificationMethod": "email"
}
```

#### Read Operations
```http
# Get flight by ID
GET /api/v1/flights/:id

# Search flights with filters
GET /api/v1/flights/search?from=NYC&to=LAX&date=2024-12-20&maxPrice=500

# Get user's price alerts
GET /api/v1/users/:userId/price-alerts
```

#### Update Operations
```http
# Update flight prices (System)
PATCH /api/v1/flights/:id/pricing
{ "economy": 480, "business": 1250, "updatedAt": "2024-12-15T10:00:00Z" }

# Update flight status
PATCH /api/v1/flights/:id/status
{ "status": "delayed", "newDepartureTime": "10:30" }
```

#### Delete Operations
```http
# Cancel flight (Admin)
DELETE /api/v1/admin/flights/:id
{ "reason": "Aircraft maintenance", "notifyPassengers": true }

# Delete price alert
DELETE /api/v1/users/price-alerts/:alertId
```

---

## 🏨 HOTELS PAGE (hotels.html)

### Required APIs for Hotels Page

#### 1. Hotel Search
```http
POST /api/v1/hotels/search
{
  "location": "Paris", "checkIn": "2024-12-20",
  "checkOut": "2024-12-25", "guests": 2, "rooms": 1
}
```

#### 2. Location Autocomplete
```http
GET /api/v1/locations/search?q=par&type=city
Response: {
  "suggestions": [
    {"id": "paris-france", "name": "Paris, France", "type": "city"}
  ]
}
```

#### 3. Hotel Filters
```http
GET /api/v1/hotels/filters?location=paris
Response: {
  "priceRange": {"min": 80, "max": 800},
  "starRating": [3, 4, 5],
  "amenities": [{"id": "wifi", "name": "Free WiFi", "count": 156}]
}
```

#### 4. Hotel Details
```http
GET /api/v1/hotels/:id/details
Response: {
  "name": "Grand Hotel Paris", "starRating": 5,
  "amenities": ["WiFi", "Pool", "Spa"],
  "rooms": [{"type": "Deluxe", "price": 320, "available": 3}]
}
```

#### 5. Room Availability
```http
GET /api/v1/hotels/:id/availability?checkIn=2024-12-20&checkOut=2024-12-25
Response: {
  "rooms": [
    {"type": "Standard", "available": 5, "price": 180},
    {"type": "Deluxe", "available": 2, "price": 320}
  ]
}
```

### CRUD Operations for Hotels

#### Create Operations
```http
# Add new hotel (Admin)
POST /api/v1/admin/hotels
{
  "name": "Grand Plaza Hotel", "starRating": 5,
  "location": {"city": "Paris", "address": "123 Main St"},
  "rooms": [{"type": "Standard", "count": 50, "basePrice": 200}]
}

# Add hotel review
POST /api/v1/hotels/:id/reviews
{
  "userId": "user123", "rating": 5,
  "title": "Amazing stay!", "content": "Perfect location..."
}
```

#### Read Operations
```http
# Get hotel with reviews
GET /api/v1/hotels/:id?include=reviews,amenities

# Search hotels by location
GET /api/v1/hotels/search?location=paris&minRating=4&maxPrice=300

# Get hotel reviews
GET /api/v1/hotels/:id/reviews?page=1&limit=10
```

#### Update Operations
```http
# Update room availability (System)
PATCH /api/v1/hotels/:id/rooms/availability
{
  "roomType": "Standard", "date": "2024-12-20",
  "available": 8, "price": 220
}

# Update hotel information
PATCH /api/v1/admin/hotels/:id
{ "description": "Updated description", "amenities": ["WiFi", "Pool"] }
```

#### Delete Operations
```http
# Remove hotel (Admin)
DELETE /api/v1/admin/hotels/:id
{ "reason": "Permanently closed" }

# Delete review (User/Admin)
DELETE /api/v1/hotels/reviews/:reviewId
```

---

## 🤖 AI ITINERARY PAGE (itinerary-ai.html)

### Required APIs for AI Page

#### 1. AI Trip Generation
```http
POST /api/v1/ai/generate-trip
{
  "prompt": "Romantic 5-day trip to Paris for couple",
  "preferences": {
    "budget": "mid-range", "interests": ["culture", "food"],
    "travelStyle": "relaxed"
  }
}
```

#### 2. Itinerary Templates
```http
GET /api/v1/ai/templates?destination=paris&theme=romantic
Response: {
  "templates": [
    {
      "id": "paris-romantic-5d", "title": "Paris Romance",
      "duration": 5, "rating": 4.8, "usageCount": 1247
    }
  ]
}
```

#### 3. AI Conversation
```http
POST /api/v1/ai/chat
{
  "userId": "user123", "message": "Make it more budget-friendly",
  "context": {"itineraryId": "itin123"}
}
```

#### 4. Itinerary Refinement
```http
POST /api/v1/ai/refine-itinerary
{
  "itineraryId": "itin123",
  "changes": [
    {"type": "replace_activity", "day": 2, "activityId": "louvre", "newActivity": "orsay-museum"}
  ]
}
```

### CRUD Operations for AI Features

#### Create Operations
```http
# Create AI-generated itinerary
POST /api/v1/itineraries/ai-generated
{
  "userId": "user123", "prompt": "Adventure trip to Japan",
  "generatedBy": "template-engine", "templateId": "japan-adventure"
}

# Save AI conversation
POST /api/v1/ai/conversations
{
  "userId": "user123", "sessionId": "session123",
  "messages": [{"role": "user", "content": "Plan my trip"}]
}
```

#### Read Operations
```http
# Get user's AI conversations
GET /api/v1/users/:userId/ai-conversations

# Get itinerary with AI metadata
GET /api/v1/itineraries/:id?include=ai-metadata

# Get AI suggestions
GET /api/v1/ai/suggestions?destination=paris&interests=culture
```

#### Update Operations
```http
# Update itinerary from AI suggestions
PATCH /api/v1/itineraries/:id/apply-ai-changes
{
  "changes": [{"day": 1, "activity": "add", "details": {...}}]
}

# Update AI template usage
PATCH /api/v1/ai/templates/:id/stats
{ "usageCount": 1248, "averageRating": 4.9 }
```

#### Delete Operations
```http
# Delete AI conversation
DELETE /api/v1/ai/conversations/:conversationId

# Remove AI-generated itinerary
DELETE /api/v1/itineraries/:id/ai-data
```

---

## 📦 PACKAGES PAGE (packages.html)

### Required APIs for Packages Page

#### 1. Package Listing
```http
GET /api/v1/packages?category=romantic&destination=europe&maxPrice=3000
Response: {
  "packages": [
    {
      "id": "paris-romance", "title": "Paris Romance Package",
      "duration": 5, "price": 1890, "rating": 4.8
    }
  ]
}
```

#### 2. Package Categories
```http
GET /api/v1/packages/categories
Response: {
  "categories": [
    {"id": "romantic", "name": "Romantic Getaways", "count": 156},
    {"id": "adventure", "name": "Adventure Tours", "count": 234}
  ]
}
```

#### 3. Package Details
```http
GET /api/v1/packages/:id/details
Response: {
  "title": "Japan Adventure", "duration": 7, "price": 2890,
  "includes": ["Flights", "Hotels", "Tours"],
  "itinerary": {"day1": "Tokyo arrival", "day2": "City tour"}
}
```

#### 4. Package Customization
```http
POST /api/v1/packages/:id/customize
{
  "modifications": [
    {"type": "extend_duration", "additionalDays": 2},
    {"type": "upgrade_hotel", "category": "luxury"}
  ]
}
```

### CRUD Operations for Packages

#### Create Operations
```http
# Create new package (Admin)
POST /api/v1/admin/packages
{
  "title": "Bali Escape", "duration": 10, "price": 1590,
  "destinations": ["Ubud", "Seminyak"],
  "includes": ["Accommodation", "Breakfast", "Tours"]
}
```

#### Read Operations
```http
# Get package with full details
GET /api/v1/packages/:id?include=itinerary,reviews,pricing

# Search packages
GET /api/v1/packages/search?q=adventure&minDuration=7&maxPrice=3000
```

#### Update Operations
```http
# Update package pricing
PATCH /api/v1/admin/packages/:id/pricing
{ "price": 1650, "discount": 10, "validUntil": "2024-12-31" }
```

#### Delete Operations
```http
# Remove package
DELETE /api/v1/admin/packages/:id
```

---

## 👤 USER DASHBOARD (dashboard.html)

### Required APIs for Dashboard

#### 1. Dashboard Summary
```http
GET /api/v1/users/:userId/dashboard
Response: {
  "upcomingTrips": 2, "totalBookings": 15,
  "loyaltyPoints": 1250, "totalSpent": 25000,
  "nextTrip": {"destination": "Paris", "daysUntil": 5}
}
```

#### 2. User Bookings
```http
GET /api/v1/users/:userId/bookings?status=upcoming&limit=5
Response: {
  "bookings": [
    {
      "id": "book123", "type": "flight", "destination": "Paris",
      "date": "2024-12-20", "status": "confirmed"
    }
  ]
}
```

#### 3. Trip Timeline
```http
GET /api/v1/users/:userId/trips/timeline?year=2024
Response: {
  "timeline": [
    {"month": "January", "trips": [{"destination": "Tokyo", "status": "completed"}]}
  ]
}
```

### CRUD Operations for User Data

#### Create Operations
```http
# Create user profile
POST /api/v1/users/profile
{
  "firstName": "John", "lastName": "Doe",
  "preferences": {"currency": "USD", "language": "en"}
}
```

#### Read Operations
```http
# Get user profile
GET /api/v1/users/:userId/profile

# Get user statistics
GET /api/v1/users/:userId/stats
```

#### Update Operations
```http
# Update user preferences
PATCH /api/v1/users/:userId/preferences
{ "currency": "EUR", "notifications": {"email": true} }
```

#### Delete Operations
```http
# Delete user account
DELETE /api/v1/users/:userId/account
{ "reason": "User requested deletion" }
```

---

## 🔄 Data Push & Sync Operations

### Real-time Data Updates

#### 1. Price Updates
```http
# Push price changes (System)
POST /api/v1/system/prices/bulk-update
[
  {"type": "flight", "id": "flight123", "newPrice": 450, "oldPrice": 480},
  {"type": "hotel", "id": "hotel456", "newPrice": 200, "oldPrice": 220}
]
```

#### 2. Inventory Updates
```http
# Update availability (System)
POST /api/v1/system/inventory/update
{
  "type": "hotel", "hotelId": "hotel123",
  "roomType": "standard", "date": "2024-12-20",
  "available": 3, "booked": 2
}
```

#### 3. Booking Status Updates
```http
# Update booking status (System)
PATCH /api/v1/bookings/:id/status
{
  "status": "confirmed", "confirmationCode": "ABC123",
  "notifyUser": true
}
```

### Bulk Operations

#### 1. Data Import
```http
# Import flight schedules (Daily)
POST /api/v1/admin/data/import/flights
{
  "source": "amadeus", "date": "2024-12-15",
  "flights": [...] // Array of flight data
}

# Import hotel rates (Daily)
POST /api/v1/admin/data/import/hotels
{
  "source": "booking", "date": "2024-12-15",
  "rates": [...] // Array of hotel rates
}
```

#### 2. Data Cleanup
```http
# Archive old bookings (Weekly)
POST /api/v1/admin/data/archive
{
  "type": "bookings", "olderThan": "365 days",
  "status": "completed"
}
```

This documentation provides clear, page-specific APIs with their exact CRUD operations, making it easy to understand what's needed for each page and how data flows through the system.