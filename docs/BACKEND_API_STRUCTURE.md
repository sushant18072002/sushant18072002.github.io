# Backend API Structure & Implementation

## 🏗️ API Organization by Feature

### 1. Authentication APIs
**Base URL:** `/api/v1/auth`

```javascript
// Routes: auth.routes.js
POST   /register           // User registration
POST   /login              // User login  
POST   /logout             // User logout
POST   /refresh-token      // Refresh JWT token
POST   /forgot-password    // Password reset request
POST   /reset-password     // Password reset confirmation
GET    /verify-email       // Email verification
POST   /resend-verification // Resend verification email
```

### 2. User Management APIs
**Base URL:** `/api/v1/users`

```javascript
// Routes: users.routes.js
GET    /:userId/profile     // Get user profile
PATCH  /:userId/profile     // Update user profile
GET    /:userId/dashboard   // Dashboard data
GET    /:userId/bookings    // User bookings
GET    /:userId/trips       // User trips
PATCH  /:userId/preferences // Update preferences
DELETE /:userId/account     // Delete account
```

### 3. Search APIs
**Base URL:** `/api/v1/search`

```javascript
// Routes: search.routes.js
POST   /flights/quick       // Quick flight search (Home page)
POST   /hotels/quick        // Quick hotel search (Home page)  
POST   /ai-trip            // AI trip search (Home page)
POST   /flights            // Full flight search (Flights page)
POST   /hotels             // Full hotel search (Hotels page)
GET    /suggestions         // Search suggestions
```

### 4. Flight APIs
**Base URL:** `/api/v1/flights`

```javascript
// Routes: flights.routes.js
GET    /search              // Search flights
GET    /filters             // Get search filters
GET    /:id/details         // Flight details
POST   /price-alerts        // Create price alert
GET    /price-alerts        // Get user's price alerts
DELETE /price-alerts/:id    // Delete price alert
```

### 5. Hotel APIs
**Base URL:** `/api/v1/hotels`

```javascript
// Routes: hotels.routes.js
GET    /search              // Search hotels
GET    /filters             // Get search filters
GET    /:id/details         // Hotel details
GET    /:id/availability    // Room availability
GET    /:id/reviews         // Hotel reviews
POST   /:id/reviews         // Add review
```

### 6. Booking APIs
**Base URL:** `/api/v1/bookings`

```javascript
// Routes: bookings.routes.js
POST   /                    // Create booking
GET    /:id                 // Get booking details
PATCH  /:id/status          // Update booking status
DELETE /:id                 // Cancel booking
GET    /user/:userId        // Get user bookings
```

### 7. AI APIs
**Base URL:** `/api/v1/ai`

```javascript
// Routes: ai.routes.js
POST   /generate-trip       // Generate AI trip
GET    /templates           // Get AI templates
POST   /chat               // AI chat conversation
POST   /refine-itinerary   // Refine existing itinerary
GET    /suggestions         // Get AI suggestions
```

### 8. Content APIs
**Base URL:** `/api/v1/content`

```javascript
// Routes: content.routes.js
GET    /categories/adventures    // Adventure categories (Home)
GET    /destinations/featured   // Featured destinations (Home)
GET    /packages/featured       // Featured packages (Home)
GET    /blog/featured          // Featured blog posts (Home)
GET    /stats/live             // Live statistics (Home)
```

