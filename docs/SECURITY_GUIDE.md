# Security Guide

## 🔐 Security Overview

Comprehensive security implementation for TravelAI platform covering authentication, authorization, data protection, and security best practices.

## 🛡️ Security Architecture

### Security Layers
```
┌─────────────────────────────────────┐
│ 1. Network Security (WAF, DDoS)    │
├─────────────────────────────────────┤
│ 2. Application Security (Auth)     │
├─────────────────────────────────────┤
│ 3. API Security (Rate Limiting)    │
├─────────────────────────────────────┤
│ 4. Data Security (Encryption)      │
├─────────────────────────────────────┤
│ 5. Infrastructure Security (VPC)   │
└─────────────────────────────────────┘
```

## 🔑 Authentication & Authorization

### JWT Implementation
```javascript
// utils/auth.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class AuthService {
  static generateTokens(user) {
    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role
    };
    
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '15m',
      issuer: 'travelai',
      audience: 'travelai-users'
    });
    
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    
    return { accessToken, refreshToken };
  }
  
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
  
  static async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }
}

module.exports = AuthService;
```

### Authentication Middleware
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: { code: 'NO_TOKEN', message: 'Access token required' }
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' }
      });
    }
    
    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: { code: 'USER_INACTIVE', message: 'User account is inactive' }
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: { code: 'TOKEN_EXPIRED', message: 'Token has expired' }
      });
    }
    
    return res.status(403).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid token' }
    });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }
    
    const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    
    const hasRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        error: { code: 'INSUFFICIENT_PERMISSIONS', message: 'Insufficient permissions' }
      });
    }
    
    next();
  };
};

module.exports = { authenticateToken, requireRole };
```

### Multi-Factor Authentication
```javascript
// services/mfa.js
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

class MFAService {
  static generateSecret(userEmail) {
    return speakeasy.generateSecret({
      name: `TravelAI (${userEmail})`,
      issuer: 'TravelAI',
      length: 32
    });
  }
  
  static async generateQRCode(secret) {
    return await QRCode.toDataURL(secret.otpauth_url);
  }
  
  static verifyToken(token, secret) {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow 2 time steps (60 seconds) tolerance
    });
  }
  
  static async enableMFA(userId, token, secret) {
    const isValid = this.verifyToken(token, secret);
    
    if (!isValid) {
      throw new Error('Invalid MFA token');
    }
    
    await User.findByIdAndUpdate(userId, {
      'security.mfa.enabled': true,
      'security.mfa.secret': secret,
      'security.mfa.backupCodes': this.generateBackupCodes()
    });
    
    return true;
  }
  
  static generateBackupCodes() {
    return Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );
  }
}

module.exports = MFAService;
```

## 🔒 Input Validation & Sanitization

### Validation Middleware
```javascript
// middleware/validation.js
const { body, param, query, validationResult } = require('express-validator');
const xss = require('xss');
const mongoSanitize = require('express-mongo-sanitize');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: errors.array()
      }
    });
  }
  next();
};

const sanitizeInput = (req, res, next) => {
  // Remove any keys that start with '$' or contain '.'
  mongoSanitize.sanitize(req.body);
  mongoSanitize.sanitize(req.query);
  mongoSanitize.sanitize(req.params);
  
  // XSS protection
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    });
  }
  
  next();
};

// Validation rules
const userValidation = {
  register: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least 8 characters with uppercase, lowercase, number and special character'),
    body('firstName')
      .trim()
      .isLength({ min: 1, max: 50 })
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('First name must contain only letters'),
    body('lastName')
      .trim()
      .isLength({ min: 1, max: 50 })
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Last name must contain only letters'),
    handleValidationErrors
  ],
  
  login: [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    handleValidationErrors
  ]
};

const flightValidation = {
  search: [
    query('from')
      .isLength({ min: 3, max: 3 })
      .isAlpha()
      .toUpperCase()
      .withMessage('Valid departure airport code required'),
    query('to')
      .isLength({ min: 3, max: 3 })
      .isAlpha()
      .toUpperCase()
      .withMessage('Valid arrival airport code required'),
    query('departDate')
      .isISO8601()
      .isAfter(new Date().toISOString().split('T')[0])
      .withMessage('Departure date must be in the future'),
    query('passengers')
      .isInt({ min: 1, max: 9 })
      .withMessage('Passengers must be between 1 and 9'),
    handleValidationErrors
  ]
};

module.exports = {
  sanitizeInput,
  userValidation,
  flightValidation,
  handleValidationErrors
};
```

## 🚫 Rate Limiting

### Rate Limiting Implementation
```javascript
// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL);

