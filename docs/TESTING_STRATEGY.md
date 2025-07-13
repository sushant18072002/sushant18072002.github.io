# Testing Strategy

## 🧪 Testing Overview

Comprehensive testing strategy for TravelAI platform covering unit tests, integration tests, end-to-end tests, and performance testing.

## 📊 Testing Pyramid

```
    /\     E2E Tests (10%)
   /  \    - User workflows
  /____\   - Critical paths
 /      \  
/________\  Integration Tests (30%)
           - API endpoints
           - Database operations
           - Service communication

Unit Tests (60%)
- Functions
- Components  
- Business logic
```

## 🔧 Testing Tools

### Backend Testing
- **Jest**: JavaScript testing framework
- **Supertest**: HTTP assertion library
- **MongoDB Memory Server**: In-memory database for tests
- **Sinon**: Mocking and stubbing
- **Artillery**: Load testing

### Frontend Testing
- **Jest**: Unit testing
- **React Testing Library**: Component testing
- **Cypress**: End-to-end testing
- **MSW**: API mocking
- **Storybook**: Component documentation

## 📝 Unit Tests

### Backend Unit Tests

#### Service Layer Tests
```javascript
// services/__tests__/flight.service.test.js
const FlightService = require('../flight.service');
const Flight = require('../../models/Flight');

jest.mock('../../models/Flight');

describe('FlightService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchFlights', () => {
    it('should return flights matching search criteria', async () => {
      // Arrange
      const searchParams = {
        from: 'NYC',
        to: 'LAX',
        departDate: '2024-12-20',
        passengers: 1
      };
      
      const mockFlights = [
        {
          _id: 'flight1',
          flightNumber: 'AA123',
          route: {
            departure: { airport: { code: 'NYC' } },
            arrival: { airport: { code: 'LAX' } }
          }
        }
      ];
      
      Flight.find.mockResolvedValue(mockFlights);
      
      // Act
      const result = await FlightService.searchFlights(searchParams);
      
      // Assert
      expect(Flight.find).toHaveBeenCalledWith({
        'route.departure.airport.code': 'NYC',
        'route.arrival.airport.code': 'LAX',
        'route.departure.scheduledTime': {
          $gte: new Date('2024-12-20T00:00:00Z'),
          $lt: new Date('2024-12-21T00:00:00Z')
        }
      });
      expect(result).toEqual(mockFlights);
    });

    it('should throw error for invalid search params', async () => {
      // Arrange
      const invalidParams = {
        from: '',
        to: 'LAX'
      };
      
      // Act & Assert
      await expect(FlightService.searchFlights(invalidParams))
        .rejects.toThrow('Invalid search parameters');
    });
  });

  describe('calculatePrice', () => {
    it('should calculate correct price with taxes', () => {
      // Arrange
      const basePrice = 500;
      const taxRate = 0.15;
      
      // Act
      const totalPrice = FlightService.calculatePrice(basePrice, taxRate);
      
      // Assert
      expect(totalPrice).toBe(575);
    });
  });
});
```

#### Utility Function Tests
```javascript
// utils/__tests__/date.utils.test.js
const { formatDate, isValidDate, addDays } = require('../date.utils');

describe('Date Utils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-12-20T10:30:00Z');
      const formatted = formatDate(date, 'YYYY-MM-DD');
      expect(formatted).toBe('2024-12-20');
    });
  });

  describe('isValidDate', () => {
    it('should return true for valid date', () => {
      expect(isValidDate('2024-12-20')).toBe(true);
    });

    it('should return false for invalid date', () => {
      expect(isValidDate('invalid-date')).toBe(false);
    });
  });

  describe('addDays', () => {
    it('should add days correctly', () => {
      const date = new Date('2024-12-20');
      const newDate = addDays(date, 5);
      expect(newDate.getDate()).toBe(25);
    });
  });
});
```

### Frontend Unit Tests

