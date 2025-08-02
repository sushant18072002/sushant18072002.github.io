const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, Session, EmailTemplate } = require('../models');
const emailService = require('../services/emailService');
const auditService = require('../services/auditService');

const generateTokens = (userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { token, refreshToken };
};

const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: { message: 'User already exists' } });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({
      email,
      password,
      profile: { firstName, lastName, phone },
      verification: {
        token: verificationToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      },
      status: 'pending_verification'
    });

    // Send verification email
    await emailService.sendVerificationEmail(user.email, verificationToken);
    
    // Log registration
    await auditService.log({
      userId: user._id,
      action: 'USER_REGISTER',
      resource: 'user',
      resourceId: user._id.toString(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.status(201).json({
      success: true,
      data: {
        message: 'Registration successful. Please check your email to verify your account.',
        user: {
          id: user._id,
          email: user.email,
          profile: user.profile,
          status: user.status
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, rememberMe = false } = req.body;
    
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, error: { message: 'Invalid credentials' } });
    }

    if (user.status === 'suspended') {
      return res.status(401).json({ success: false, error: { message: 'Account suspended' } });
    }

    if (user.status === 'pending_verification') {
      return res.status(401).json({ success: false, error: { message: 'Please verify your email first' } });
    }

    const { token, refreshToken } = generateTokens(user._id);
    
    // Create session
    const expiresAt = new Date(Date.now() + (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000);
    await Session.create({
      userId: user._id,
      token,
      refreshToken,
      deviceInfo: {
        userAgent: req.get('User-Agent'),
        ip: req.ip
      },
      expiresAt
    });

    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Log login
    await auditService.log({
      userId: user._id,
      action: 'USER_LOGIN',
      resource: 'user',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          profile: user.profile,
          role: user.role,
          preferences: user.preferences
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      await Session.findOneAndUpdate(
        { token },
        { isActive: false },
        { new: true }
      );
    }
    
    // Log logout
    await auditService.log({
      userId: req.user?.id,
      action: 'USER_LOGOUT',
      resource: 'user',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({ success: true, data: { message: 'Logged out successfully' } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken: oldRefreshToken } = req.body;
    
    if (!oldRefreshToken) {
      return res.status(401).json({ success: false, error: { message: 'Refresh token required' } });
    }

    const decoded = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET);
    const session = await Session.findOne({ 
      refreshToken: oldRefreshToken, 
      userId: decoded.id, 
      isActive: true 
    });

    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ success: false, error: { message: 'Invalid refresh token' } });
    }

    const { token, refreshToken: newRefreshToken } = generateTokens(decoded.id);
    
    // Update session
    session.token = token;
    session.refreshToken = newRefreshToken;
    await session.save();
    
    res.json({
      success: true,
      data: {
        token,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    res.status(401).json({ success: false, error: { message: 'Invalid refresh token' } });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists
      return res.json({ success: true, data: { message: 'If email exists, reset link has been sent' } });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordReset = {
      token: resetToken,
      expires: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    };
    await user.save();

    // Send reset email
    await emailService.sendPasswordResetEmail(user.email, resetToken);
    
    // Log password reset request
    await auditService.log({
      userId: user._id,
      action: 'PASSWORD_RESET_REQUEST',
      resource: 'user',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({ success: true, data: { message: 'If email exists, reset link has been sent' } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    const user = await User.findOne({
      'passwordReset.token': token,
      'passwordReset.expires': { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ success: false, error: { message: 'Invalid or expired reset token' } });
    }

    user.password = password;
    user.passwordReset = undefined;
    await user.save();

    // Invalidate all sessions
    await Session.updateMany(
      { userId: user._id },
      { isActive: false }
    );
    
    // Log password reset
    await auditService.log({
      userId: user._id,
      action: 'PASSWORD_RESET_COMPLETE',
      resource: 'user',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({ success: true, data: { message: 'Password reset successful' } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    
    const user = await User.findOne({
      'verification.token': token,
      'verification.expires': { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ success: false, error: { message: 'Invalid or expired verification token' } });
    }

    user.status = 'active';
    user.verification = undefined;
    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    await user.save();
    
    // Log email verification
    await auditService.log({
      userId: user._id,
      action: 'EMAIL_VERIFIED',
      resource: 'user',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({ success: true, data: { message: 'Email verified successfully' } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email, status: 'pending_verification' });
    if (!user) {
      return res.status(400).json({ success: false, error: { message: 'User not found or already verified' } });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verification = {
      token: verificationToken,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };
    await user.save();

    // Send verification email
    await emailService.sendVerificationEmail(user.email, verificationToken);
    
    res.json({ success: true, data: { message: 'Verification email sent' } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification
};