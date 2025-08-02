const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validation');
const {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail
} = require('../controllers/authControllerFixed');

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-email', verifyEmail);

module.exports = router;