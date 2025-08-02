# Travel Platform - Complete API Documentation

## 🔗 **BASE URL**
```
http://localhost:3000/api/v1
```

## 📋 **AUTHENTICATION ENDPOINTS**

### POST `/auth/register`
**Description:** Register new user  
**Access:** Public  
**Payload:**
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
  "message": "User registered successfully",
  "data": {
    "user": { "id": "...", "email": "...", "profile": {...} }
  }
}
```

### POST `/auth/login`
**Description:** User login  
**Access:** Public  
**Payload:**
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

### POST `/auth/logout`
**Description:** User logout  
**Access:** Private  
**Headers:** `Authorization: Bearer <token>`  
**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### POST `/auth/refresh-token`
**Description:** Refresh access token  
**Access:** Public  
**Payload:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

### POST `/auth/forgot-password`
**Description:** Request password reset  
**Access:** Public  
**Payload:**
```json
{
  "email": "user@example.com"
}
```

### POST `/auth/reset-password`
**Description:** Reset password with token  
**Access:** Public  
**Payload:**
```json
{
  "token": "reset_token",
  "password": "new_password"
}
```

### GET `/auth/verify-email`
**Description:** Verify email address  
**Access:** Public  
**Query Params:**
- `token` (string, required): Verification token

---

## ✈️ **FLIGHT ENDPOINTS**

### GET `/flights/search`
**Description:** Search flights  
**Access:** Public  
**Query Params:**
- `from` (string, required): Departure airport code
- `to` (string, required): Arrival airport code
- `departDate` (string, required): Departure date (YYYY-MM-DD)
- `returnDate` (string, optional): Return date for round trip
- `passengers` (number, default: 1): Number of passengers
- `class` (string, default: 'economy'): Flight class (economy/business/first)
- `maxPrice` (number, optional): Maximum price filter
- `airlines` (string, optional): Comma-separated airline codes
- `stops` (number, optional): Maximum number of stops
- `sort` (string, default: 'price'): Sort by (price/duration/departure)
- `page` (number, default: 1): Page number
- `limit` (number, default: 20): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "flights": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

### GET `/flights/filters`
**Description:** Get available filters for flight search  
**Access:** Public  
**Query Params:**
- `from` (string, optional): Departure airport
- `to` (string, optional): Arrival airport
- `date` (string, optional): Travel date

**Response:**
```json
{
  "success": true,
  "data": {
    "priceRange": { "minPrice": 100, "maxPrice": 2000 },
    "airlines": [{ "id": "...", "name": "...", "count": 5 }],
    "stops": [{ "value": 0, "label": "Non-stop", "count": 10 }]
  }
}
```

### GET `/flights/:id`
**Description:** Get flight details  
**Access:** Public  
**Path Params:**
- `id` (string, required): Flight ID

### GET `/flights/:id/seats`
**Description:** Get flight seat availability  
**Access:** Public  
**Path Params:**
- `id` (string, required): Flight ID

### POST `/flights/price-alerts`
**Description:** Create price alert  
**Access:** Private  
**Headers:** `Authorization: Bearer <token>`  
**Payload:**
```json
{
  "route": {
    "from": "NYC",
    "to": "LAX"
  },
  "targetPrice": 300,
  "email": true,
  "sms": false
}
```

### GET `/flights/price-alerts`
**Description:** Get user's price alerts  
**Access:** Private  
**Headers:** `Authorization: Bearer <token>`

### DELETE `/flights/price-alerts/:id`
**Description:** Delete price alert  
**Access:** Private  
**Headers:** `Authorization: Bearer <token>`  
**Path Params:**
- `id` (string, required): Price alert ID

### POST `/flights/compare`
**Description:** Compare multiple flights  
**Access:** Public  
**Payload:**
```json
{
  "flightIds": ["flight_id_1", "flight_id_2", "flight_id_3"]
}
```

### POST `/flights` (Admin)
**Description:** Create new flight  
**Access:** Admin  
**Headers:** `Authorization: Bearer <admin_token>`  
**Payload:**
```json
{
  "flightNumber": "AA123",
  "airline": "airline_id",
  "route": {
    "departure": {
      "airport": "airport_id",
      "scheduledTime": "2024-01-15T10:00:00Z"
    },
    "arrival": {
      "airport": "airport_id",
      "scheduledTime": "2024-01-15T14:00:00Z"
    }
  },
  "pricing": {
    "economy": {
      "basePrice": 200,
      "totalPrice": 250,
      "availability": 100
    }
  }
}
```

### PUT `/flights/:id` (Admin)
**Description:** Update flight  
**Access:** Admin  
**Headers:** `Authorization: Bearer <admin_token>`  
**Path Params:**
- `id` (string, required): Flight ID

### DELETE `/flights/:id` (Admin)
**Description:** Delete flight  
**Access:** Admin  
**Headers:** `Authorization: Bearer <admin_token>`  
**Path Params:**
- `id` (string, required): Flight ID

---

## 🏨 **HOTEL ENDPOINTS**

### GET `/hotels/search`
**Description:** Search hotels  
**Access:** Public  
**Query Params:**
- `destination` (string, required): Destination city or hotel name
- `checkIn` (string, required): Check-in date (YYYY-MM-DD)
- `checkOut` (string, required): Check-out date (YYYY-MM-DD)
- `guests` (number, default: 1): Number of guests
- `rooms` (number, default: 1): Number of rooms
- `minPrice` (number, optional): Minimum price filter
- `maxPrice` (number, optional): Maximum price filter
- `starRating` (number, optional): Minimum star rating (1-5)
- `amenities` (string, optional): Comma-separated amenities
- `sort` (string, default: 'price'): Sort by (price/rating/distance)
- `page` (number, default: 1): Page number
- `limit` (number, default: 20): Items per page

### GET `/hotels/:id`
**Description:** Get hotel details  
**Access:** Public  
**Path Params:**
- `id` (string, required): Hotel ID

### GET `/hotels/:id/rooms`
**Description:** Get hotel room types and availability  
**Access:** Public  
**Path Params:**
- `id` (string, required): Hotel ID
**Query Params:**
- `checkIn` (string, required): Check-in date
- `checkOut` (string, required): Check-out date
- `guests` (number, default: 1): Number of guests

### GET `/hotels/:id/availability`
**Description:** Check hotel availability  
**Access:** Public  
**Path Params:**
- `id` (string, required): Hotel ID
**Query Params:**
- `checkIn` (string, required): Check-in date
- `checkOut` (string, required): Check-out date
- `rooms` (number, default: 1): Number of rooms

---

## 📅 **BOOKING ENDPOINTS**

### GET `/bookings`
**Description:** Get user's bookings  
**Access:** Private  
**Headers:** `Authorization: Bearer <token>`  
**Query Params:**
- `status` (string, optional): Filter by status (draft/pending/confirmed/completed/cancelled)
- `type` (string, optional): Filter by type (flight/hotel/package/activity)
- `page` (number, default: 1): Page number
- `limit` (number, default: 20): Items per page

### GET `/bookings/:id`
**Description:** Get booking details  
**Access:** Private  
**Headers:** `Authorization: Bearer <token>`  
**Path Params:**
- `id` (string, required): Booking ID

### POST `/bookings`
**Description:** Create new booking  
**Access:** Private  
**Headers:** `Authorization: Bearer <token>`  
**Payload:**
```json
{
  "type": "flight",
  "flight": {
    "flightId": "flight_id",
    "passengers": [
      {
        "type": "adult",
        "firstName": "John",
        "lastName": "Doe",
        "dateOfBirth": "1990-01-01",
        "passportNumber": "A12345678"
      }
    ],
    "class": "economy"
  },
  "pricing": {
    "baseAmount": 200,
    "taxes": 50,
    "totalAmount": 250,
    "currency": "USD"
  },
  "contact": {
    "email": "user@example.com",
    "phone": "+1234567890"
  }
}
```

### PUT `/bookings/:id`
**Description:** Update booking  
**Access:** Private  
**Headers:** `Authorization: Bearer <token>`  
**Path Params:**
- `id` (string, required): Booking ID

### POST `/bookings/:id/cancel`
**Description:** Cancel booking  
**Access:** Private  
**Headers:** `Authorization: Bearer <token>`  
**Path Params:**
- `id` (string, required): Booking ID
**Payload:**
```json
{
  "reason": "Change of plans"
}
```

### POST `/bookings/:id/payment`
**Description:** Process payment for booking  
**Access:** Private  
**Headers:** `Authorization: Bearer <token>`  
**Path Params:**
- `id` (string, required): Booking ID
**Payload:**
```json
{
  "paymentMethod": "card",
  "paymentDetails": {
    "cardToken": "card_token_here"
  }
}
```

---

## 🗺️ **ITINERARY ENDPOINTS**

### GET `/itineraries`
**Description:** Get user's itineraries  
**Access:** Private  
**Headers:** `Authorization: Bearer <token>`  
**Query Params:**
- `status` (string, optional): Filter by status
- `page` (number, default: 1): Page number
- `limit` (number, default: 20): Items per page

### POST `/itineraries`
**Description:** Create new itinerary  
**Access:** Private  
**Headers:** `Authorization: Bearer <token>`  
**Payload:**
```json
{
  "title": "Trip to Paris",
  "destination": {
    "primary": "destination_id"
  },
  "duration": {
    "days": 5,
    "nights": 4
  },
  "dates": {
    "startDate": "2024-06-01",
    "endDate": "2024-06-05"
  },
  "travelers": {
    "adults": 2,
    "total": 2
  }
}
```

### GET `/itineraries/:id`
**Description:** Get itinerary details  
**Access:** Private  
**Headers:** `Authorization: Bearer <token>`  
**Path Params:**
- `id` (string, required): Itinerary ID

---

## 🤖 **AI ENDPOINTS**

### POST `/ai/itinerary/generate`
**Description:** Generate AI-powered itinerary  
**Access:** Private  
**Headers:** `Authorization: Bearer <token>`  
**Payload:**
```json
{
  "destination": "destination_id",
  "duration": 5,
  "budget": 2000,
  "travelers": 2,
  "interests": ["culture", "food", "history"],
  "travelStyle": "relaxed",
  "startDate": "2024-06-01"
}
```

### PUT `/ai/itinerary/:id/customize`
**Description:** Customize AI-generated itinerary  
**Access:** Private  
**Headers:** `Authorization: Bearer <token>`  
**Path Params:**
- `id` (string, required): Itinerary ID
**Payload:**
```json
{
  "modifications": [
    {
      "type": "activity",
      "day": 1,
      "activityId": "activity_id",
      "changes": {
        "startTime": "10:00",
        "title": "Modified Activity"
      }
    }
  ]
}
```

---

## 📊 **DASHBOARD ENDPOINTS**

### GET `/dashboard`
**Description:** Get customer dashboard overview  
**Access:** Private  
**Headers:** `Authorization: Bearer <token>`

### GET `/dashboard/analytics`
**Description:** Get booking analytics  
**Access:** Private  
**Headers:** `Authorization: Bearer <token>`  
**Query Params:**
- `period` (string, default: '12m'): Time period (3m/6m/12m)

---

## ⭐ **REVIEW ENDPOINTS**

### GET `/reviews`
**Description:** Get reviews  
**Access:** Public  
**Query Params:**
- `entityType` (string, optional): Entity type (hotel/flight/package/destination)
- `entityId` (string, optional): Entity ID
- `rating` (number, optional): Filter by rating (1-5)
- `verified` (boolean, optional): Filter verified reviews
- `page` (number, default: 1): Page number
- `limit` (number, default: 20): Items per page

### POST `/reviews`
**Description:** Create review  
**Access:** Private  
**Headers:** `Authorization: Bearer <token>`  
**Payload:**
```json
{
  "entityType": "hotel",
  "entityId": "hotel_id",
  "rating": 5,
  "title": "Great hotel!",
  "content": "Had an amazing stay...",
  "ratingBreakdown": {
    "cleanliness": 5,
    "service": 4,
    "location": 5,
    "value": 4
  }
}
```

---

## 🔍 **SEARCH ENDPOINTS**

### GET `/search`
**Description:** Global search  
**Access:** Public  
**Query Params:**
- `q` (string, required): Search query
- `type` (string, optional): Entity type filter
- `limit` (number, default: 10): Results limit per type

### GET `/search/suggestions`
**Description:** Get search suggestions  
**Access:** Public  
**Query Params:**
- `q` (string, required): Search query (min 2 characters)
- `limit` (number, default: 10): Max suggestions

---

## 🔔 **NOTIFICATION ENDPOINTS**

### GET `/notifications`
**Description:** Get user notifications  
**Access:** Private  
**Headers:** `Authorization: Bearer <token>`  
**Query Params:**
- `type` (string, optional): Notification type
- `isRead` (boolean, optional): Filter by read status
- `page` (number, default: 1): Page number
- `limit` (number, default: 20): Items per page

### PUT `/notifications/:id/read`
**Description:** Mark notification as read  
**Access:** Private  
**Headers:** `Authorization: Bearer <token>`  
**Path Params:**
- `id` (string, required): Notification ID

---

## 👨‍💼 **ADMIN ENDPOINTS**

### GET `/admin/dashboard`
**Description:** Get admin dashboard  
**Access:** Admin  
**Headers:** `Authorization: Bearer <admin_token>`

### GET `/admin/users`
**Description:** Get all users  
**Access:** Admin  
**Headers:** `Authorization: Bearer <admin_token>`  
**Query Params:**
- `status` (string, optional): Filter by status
- `role` (string, optional): Filter by role
- `search` (string, optional): Search users
- `page` (number, default: 1): Page number
- `limit` (number, default: 20): Items per page

### GET `/admin/bookings`
**Description:** Get all bookings  
**Access:** Admin  
**Headers:** `Authorization: Bearer <admin_token>`  
**Query Params:**
- `status` (string, optional): Filter by status
- `type` (string, optional): Filter by type
- `dateFrom` (string, optional): Start date filter
- `dateTo` (string, optional): End date filter

---

## 📝 **STANDARD RESPONSE FORMAT**

### Success Response:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...},
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [...],
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

### Paginated Response:
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {...},
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  },
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```