// General API rate limiting
const generalLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for authentication endpoints
const authLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later'
    }
  }
});

// Search rate limiting
const searchLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 searches per minute
  message: {
    success: false,
    error: {
      code: 'SEARCH_RATE_LIMIT_EXCEEDED',
      message: 'Too many search requests, please slow down'
    }
  }
});

// Booking rate limiting
const bookingLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 bookings per hour
  message: {
    success: false,
    error: {
      code: 'BOOKING_RATE_LIMIT_EXCEEDED',
      message: 'Too many booking attempts, please try again later'
    }
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  searchLimiter,
  bookingLimiter
};
```

## 🔐 Data Encryption

### Encryption Service
```javascript
// services/encryption.js
const crypto = require('crypto');

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.secretKey = process.env.ENCRYPTION_KEY; // 32 bytes key
  }
  
  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.secretKey);
    cipher.setAAD(Buffer.from('TravelAI', 'utf8'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }
  
  decrypt(encryptedData) {
    const decipher = crypto.createDecipher(this.algorithm, this.secretKey);
    decipher.setAAD(Buffer.from('TravelAI', 'utf8'));
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  hashSensitiveData(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

module.exports = new EncryptionService();
```

### PII Data Protection
```javascript
// models/User.js
const mongoose = require('mongoose');
const EncryptionService = require('../services/encryption');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  profile: {
    firstName: {
      type: String,
      required: true,
      set: function(value) {
        // Encrypt PII data
        return EncryptionService.encrypt(value);
      },
      get: function(value) {
        // Decrypt when retrieving
        return value ? EncryptionService.decrypt(value) : value;
      }
    },
    lastName: {
      type: String,
      required: true,
      set: function(value) {
        return EncryptionService.encrypt(value);
      },
      get: function(value) {
        return value ? EncryptionService.decrypt(value) : value;
      }
    },
    phone: {
      type: String,
      set: function(value) {
        return value ? EncryptionService.encrypt(value) : value;
      },
      get: function(value) {
        return value ? EncryptionService.decrypt(value) : value;
      }
    }
  },
  // Store hashed version for search purposes
  searchableFields: {
    emailHash: {
      type: String,
      index: true
    },
    phoneHash: String
  }
});

// Hash searchable fields before saving
userSchema.pre('save', function(next) {
  if (this.isModified('email')) {
    this.searchableFields.emailHash = EncryptionService.hashSensitiveData(this.email);
  }
  if (this.isModified('profile.phone') && this.profile.phone) {
    this.searchableFields.phoneHash = EncryptionService.hashSensitiveData(this.profile.phone);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
```

## 🛡️ Security Headers

### Security Middleware
```javascript
// middleware/security.js
const helmet = require('helmet');
const cors = require('cors');

const securityMiddleware = (app) => {
  // Helmet for security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "https://api.travelai.com"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));
  
  // CORS configuration
  app.use(cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        'https://travelai.com',
        'https://www.travelai.com',
        'https://app.travelai.com'
      ];
      
      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  
  // Additional security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
  });
};

module.exports = securityMiddleware;
```

## 🔍 Security Monitoring

### Security Event Logging
```javascript
// services/securityLogger.js
const winston = require('winston');

const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'security' },
  transports: [
    new winston.transports.File({ filename: 'logs/security.log' }),
    new winston.transports.Console()
  ]
});

