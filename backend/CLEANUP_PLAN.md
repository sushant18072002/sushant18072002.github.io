# System Cleanup & Gap Analysis

## 🗑️ **FILES TO DELETE**

### **Duplicate Models:**
- BaseModel.js (not used)
- Company.js (not needed for travel platform)
- Partner.js (Odoo-style, not needed)
- ProductTemplate.js (Odoo-style, not needed)
- UserImproved.js (duplicate of User.js)
- Sequence.js (not needed)
- Payment.js (payment info in Booking model)

### **Duplicate Routes:**
- authRoutes.js (keep auth.routes.js)
- flightRoutes.js (keep flights.routes.js)

### **Unused Routes:**
- masterData.routes.js (not in server.js)

### **Duplicate Controllers:**
- authController.js (keep authControllerFixed.js)
- flightController.js (keep flightControllerFixed.js)

### **Unnecessary Docs:**
- BACKEND_IMPLEMENTATION_PLAN.md
- CRITICAL_FIXES.md
- DATABASE_ARCHITECTURE_ANALYSIS.md
- DEVELOPMENT_PLAN.md
- MASTER_BACKEND_PLAN.md
- SYSTEM_ANALYSIS_COMPLETE.md
- SYSTEM_FIXES_COMPLETE.md
- SYSTEM_STATUS.md

## 📋 **MISSING APIs BY FEATURE**

### **Flight APIs Missing (8/18):**
- GET /flights/:id/baggage-info
- GET /flights/:id/meal-options
- GET /flights/popular-routes
- GET /flights/deals
- GET /flights/calendar-prices
- POST /flights/flexible-search
- POST /flights/multi-city
- POST /flights/:id/hold-seat

### **Hotel APIs Missing (8/16):**
- GET /hotels/:id/amenities
- GET /hotels/:id/photos
- GET /hotels/deals
- GET /hotels/popular-destinations
- GET /locations/search
- POST /hotels/price-alerts
- DELETE /hotels/price-alerts/:id
- POST /hotels/compare

### **Booking APIs Missing (9/15):**
- POST /bookings/flights
- POST /bookings/hotels
- POST /bookings/packages
- GET /bookings/:id/invoice
- POST /bookings/:id/modify
- GET /bookings/history
- GET /bookings/upcoming
- POST /bookings/:id/review
- POST /bookings/payment/refund

### **User APIs Missing (6/12):**
- GET /users/trips
- GET /users/loyalty-points
- POST /users/favorites
- DELETE /users/favorites/:id
- DELETE /users/account
- PUT /users/notifications/:id/read

### **Content APIs Missing (10/10):**
- All content APIs missing
- Need content.routes.js implementation

### **Support APIs Missing (6/6):**
- All support APIs missing
- Need support.routes.js implementation

### **Blog APIs Missing (6/6):**
- All blog APIs missing
- Need blog.routes.js implementation

## 🎯 **PRIORITY FIXES**

1. **Delete unnecessary files**
2. **Implement missing critical APIs**
3. **Fix route mismatches**
4. **Complete feature gaps**