#### Component Tests
```javascript
// components/__tests__/FlightCard.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import FlightCard from '../FlightCard';

const mockFlight = {
  id: 'flight1',
  flightNumber: 'AA123',
  airline: { name: 'American Airlines' },
  route: {
    departure: { airport: { code: 'NYC' }, scheduledTime: '2024-12-20T10:00:00Z' },
    arrival: { airport: { code: 'LAX' }, scheduledTime: '2024-12-20T15:00:00Z' }
  },
  pricing: { economy: { totalPrice: 500 } }
};

describe('FlightCard', () => {
  it('should render flight information correctly', () => {
    render(<FlightCard flight={mockFlight} />);
    
    expect(screen.getByText('AA123')).toBeInTheDocument();
    expect(screen.getByText('American Airlines')).toBeInTheDocument();
    expect(screen.getByText('NYC')).toBeInTheDocument();
    expect(screen.getByText('LAX')).toBeInTheDocument();
    expect(screen.getByText('$500')).toBeInTheDocument();
  });

  it('should call onSelect when clicked', () => {
    const mockOnSelect = jest.fn();
    render(<FlightCard flight={mockFlight} onSelect={mockOnSelect} />);
    
    fireEvent.click(screen.getByRole('button', { name: /select flight/i }));
    
    expect(mockOnSelect).toHaveBeenCalledWith(mockFlight);
  });
});
```

#### Hook Tests
```javascript
// hooks/__tests__/useFlightSearch.test.js
import { renderHook, act } from '@testing-library/react';
import { useFlightSearch } from '../useFlightSearch';
import * as flightAPI from '../../services/flightAPI';

jest.mock('../../services/flightAPI');

describe('useFlightSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should search flights successfully', async () => {
    // Arrange
    const mockFlights = [{ id: 'flight1', flightNumber: 'AA123' }];
    flightAPI.searchFlights.mockResolvedValue({ data: mockFlights });
    
    const { result } = renderHook(() => useFlightSearch());
    
    // Act
    await act(async () => {
      await result.current.searchFlights({
        from: 'NYC',
        to: 'LAX',
        departDate: '2024-12-20'
      });
    });
    
    // Assert
    expect(result.current.flights).toEqual(mockFlights);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle search error', async () => {
    // Arrange
    const mockError = new Error('Search failed');
    flightAPI.searchFlights.mockRejectedValue(mockError);
    
    const { result } = renderHook(() => useFlightSearch());
    
    // Act
    await act(async () => {
      await result.current.searchFlights({
        from: 'NYC',
        to: 'LAX'
      });
    });
    
    // Assert
    expect(result.current.flights).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(mockError.message);
  });
});
```

## 🔗 Integration Tests

### API Integration Tests
```javascript
// tests/integration/flights.test.js
const request = require('supertest');
const app = require('../../app');
const { setupTestDB, cleanupTestDB } = require('../helpers/db');

describe('Flights API', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await cleanupTestDB();
  });

  describe('GET /api/v1/flights/search', () => {
    it('should return flights for valid search', async () => {
      // Arrange
      const searchParams = {
        from: 'NYC',
        to: 'LAX',
        departDate: '2024-12-20',
        passengers: 1
      };
      
      // Act
      const response = await request(app)
        .get('/api/v1/flights/search')
        .query(searchParams)
        .expect(200);
      
      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.flights).toBeDefined();
      expect(Array.isArray(response.body.data.flights)).toBe(true);
    });

    it('should return 400 for invalid search params', async () => {
      const response = await request(app)
        .get('/api/v1/flights/search')
        .query({ from: 'NYC' }) // Missing required params
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/v1/bookings', () => {
    it('should create booking successfully', async () => {
      // Arrange
      const bookingData = {
        type: 'flight',
        items: [{
          flightId: 'test-flight-id',
          passengers: [{
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: '1990-01-01'
          }]
        }]
      };
      
      // Act
      const response = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', 'Bearer valid-jwt-token')
        .send(bookingData)
        .expect(201);
      
      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.booking).toBeDefined();
      expect(response.body.data.booking.status).toBe('pending');
    });
  });
});
```

