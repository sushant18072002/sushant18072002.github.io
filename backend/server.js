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
  origin: ['http://localhost:3001', 'http://localhost:3000','http://34.228.143.158/'],
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
  windowMs: 15 * 60 * 1000,
  max: 1000
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));

// Database connection function
const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log('📍 URI:', process.env.MONGODB_URI);
    
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    };
    
    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log('✅ MongoDB connected successfully');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    throw err;
  }
};

// Initialize routes after DB connection
const initializeRoutes = () => {
  console.log('📦 Loading routes...');
  
  // Core Routes
  app.use('/api/auth', require('./src/routes/auth.routes'));
  app.use('/api/users', require('./src/routes/users.routes'));
  app.use('/api/hotels', require('./src/routes/hotels.routes'));
  app.use('/api/bookings', require('./src/routes/bookings.routes'));
  app.use('/api/appointments', require('./src/routes/corporateGroup.routes'));
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
  app.use('/api/user/trips', require('./src/routes/userTrips'));

  // Corporate routes
  app.use('/api/corporate', require('./src/routes/corporate.routes'));
  console.log('✅ Corporate group booking routes loaded');

  // Admin routes
  console.log('Loading admin routes...');
  app.use('/api/admin', require('./src/routes/admin.routes'));
  app.use('/api/admin/appointments', require('./src/routes/admin/appointments'));
  app.use('/api/admin/bookings', require('./src/routes/admin/bookings'));
  app.use('/api/admin/corporate', require('./src/routes/admin/corporate.routes'));
  console.log('✅ Admin routes loaded successfully');

  // Health check
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
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
    res.status(404).json({
      success: false,
      error: { message: `Route not found: ${req.method} ${req.originalUrl}` }
    });
  });
  
  console.log('✅ All routes loaded successfully');
};

// MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('👋 MongoDB closed');
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Connect to DB first
    await connectDB();
    
    // Initialize routes
    initializeRoutes();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API: http://localhost:${PORT}/api`);
      console.log(`🔗 Health: http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error('❌ Failed to start:', err);
    process.exit(1);
  }
};

startServer();

module.exports = app;
