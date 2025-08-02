const express = require('express');
const { register, login, getProfile, updateProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { userValidation } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', userValidation.register, register);
router.post('/login', userValidation.login, login);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.patch('/profile', authenticate, updateProfile);

module.exports = router;