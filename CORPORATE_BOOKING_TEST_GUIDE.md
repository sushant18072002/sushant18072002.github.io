# Corporate Booking System - Complete Testing Guide

## Prerequisites

1. **Backend Running**: Ensure backend is running on `http://localhost:3000`
2. **Frontend Running**: Ensure frontend is running on `http://localhost:3001`
3. **Database**: MongoDB connection established

## Setup Demo Data

Run the setup script to create demo data:

```bash
cd Travel
node setup-corporate-demo.js
```

This creates:
- Admin user: `admin@travelai.com` / `admin123`
- Corporate employee: `john.doe@democorp.com` / `password123`
- Corporate manager: `jane.manager@democorp.com` / `password123`
- Demo company: "Demo Corporation"
- Sample corporate trip: "Corporate Retreat - Bali"

## Manual Testing Steps

### Phase 1: Admin Setup & Management

#### 1.1 Admin Login & Corporate Overview
1. Go to `http://localhost:3001/auth`
2. Login as admin: `admin@travelai.com` / `admin123`
3. Navigate to `/admin`
4. Click on "Corporate" tab
5. **Verify**: You can see the demo company and any corporate bookings

#### 1.2 Admin Corporate Management
1. In Admin → Corporate tab
2. **Verify**: Company list shows "Demo Corporation" with status "active"
3. **Verify**: Employee count shows correctly
4. **Test**: Try suspending and reactivating the company
5. **Verify**: Corporate bookings section shows any existing bookings

### Phase 2: Corporate User Registration & Setup

#### 2.1 New Company Registration
1. Logout from admin
2. Login as regular user or create new account
3. Navigate to `/corporate/setup`
4. Fill out company registration form:
   - Company Name: "Test Company Inc"
   - Email: your email
   - Departments: "IT, HR, Sales, Finance"
   - Enable approval requirements
5. **Verify**: Company is created and you're redirected to corporate dashboard

#### 2.2 Employee Management
1. In corporate dashboard, add employees:
   - Add regular employee with limited approval rights
   - Add manager with higher approval limits
2. **Verify**: Employees appear in company employee list
3. **Test**: Update employee permissions and approval limits

### Phase 3: Corporate Booking Flow

#### 3.1 Employee Corporate Booking
1. Logout and login as corporate employee: `john.doe@democorp.com` / `password123`
2. Navigate to `/trips`
3. Find "Corporate Retreat - Bali" trip
4. Click "Corporate Booking" button (not individual booking)
5. Fill out corporate booking form:
   - **Step 1**: Corporate details (department, purpose, project)
   - **Step 2**: Add travelers (yourself + colleague)
   - **Step 3**: Review and submit
6. **Verify**: Booking is created with "pending-approval" status
7. **Verify**: Booking reference is generated (CORP-XXXXX format)

#### 3.2 Manager Approval Process
1. Logout and login as manager: `jane.manager@democorp.com` / `password123`
2. Navigate to `/corporate/dashboard`
3. **Verify**: Pending approval shows in dashboard
4. Click "View All" pending approvals
5. **Test**: Approve the booking with notes
6. **Verify**: Booking status changes to "approved"
7. **Verify**: Employee receives confirmation

#### 3.3 Budget Tracking
1. In corporate dashboard, check department spending
2. **Verify**: Budget utilization updates after booking approval
3. **Test**: Try booking that exceeds department budget
4. **Verify**: System prevents over-budget bookings

### Phase 4: Admin Monitoring

#### 4.1 Admin Corporate Analytics
1. Login as admin
2. Go to Admin → Corporate
3. **Verify**: All companies and bookings are visible
4. **Test**: View corporate booking details
5. **Verify**: Analytics show correct totals and trends

#### 4.2 Admin Actions
1. **Test**: Suspend a company and verify employees can't book
2. **Test**: Reactivate company and verify functionality restored
3. **Verify**: Admin can see all corporate bookings across companies

## Automated Testing

Run the automated test script:

```bash
cd Travel
node test-corporate-booking-flow.js
```