### Database Integration Tests
```javascript
// tests/integration/database.test.js
const mongoose = require('mongoose');
const User = require('../../models/User');
const Booking = require('../../models/Booking');

describe('Database Operations', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_MONGODB_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Booking.deleteMany({});
  });

  describe('User-Booking Relationship', () => {
    it('should create user and booking with proper relationship', async () => {
      // Create user
      const user = await User.create({
        email: 'test@example.com',
        password: 'hashedpassword',
        profile: { firstName: 'John', lastName: 'Doe' }
      });

      // Create booking
      const booking = await Booking.create({
        userId: user._id,
        type: 'flight',
        status: 'confirmed',
        pricing: { total: 500, currency: 'USD' }
      });

      // Verify relationship
      const userWithBookings = await User.findById(user._id);
      const userBookings = await Booking.find({ userId: user._id });

      expect(userWithBookings).toBeDefined();
      expect(userBookings).toHaveLength(1);
      expect(userBookings[0].userId.toString()).toBe(user._id.toString());
    });
  });
});
```

## 🌐 End-to-End Tests

### Cypress E2E Tests
```javascript
// cypress/e2e/flight-booking.cy.js
describe('Flight Booking Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should complete flight booking successfully', () => {
    // Search for flights
    cy.get('[data-testid="flight-search-form"]').within(() => {
      cy.get('input[name="from"]').type('NYC');
      cy.get('input[name="to"]').type('LAX');
      cy.get('input[name="departDate"]').type('2024-12-20');
      cy.get('select[name="passengers"]').select('1');
      cy.get('button[type="submit"]').click();
    });

    // Wait for search results
    cy.get('[data-testid="flight-results"]').should('be.visible');
    cy.get('[data-testid="flight-card"]').should('have.length.greaterThan', 0);

    // Select first flight
    cy.get('[data-testid="flight-card"]').first().within(() => {
      cy.get('button').contains('Select').click();
    });

    // Fill passenger details
    cy.get('[data-testid="passenger-form"]').within(() => {
      cy.get('input[name="firstName"]').type('John');
      cy.get('input[name="lastName"]').type('Doe');
      cy.get('input[name="dateOfBirth"]').type('1990-01-01');
      cy.get('button').contains('Continue').click();
    });

    // Complete payment
    cy.get('[data-testid="payment-form"]').within(() => {
      cy.get('input[name="cardNumber"]').type('4242424242424242');
      cy.get('input[name="expiryDate"]').type('12/25');
      cy.get('input[name="cvv"]').type('123');
      cy.get('button').contains('Pay Now').click();
    });

    // Verify booking confirmation
    cy.get('[data-testid="booking-confirmation"]').should('be.visible');
    cy.get('[data-testid="booking-reference"]').should('contain', 'TRV-');
  });

  it('should handle search with no results', () => {
    cy.get('[data-testid="flight-search-form"]').within(() => {
      cy.get('input[name="from"]').type('XXX'); // Invalid airport
      cy.get('input[name="to"]').type('YYY');   // Invalid airport
      cy.get('input[name="departDate"]').type('2024-12-20');
      cy.get('button[type="submit"]').click();
    });

    cy.get('[data-testid="no-results"]').should('be.visible');
    cy.get('[data-testid="no-results"]').should('contain', 'No flights found');
  });
});
```

### User Journey Tests
```javascript
// cypress/e2e/user-journey.cy.js
describe('Complete User Journey', () => {
  it('should complete full user journey from registration to booking', () => {
    // Registration
    cy.visit('/auth');
    cy.get('[data-testid="register-tab"]').click();
    cy.get('input[name="email"]').type('newuser@example.com');
    cy.get('input[name="password"]').type('SecurePass123!');
    cy.get('input[name="firstName"]').type('Jane');
    cy.get('input[name="lastName"]').type('Smith');
    cy.get('button[type="submit"]').click();

    // Email verification (mock)
    cy.visit('/verify-email?token=mock-token');
    cy.get('[data-testid="verification-success"]').should('be.visible');

    // Profile setup
    cy.get('[data-testid="profile-setup"]').within(() => {
      cy.get('select[name="currency"]').select('USD');
      cy.get('select[name="language"]').select('English');
      cy.get('button').contains('Save Preferences').click();
    });

    // First search and booking
    cy.get('[data-testid="hero-search"]').within(() => {
      cy.get('input[name="dreamTrip"]').type('Romantic getaway in Paris');
      cy.get('select[name="duration"]').select('1 week');
      cy.get('select[name="budget"]').select('Mid-range');
      cy.get('button').contains('Create My Dream Trip').click();
    });

    // AI itinerary generation
    cy.get('[data-testid="ai-itinerary"]').should('be.visible');
    cy.get('[data-testid="itinerary-day"]').should('have.length.greaterThan', 0);
    cy.get('button').contains('Book This Trip').click();

    // Booking completion
    cy.get('[data-testid="booking-summary"]').should('be.visible');
    cy.get('button').contains('Confirm Booking').click();

    // Success
    cy.get('[data-testid="booking-success"]').should('be.visible');
    cy.url().should('include', '/booking-confirmation');
  });
});
```