class SecurityMonitor {
  static logAuthAttempt(req, success, userId = null) {
    securityLogger.info('Authentication attempt', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      success,
      userId,
      timestamp: new Date().toISOString()
    });
  }
  
  static logSuspiciousActivity(req, activity, details = {}) {
    securityLogger.warn('Suspicious activity detected', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      activity,
      details,
      timestamp: new Date().toISOString()
    });
  }
  
  static logSecurityEvent(event, details = {}) {
    securityLogger.error('Security event', {
      event,
      details,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = SecurityMonitor;
```

### Intrusion Detection
```javascript
// middleware/intrusionDetection.js
const SecurityMonitor = require('../services/securityLogger');

const suspiciousPatterns = [
  /(\<script\>|\<\/script\>)/gi,
  /(union.*select|select.*from|insert.*into|delete.*from)/gi,
  /(\.\.\/|\.\.\\)/g,
  /(<|>|'|"|;|\||&|\$)/g
];

const intrusionDetection = (req, res, next) => {
  const checkForSuspiciousContent = (obj, path = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof value === 'string') {
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(value)) {
            SecurityMonitor.logSuspiciousActivity(req, 'Suspicious input detected', {
              field: currentPath,
              value: value.substring(0, 100), // Log first 100 chars
              pattern: pattern.toString()
            });
            
            return res.status(400).json({
              success: false,
              error: {
                code: 'SUSPICIOUS_INPUT',
                message: 'Request contains suspicious content'
              }
            });
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        const result = checkForSuspiciousContent(value, currentPath);
        if (result) return result;
      }
    }
  };
  
  // Check request body
  if (req.body) {
    const result = checkForSuspiciousContent(req.body);
    if (result) return result;
  }
  
  // Check query parameters
  if (req.query) {
    const result = checkForSuspiciousContent(req.query);
    if (result) return result;
  }
  
  next();
};

module.exports = intrusionDetection;
```

## 🔐 Payment Security

### PCI DSS Compliance
```javascript
// services/paymentSecurity.js
const crypto = require('crypto');

class PaymentSecurity {
  static tokenizeCard(cardNumber) {
    // Generate a random token
    const token = crypto.randomBytes(16).toString('hex');
    
    // Store mapping in secure vault (not in main database)
    // This would typically be handled by a PCI-compliant service
    return {
      token,
      lastFour: cardNumber.slice(-4),
      type: this.getCardType(cardNumber)
    };
  }
  
  static getCardType(cardNumber) {
    const patterns = {
      visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
      mastercard: /^5[1-5][0-9]{14}$/,
      amex: /^3[47][0-9]{13}$/,
      discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/
    };
    
    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(cardNumber)) {
        return type;
      }
    }
    
    return 'unknown';
  }
  
  static validateCardNumber(cardNumber) {
    // Luhn algorithm
    const digits = cardNumber.replace(/\D/g, '');
    let sum = 0;
    let isEven = false;
    
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }
  
  static maskCardNumber(cardNumber) {
    return cardNumber.replace(/\d(?=\d{4})/g, '*');
  }
}

module.exports = PaymentSecurity;
```

## 🚨 Incident Response

### Security Incident Handler
```javascript
// services/incidentResponse.js
const SecurityMonitor = require('./securityLogger');

class IncidentResponse {
  static async handleSecurityIncident(incident) {
    const severity = this.assessSeverity(incident);
    
    // Log the incident
    SecurityMonitor.logSecurityEvent('Security incident', {
      type: incident.type,
      severity,
      details: incident.details
    });
    
    // Take immediate action based on severity
    switch (severity) {
      case 'critical':
        await this.handleCriticalIncident(incident);
        break;
      case 'high':
        await this.handleHighSeverityIncident(incident);
        break;
      case 'medium':
        await this.handleMediumSeverityIncident(incident);
        break;
      default:
        await this.handleLowSeverityIncident(incident);
    }
  }
  
  static assessSeverity(incident) {
    const criticalTypes = ['data_breach', 'system_compromise', 'payment_fraud'];
    const highTypes = ['brute_force_attack', 'sql_injection', 'xss_attack'];
    const mediumTypes = ['suspicious_login', 'rate_limit_exceeded'];
    
    if (criticalTypes.includes(incident.type)) return 'critical';
    if (highTypes.includes(incident.type)) return 'high';
    if (mediumTypes.includes(incident.type)) return 'medium';
    return 'low';
  }
  
  static async handleCriticalIncident(incident) {
    // Immediate actions for critical incidents
    // 1. Alert security team
    // 2. Consider system lockdown
    // 3. Preserve evidence
    // 4. Notify stakeholders
    
    console.log('CRITICAL SECURITY INCIDENT - Immediate action required');
    // Implementation would include actual alerting mechanisms
  }
}

module.exports = IncidentResponse;
```

## 📋 Security Checklist

### Pre-deployment Security Checklist
- [ ] All sensitive data encrypted at rest
- [ ] HTTPS enforced for all communications
- [ ] JWT tokens properly configured with expiration
- [ ] Rate limiting implemented on all endpoints
- [ ] Input validation and sanitization in place
- [ ] SQL injection protection enabled
- [ ] XSS protection implemented
- [ ] CSRF protection configured
- [ ] Security headers properly set
- [ ] Authentication and authorization tested
- [ ] PII data properly protected
- [ ] Payment data tokenized
- [ ] Security logging implemented
- [ ] Intrusion detection active
- [ ] Incident response plan ready
- [ ] Security monitoring configured
- [ ] Vulnerability scanning completed
- [ ] Penetration testing performed
- [ ] Security documentation updated
- [ ] Team security training completed

This comprehensive security guide ensures TravelAI platform maintains the highest security standards!