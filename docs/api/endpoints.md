# Detailed API Endpoints

## 🔍 Search & Discovery APIs

### Flight Search
```http
GET /flights/search
```

**Query Parameters:**
```json
{
  "from": "string (required) - Departure airport code",
  "to": "string (required) - Arrival airport code", 
  "departDate": "string (required) - YYYY-MM-DD",
  "returnDate": "string (optional) - YYYY-MM-DD",
  "passengers": "number (required) - Number of passengers",
  "class": "string (optional) - economy|business|first",
  "direct": "boolean (optional) - Direct flights only",
  "maxPrice": "number (optional) - Maximum price",
  "airlines": "array (optional) - Preferred airlines",
  "sort": "string (optional) - price|duration|departure"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "flights": [
      {
        "id": "FL123456",
        "airline": "Emirates",
        "flightNumber": "EK205",
        "departure": {
          "airport": "DXB",
          "city": "Dubai",
          "time": "2024-12-20T14:30:00Z",
          "terminal": "3"
        },
        "arrival": {
          "airport": "JFK",
          "city": "New York",
          "time": "2024-12-20T19:45:00Z",
          "terminal": "4"
        },
        "duration": "14h 15m",
        "stops": 0,
        "price": {
          "amount": 1250,
          "currency": "USD",
          "breakdown": {
            "base": 980,
            "taxes": 270
          }
        },
        "aircraft": "Boeing 777-300ER",
        "amenities": ["wifi", "entertainment", "meals"],
        "baggage": {
          "carry": "7kg",
          "checked": "30kg"
        },
        "availability": {
          "economy": 15,
          "business": 3,
          "first": 1
        }
      }
    ],
    "filters": {
      "priceRange": {"min": 450, "max": 2500},
      "airlines": ["Emirates", "Qatar", "Lufthansa"],
      "stops": [0, 1, 2],
      "duration": {"min": "8h", "max": "24h"}
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "hasNext": true
    }
  }
}
```

### Hotel Search
```http
GET /hotels/search
```

**Query Parameters:**
```json
{
  "location": "string (required) - City or hotel name",
  "checkIn": "string (required) - YYYY-MM-DD",
  "checkOut": "string (required) - YYYY-MM-DD",
  "guests": "number (required) - Number of guests",
  "rooms": "number (required) - Number of rooms",
  "minPrice": "number (optional)",
  "maxPrice": "number (optional)",
  "starRating": "array (optional) - [3,4,5]",
  "amenities": "array (optional) - ['wifi','pool','gym']",
  "sort": "string (optional) - price|rating|distance"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hotels": [
      {
        "id": "HTL789012",
        "name": "Grand Plaza Hotel",
        "starRating": 5,
        "rating": 4.8,
        "reviewCount": 1247,
        "location": {
          "address": "123 Main Street, Paris",
          "coordinates": {"lat": 48.8566, "lng": 2.3522},
          "landmarks": [
            {"name": "Eiffel Tower", "distance": "0.5km"},
            {"name": "Louvre Museum", "distance": "1.2km"}
          ]
        },
        "images": [
          "https://example.com/hotel1.jpg",
          "https://example.com/hotel2.jpg"
        ],
        "price": {
          "amount": 320,
          "currency": "USD",
          "perNight": true,
          "totalStay": 960,
          "taxes": 48
        },
        "amenities": [
          "Free WiFi", "Swimming Pool", "Fitness Center", 
          "Restaurant", "Room Service", "Concierge"
        ],
        "rooms": [
          {
            "type": "Deluxe Room",
            "size": "35 sqm",
            "beds": "1 King Bed",
            "maxGuests": 2,
            "price": 320,
            "available": 5
          }
        ],
        "policies": {
          "checkIn": "15:00",
          "checkOut": "11:00",
          "cancellation": "Free cancellation until 24h before",
          "pets": false,
          "smoking": false
        }
      }
    ],
    "totalResults": 89,
    "filters": {
      "priceRange": {"min": 80, "max": 800},
      "starRatings": [3, 4, 5],
      "amenities": ["WiFi", "Pool", "Gym", "Restaurant"],
      "neighborhoods": ["City Center", "Old Town", "Business District"]
    }
  }
}
```

## 🤖 AI-Powered APIs

### Generate AI Itinerary
```http
POST /ai/generate-itinerary
```

