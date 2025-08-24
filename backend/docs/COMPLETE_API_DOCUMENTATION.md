# 🚀 TravelAI Platform - Complete API Documentation

## 📊 **API Overview**
- **Base URL:** `http://localhost:3000/api/v1`
- **Authentication:** JWT Bearer Token
- **Response Format:** JSON
- **Total Endpoints:** 130+

---

## 🔐 **Authentication APIs** (8 endpoints)

### **POST** `/auth/register`
**Purpose:** User registration
**Access:** Public
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": { "id": "...", "email": "...", "profile": {...} }
  }
}
```

### **POST** `/auth/login`
**Purpose:** User login
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": false
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "user": {...},
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### **POST** `/auth/logout`
**Purpose:** User logout
**Headers:** `Authorization: Bearer <token>`

### **POST** `/auth/refresh-token`
**Purpose:** Refresh JWT token
**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

### **POST** `/auth/forgot-password`
**Purpose:** Request password reset
**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### **POST** `/auth/reset-password`
**Purpose:** Reset password with token
**Request Body:**
```json
{
  "token": "reset_token",
  "password": "new_password"
}
```

### **GET** `/auth/verify-email`
**Purpose:** Verify email address
**Query Params:** `?token=verification_token`

### **POST** `/auth/resend-verification`
**Purpose:** Resend verification email
**Request Body:**
```json
{
  "email": "user@example.com"
}
```

---

## ✈️ **Flight APIs** (18 endpoints)

### **GET** `/flights/search`
**Purpose:** Search flights
**Query Params:**
```
from=NYC&to=PAR&departDate=2024-12-15&returnDate=2024-12-22
&passengers=1&class=economy&maxPrice=1000&airlines=DL,AA
&stops=0&sort=price&page=1&limit=20
```
**Response:**
```json
{
  "success": true,
  "data": {
    "flights": [...],
    "pagination": {...}
  }
}
```

### **GET** `/flights/filters`
**Purpose:** Get search filters
**Query Params:** `from=NYC&to=PAR&date=2024-12-15`

### **GET** `/flights/:id`
**Purpose:** Get flight details
**Response:** Complete flight information with airline, route, pricing

### **GET** `/flights/:id/seats`
**Purpose:** Get seat map
**Response:** Available seats by class

### **POST** `/flights/price-alerts`
**Purpose:** Create price alert
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "route": {
    "from": "NYC",
    "to": "PAR",
    "departDate": "2024-12-15"
  },
  "targetPrice": 500,
  "email": true,
  "sms": false
}
```

### **GET** `/flights/price-alerts`
**Purpose:** Get user's price alerts
**Headers:** `Authorization: Bearer <token>`

### **DELETE** `/flights/price-alerts/:id`
**Purpose:** Delete price alert
**Headers:** `Authorization: Bearer <token>`

### **POST** `/flights/compare`
**Purpose:** Compare multiple flights
**Request Body:**
```json
{
  "flightIds": ["flight1", "flight2", "flight3"]
}
```

### **GET** `/flights/:id/baggage-info`
**Purpose:** Get baggage information

### **GET** `/flights/:id/meal-options`
**Purpose:** Get meal options

### **GET** `/flights/popular-routes`
**Purpose:** Get popular flight routes

### **GET** `/flights/deals`
**Purpose:** Get flight deals

### **GET** `/flights/calendar-prices`
**Purpose:** Get calendar view of prices
**Query Params:** `from=NYC&to=PAR&month=12&year=2024`

### **POST** `/flights/flexible-search`
**Purpose:** Flexible date search
**Request Body:**
```json
{
  "from": "NYC",
  "to": "PAR",
  "departMonth": "2024-12",
  "duration": 7
}
```

### **POST** `/flights/multi-city`
**Purpose:** Multi-city flight search
**Request Body:**
```json
{
  "segments": [
    {"from": "NYC", "to": "PAR", "date": "2024-12-15"},
    {"from": "PAR", "to": "ROM", "date": "2024-12-20"}
  ]
}
```

