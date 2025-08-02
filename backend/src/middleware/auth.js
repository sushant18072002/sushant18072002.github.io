const jwt = require('jsonwebtoken');
const { User, Session } = require('../models');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: { message: 'Access denied. No token provided.' } 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if session is valid
    const session = await Session.findOne({ 
      token, 
      userId: decoded.id, 
      isActive: true,
      expiresAt: { $gt: new Date() }
    });
    
    if (!session) {
      return res.status(401).json({ 
        success: false, 
        error: { message: 'Session expired or invalid.' } 
      });
    }

    const user = await User.findById(decoded.id).select('-password');
    
    if (!user || user.status !== 'active') {
      return res.status(401).json({ 
        success: false, 
        error: { message: 'User not found or inactive.' } 
      });
    }

    req.user = user;
    req.session = session;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        error: { message: 'Token expired.' } 
      });
    }
    res.status(401).json({ 
      success: false, 
      error: { message: 'Invalid token.' } 
    });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      error: { message: 'Access denied. Admin privileges required.' } 
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.status === 'active') {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

module.exports = { auth, admin, optionalAuth };