**Request Body:**
```json
{
  "prompt": "Romantic getaway in Paris for 5 days with my partner",
  "preferences": {
    "budget": "mid-range",
    "travelers": 2,
    "duration": 5,
    "interests": ["culture", "food", "romance"],
    "travelStyle": "relaxed",
    "accommodation": "hotel",
    "transportation": "public"
  },
  "constraints": {
    "maxBudget": 3000,
    "mustInclude": ["Eiffel Tower", "Louvre"],
    "avoid": ["crowded places"],
    "accessibility": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "itinerary": {
      "id": "AI_ITN_123456",
      "title": "Romantic Paris Getaway",
      "description": "A perfect 5-day romantic escape in the City of Love",
      "duration": 5,
      "estimatedCost": {
        "total": 2850,
        "breakdown": {
          "accommodation": 1200,
          "activities": 800,
          "meals": 600,
          "transportation": 250
        }
      },
      "days": [
        {
          "day": 1,
          "date": "2024-12-20",
          "theme": "Arrival & City Introduction",
          "activities": [
            {
              "time": "14:00",
              "title": "Check-in at Hotel",
              "description": "Settle into your romantic suite",
              "duration": "1h",
              "cost": 0,
              "location": "Hotel Grand Plaza",
              "type": "accommodation"
            },
            {
              "time": "16:00",
              "title": "Seine River Cruise",
              "description": "Romantic boat ride with champagne",
              "duration": "2h",
              "cost": 120,
              "location": "Pont Neuf",
              "type": "activity",
              "bookingRequired": true
            }
          ]
        }
      ],
      "recommendations": {
        "restaurants": [
          {
            "name": "Le Jules Verne",
            "cuisine": "French Fine Dining",
            "priceRange": "$$$",
            "rating": 4.9,
            "speciality": "Michelin starred restaurant in Eiffel Tower"
          }
        ],
        "hotels": [
          {
            "name": "Hotel Plaza Athénée",
            "rating": 5,
            "pricePerNight": 450,
            "features": ["Spa", "Michelin Restaurant", "Eiffel Tower View"]
          }
        ]
      },
      "tips": [
        "Book restaurant reservations in advance",
        "Purchase museum passes for skip-the-line access",
        "Pack comfortable walking shoes"
      ],
      "aiConfidence": 0.92,
      "generatedAt": "2024-12-15T10:30:00Z"
    }
  }
}
```

### AI Recommendations
```http
GET /ai/suggestions
```

**Query Parameters:**
```json
{
  "userId": "string (required)",
  "type": "string (required) - destinations|activities|restaurants",
  "location": "string (optional)",
  "budget": "string (optional) - budget|mid-range|luxury",
  "interests": "array (optional)",
  "limit": "number (optional) - default 10"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "id": "SUGG_001",
        "type": "destination",
        "title": "Santorini, Greece",
        "description": "Perfect for romantic sunsets and wine tasting",
        "confidence": 0.89,
        "reasons": [
          "Matches your preference for romantic destinations",
          "Similar to your previous bookings",
          "Highly rated by users with similar interests"
        ],
        "estimatedCost": 2500,
        "bestTime": "April - October",
        "image": "https://example.com/santorini.jpg",
        "tags": ["romantic", "islands", "wine", "photography"]
      }
    ],
    "metadata": {
      "basedOn": ["user_history", "preferences", "similar_users"],
      "refreshedAt": "2024-12-15T10:30:00Z"
    }
  }
}
```

## 💳 Booking & Payment APIs

### Create Booking
```http
POST /bookings/create
```

**Request Body:**
```json
{
  "type": "flight|hotel|package|itinerary",
  "items": [
    {
      "id": "FL123456",
      "type": "flight",
      "passengers": [
        {
          "title": "Mr",
          "firstName": "John",
          "lastName": "Doe",
          "dateOfBirth": "1990-05-15",
          "passport": "A12345678",
          "nationality": "US"
        }
      ],
      "seatPreferences": ["window", "aisle"],
      "specialRequests": ["vegetarian meal"]
    }
  ],
  "contactInfo": {
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "payment": {
    "method": "card|paypal|bank_transfer",
    "installments": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "BKG_789012345",
      "reference": "TRV-ABC123",
      "status": "confirmed",
      "totalAmount": 1250,
      "currency": "USD",
      "items": [...],
      "payment": {
        "status": "completed",
        "transactionId": "TXN_456789",
        "method": "card",
        "paidAt": "2024-12-15T10:30:00Z"
      },
      "cancellation": {
        "allowed": true,
        "deadline": "2024-12-18T23:59:59Z",
        "penalty": 50
      },
      "documents": [
        {
          "type": "e-ticket",
          "url": "https://example.com/ticket.pdf"
        }
      ],
      "createdAt": "2024-12-15T10:30:00Z"
    }
  }
}
```

## 👤 User Management APIs

### User Profile
```http
GET /users/profile
PUT /users/profile
```

**GET Response / PUT Request:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "USR_123456",
      "email": "john@example.com",
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "dateOfBirth": "1990-05-15",
        "phone": "+1234567890",
        "avatar": "https://example.com/avatar.jpg",
        "nationality": "US",
        "passportNumber": "A12345678",
        "passportExpiry": "2030-05-15"
      },
      "preferences": {
        "currency": "USD",
        "language": "en",
        "timezone": "America/New_York",
        "notifications": {
          "email": true,
          "sms": false,
          "push": true
        },
        "travel": {
          "seatPreference": "window",
          "mealPreference": "vegetarian",
          "budgetRange": "mid-range",
          "interests": ["culture", "food", "adventure"],
          "travelStyle": "relaxed"
        }
      },
      "stats": {
        "totalBookings": 15,
        "totalSpent": 25000,
        "countriesVisited": 12,
        "memberSince": "2022-01-15"
      }
    }
  }
}
```

## 🔔 Real-time APIs

### WebSocket Events
```javascript
// Connection
ws://localhost:3000/socket.io

// Events
{
  "priceAlert": {
    "flightId": "FL123456",
    "oldPrice": 1250,
    "newPrice": 1100,
    "savings": 150
  },
  "bookingUpdate": {
    "bookingId": "BKG_789012345",
    "status": "confirmed",
    "message": "Your flight has been confirmed"
  },
  "chatMessage": {
    "supportId": "SUP_456789",
    "message": "How can I help you today?",
    "timestamp": "2024-12-15T10:30:00Z"
  }
}
```