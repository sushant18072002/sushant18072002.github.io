# Database Design

## 🗄️ Database Choice: MongoDB

**Why MongoDB?**
- **Flexible Schema**: Travel data varies significantly (flights, hotels, itineraries)
- **JSON-like Documents**: Perfect for API responses and complex nested data
- **Horizontal Scaling**: Can handle high traffic and large datasets
- **Geospatial Queries**: Built-in support for location-based searches
- **Aggregation Pipeline**: Powerful for analytics and reporting

## 🏗️ Database Architecture

### Primary Database: MongoDB
- **Main Collections**: User data, bookings, content
- **Indexes**: Optimized for search queries
- **Replication**: Master-slave setup for high availability

### Cache Layer: Redis
- **Session Storage**: JWT tokens and user sessions
- **Search Cache**: Frequently searched flights/hotels
- **Rate Limiting**: API rate limiting data
- **Real-time Data**: Live prices and availability

### File Storage: AWS S3
- **User Uploads**: Profile pictures, documents
- **Static Assets**: Images, PDFs, documents
- **Backup Storage**: Database backups

## 📊 Collections Overview

### Core Collections
1. **users** - User accounts and profiles
2. **bookings** - All booking records
3. **flights** - Flight data and schedules
4. **hotels** - Hotel information and rooms
5. **itineraries** - Custom and AI-generated itineraries
6. **destinations** - Destination information
7. **reviews** - User reviews and ratings
8. **payments** - Payment transactions
9. **support_tickets** - Customer support
10. **notifications** - User notifications

### Content Collections
11. **blog_posts** - Blog articles
12. **packages** - Travel packages
13. **activities** - Activities and experiences
14. **airlines** - Airline information
15. **airports** - Airport data
16. **countries** - Country information
17. **cities** - City data
18. **currencies** - Currency rates

### System Collections
19. **sessions** - User sessions
20. **audit_logs** - System audit trail
21. **email_templates** - Email templates
22. **settings** - System settings
23. **analytics** - Usage analytics
24. **ai_training_data** - AI model training data
25. **search_logs** - Search query logs

## 🔗 Relationships

### User-Centric Relationships
```
users (1) → (N) bookings
users (1) → (N) itineraries
users (1) → (N) reviews
users (1) → (N) support_tickets
users (1) → (N) notifications
```

### Booking Relationships
```
bookings (N) → (1) users
bookings (N) → (1) flights/hotels/packages
bookings (1) → (N) payments
bookings (1) → (N) travelers
```

### Content Relationships
```
destinations (1) → (N) hotels
destinations (1) → (N) activities
hotels (1) → (N) rooms
hotels (1) → (N) reviews
itineraries (1) → (N) activities
```

## 📈 Indexing Strategy

### Search Indexes
```javascript
// Text search across multiple fields
db.hotels.createIndex({
  "name": "text",
  "description": "text",
  "location.city": "text"
})

// Geospatial index for location-based queries
db.hotels.createIndex({
  "location.coordinates": "2dsphere"
})

// Compound indexes for common queries
db.flights.createIndex({
  "departure.airport": 1,
  "arrival.airport": 1,
  "departure.date": 1
})
```

### Performance Indexes
```javascript
// User bookings lookup
db.bookings.createIndex({"userId": 1, "createdAt": -1})

// Price range queries
db.hotels.createIndex({"price.amount": 1})

// Availability queries
db.flights.createIndex({
  "departure.date": 1,
  "availability.economy": 1
})
```

## 🔄 Data Flow

### Search Flow
1. User searches → Redis cache check
2. Cache miss → MongoDB query
3. Results cached → Return to user
4. Background: Update search analytics

### Booking Flow
1. User initiates booking → Create pending booking
2. Payment processing → Update booking status
3. Confirmation → Send notifications
4. Background: Update availability, analytics

### AI Flow
1. User request → Store in ai_training_data
2. AI processing → Generate recommendations
3. Results → Cache in Redis
4. User feedback → Update training data

## 📊 Sample Documents

See [schema.md](./schema.md) for detailed collection schemas and examples.