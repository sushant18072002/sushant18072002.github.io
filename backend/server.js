require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/v1/auth', require('./src/routes/auth.routes'));
app.use('/api/v1/users', require('./src/routes/users.routes'));
app.use('/api/v1/flights', require('./src/routes/flights.routes'));
app.use('/api/v1/hotels', require('./src/routes/hotels.routes'));
app.use('/api/v1/bookings', require('./src/routes/bookings.routes'));
app.use('/api/v1/itineraries', require('./src/routes/itineraries.routes'));
app.use('/api/v1/destinations', require('./src/routes/destinations.routes'));
app.use('/api/v1/packages', require('./src/routes/packages.routes'));
app.use('/api/v1/reviews', require('./src/routes/reviews.routes'));
app.use('/api/v1/tags', require('./src/routes/tags.routes'));
app.use('/api/v1/search', require('./src/routes/search.routes'));
app.use('/api/v1/notifications', require('./src/routes/notifications.routes'));
app.use('/api/v1/dashboard', require('./src/routes/dashboard.routes'));
app.use('/api/v1/ai', require('./src/routes/ai.routes'));
app.use('/api/v1/admin', require('./src/routes/admin.routes'));

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
  res.status(404).json({
    success: false,
    error: { message: 'Route not found' }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;