## ⚡ Performance Tests

### Load Testing with Artillery
```yaml
# artillery/load-test.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Ramp up load"
    - duration: 300
      arrivalRate: 100
      name: "Sustained load"

scenarios:
  - name: "Flight Search"
    weight: 60
    flow:
      - get:
          url: "/api/v1/flights/search"
          qs:
            from: "NYC"
            to: "LAX"
            departDate: "2024-12-20"
            passengers: 1
      - think: 2

  - name: "Hotel Search"
    weight: 30
    flow:
      - get:
          url: "/api/v1/hotels/search"
          qs:
            location: "Paris"
            checkIn: "2024-12-20"
            checkOut: "2024-12-25"
            guests: 2
      - think: 3

  - name: "User Registration"
    weight: 10
    flow:
      - post:
          url: "/api/v1/auth/register"
          json:
            email: "test{{ $randomString() }}@example.com"
            password: "SecurePass123!"
            firstName: "Test"
            lastName: "User"
```

### Database Performance Tests
```javascript
// tests/performance/database.test.js
const mongoose = require('mongoose');
const Flight = require('../../models/Flight');

describe('Database Performance', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_MONGODB_URI);
    
    // Create test data
    const flights = Array.from({ length: 10000 }, (_, i) => ({
      flightNumber: `FL${i}`,
      airline: { code: 'AA', name: 'American Airlines' },
      route: {
        departure: { airport: { code: 'NYC' } },
        arrival: { airport: { code: 'LAX' } }
      }
    }));
    
    await Flight.insertMany(flights);
  });

  it('should search flights within acceptable time', async () => {
    const startTime = Date.now();
    
    const flights = await Flight.find({
      'route.departure.airport.code': 'NYC',
      'route.arrival.airport.code': 'LAX'
    }).limit(20);
    
    const duration = Date.now() - startTime;
    
    expect(flights).toHaveLength(20);
    expect(duration).toBeLessThan(100); // Should complete within 100ms
  });

  it('should handle concurrent searches efficiently', async () => {
    const searches = Array.from({ length: 50 }, () =>
      Flight.find({
        'route.departure.airport.code': 'NYC'
      }).limit(10)
    );
    
    const startTime = Date.now();
    const results = await Promise.all(searches);
    const duration = Date.now() - startTime;
    
    expect(results).toHaveLength(50);
    expect(duration).toBeLessThan(1000); // All searches within 1 second
  });
});
```

## 📊 Test Coverage

### Coverage Configuration
```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/index.js',
    '!src/setupTests.js'
  ]
};
```

### Coverage Targets
- **Unit Tests**: 90% coverage
- **Integration Tests**: 80% coverage
- **E2E Tests**: Critical user paths
- **Performance Tests**: Key endpoints under load

## 🚀 CI/CD Integration

### GitHub Actions Test Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:7
        ports:
          - 27017:27017
      redis:
        image: redis:7
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
        
      - name: Run integration tests
        run: npm run test:integration
        env:
          TEST_MONGODB_URI: mongodb://localhost:27017/test
          REDIS_URL: redis://localhost:6379
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

This comprehensive testing strategy ensures high-quality, reliable code for the TravelAI platform!