## 📁 Backend Folder Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js       // Authentication logic
│   │   ├── users.controller.js      // User management
│   │   ├── search.controller.js     // Search functionality
│   │   ├── flights.controller.js    // Flight operations
│   │   ├── hotels.controller.js     // Hotel operations
│   │   ├── bookings.controller.js   // Booking management
│   │   ├── ai.controller.js         // AI features
│   │   └── content.controller.js    // Content management
│   ├── routes/
│   │   ├── auth.routes.js           // Auth routes
│   │   ├── users.routes.js          // User routes
│   │   ├── search.routes.js         // Search routes
│   │   ├── flights.routes.js        // Flight routes
│   │   ├── hotels.routes.js         // Hotel routes
│   │   ├── bookings.routes.js       // Booking routes
│   │   ├── ai.routes.js             // AI routes
│   │   └── content.routes.js        // Content routes
│   ├── models/
│   │   ├── User.js                  // User model
│   │   ├── Flight.js                // Flight model
│   │   ├── Hotel.js                 // Hotel model
│   │   ├── Booking.js               // Booking model
│   │   ├── Itinerary.js             // Itinerary model
│   │   └── index.js                 // Model exports
│   ├── services/
│   │   ├── authService.js           // Auth business logic
│   │   ├── searchService.js         // Search logic
│   │   ├── bookingService.js        // Booking logic
│   │   ├── aiService.js             // AI logic
│   │   ├── emailService.js          // Email service
│   │   └── paymentService.js        // Payment service
│   ├── middleware/
│   │   ├── auth.middleware.js       // Authentication
│   │   ├── validation.middleware.js // Input validation
│   │   ├── rateLimiter.middleware.js// Rate limiting
│   │   └── error.middleware.js      // Error handling
│   ├── utils/
│   │   ├── database.js              // DB connection
│   │   ├── logger.js                // Logging utility
│   │   ├── encryption.js            // Encryption utils
│   │   └── helpers.js               // Helper functions
│   └── config/
│       ├── database.config.js       // DB configuration
│       ├── auth.config.js           // Auth configuration
│       └── app.config.js            // App configuration
├── tests/
│   ├── unit/                        // Unit tests
│   ├── integration/                 // Integration tests
│   └── e2e/                         // End-to-end tests
├── docs/
│   └── api/                         // API documentation
├── package.json
├── server.js                        // Main server file
└── .env                            // Environment variables
```

## 🔧 Controller Implementation Examples

### 1. Home Page Controller
```javascript
// controllers/content.controller.js
const contentController = {
  // GET /api/v1/content/stats/live
  getLiveStats: async (req, res) => {
    try {
      const stats = await contentService.getLiveStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // GET /api/v1/content/categories/adventures
  getAdventureCategories: async (req, res) => {
    try {
      const categories = await contentService.getAdventureCategories();
      res.json({ success: true, data: { categories } });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // GET /api/v1/content/destinations/featured
  getFeaturedDestinations: async (req, res) => {
    try {
      const { limit = 4 } = req.query;
      const destinations = await contentService.getFeaturedDestinations(limit);
      res.json({ success: true, data: { destinations } });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};
```

### 2. Search Controller
```javascript
// controllers/search.controller.js
const searchController = {
  // POST /api/v1/search/flights/quick (Home page)
  quickFlightSearch: async (req, res) => {
    try {
      const { from, to, departDate, passengers } = req.body;
      const flights = await searchService.quickFlightSearch({
        from, to, departDate, passengers
      });
      res.json({ success: true, data: { flights } });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // POST /api/v1/search/ai-trip (Home page)
  aiTripSearch: async (req, res) => {
    try {
      const { prompt, duration, travelers, budget } = req.body;
      const itinerary = await aiService.generateQuickItinerary({
        prompt, duration, travelers, budget
      });
      res.json({ success: true, data: { itinerary } });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};
```

### 3. Flight Controller
```javascript
// controllers/flights.controller.js
const flightController = {
  // GET /api/v1/flights/search (Flights page)
  searchFlights: async (req, res) => {
    try {
      const searchParams = req.query;
      const flights = await flightService.searchFlights(searchParams);
      res.json({ success: true, data: { flights } });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // GET /api/v1/flights/filters
  getFilters: async (req, res) => {
    try {
      const { from, to, date } = req.query;
      const filters = await flightService.getSearchFilters({ from, to, date });
      res.json({ success: true, data: filters });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // POST /api/v1/flights/price-alerts
  createPriceAlert: async (req, res) => {
    try {
      const alertData = { ...req.body, userId: req.user.id };
      const alert = await flightService.createPriceAlert(alertData);
      res.status(201).json({ success: true, data: { alert } });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};
```

## 🗄️ Service Layer Implementation

### 1. Content Service (Home Page Data)
```javascript
// services/contentService.js
const contentService = {
  async getLiveStats() {
    const [dreamsPlanned, activeUsers, totalBookings] = await Promise.all([
      this.getDreamsPlannedToday(),
      this.getActiveUsers(),
      this.getTotalBookings()
    ]);
    
    return {
      dreamsPlannedToday: dreamsPlanned,
      activeUsers: activeUsers,
      totalBookings: totalBookings
    };
  },

  async getAdventureCategories() {
    return await AdventureCategory.find({ active: true })
      .select('name icon placesCount averagePrice')
      .sort({ priority: 1 });
  },

  async getFeaturedDestinations(limit = 4) {
    return await Destination.find({ featured: true })
      .select('name price discount rating image')
      .limit(parseInt(limit))
      .sort({ priority: 1 });
  },

  async getFeaturedPackages(limit = 4) {
    return await Package.find({ featured: true })
      .select('title duration price rating image')
      .limit(parseInt(limit))
      .sort({ priority: 1 });
  }
};
```

### 2. Search Service
```javascript
// services/searchService.js
const searchService = {
  async quickFlightSearch(params) {
    const { from, to, departDate, passengers } = params;
    
    return await Flight.find({
      'route.departure.airport.code': from,
      'route.arrival.airport.code': to,
      'route.departure.scheduledTime': {
        $gte: new Date(departDate),
        $lt: new Date(new Date(departDate).getTime() + 24*60*60*1000)
      }
    })
    .select('flightNumber airline route pricing')
    .limit(5)
    .sort({ 'pricing.economy.totalPrice': 1 });
  },

  async quickHotelSearch(params) {
    const { location, checkIn, checkOut, guests } = params;
    
    return await Hotel.find({
      'location.city': new RegExp(location, 'i'),
      'rooms.maxOccupancy': { $gte: guests }
    })
    .select('name starRating location pricing rating')
    .limit(5)
    .sort({ 'rating.overall': -1 });
  }
};
```

### 3. AI Service (Template-based)
```javascript
// services/aiService.js
const aiService = {
  async generateQuickItinerary(params) {
    const { prompt, duration, travelers, budget } = params;
    
    // Extract destination from prompt
    const destination = this.extractDestination(prompt);
    const theme = this.extractTheme(prompt);
    
    // Get template
    const template = await this.getTemplate(destination, theme, duration);
    
    // Customize based on budget and travelers
    const customizedItinerary = this.customizeTemplate(template, {
      budget, travelers, duration
    });
    
    return customizedItinerary;
  },

  extractDestination(prompt) {
    const destinations = {
      'paris': ['paris', 'france', 'eiffel'],
      'tokyo': ['tokyo', 'japan', 'shibuya'],
      'bali': ['bali', 'indonesia', 'ubud']
    };
    
    const lowerPrompt = prompt.toLowerCase();
    for (const [dest, keywords] of Object.entries(destinations)) {
      if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
        return dest;
      }
    }
    return 'generic';
  },

  async getTemplate(destination, theme, duration) {
    return await ItineraryTemplate.findOne({
      destination,
      theme,
      duration: { $lte: duration }
    });
  }
};
```

## 🔄 CRUD Operations Implementation

### 1. Create Operations
```javascript
// Create new booking
const createBooking = async (bookingData) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      // Create booking
      const booking = await Booking.create([bookingData], { session });
      
      // Update inventory
      if (bookingData.type === 'flight') {
        await Flight.updateOne(
          { _id: bookingData.flightId },
          { $inc: { 'availability.economy': -1 } },
          { session }
        );
      }
      
      // Send confirmation email
      await emailService.sendBookingConfirmation(booking[0]);
      
      return booking[0];
    });
  } finally {
    await session.endSession();
  }
};
```

### 2. Read Operations
```javascript
// Get user dashboard data
const getUserDashboard = async (userId) => {
  const [upcomingBookings, totalBookings, loyaltyPoints] = await Promise.all([
    Booking.countDocuments({ 
      userId, 
      status: 'confirmed',
      'travel.departureDate': { $gte: new Date() }
    }),
    Booking.countDocuments({ userId }),
    User.findById(userId).select('loyaltyPoints')
  ]);
  
  return {
    upcomingTrips: upcomingBookings,
    totalBookings,
    loyaltyPoints: loyaltyPoints?.loyaltyPoints || 0
  };
};
```

### 3. Update Operations
```javascript
// Update flight prices
const updateFlightPrices = async (priceUpdates) => {
  const bulkOps = priceUpdates.map(update => ({
    updateOne: {
      filter: { _id: update.flightId },
      update: {
        $set: {
          'pricing.economy.totalPrice': update.newPrice,
          'pricing.lastUpdated': new Date()
        },
        $push: {
          'pricing.priceHistory': {
            price: update.newPrice,
            timestamp: new Date()
          }
        }
      }
    }
  }));
  
  await Flight.bulkWrite(bulkOps);
  
  // Check price alerts
  await checkPriceAlerts(priceUpdates);
};
```

### 4. Delete Operations
```javascript
// Soft delete user account
const deleteUserAccount = async (userId, reason) => {
  await User.updateOne(
    { _id: userId },
    {
      $set: {
        status: 'deleted',
        deletedAt: new Date(),
        deletionReason: reason
      }
    }
  );
  
  // Archive user data
  await archiveUserData(userId);
};
```

## 🔗 Route Definitions

### Main App Routes
```javascript
// server.js
const express = require('express');
const app = express();

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const searchRoutes = require('./routes/search.routes');
const flightRoutes = require('./routes/flights.routes');
const hotelRoutes = require('./routes/hotels.routes');
const bookingRoutes = require('./routes/bookings.routes');
const aiRoutes = require('./routes/ai.routes');
const contentRoutes = require('./routes/content.routes');

// Use routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/flights', flightRoutes);
app.use('/api/v1/hotels', hotelRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/content', contentRoutes);
```

This structure provides clear organization of APIs by feature, making it easy to understand which APIs serve which pages and how CRUD operations are implemented.