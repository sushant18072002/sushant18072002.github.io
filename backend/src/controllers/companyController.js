const { Company, User, CorporateBooking } = require('../models');
const auditService = require('../services/auditService');

// Create company
const createCompany = async (req, res) => {
  try {
    const {
      name,
      legalName,
      contact,
      settings,
      subscription
    } = req.body;

    const company = new Company({
      name,
      legalName,
      contact,
      settings: {
        ...settings,
        travelPolicy: {
          requireApproval: true,
          approvalLimits: [],
          allowedBookingWindow: 30,
          ...settings?.travelPolicy
        },
        budgetControls: {
          enabled: true,
          departmentBudgets: [],
          ...settings?.budgetControls
        }
      },
      subscription: {
        plan: 'basic',
        status: 'active',
        ...subscription
      },
      admins: [{
        user: req.user._id,
        role: 'super-admin',
        permissions: ['all']
      }],
      createdBy: req.user._id
    });

    await company.save();

    // Update user to be corporate admin
    await User.findByIdAndUpdate(req.user._id, {
      role: 'corporate-admin',
      'corporate.company': company._id,
      'corporate.canApprove': true,
      'corporate.approvalLimit': 999999,
      'corporate.permissions': ['book-travel', 'approve-bookings', 'manage-team', 'view-reports', 'manage-budget'],
      'corporate.joinedAt': new Date()
    });

    await auditService.log({
      userId: req.user._id,
      action: 'COMPANY_CREATED',
      resource: 'company',
      resourceId: company._id.toString(),
      metadata: { name: company.name }
    });

    res.status(201).json({
      success: true,
      data: { company }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

// Get company details
const getCompanyDetails = async (req, res) => {
  try {
    if (!req.user.corporate?.company) {
      return res.status(403).json({
        success: false,
        error: { message: 'User not associated with any company' }
      });
    }

    const company = await Company.findById(req.user.corporate.company)
      .populate('admins.user', 'profile.firstName profile.lastName email');

    if (!company) {
      return res.status(404).json({
        success: false,
        error: { message: 'Company not found' }
      });
    }

    res.json({
      success: true,
      data: { company }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Update company settings
const updateCompanySettings = async (req, res) => {
  try {
    const { settings } = req.body;

    if (!req.user.corporate?.company) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied' }
      });
    }

    // Check if user is company admin
    const company = await Company.findById(req.user.corporate.company);
    const isAdmin = company.admins.some(admin => 
      admin.user.toString() === req.user._id.toString() && 
      ['super-admin', 'admin'].includes(admin.role)
    );

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: { message: 'Only company admins can update settings' }
      });
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      req.user.corporate.company,
      { 
        settings: { ...company.settings, ...settings },
        updatedBy: req.user._id
      },
      { new: true }
    );

    await auditService.log({
      userId: req.user._id,
      action: 'COMPANY_SETTINGS_UPDATED',
      resource: 'company',
      resourceId: company._id.toString()
    });

    res.json({
      success: true,
      data: { company: updatedCompany }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Add employee to company
const addEmployee = async (req, res) => {
  try {
    const {
      email,
      department,
      designation,
      approvalLimit = 0,
      canApprove = false,
      permissions = ['book-travel']
    } = req.body;

    if (!req.user.corporate?.company) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied' }
      });
    }

    // Find or create user
    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Create new user account
      user = new User({
        email: email.toLowerCase(),
        password: 'TempPass123!', // Temporary password
        role: 'corporate-user',
        status: 'pending',
        corporate: {
          company: req.user.corporate.company,
          department,
          designation,
          approvalLimit,
          canApprove,
          permissions,
          joinedAt: new Date()
        }
      });
      await user.save();
      
      // Send invitation email
      await sendEmployeeInvitation(user, req.user.corporate.company);
    } else {
      // Update existing user
      if (user.corporate?.company && user.corporate.company.toString() !== req.user.corporate.company.toString()) {
        return res.status(400).json({
          success: false,
          error: { message: 'User already belongs to another company' }
        });
      }

      user.role = 'corporate-user';
      user.corporate = {
        company: req.user.corporate.company,
        department,
        designation,
        approvalLimit,
        canApprove,
        permissions,
        joinedAt: new Date()
      };
      await user.save();
    }

    // Update company employee count
    await Company.findByIdAndUpdate(
      req.user.corporate.company,
      { $inc: { 'stats.totalEmployees': 1 } }
    );

    await auditService.log({
      userId: req.user._id,
      action: 'EMPLOYEE_ADDED',
      resource: 'company',
      resourceId: req.user.corporate.company.toString(),
      metadata: { employeeEmail: email, department }
    });

    res.status(201).json({
      success: true,
      data: { 
        user: user.toSafeObject(),
        message: 'Employee added successfully'
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

// Get company employees
const getCompanyEmployees = async (req, res) => {
  try {
    const { department, status, page = 1, limit = 20 } = req.query;

    if (!req.user.corporate?.company) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied' }
      });
    }

    const query = { 'corporate.company': req.user.corporate.company };
    if (department) query['corporate.department'] = department;
    if (status) query.status = status;

    const employees = await User.find(query)
      .select('-password -verification -passwordReset')
      .sort({ 'corporate.joinedAt': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        employees,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Update employee permissions
const updateEmployeePermissions = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { department, designation, approvalLimit, canApprove, permissions } = req.body;

    if (!req.user.corporate?.company) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied' }
      });
    }

    const employee = await User.findById(employeeId);
    if (!employee || employee.corporate?.company?.toString() !== req.user.corporate.company.toString()) {
      return res.status(404).json({
        success: false,
        error: { message: 'Employee not found' }
      });
    }

    const updateData = {};
    if (department !== undefined) updateData['corporate.department'] = department;
    if (designation !== undefined) updateData['corporate.designation'] = designation;
    if (approvalLimit !== undefined) updateData['corporate.approvalLimit'] = approvalLimit;
    if (canApprove !== undefined) updateData['corporate.canApprove'] = canApprove;
    if (permissions !== undefined) updateData['corporate.permissions'] = permissions;

    await User.findByIdAndUpdate(employeeId, updateData);

    await auditService.log({
      userId: req.user._id,
      action: 'EMPLOYEE_PERMISSIONS_UPDATED',
      resource: 'user',
      resourceId: employeeId,
      metadata: { changes: updateData }
    });

    res.json({
      success: true,
      data: { message: 'Employee permissions updated successfully' }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Get company dashboard data
const getCompanyDashboard = async (req, res) => {
  try {
    if (!req.user.corporate?.company) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied' }
      });
    }

    const companyId = req.user.corporate.company;

    // Get basic stats
    const [
      totalEmployees,
      activeBookings,
      pendingApprovals,
      monthlySpend
    ] = await Promise.all([
      User.countDocuments({ 'corporate.company': companyId, 'corporate.isActive': true }),
      CorporateBooking.countDocuments({ company: companyId, status: { $in: ['confirmed', 'in-progress'] } }),
      CorporateBooking.countDocuments({ company: companyId, 'corporate.approval.status': 'pending' }),
      CorporateBooking.aggregate([
        {
          $match: {
            company: mongoose.Types.ObjectId(companyId),
            createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
          }
        },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ])
    ]);

    // Get recent bookings
    const recentBookings = await CorporateBooking.find({ company: companyId })
      .populate('bookedBy', 'profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get department-wise spending
    const departmentSpending = await CorporateBooking.aggregate([
      { $match: { company: mongoose.Types.ObjectId(companyId) } },
      {
        $group: {
          _id: '$corporate.department',
          totalSpent: { $sum: '$pricing.total' },
          bookingCount: { $sum: 1 }
        }
      },
      { $sort: { totalSpent: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalEmployees,
          activeBookings,
          pendingApprovals,
          monthlySpend: monthlySpend[0]?.total || 0
        },
        recentBookings,
        departmentSpending
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Helper function
const sendEmployeeInvitation = async (user, companyId) => {
  // Implementation for sending employee invitation email
  console.log(`Invitation sent to ${user.email} for company ${companyId}`);
};

module.exports = {
  createCompany,
  getCompanyDetails,
  updateCompanySettings,
  addEmployee,
  getCompanyEmployees,
  updateEmployeePermissions,
  getCompanyDashboard
};