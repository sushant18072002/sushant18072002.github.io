# Development Guide

## 🚀 Getting Started

### Prerequisites
```bash
# Required Software
Node.js 18+
MongoDB 7.0+
Redis 7.0+
Docker & Docker Compose
Git
```

### Environment Setup
```bash
# Clone repository
git clone https://github.com/company/travelai.git
cd travelai

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
```

### Environment Variables
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/travelai
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# External APIs
AMADEUS_API_KEY=your-amadeus-key
BOOKING_API_KEY=your-booking-key
STRIPE_SECRET_KEY=your-stripe-key

# Email
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@travelai.com

# File Storage
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=travelai-uploads

# Environment
NODE_ENV=development
PORT=3000
```

### Development Commands
```bash
# Start all services
npm run dev:all

# Start individual services
npm run dev:api          # API Gateway
npm run dev:user         # User Service
npm run dev:booking      # Booking Service
npm run dev:ai           # AI Service
npm run dev:frontend     # React App

# Database operations
npm run db:seed          # Seed initial data
npm run db:migrate       # Run migrations
npm run db:reset         # Reset database

# Testing
npm run test             # Run all tests
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests
npm run test:e2e         # End-to-end tests

# Code quality
npm run lint             # ESLint
npm run format           # Prettier
npm run type-check       # TypeScript
```

## 📁 Project Structure

```
travelai/
├── backend/
│   ├── api-gateway/         # Main API gateway
│   ├── services/
│   │   ├── user-service/    # User management
│   │   ├── booking-service/ # Booking operations
│   │   ├── search-service/  # Search functionality
│   │   ├── payment-service/ # Payment processing
│   │   └── ai-service/      # AI features
│   ├── shared/
│   │   ├── database/        # Database models
│   │   ├── middleware/      # Common middleware
│   │   └── utils/           # Utility functions
│   └── scripts/             # Database scripts
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   ├── store/           # Redux store
│   │   └── utils/           # Frontend utils
│   └── public/              # Static assets
├── docs/                    # Documentation
├── docker/                  # Docker configurations
├── scripts/                 # Build scripts
└── tests/                   # Test files
```

## 🔧 Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/flight-search

# Make changes
# ... code changes ...

# Run tests
npm run test

# Commit changes
git add .
git commit -m "feat: add flight search functionality"

# Push and create PR
git push origin feature/flight-search
```

### 2. Code Standards
```javascript
// Use TypeScript for type safety
interface FlightSearchParams {
  from: string;
  to: string;
  departDate: string;
  returnDate?: string;
  passengers: number;
}

// Use async/await for promises
const searchFlights = async (params: FlightSearchParams) => {
  try {
    const response = await flightAPI.search(params);
    return response.data;
  } catch (error) {
    logger.error('Flight search failed:', error);
    throw error;
  }
};

// Use proper error handling
const handleError = (error: Error, req: Request, res: Response) => {
  logger.error(error.message, { stack: error.stack });
  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }
  });
};
```

### 3. Database Operations
```javascript
// Use transactions for multi-collection operations
const createBookingWithInventory = async (bookingData) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      // Create booking
      const booking = await Booking.create([bookingData], { session });
      
      // Update inventory
      await Flight.updateOne(
        { _id: bookingData.flightId },
        { $inc: { 'availability.economy': -1 } },
        { session }
      );
      
      return booking[0];
    });
  } finally {
    await session.endSession();
  }
};
```

## 🧪 Testing Strategy

### Unit Tests
```javascript
// services/flight.test.js
describe('Flight Service', () => {
  describe('searchFlights', () => {
    it('should return flights for valid search params', async () => {
      const params = {
        from: 'NYC',
        to: 'LAX',
        departDate: '2024-12-20',
        passengers: 1
      };
      
      const flights = await flightService.search(params);
      
      expect(flights).toBeDefined();
      expect(flights.length).toBeGreaterThan(0);
      expect(flights[0]).toHaveProperty('flightNumber');
    });
  });
});
```

### Integration Tests
```javascript
// tests/integration/booking.test.js
describe('Booking API', () => {
  it('should create booking successfully', async () => {
    const bookingData = {
      userId: testUser._id,
      type: 'flight',
      items: [{ flightId: testFlight._id }]
    };
    
    const response = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send(bookingData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.booking).toBeDefined();
  });
});
```

## 🔍 Debugging

### Logging
```javascript
// Use structured logging
const logger = require('./utils/logger');

logger.info('Flight search initiated', {
  userId: req.user.id,
  searchParams: req.body,
  timestamp: new Date().toISOString()
});

logger.error('Database connection failed', {
  error: error.message,
  stack: error.stack,
  service: 'user-service'
});
```

### Debug Configuration
```javascript
// package.json
{
  "scripts": {
    "debug": "node --inspect-brk=0.0.0.0:9229 server.js",
    "debug:test": "node --inspect-brk jest --runInBand"
  }
}
```

## 📊 Performance Monitoring

### Metrics Collection
```javascript
// Collect performance metrics
const performanceMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    metrics.histogram('http_request_duration', duration, {
      method: req.method,
      route: req.route?.path,
      status_code: res.statusCode
    });
  });
  
  next();
};
```

### Database Monitoring
```javascript
// Monitor database queries
mongoose.set('debug', (collectionName, method, query, doc) => {
  logger.debug('Database query', {
    collection: collectionName,
    method,
    query,
    executionTime: Date.now() - query.startTime
  });
});
```

## 🔐 Security Guidelines

### Input Validation
```javascript
const { body, validationResult } = require('express-validator');

const validateFlightSearch = [
  body('from').isLength({ min: 3, max: 3 }).withMessage('Invalid airport code'),
  body('to').isLength({ min: 3, max: 3 }).withMessage('Invalid airport code'),
  body('departDate').isISO8601().withMessage('Invalid date format'),
  body('passengers').isInt({ min: 1, max: 9 }).withMessage('Invalid passenger count'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];
```

### Authentication Middleware
```javascript
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};
```

## 🚀 Deployment

### Docker Setup
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/travelai
    depends_on:
      - mongo
      - redis
  
  mongo:
    image: mongo:7
    volumes:
      - mongo_data:/data/db
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  mongo_data:
  redis_data:
```

## 📋 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check MongoDB connection
mongosh mongodb://localhost:27017/travelai

# Check Redis connection
redis-cli ping
```

#### Port Conflicts
```bash
# Check what's using port 3000
lsof -i :3000

# Kill process using port
kill -9 <PID>
```

#### Memory Issues
```bash
# Check Node.js memory usage
node --max-old-space-size=4096 server.js

# Monitor memory
npm install -g clinic
clinic doctor -- node server.js
```

### Debug Commands
```bash
# View logs
docker-compose logs -f api

# Access container
docker-compose exec api sh

# Database shell
docker-compose exec mongo mongosh travelai
```

This development guide provides everything needed to start building TravelAI efficiently!