### **POST** `/flights/:id/hold-seat`
**Purpose:** Hold seat temporarily
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "seatNumber": "12A",
  "holdDuration": 15
}
```

### **GET** `/airlines`
**Purpose:** Get all airlines

### **GET** `/airports/search`
**Purpose:** Search airports
**Query Params:** `q=new york`

---

## 🏨 **Hotel APIs** (16 endpoints)

### **GET** `/hotels/search`
**Purpose:** Search hotels
**Query Params:**
```
location=Paris&checkIn=2024-12-15&checkOut=2024-12-18
&guests=2&minPrice=50&maxPrice=300&starRating=4,5
```

### **GET** `/hotels/filters`
**Purpose:** Get search filters

### **GET** `/hotels/:id`
**Purpose:** Get hotel details

### **GET** `/hotels/:id/rooms`
**Purpose:** Get available rooms
**Query Params:** `checkIn=2024-12-15&checkOut=2024-12-18&guests=2`

### **GET** `/hotels/:id/availability`
**Purpose:** Check availability

### **GET** `/hotels/:id/reviews`
**Purpose:** Get hotel reviews
**Query Params:** `page=1&limit=10`

### **POST** `/hotels/:id/reviews`
**Purpose:** Add hotel review
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "rating": 5,
  "title": "Amazing stay!",
  "content": "Great hotel with excellent service",
  "ratingBreakdown": {
    "cleanliness": 5,
    "service": 5,
    "location": 4,
    "value": 4
  }
}
```

### **GET** `/hotels/:id/amenities`
**Purpose:** Get hotel amenities

### **GET** `/hotels/:id/photos`
**Purpose:** Get hotel photos

### **GET** `/hotels/nearby/:lat/:lng`
**Purpose:** Get nearby hotels

### **POST** `/hotels/compare`
**Purpose:** Compare hotels
**Request Body:**
```json
{
  "hotelIds": ["hotel1", "hotel2", "hotel3"]
}
```

### **GET** `/hotels/deals`
**Purpose:** Get hotel deals

### **POST** `/hotels/price-alerts`
**Purpose:** Create hotel price alert
**Headers:** `Authorization: Bearer <token>`

### **DELETE** `/hotels/price-alerts/:id`
**Purpose:** Delete price alert
**Headers:** `Authorization: Bearer <token>`

### **GET** `/hotels/popular-destinations`
**Purpose:** Get popular hotel destinations

### **GET** `/locations/search`
**Purpose:** Search locations
**Query Params:** `q=paris`

---

## 📋 **Booking APIs** (15 endpoints)

### **GET** `/bookings`
**Purpose:** Get user bookings
**Headers:** `Authorization: Bearer <token>`
**Query Params:** `page=1&limit=20&status=confirmed&type=flight`

### **GET** `/bookings/:id`
**Purpose:** Get booking details
**Headers:** `Authorization: Bearer <token>`

### **POST** `/bookings`
**Purpose:** Create booking
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "type": "flight",
  "flight": {
    "flightId": "flight123",
    "passengers": [
      {
        "type": "adult",
        "firstName": "John",
        "lastName": "Doe",
        "dateOfBirth": "1990-01-01"
      }
    ],
    "class": "economy"
  },
  "pricing": {
    "baseAmount": 500,
    "taxes": 50,
    "totalAmount": 550,
    "currency": "USD"
  },
  "contact": {
    "email": "user@example.com",
    "phone": "+1234567890"
  }
}
```

### **PUT** `/bookings/:id`
**Purpose:** Update booking
**Headers:** `Authorization: Bearer <token>`

### **POST** `/bookings/:id/cancel`
**Purpose:** Cancel booking
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "reason": "Change of plans"
}
```

