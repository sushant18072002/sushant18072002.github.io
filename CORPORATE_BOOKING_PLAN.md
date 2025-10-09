# 🏢 Corporate Booking Implementation Plan

## 📋 **Current System Analysis**

### **Existing Booking Flow**
1. **Individual Booking**: User → Trip Selection → Customization → Personal Details → Payment → Confirmation
2. **Models**: User, Booking, Trip, Payment
3. **User Types**: Only 'customer' and 'admin' roles
4. **Booking Types**: 'flight', 'hotel', 'package', 'activity', 'combo', 'trip', 'trip-appointment'

### **Missing Corporate Features**
- No corporate user roles
- No bulk booking capabilities
- No corporate approval workflows
- No company billing/invoicing
- No employee management
- No corporate discounts/rates

## 🎯 **Corporate Booking Requirements**

### **User Roles**
- **Corporate Admin**: Manages company account, employees, budgets
- **Corporate Manager**: Approves bookings, manages team budgets
- **Corporate Employee**: Books trips within company policies
- **Travel Manager**: Handles all corporate travel coordination

### **Key Features**
1. **Company Management**: Company profiles, departments, budgets
2. **Employee Management**: Add/remove employees, assign roles
3. **Approval Workflows**: Multi-level approval for bookings
4. **Bulk Booking**: Book for multiple employees
5. **Corporate Rates**: Special pricing for companies
6. **Expense Management**: Track and report travel expenses
7. **Policy Compliance**: Enforce travel policies
8. **Centralized Billing**: Company-wide invoicing

## 🏗️ **Implementation Plan**

### **Phase 1: Backend Foundation**

#### **1. Database Models**

**Company Model:**
```javascript
{
  name: String,
  industry: String,
  size: String, // 'small', 'medium', 'large', 'enterprise'
  address: Object,
  taxId: String,
  contactInfo: Object,
  settings: {
    approvalRequired: Boolean,
    maxBookingAmount: Number,
    allowedDestinations: [String],
    preferredVendors: [String]
  },
  billing: {
    paymentMethod: String,
    billingCycle: String, // 'monthly', 'quarterly'
    creditLimit: Number
  },
  status: String // 'active', 'suspended'
}
```

**Corporate User Extensions:**
```javascript
// Add to existing User model
{
  company: ObjectId, // Reference to Company
  role: String, // Add 'corporate-admin', 'corporate-manager', 'corporate-employee', 'travel-manager'
  department: String,
  employeeId: String,
  manager: ObjectId, // Reference to manager
  travelBudget: {
    annual: Number,
    used: Number,
    remaining: Number
  }
}
```

**Corporate Booking Extensions:**
```javascript
// Add to existing Booking model
{
  bookingType: String, // Add 'corporate'
  company: ObjectId,
  bookedFor: ObjectId, // Employee being booked for
  bookedBy: ObjectId, // Person making the booking
  approval: {
    required: Boolean,
    status: String, // 'pending', 'approved', 'rejected'
    approvedBy: ObjectId,
    approvedAt: Date,
    rejectionReason: String
  },
  corporate: {
    department: String,
    costCenter: String,
    projectCode: String,
    businessPurpose: String
  }
}
```

#### **2. API Endpoints**

**Company Management:**
- `POST /api/companies` - Create company
- `GET /api/companies/:id` - Get company details
- `PUT /api/companies/:id` - Update company
- `GET /api/companies/:id/employees` - List employees
- `POST /api/companies/:id/employees` - Add employee

**Corporate Bookings:**
- `POST /api/bookings/corporate` - Create corporate booking
- `GET /api/bookings/corporate` - List corporate bookings
- `PUT /api/bookings/:id/approve` - Approve booking
- `PUT /api/bookings/:id/reject` - Reject booking
- `POST /api/bookings/bulk` - Bulk booking

### **Phase 2: Frontend Implementation**

#### **1. Corporate Dashboard**
- Company overview
- Employee management
- Booking approvals
- Budget tracking
- Reports and analytics

#### **2. Corporate Booking Flow**
- Enhanced trip selection with corporate rates
- Employee selection (for managers/admins)
- Corporate information form
- Approval workflow display
- Bulk booking interface

#### **3. UI Components**
- Corporate user switcher
- Approval status indicators
- Budget tracking widgets
- Employee selector
- Department/cost center inputs

### **Phase 3: Integration Points**

#### **1. Existing Trip Flow Enhancement**
- Add corporate booking option
- Show corporate rates
- Integrate approval workflow
- Add corporate-specific customization

#### **2. User Management Integration**
- Corporate role-based access
- Company switching
- Employee impersonation (for admins)

## 💻 **Code Implementation**

### **Backend Models**

