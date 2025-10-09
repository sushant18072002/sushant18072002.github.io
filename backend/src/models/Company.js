const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  // Company identification
  name: { type: String, required: true, trim: true },
  legalName: String,
  registrationNumber: String,
  taxId: String,
  
  // Contact information
  contact: {
    email: { type: String, required: true },
    phone: String,
    website: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    }
  },

  // Corporate settings
  settings: {
    currency: { type: String, default: 'USD' },
    timezone: String,
    fiscalYearStart: { type: String, default: 'January' },
    
    // Travel policy
    travelPolicy: {
      requireApproval: { type: Boolean, default: true },
      approvalLimits: [{
        role: String,
        maxAmount: Number,
        currency: String
      }],
      allowedBookingWindow: { type: Number, default: 30 }, // days in advance
      cancellationPolicy: String,
      preferredVendors: [String]
    },

    // Budget controls
    budgetControls: {
      enabled: { type: Boolean, default: true },
      departmentBudgets: [{
        department: String,
        annualBudget: Number,
        spentAmount: { type: Number, default: 0 },
        currency: String
      }]
    }
  },

  // Subscription and billing
  subscription: {
    plan: { type: String, enum: ['basic', 'premium', 'enterprise'], default: 'basic' },
    status: { type: String, enum: ['active', 'suspended', 'cancelled'], default: 'active' },
    billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
    nextBillingDate: Date,
    features: [String]
  },

  // Corporate rates and discounts
  corporateRates: [{
    vendor: String,
    category: { type: String, enum: ['flight', 'hotel', 'car', 'package'] },
    discountType: { type: String, enum: ['percentage', 'fixed'] },
    discountValue: Number,
    validFrom: Date,
    validTo: Date,
    conditions: String
  }],

  // Company statistics
  stats: {
    totalEmployees: { type: Number, default: 0 },
    activeBookings: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    totalSavings: { type: Number, default: 0 }
  },

  // Admin users
  admins: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['super-admin', 'admin', 'manager'], default: 'admin' },
    permissions: [String],
    addedAt: { type: Date, default: Date.now }
  }],

  status: { type: String, enum: ['active', 'suspended', 'pending'], default: 'pending' },
  
  // System fields
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
companySchema.index({ name: 1 });
companySchema.index({ status: 1 });
companySchema.index({ 'contact.email': 1 });

// Methods
companySchema.methods.addEmployee = function(userId, department, role) {
  this.stats.totalEmployees += 1;
  return this.save();
};

companySchema.methods.updateBudgetSpent = function(department, amount) {
  const deptBudget = this.settings.budgetControls.departmentBudgets.find(b => b.department === department);
  if (deptBudget) {
    deptBudget.spentAmount += amount;
  }
  this.stats.totalSpent += amount;
  return this.save();
};

module.exports = mongoose.model('Company', companySchema);