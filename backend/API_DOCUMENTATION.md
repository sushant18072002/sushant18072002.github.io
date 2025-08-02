# Travel Platform API Documentation

## Overview
This document provides comprehensive documentation for all API endpoints in the Travel Platform backend system.

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format
All API responses follow this standard format:
```json
{
  "success": true|false,
  "data": {
    // Response data
  },
  "error": {
    "message": "Error description"
  }
}
```

---

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

### POST /auth/login
Login with email and password.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": false
}
```

### POST /auth/logout
Logout and invalidate session.

### POST /auth/refresh-token
Refresh access token using refresh token.

### POST /auth/forgot-password
Request password reset email.

### POST /auth/reset-password
Reset password using token.

### GET /auth/verify-email?token=<token>
Verify email address.

---

## User Management Endpoints

### GET /users/profile
Get current user profile (authenticated).

### PUT /users/profile
Update user profile (authenticated).

### GET /users/bookings
Get user's booking history (authenticated).

### GET /users/preferences
Get user preferences (authenticated).

### PUT /users/preferences
Update user preferences (authenticated).

---

## Destinations Endpoints

### GET /destinations
Get all destinations with filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `country` (string): Filter by country ID
- `featured` (boolean): Filter featured destinations
- `search` (string): Search in name/description
- `tags` (string): Comma-separated tag names
- `sortBy` (string): Sort field (default: priority)
- `sortOrder` (string): asc/desc (default: desc)

### GET /destinations/featured
Get featured destinations.

### GET /destinations/search
Search destinations by location and query.

**Query Parameters:**
- `q` (string): Search query
- `lat` (number): Latitude
- `lng` (number): Longitude
- `radius` (number): Search radius in km (default: 50)

### GET /destinations/:id
Get destination by ID.

### POST /destinations
Create new destination (admin only).

### PUT /destinations/:id
Update destination (admin only).

### DELETE /destinations/:id
Delete destination (admin only).

### GET /destinations/:id/cities
Get cities in a destination.

---

## Reviews Endpoints

### GET /reviews
Get all reviews with filtering.

**Query Parameters:**
- `page`, `limit`: Pagination
- `entityType`: hotel/flight/package/destination/booking
- `entityId`: ID of the entity being reviewed
- `rating`: Filter by rating (1-5)
- `verified`: Filter verified reviews
- `sortBy`: Sort field
- `sortOrder`: asc/desc

### GET /reviews/:id
Get review by ID.

### POST /reviews
Create new review (authenticated).

**Body:**
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
  },
  "images": ["image1.jpg", "image2.jpg"]
}
```

### PUT /reviews/:id
Update review (owner or admin).

### DELETE /reviews/:id
Delete review (owner or admin).

### POST /reviews/:id/helpful
Toggle helpful vote on review (authenticated).

### GET /reviews/stats/:entityType/:entityId
Get review statistics for an entity.

### POST /reviews/:id/admin-response
Add admin response to review (admin only).

---

## Tags Endpoints

### GET /tags
Get all tags with filtering.

**Query Parameters:**
- `category`: Filter by tag category
- `featured`: Filter featured tags
- `search`: Search in name/description

### GET /tags/popular
Get popular tags by usage count.

### GET /tags/categories
Get all tag categories with counts.

### GET /tags/search
Search tags for autocomplete.

### GET /tags/category/:category
Get tags by category.

### GET /tags/:id
Get tag by ID or slug.

### POST /tags
Create new tag (admin only).

### PUT /tags/:id
Update tag (admin only).

### DELETE /tags/:id
Delete tag (admin only).

---

## Search Endpoints

### GET /search
Global search across all entities.

**Query Parameters:**
- `q` (string): Search query
- `type` (string): Entity type filter
- `lat`, `lng`: Location coordinates
- `radius`: Search radius in km
- `priceMin`, `priceMax`: Price range
- `rating`: Minimum rating
- `tags`: Comma-separated tags
- `limit`: Results limit per type

### GET /search/suggestions
Get search suggestions for autocomplete.

**Query Parameters:**
- `q` (string): Search query (min 2 characters)
- `limit` (number): Max suggestions (default: 10)

### POST /search/advanced
Advanced search with complex filters.

**Body:**
```json
{
  "q": "search query",
  "type": "destinations",
  "page": 1,
  "limit": 20,
  "sortBy": "relevance",
  "sortOrder": "desc",
  "filters": {
    "priceMin": 100,
    "priceMax": 1000,
    "rating": 4,
    "tags": ["beach", "luxury"],
    "location": {
      "lat": 40.7128,
      "lng": -74.0060,
      "radius": 50
    }
  }
}
```

### GET /search/popular
Get popular search queries.

---

## Admin Endpoints

All admin endpoints require admin role authentication.

### GET /admin/dashboard
Get admin dashboard overview with key metrics.

### GET /admin/users
Get all users with filtering and pagination.

### PUT /admin/users/:id
Update user (admin only).

### DELETE /admin/users/:id
Suspend user (admin only).

### GET /admin/bookings
Get all bookings with filtering.

### PUT /admin/bookings/:id/status
Update booking status.

### GET /admin/analytics/overview
Get analytics overview with trends.

### GET /admin/support/tickets
Get support tickets.

### PUT /admin/support/tickets/:id
Update support ticket.

### POST /admin/content/blog
Create blog post.

### PUT /admin/settings
Update system settings.

### POST /admin/flights
Create flight (admin only).

### PUT /admin/flights/:id
Update flight (admin only).

### DELETE /admin/flights/:id
Delete flight (admin only).

### POST /admin/hotels
Create hotel (admin only).

### PUT /admin/hotels/:id
Update hotel (admin only).

### DELETE /admin/hotels/:id
Delete hotel (admin only).

---

## Error Codes

- `400` - Bad Request: Invalid input data
- `401` - Unauthorized: Authentication required
- `403` - Forbidden: Insufficient permissions
- `404` - Not Found: Resource not found
- `409` - Conflict: Resource already exists
- `422` - Unprocessable Entity: Validation errors
- `429` - Too Many Requests: Rate limit exceeded
- `500` - Internal Server Error: Server error

---

## Rate Limiting

API requests are limited to 1000 requests per 15-minute window per IP address.

---

## Pagination

List endpoints support pagination with these query parameters:
- `page`: Page number (starts from 1)
- `limit`: Items per page (max 100)

Response includes pagination metadata:
```json
{
  "pagination": {
    "current": 1,
    "pages": 10,
    "total": 200
  }
}
```

---

## Filtering and Sorting

Most list endpoints support:
- `sortBy`: Field to sort by
- `sortOrder`: `asc` or `desc`
- Various filter parameters specific to each endpoint

---

## File Uploads

Image uploads are supported for:
- User avatars
- Destination images
- Review images
- Hotel images

Maximum file size: 10MB
Supported formats: JPG, PNG, WebP

---

## Webhooks

The system supports webhooks for:
- Booking status changes
- Payment confirmations
- User registrations
- Review submissions

Configure webhook URLs in admin settings.