#### **Company Model**
```javascript
const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  industry: String,
  size: { type: String, enum: ['small', 'medium', 'large', 'enterprise'] },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  contactInfo: {
    phone: String,
    email: String,
    website: String
  },
  settings: {
    approvalRequired: { type: Boolean, default: true },
    maxBookingAmount: { type: Number, default: 5000 },
    allowedDestinations: [String],
    preferredVendors: [String],
    autoApprovalLimit: { type: Number, default: 1000 }
  },
  billing: {
    paymentMethod: String,
    billingCycle: { type: String, enum: ['monthly', 'quarterly'], default: 'monthly' },
    creditLimit: Number,
    currentBalance: { type: Number, default: 0 }
  },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' }
}, { timestamps: true });
```

#### **Corporate Booking Controller**
```javascript
const createCorporateBooking = async (req, res) => {
  try {
    const { bookingData, employeeId, corporateInfo } = req.body;
    
    // Check if approval required
    const company = await Company.findById(req.user.company);
    const requiresApproval = company.settings.approvalRequired && 
                           bookingData.totalAmount > company.settings.autoApprovalLimit;
    
    const booking = new Booking({
      ...bookingData,
      type: 'corporate',
      user: employeeId || req.user._id,
      bookedBy: req.user._id,
      company: req.user.company,
      approval: {
        required: requiresApproval,
        status: requiresApproval ? 'pending' : 'approved'
      },
      corporate: corporateInfo
    });
    
    await booking.save();
    
    // Send approval notification if required
    if (requiresApproval) {
      await sendApprovalNotification(booking);
    }
    
    res.json({ success: true, data: { booking } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};
```

### **Frontend Components**

#### **Corporate Booking Page**
```typescript
export const CorporateBookingPage: React.FC = () => {
  const [bookingType, setBookingType] = useState<'self' | 'employee'>('self');
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [employees, setEmployees] = useState<User[]>([]);
  const [corporateInfo, setCorporateInfo] = useState({
    department: '',
    costCenter: '',
    projectCode: '',
    businessPurpose: ''
  });

  return (
    <div className="corporate-booking-page">
      {/* Booking Type Selector */}
      <div className="booking-type-selector">
        <button 
          onClick={() => setBookingType('self')}
          className={bookingType === 'self' ? 'active' : ''}
        >
          Book for Myself
        </button>
        <button 
          onClick={() => setBookingType('employee')}
          className={bookingType === 'employee' ? 'active' : ''}
        >
          Book for Employee
        </button>
      </div>

      {/* Employee Selection */}
      {bookingType === 'employee' && (
        <EmployeeSelector 
          employees={employees}
          selected={selectedEmployee}
          onSelect={setSelectedEmployee}
        />
      )}

      {/* Corporate Information Form */}
      <CorporateInfoForm 
        data={corporateInfo}
        onChange={setCorporateInfo}
      />

      {/* Trip Selection with Corporate Rates */}
      <TripSelector showCorporateRates={true} />
    </div>
  );
};
```

#### **Corporate Dashboard**
```typescript
export const CorporateDashboard: React.FC = () => {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [budgetOverview, setBudgetOverview] = useState(null);

  return (
    <div className="corporate-dashboard">
      <div className="dashboard-header">
        <h1>Corporate Travel Dashboard</h1>
        <CompanySelector />
      </div>

      <div className="dashboard-grid">
        <BudgetOverview data={budgetOverview} />
        <PendingApprovals bookings={pendingApprovals} />
        <RecentBookings />
        <TravelAnalytics />
      </div>
    </div>
  );
};
```

## 🎨 **UI/UX Integration**

### **Navigation Enhancement**
- Add "Corporate" section to main navigation
- Corporate dashboard link
- Switch between personal/corporate booking modes

### **Trip Cards Enhancement**
- Show corporate rates when in corporate mode
- Display approval requirements
- Add bulk selection capabilities

### **Booking Flow Modifications**
- Corporate booking toggle on trip details page
- Enhanced form with corporate fields
- Approval workflow visualization

## 📱 **Mobile Considerations**
- Responsive corporate dashboard
- Mobile-friendly approval interface
- Touch-optimized employee selection

## 🔒 **Security & Permissions**
- Role-based access control
- Company data isolation
- Approval workflow security
- Audit logging for corporate actions

## 📊 **Reporting & Analytics**
- Travel spend analytics
- Department-wise reports
- Approval workflow metrics
- Cost center tracking

## 🚀 **Implementation Priority**

### **Phase 1 (High Priority)**
1. Company and corporate user models
2. Basic corporate booking flow
3. Simple approval workflow
4. Corporate dashboard

### **Phase 2 (Medium Priority)**
1. Bulk booking capabilities
2. Advanced approval workflows
3. Budget management
4. Corporate rates integration

### **Phase 3 (Future)**
1. Advanced analytics
2. Integration with expense systems
3. Mobile app enhancements
4. AI-powered travel recommendations

## 📋 **Next Steps**
1. Create backend models and controllers
2. Implement corporate booking API endpoints
3. Build corporate dashboard UI
4. Integrate with existing trip flow
5. Add approval workflow
6. Test and refine user experience