### **POST** `/bookings/:id/payment`
**Purpose:** Process payment
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "paymentMethod": "card",
  "paymentDetails": {
    "cardLast4": "1234",
    "cardBrand": "visa"
  }
}
```

### **POST** `/bookings/flights`
**Purpose:** Create flight booking
**Headers:** `Authorization: Bearer <token>`

### **POST** `/bookings/hotels`
**Purpose:** Create hotel booking
**Headers:** `Authorization: Bearer <token>`

### **POST** `/bookings/packages`
**Purpose:** Create package booking
**Headers:** `Authorization: Bearer <token>`

### **GET** `/bookings/:id/invoice`
**Purpose:** Get booking invoice
**Headers:** `Authorization: Bearer <token>`

### **POST** `/bookings/:id/modify`
**Purpose:** Modify booking
**Headers:** `Authorization: Bearer <token>`

### **GET** `/bookings/history`
**Purpose:** Get booking history
**Headers:** `Authorization: Bearer <token>`

### **GET** `/bookings/upcoming`
**Purpose:** Get upcoming bookings
**Headers:** `Authorization: Bearer <token>`

### **POST** `/bookings/:id/review`
**Purpose:** Add booking review
**Headers:** `Authorization: Bearer <token>`

### **GET** `/bookings/payment/status/:id`
**Purpose:** Get payment status
**Headers:** `Authorization: Bearer <token>`

---

## 🤖 **AI & Itinerary APIs** (12 endpoints)

### **POST** `/ai/generate-trip`
**Purpose:** Generate AI trip
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "destination": "Paris",
  "duration": 5,
  "budget": 2000,
  "travelers": 2,
  "interests": ["culture", "food", "history"],
  "travelStyle": "balanced",
  "startDate": "2024-12-15"
}
```

### **GET** `/ai/templates`
**Purpose:** Get AI templates
**Headers:** `Authorization: Bearer <token>`

### **POST** `/ai/chat`
**Purpose:** AI chat assistance
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "message": "I want to visit romantic places in Paris",
  "context": {...}
}
```

### **POST** `/ai/refine-itinerary`
**Purpose:** Refine itinerary
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "itineraryId": "itinerary123",
  "refinements": [
    {
      "type": "budget_adjustment",
      "newBudget": 2500
    }
  ]
}
```

### **GET** `/itineraries`
**Purpose:** Get user itineraries
**Headers:** `Authorization: Bearer <token>`
**Query Params:** `status=draft&page=1&limit=10`

### **POST** `/itineraries`
**Purpose:** Create itinerary
**Headers:** `Authorization: Bearer <token>`

### **GET** `/itineraries/:id`
**Purpose:** Get itinerary details
**Headers:** `Authorization: Bearer <token>` (optional for public)

### **PUT** `/itineraries/:id`
**Purpose:** Update itinerary
**Headers:** `Authorization: Bearer <token>`

### **DELETE** `/itineraries/:id`
**Purpose:** Delete itinerary
**Headers:** `Authorization: Bearer <token>`

### **POST** `/itineraries/:id/share`
**Purpose:** Share itinerary
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "isPublic": true
}
```

### **GET** `/itineraries/shared/:token`
**Purpose:** Get shared itinerary
**Access:** Public

### **POST** `/itineraries/:id/book`
**Purpose:** Book itinerary
**Headers:** `Authorization: Bearer <token>`

---

## 👤 **User Management APIs** (12 endpoints)

### **GET** `/users/dashboard`
**Purpose:** Get user dashboard
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalBookings": 5,
      "totalSpent": 2500,
      "loyaltyPoints": 1250
    },
    "upcomingBookings": [...],
    "recentBookings": [...],
    "notifications": [...]
  }
}
```

### **GET** `/users/profile`
**Purpose:** Get user profile
**Headers:** `Authorization: Bearer <token>`

