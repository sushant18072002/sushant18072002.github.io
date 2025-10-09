const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./backend/src/models/User');
const Company = require('./backend/src/models/Company');
const Trip = require('./backend/src/models/Trip');

async function setupCorporateDemo() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Create admin user if not exists
    let admin = await User.findOne({ email: 'admin@travelai.com' });
    if (!admin) {
      admin = new User({
        email: 'admin@travelai.com',
        password: 'admin123',
        role: 'admin',
        status: 'active',
        emailVerified: true,
        profile: {
          firstName: 'Admin',
          lastName: 'User'
        }
      });
      await admin.save();
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }

    // 2. Create sample company
    let company = await Company.findOne({ name: 'Demo Corporation' });
    if (!company) {
      company = new Company({
        name: 'Demo Corporation',
        legalName: 'Demo Corporation Inc.',
        contact: {
          email: 'admin@democorp.com',
          phone: '+1-555-0100',
          address: {
            street: '100 Demo Street',
            city: 'Demo City',
            state: 'CA',
            country: 'USA',
            zipCode: '90210'
          }
        },
        settings: {
          currency: 'USD',
          travelPolicy: {
            requireApproval: true,
            approvalLimits: [
              { role: 'employee', maxAmount: 2000, currency: 'USD' },
              { role: 'manager', maxAmount: 10000, currency: 'USD' }
            ],
            allowedBookingWindow: 30
          },
          budgetControls: {
            enabled: true,
            departmentBudgets: [
              { department: 'Engineering', annualBudget: 50000, spentAmount: 0, currency: 'USD' },
              { department: 'Sales', annualBudget: 30000, spentAmount: 0, currency: 'USD' },
              { department: 'Marketing', annualBudget: 25000, spentAmount: 0, currency: 'USD' }
            ]
          }
        },
        admins: [{
          user: admin._id,
          role: 'super-admin',
          permissions: ['all']
        }],
        status: 'active',
        createdBy: admin._id
      });
      await company.save();
      console.log('✅ Demo company created');
    } else {
      console.log('✅ Demo company already exists');
    }

    // 3. Create corporate users
    const corporateUsers = [
      {
        email: 'john.doe@democorp.com',
        password: 'password123',
        role: 'corporate-user',
        profile: { firstName: 'John', lastName: 'Doe' },
        corporate: {
          company: company._id,
          department: 'Engineering',
          designation: 'Senior Developer',
          approvalLimit: 2000,
          canApprove: false,
          permissions: ['book-travel']
        }
      },
      {
        email: 'jane.manager@democorp.com',
        password: 'password123',
        role: 'corporate-admin',
        profile: { firstName: 'Jane', lastName: 'Manager' },
        corporate: {
          company: company._id,
          department: 'Engineering',
          designation: 'Engineering Manager',
          approvalLimit: 15000,
          canApprove: true,
          permissions: ['book-travel', 'approve-bookings', 'manage-team']
        }
      }
    ];

    for (const userData of corporateUsers) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = new User({
          ...userData,
          status: 'active',
          emailVerified: true
        });
        await user.save();
        console.log(`✅ Corporate user created: ${userData.email}`);
      } else {
        console.log(`✅ Corporate user already exists: ${userData.email}`);
      }
    }

    // 4. Create sample trip if not exists
    let trip = await Trip.findOne({ title: 'Corporate Retreat - Bali' });
    if (!trip) {
      trip = new Trip({
        title: 'Corporate Retreat - Bali',
        description: 'Perfect for team building and corporate events in beautiful Bali',
        category: { name: 'Corporate', icon: '🏢' },
        primaryDestination: { name: 'Bali, Indonesia' },
        duration: { days: 5, nights: 4 },
        groupSize: { min: 5, max: 50 },
        pricing: {
          basePrice: 1200,
          sellPrice: 1500,
          finalPrice: 1200,
          currency: 'USD',
          discountPercent: 20,
          discountAmount: 300
        },
        images: [{
          url: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800',
          alt: 'Bali Corporate Retreat'
        }],
        itinerary: [
          {
            day: 1,
            title: 'Arrival and Welcome',
            description: 'Airport pickup and hotel check-in',
            activities: [{
              title: 'Welcome Dinner',
              description: 'Team welcome dinner at beachfront restaurant'
            }]
          },
          {
            day: 2,
            title: 'Team Building Activities',
            description: 'Full day of team building exercises',
            activities: [{
              title: 'Beach Team Building',
              description: 'Collaborative activities on the beach'
            }]
          }
        ],
        includes: [
          'Airport transfers',
          '4-star accommodation',
          'Daily breakfast',
          'Team building activities',
          'Welcome and farewell dinners'
        ],
        status: 'published',
        featured: true
      });
      await trip.save();
      console.log('✅ Sample corporate trip created');
    } else {
      console.log('✅ Sample corporate trip already exists');
    }

    console.log('\n🎉 Corporate demo setup completed!');
    console.log('\n📋 Demo Credentials:');
    console.log('   Admin: admin@travelai.com / admin123');
    console.log('   Employee: john.doe@democorp.com / password123');
    console.log('   Manager: jane.manager@democorp.com / password123');
    console.log('\n🏢 Demo Company: Demo Corporation');
    console.log('🧳 Demo Trip: Corporate Retreat - Bali');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

setupCorporateDemo();