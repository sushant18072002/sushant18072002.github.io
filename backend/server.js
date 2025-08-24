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
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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

// Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/v1/users', require('./src/routes/users.routes'));
app.use('/api/flights', require('./src/routes/flights.routes'));
app.use('/api/hotels', require('./src/routes/hotels.routes'));
app.use('/api/v1/bookings', require('./src/routes/bookings.routes'));
app.use('/api/v1/itineraries', require('./src/routes/itineraries.routes'));
app.use('/api/v1/destinations', require('./src/routes/destinations.routes'));
app.use('/api/packages', require('./src/routes/packages.routes'));
app.use('/api/v1/packages', require('./src/routes/packages.routes')); // Add versioned route
app.use('/api/v1/reviews', require('./src/routes/reviews.routes'));
app.use('/api/v1/tags', require('./src/routes/tags.routes'));
app.use('/api/v1/search', require('./src/routes/search.routes'));
app.use('/api/v1/notifications', require('./src/routes/notifications.routes'));
app.use('/api/v1/dashboard', require('./src/routes/dashboard.routes'));
app.use('/api/v1/ai', require('./src/routes/ai.routes'));

// Admin routes
console.log('Loading admin routes...');
app.use('/api/admin', require('./src/routes/admin.routes'));
console.log('✅ Admin routes loaded successfully');

app.use('/api/v1/content', require('./src/routes/content.routes'));
app.use('/api/v1/support', require('./src/routes/support.routes'));
app.use('/api/v1/blog', require('./src/routes/blog.routes'));
app.use('/api/v1/master-data', require('./src/routes/masterData.routes'));
app.use('/api/v1/analytics', require('./src/routes/analytics.routes'));
app.use('/api/v1/airlines', require('./src/routes/airlines.routes'));
app.use('/api/v1/airports', require('./src/routes/airports.routes'));
app.use('/api/v1/locations', require('./src/routes/locations.routes'));

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
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
});

module.exports = app;