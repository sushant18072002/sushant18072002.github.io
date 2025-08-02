const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer', index: true },
  active: { type: Boolean, default: true, index: true },
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    avatar: String,
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    nationality: String,
    passportNumber: String,
    passportExpiry: Date
  },
  preferences: {
    currency: { type: String, default: 'USD' },
    language: { type: String, default: 'en' },
    timezone: String,
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    travel: {
      seatPreference: { type: String, enum: ['aisle', 'window', 'middle'] },
      mealPreference: String,
      roomType: { type: String, enum: ['single', 'double', 'suite'] },
      smokingPreference: { type: Boolean, default: false }
    }
  },
  status: { type: String, enum: ['pending', 'active', 'suspended', 'blocked'], default: 'pending', index: true },
  emailVerified: { type: Boolean, default: false },
  emailVerifiedAt: Date,
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  verification: {
    token: String,
    expires: Date
  },
  passwordReset: {
    token: String,
    expires: Date
  },
  loyaltyPoints: { type: Number, default: 0 },
  totalBookings: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 }
}, { 
  timestamps: true,
  toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.password; return ret; } },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ active: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.profile?.firstName || ''} ${this.profile?.lastName || ''}`.trim();
});

// Pre-save middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Methods
userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.verification;
  delete obj.passwordReset;
  return obj;
};

// Statics
userSchema.statics.findActive = function(filter = {}) {
  return this.find({ ...filter, active: true });
};

module.exports = mongoose.model('User', userSchema);