### **PUT** `/users/profile`
**Purpose:** Update user profile
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  },
  "preferences": {
    "currency": "USD",
    "language": "en"
  }
}
```

### **GET** `/users/bookings`
**Purpose:** Get user bookings
**Headers:** `Authorization: Bearer <token>`

### **GET** `/users/trips/timeline`
**Purpose:** Get trips timeline
**Headers:** `Authorization: Bearer <token>`
**Query Params:** `year=2024`

### **PUT** `/users/preferences`
**Purpose:** Update user preferences
**Headers:** `Authorization: Bearer <token>`

### **GET** `/users/trips`
**Purpose:** Get user trips
**Headers:** `Authorization: Bearer <token>`

### **GET** `/users/loyalty-points`
**Purpose:** Get loyalty points
**Headers:** `Authorization: Bearer <token>`

### **POST** `/users/favorites`
**Purpose:** Add to favorites
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "entityType": "hotel",
  "entityId": "hotel123"
}
```

### **DELETE** `/users/favorites/:id`
**Purpose:** Remove from favorites
**Headers:** `Authorization: Bearer <token>`

### **DELETE** `/users/account`
**Purpose:** Delete account
**Headers:** `Authorization: Bearer <token>`

### **GET** `/users/notifications`
**Purpose:** Get user notifications
**Headers:** `Authorization: Bearer <token>`

---

## 🔍 **Search APIs** (6 endpoints)

### **POST** `/search/global`
**Purpose:** Global search
**Request Body:**
```json
{
  "q": "Paris hotels",
  "type": "hotels",
  "lat": 48.8566,
  "lng": 2.3522,
  "radius": 50,
  "priceMin": 100,
  "priceMax": 500
}
```

### **GET** `/search/suggestions`
**Purpose:** Search suggestions
**Query Params:** `q=par&limit=10`

### **POST** `/search/advanced`
**Purpose:** Advanced search with filters

### **GET** `/search/popular`
**Purpose:** Get popular searches

### **GET** `/search/history`
**Purpose:** Get search history
**Headers:** `Authorization: Bearer <token>`

### **DELETE** `/search/history`
**Purpose:** Clear search history
**Headers:** `Authorization: Bearer <token>`

---

## 📦 **Package APIs** (8 endpoints)

### **GET** `/packages`
**Purpose:** Get all packages
**Query Params:** `page=1&limit=20&category=adventure&featured=true`

### **GET** `/packages/:id`
**Purpose:** Get package details

### **GET** `/packages/categories`
**Purpose:** Get package categories

### **GET** `/packages/featured`
**Purpose:** Get featured packages

### **GET** `/packages/search`
**Purpose:** Search packages
**Query Params:** `q=japan&destination=tokyo&duration=7&budget=2000`

### **POST** `/packages/:id/customize`
**Purpose:** Customize package
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "customizations": [
    {
      "type": "hotel_upgrade",
      "description": "Upgrade to 5-star hotel",
      "additionalCost": 200
    }
  ]
}
```

### **GET** `/packages/:id/itinerary`
**Purpose:** Get package itinerary

### **POST** `/packages/:id/inquiry`
**Purpose:** Send package inquiry
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "message": "Interested in this package",
  "travelDate": "2024-12-15",
  "travelers": 2
}
```

---

## 📝 **Content APIs** (10 endpoints)

### **GET** `/content/home-stats`
**Purpose:** Get homepage statistics

### **GET** `/content/featured-destinations`
**Purpose:** Get featured destinations

### **GET** `/content/travel-categories`
**Purpose:** Get travel categories

### **GET** `/content/deals`
**Purpose:** Get current deals

### **GET** `/content/blog/latest`
**Purpose:** Get latest blog posts

### **GET** `/content/testimonials`
**Purpose:** Get customer testimonials

### **GET** `/blog/posts`
**Purpose:** Get blog posts
**Query Params:** `page=1&limit=10&category=travel-tips`

### **GET** `/blog/posts/:id`
**Purpose:** Get blog post details

### **GET** `/blog/categories`
**Purpose:** Get blog categories

