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
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    const { User } = require('../models');
    const crypto = require('crypto');
    const emailService = require('../services/emailService');
    
    const user = await User.findOne({ email, active: true });
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }
    
    if (user.emailVerified) {
      return res.status(400).json({ success: false, error: { message: 'Email already verified' } });
    }
    
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verification = {
      token: verificationToken,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };
    await user.save();
    
    await emailService.sendVerificationEmail(user.email, verificationToken);
    
    res.json({ success: true, data: { message: 'Verification email sent' } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

module.exports = router;