require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Additional CORS headers for file uploads
app.use((req, res, next) => {
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Core Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/users', require('./src/routes/users.routes'));
// app.use('/api/flights', require('./src/routes/flights.routes')); // Will be replaced with new implementation
app.use('/api/hotels', require('./src/routes/hotels.routes'));
app.use('/api/bookings', require('./src/routes/bookings.routes'));
app.use('/api/reviews', require('./src/routes/reviews.routes'));
app.use('/api/search', require('./src/routes/search.routes'));
app.use('/api/notifications', require('./src/routes/notifications.routes'));
app.use('/api/dashboard', require('./src/routes/dashboard.routes'));
app.use('/api/ai', require('./src/routes/ai.routes'));
app.use('/api/blog', require('./src/routes/blog.routes'));
app.use('/api/support', require('./src/routes/support.routes'));

// New Unified Routes
app.use('/api/trips', require('./src/routes/trips.routes'));
app.use('/api/flights', require('./src/routes/flights.routes'));
app.use('/api/airports', require('./src/routes/airports.routes'));
app.use('/api/locations', require('./src/routes/locations.routes'));
app.use('/api/master', require('./src/routes/master.routes'));
app.use('/api/home', require('./src/routes/home.routes'));
app.use('/api/destinations', require('./src/routes/destinations.routes'));

// Public routes
app.use('/api', require('./src/routes/public.routes'));
app.use('/api/upload', require('./src/routes/upload.routes'));

// Appointment routes
app.use('/api/appointments', require('./src/routes/appointments'));

// User trips (unified appointments + bookings)
app.use('/api/user/trips', require('./src/routes/userTrips'));

// Admin routes
console.log('Loading admin routes...');
app.use('/api/admin', require('./src/routes/admin.routes'));
app.use('/api/admin/appointments', require('./src/routes/admin/appointments'));
app.use('/api/admin/bookings', require('./src/routes/admin/bookings'));
console.log('✅ Admin routes loaded successfully');
console.log('✅ Trip routes loaded successfully');
console.log('✅ Master data routes loaded successfully');

// Legacy routes (remove deprecated ones)
// Removed: content, analytics, airlines, airports, locations, master-data

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  console.log(`🔍 Available routes: /api/admin/*, /api/auth/*, /api/packages/*`);
  res.status(404).json({
    success: false,
    error: { message: `Route not found: ${req.method} ${req.originalUrl}` }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  
  // // Seed master data on startup
  // if (process.env.NODE_ENV === 'development') {
  //   const { seedMasterData } = require('./src/seeders/masterData');
  //   const { seedCities } = require('./src/seeders/cities');
  //   const { seedDestinations } = require('./src/seeders/destinations');
  //   await seedMasterData();
  //   await seedCities();
  //   await seedDestinations();
  // }
});

module.exports = app;