### **POST** `/blog/posts/:id/like`
**Purpose:** Like blog post

---

## 🎫 **Support APIs** (6 endpoints)

### **POST** `/support/tickets`
**Purpose:** Create support ticket
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "subject": "Booking issue",
  "category": "booking_issue",
  "message": "I need help with my booking",
  "priority": "medium"
}
```

### **GET** `/support/tickets`
**Purpose:** Get user tickets
**Headers:** `Authorization: Bearer <token>`

### **GET** `/support/tickets/:id`
**Purpose:** Get ticket details
**Headers:** `Authorization: Bearer <token>`

### **PUT** `/support/tickets/:id`
**Purpose:** Update ticket
**Headers:** `Authorization: Bearer <token>`

### **POST** `/support/tickets/:id/messages`
**Purpose:** Add ticket message
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "message": "Additional information about my issue"
}
```

### **GET** `/support/faq`
**Purpose:** Get FAQ content

---

## 📊 **Dashboard APIs** (3 endpoints)

### **GET** `/dashboard`
**Purpose:** Get customer dashboard
**Headers:** `Authorization: Bearer <token>`

### **GET** `/dashboard/analytics`
**Purpose:** Get booking analytics
**Headers:** `Authorization: Bearer <token>`
**Query Params:** `period=12m`

### **GET** `/dashboard/insights`
**Purpose:** Get travel insights
**Headers:** `Authorization: Bearer <token>`

---

## 🏷️ **Additional APIs**

### **Reviews** (8 endpoints)
- GET `/reviews` - Get all reviews
- POST `/reviews` - Create review
- GET `/reviews/stats/:entityType/:entityId` - Get review stats
- PUT `/reviews/:id` - Update review
- DELETE `/reviews/:id` - Delete review
- POST `/reviews/:id/helpful` - Toggle helpful vote

### **Destinations** (8 endpoints)
- GET `/destinations` - Get all destinations
- GET `/destinations/featured` - Get featured destinations
- GET `/destinations/search` - Search destinations
- GET `/destinations/:id` - Get destination details
- GET `/destinations/:id/cities` - Get destination cities

### **Notifications** (8 endpoints)
- GET `/notifications` - Get user notifications
- PUT `/notifications/:id/read` - Mark as read
- PUT `/notifications/read-all` - Mark all as read
- DELETE `/notifications/:id` - Delete notification

### **Admin APIs** (20 endpoints)
- Complete admin panel functionality
- User management, booking oversight
- Analytics and reporting
- Content management

---

## 🔒 **Authentication & Authorization**

### **JWT Token Structure:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "role": "customer",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### **Authorization Levels:**
- **Public:** No authentication required
- **Customer:** Requires valid JWT token
- **Admin:** Requires JWT token with admin role

### **Error Responses:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [...],
  "timestamp": "2024-12-15T10:30:00Z"
}
```

---

## 📱 **Response Format Standards**

### **Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...},
  "timestamp": "2024-12-15T10:30:00Z"
}
```

### **Paginated Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "current": 1,
    "pages": 10,
    "total": 100,
    "limit": 10
  }
}
```

### **HTTP Status Codes:**
- **200:** Success
- **201:** Created
- **400:** Bad Request
- **401:** Unauthorized
- **403:** Forbidden
- **404:** Not Found
- **500:** Internal Server Error

---

## 🚀 **Rate Limiting**
- **General:** 1000 requests per 15 minutes per IP
- **Authentication:** 5 login attempts per 15 minutes per IP
- **Search:** 100 requests per minute per user

---

## 📋 **API Testing**
Use tools like Postman or Thunder Client to test endpoints:
1. Set base URL: `http://localhost:3000/api/v1`
2. Add Authorization header for protected routes
3. Use proper HTTP methods and request bodies
4. Check response format and status codes

**🎉 All 130+ API endpoints are fully functional and ready for frontend integration!**