const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, Session } = require('../models');
const { success, error } = require('../utils/response');
const emailService = require('../services/emailService');

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
      return error(res, 'User already exists', 400);
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    console.log('🔑 Generated verification token:', verificationToken);
    
    const user = await User.create({
      email,
      password,
      profile: { firstName, lastName, phone },
      verification: {
        token: verificationToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });

    console.log('✅ User created with ID:', user._id);
    console.log('🔍 Verification data saved:', JSON.stringify(user.verification, null, 2));

    await emailService.sendVerificationEmail(user.email, verificationToken);
    
    return success(res, {
      message: 'Registration successful. Please verify your email.',
      verificationToken: verificationToken,
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile,
        status: user.status
      }
    }, 'User registered successfully', 201);
  } catch (err) {
    console.error('❌ Registration error:', err);
    return error(res, err.message, 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password, rememberMe = false } = req.body;
    
    const user = await User.findOne({ email, active: true });
    if (!user || !(await user.comparePassword(password))) {
      return error(res, 'Invalid credentials', 401);
    }

    if (user.status === 'suspended') {
      return error(res, 'Account suspended', 401);
    }

    if (user.status === 'pending') {
      return error(res, 'Please verify your email first', 401);
    }

    const { token, refreshToken } = generateTokens(user._id);
    
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

    user.lastLogin = new Date();
    await user.save();
    
    return success(res, {
      user: user.toSafeObject(),
      token,
      refreshToken
    }, 'Login successful');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const logout = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      await Session.findOneAndUpdate({ token }, { isActive: false });
    }
    
    return success(res, null, 'Logged out successfully');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken: oldRefreshToken } = req.body;
    
    if (!oldRefreshToken) {
      return error(res, 'Refresh token required', 401);
    }

    const decoded = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET);
    const session = await Session.findOne({ 
      refreshToken: oldRefreshToken, 
      userId: decoded.id, 
      isActive: true 
    });

    if (!session || session.expiresAt < new Date()) {
      return error(res, 'Invalid refresh token', 401);
    }

    const { token, refreshToken: newRefreshToken } = generateTokens(decoded.id);
    
    session.token = token;
    session.refreshToken = newRefreshToken;
    await session.save();
    
    return success(res, { token, refreshToken: newRefreshToken }, 'Token refreshed');
  } catch (err) {
    return error(res, 'Invalid refresh token', 401);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email, active: true });
    if (!user) {
      return success(res, null, 'If email exists, reset link has been sent');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordReset = {
      token: resetToken,
      expires: new Date(Date.now() + 60 * 60 * 1000)
    };
    await user.save();

    await emailService.sendPasswordResetEmail(user.email, resetToken);
    
    return success(res, null, 'If email exists, reset link has been sent');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    const user = await User.findOne({
      'passwordReset.token': token,
      'passwordReset.expires': { $gt: new Date() },
      active: true
    });

    if (!user) {
      return error(res, 'Invalid or expired reset token', 400);
    }

    user.password = password;
    user.passwordReset = undefined;
    await user.save();

    await Session.updateMany({ userId: user._id }, { isActive: false });
    
    return success(res, null, 'Password reset successful');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

/*
const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('✅ User email :', email );

    console.log('✅ User password :', password );
    
    const user = await User.findOne({ email, active: true });

    console.log('✅ User with ID:', user);

    if (!user) {
      return error(res, 'Invalid or expired reset token', 400);
    }

    user.password = password;
    user.passwordReset = undefined;
    await user.save();

    //await Session.updateMany({ userId: user._id }, { isActive: false });
    
    return success(res, null, 'Password reset successful');
  } catch (err) {
    return error(res, err.message, 500);
  }
};
*/
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    console.log('🔍 Verifying token:', token);
    
    const user = await User.findOne({
      'verification.token': token,
      'verification.expires': { $gt: new Date() },
      active: true
    });

    console.log('👤 User found:', user ? 'YES' : 'NO');
    
    if (!user) {
      // Debug: Check if token exists but expired
      const expiredUser = await User.findOne({ 'verification.token': token });
      if (expiredUser) {
        console.log('⚠️ Token expired. Expires:', expiredUser.verification.expires, 'Current:', new Date());
      } else {
        console.log('❌ Token not found in database');
      }
      return error(res, 'Invalid or expired verification token', 400);
    }

    console.log('✅ Verifying user:', user.email);
    user.status = 'active';
    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    user.verification = undefined;
    await user.save();
    
    console.log('✨ Email verified successfully for:', user.email);
    return success(res, null, 'Email verified successfully');
  } catch (err) {
    console.error('❌ Verification error:', err);
    return error(res, err.message, 500);
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail
};