This script tests:
1. ✅ Admin login
2. ✅ Company creation
3. ✅ Employee addition
4. ✅ Trip availability
5. ✅ Corporate booking creation
6. ✅ Approval workflow
7. ✅ Analytics retrieval
8. ✅ Admin oversight

## Expected Results

### ✅ Success Indicators

1. **Company Management**:
   - Companies can be created and managed
   - Employees can be added with proper roles
   - Budget controls work correctly

2. **Booking Flow**:
   - Corporate bookings are created with proper workflow
   - Approval process functions correctly
   - Budget validation prevents overspending

3. **Admin Control**:
   - Admins can view all corporate data
   - Company suspension/activation works
   - Analytics provide accurate insights

4. **User Experience**:
   - Clear distinction between individual and corporate booking
   - Intuitive approval workflow
   - Real-time budget tracking

### ❌ Failure Indicators

1. **Backend Issues**:
   - 500 errors on API calls
   - Database connection failures
   - Missing route handlers

2. **Frontend Issues**:
   - Components not rendering
   - Navigation errors
   - Form submission failures

3. **Business Logic Issues**:
   - Approval workflow bypassed
   - Budget limits not enforced
   - Incorrect role permissions

## Troubleshooting

### Common Issues

1. **"Company not found" errors**:
   - Ensure setup script ran successfully
   - Check MongoDB connection
   - Verify user has corporate.company field

2. **Approval workflow not working**:
   - Check user has canApprove permission
   - Verify approval limits are set correctly
   - Ensure booking amount triggers approval

3. **Budget validation failing**:
   - Check department budget configuration
   - Verify budget calculation logic
   - Ensure currency matching

4. **Admin routes not accessible**:
   - Verify user has admin role
   - Check admin middleware
   - Ensure routes are properly registered

### Debug Steps

1. **Check Backend Logs**:
   ```bash
   # In backend terminal, watch for errors
   ```

2. **Check Database**:
   ```bash
   # Connect to MongoDB and verify data
   use travelai
   db.companies.find()
   db.corporatebookings.find()
   ```

3. **Check Network Requests**:
   - Open browser DevTools
   - Monitor Network tab for API calls
   - Check for 401, 403, 500 errors

4. **Verify Environment**:
   - Check .env files are properly configured
   - Ensure all required environment variables are set
   - Verify API base URLs match

## Performance Testing

### Load Testing Scenarios

1. **Multiple Companies**: Create 10+ companies with 50+ employees each
2. **Concurrent Bookings**: Simulate multiple users booking simultaneously
3. **Approval Queue**: Test with 100+ pending approvals
4. **Analytics Load**: Test dashboard with large datasets

### Expected Performance

- **API Response Time**: < 500ms for most operations
- **Page Load Time**: < 2 seconds for dashboard
- **Database Queries**: < 100ms for simple operations
- **Concurrent Users**: Support 50+ simultaneous users

## Security Testing

### Test Cases

1. **Access Control**:
   - Verify users can only access their company data
   - Test admin-only endpoints require admin role
   - Ensure approval permissions are enforced

2. **Data Validation**:
   - Test input sanitization on all forms
   - Verify budget limits can't be bypassed
   - Check for SQL injection vulnerabilities

3. **Authentication**:
   - Test token expiration handling
   - Verify logout clears all sessions
   - Check password requirements

## Deployment Checklist

Before deploying to production:

- [ ] All tests pass (automated + manual)
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Database migrations ready
- [ ] Environment variables configured
- [ ] Monitoring and logging set up
- [ ] Backup procedures in place
- [ ] Documentation updated

## Support & Maintenance

### Monitoring Points

1. **Business Metrics**:
   - Corporate booking conversion rates
   - Average approval time
   - Budget utilization rates

2. **Technical Metrics**:
   - API response times
   - Error rates
   - Database performance

3. **User Experience**:
   - Page load times
   - Form completion rates
   - User satisfaction scores

### Regular Maintenance

1. **Weekly**: Review error logs and performance metrics
2. **Monthly**: Analyze business metrics and user feedback
3. **Quarterly**: Security audit and dependency updates
4. **Annually**: Full system review and optimization

---

This comprehensive testing guide ensures the corporate booking system works correctly and is ready for production use.