# API Documentation

## 🔗 Base URL
```
Production: https://api.travelai.com/v1
Development: http://localhost:3000/api/v1
```

## 🔐 Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## 📄 Page-wise API Requirements

### 1. Index Page (Landing)
- **GET** `/destinations/popular` - Popular destinations
- **GET** `/packages/featured` - Featured packages
- **GET** `/stats/live` - Live statistics
- **POST** `/newsletter/subscribe` - Newsletter subscription

### 2. Flights Page
- **GET** `/flights/search` - Search flights
- **GET** `/flights/filters` - Available filters
- **GET** `/airports/search` - Airport autocomplete
- **POST** `/flights/compare` - Compare flights

### 3. Flight Details Page
- **GET** `/flights/:id` - Flight details
- **GET** `/flights/:id/seats` - Available seats
- **GET** `/flights/:id/reviews` - Flight reviews
- **POST** `/flights/:id/hold` - Hold seat temporarily

### 4. Flight Booking Page
- **POST** `/bookings/flights` - Create flight booking
- **GET** `/bookings/:id` - Get booking details
- **PUT** `/bookings/:id` - Update booking
- **POST** `/payments/process` - Process payment
- **GET** `/users/:id/travelers` - Saved travelers

### 5. Hotels Page
- **GET** `/hotels/search` - Search hotels
- **GET** `/hotels/filters` - Available filters
- **GET** `/locations/search` - Location autocomplete
- **POST** `/hotels/compare` - Compare hotels

### 6. Hotel Details Page
- **GET** `/hotels/:id` - Hotel details
- **GET** `/hotels/:id/rooms` - Available rooms
- **GET** `/hotels/:id/reviews` - Hotel reviews
- **GET** `/hotels/:id/amenities` - Hotel amenities
- **POST** `/hotels/:id/availability` - Check availability

### 7. Hotel Booking Page
- **POST** `/bookings/hotels` - Create hotel booking
- **GET** `/hotels/:id/policies` - Cancellation policies
- **POST** `/bookings/hotels/modify` - Modify booking
- **GET** `/bookings/:id/confirmation` - Booking confirmation

### 8. Itinerary Hub Page
- **GET** `/itineraries/templates` - Pre-made templates
- **GET** `/itineraries/categories` - Categories
- **GET** `/itineraries/popular` - Popular itineraries
- **POST** `/itineraries/search` - Search itineraries

### 9. Itinerary AI Page
- **POST** `/ai/generate-itinerary` - Generate AI itinerary
- **POST** `/ai/refine-itinerary` - Refine existing itinerary
- **GET** `/ai/suggestions` - Get AI suggestions
- **POST** `/ai/feedback` - Submit feedback to AI

### 10. Packages Page
- **GET** `/packages/search` - Search packages
- **GET** `/packages/categories` - Package categories
- **GET** `/packages/deals` - Special deals
- **POST** `/packages/customize` - Customize package

### 11. Custom Builder Page
- **POST** `/itineraries/create` - Create custom itinerary
- **PUT** `/itineraries/:id` - Update itinerary
- **GET** `/activities/search` - Search activities
- **GET** `/destinations/info` - Destination information

### 12. Itinerary Details Page
- **GET** `/itineraries/:id` - Get itinerary details
- **POST** `/itineraries/:id/book` - Book itinerary
- **PUT** `/itineraries/:id/customize` - Customize itinerary
- **GET** `/itineraries/:id/timeline` - Get timeline view

### 13. Itinerary Booking Page
- **POST** `/bookings/itineraries` - Book complete itinerary
- **GET** `/bookings/:id/breakdown` - Cost breakdown
- **POST** `/bookings/split-payment` - Split payment options
- **GET** `/insurance/options` - Travel insurance options

### 14. Contact Page
- **POST** `/support/tickets` - Create support ticket
- **GET** `/support/categories` - Support categories
- **POST** `/support/chat` - Start live chat
- **GET** `/support/faq` - Get FAQ items

### 15. Blog Page
- **GET** `/blog/posts` - Get blog posts
- **GET** `/blog/categories` - Blog categories
- **GET** `/blog/search` - Search blog posts
- **POST** `/blog/subscribe` - Subscribe to blog

### 16. Blog Details Page
- **GET** `/blog/posts/:slug` - Get blog post
- **POST** `/blog/posts/:id/comments` - Add comment
- **GET** `/blog/posts/:id/related` - Related posts
- **POST** `/blog/posts/:id/like` - Like post

### 17. Legal Page
- **GET** `/legal/terms` - Terms & conditions
- **GET** `/legal/privacy` - Privacy policy
- **GET** `/legal/cookies` - Cookie policy
- **POST** `/legal/consent` - Update consent

### 18. Auth Page (Login/Register)
- **POST** `/auth/register` - User registration
- **POST** `/auth/login` - User login
- **POST** `/auth/logout` - User logout
- **POST** `/auth/forgot-password` - Forgot password
- **POST** `/auth/reset-password` - Reset password
- **POST** `/auth/verify-email` - Verify email
- **POST** `/auth/refresh-token` - Refresh JWT token

### 19. User Dashboard
- **GET** `/users/profile` - Get user profile
- **PUT** `/users/profile` - Update profile
- **GET** `/users/bookings` - User bookings
- **GET** `/users/itineraries` - User itineraries
- **GET** `/users/favorites` - User favorites
- **GET** `/users/notifications` - User notifications
- **PUT** `/users/preferences` - Update preferences

## 🔄 Common Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "timestamp": "2024-12-15T10:30:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": []
  },
  "timestamp": "2024-12-15T10:30:00Z"
}
```

## 📊 Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **429**: Rate Limited
- **500**: Internal Server Error