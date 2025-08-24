require('dotenv').config();
const mongoose = require('mongoose');
const { User, Airport, Airline, Flight } = require('../src/models');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travelai');
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Airport.deleteMany({});
    await Airline.deleteMany({});
    await Flight.deleteMany({});

    // Create admin user
    const adminUser = await User.create({
      email: 'admin@travelai.com',
      password: 'admin123',
      role: 'admin',
      status: 'active',
      profile: {
        firstName: 'Admin',
        lastName: 'User'
      }
    });

    // Create sample customer
    const customer = await User.create({
      email: 'customer@travelai.com',
      password: 'customer123',
      role: 'customer',
      status: 'active',
      profile: {
        firstName: 'John',
        lastName: 'Doe'
      }
    });

    // Create airports
    const airports = await Airport.insertMany([
      { code: 'NYC', name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA' },
      { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'USA' },
      { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France' },
      { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'UK' },
      { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan' }
    ]);

    // Create airlines
    const airlines = await Airline.insertMany([
      { code: 'DL', name: 'Delta Airlines', country: 'USA', status: 'active' },
      { code: 'UA', name: 'United Airlines', country: 'USA', status: 'active' },
      { code: 'BA', name: 'British Airways', country: 'UK', status: 'active' },
      { code: 'AF', name: 'Air France', country: 'France', status: 'active' }
    ]);

    // Create sample flights
    const flights = await Flight.insertMany([
      {
        flightNumber: 'DL1234',
        airline: airlines[0]._id,
        route: {
          departure: {
            airport: airports[0]._id,
            scheduledTime: new Date('2024-12-15T10:00:00Z')
          },
          arrival: {
            airport: airports[2]._id,
            scheduledTime: new Date('2024-12-15T22:00:00Z')
          }
        },
        duration: { scheduled: 480 },
        pricing: {
          economy: { basePrice: 550, taxes: 49, totalPrice: 599, availability: 150 },
          business: { basePrice: 1200, taxes: 100, totalPrice: 1300, availability: 20 }
        },
        stops: 0,
        status: 'scheduled'
      },
      {
        flightNumber: 'UA5678',
        airline: airlines[1]._id,
        route: {
          departure: {
            airport: airports[1]._id,
            scheduledTime: new Date('2024-12-16T14:00:00Z')
          },
          arrival: {
            airport: airports[4]._id,
            scheduledTime: new Date('2024-12-17T18:00:00Z')
          }
        },
        duration: { scheduled: 660 },
        pricing: {
          economy: { basePrice: 720, taxes: 69, totalPrice: 789, availability: 180 },
          business: { basePrice: 2200, taxes: 200, totalPrice: 2400, availability: 15 }
        },
        stops: 0,
        status: 'scheduled'
      }
    ]);

    console.log('✅ Seed data created successfully!');
    console.log(`👤 Admin user: admin@travelai.com / admin123`);
    console.log(`👤 Customer user: customer@travelai.com / customer123`);
    console.log(`✈️ ${airports.length} airports created`);
    console.log(`🏢 ${airlines.length} airlines created`);
    console.log(`🛫 ${flights.length} flights created`);

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    mongoose.connection.close();
  }
};

const runSeed = async () => {
  await connectDB();
  await seedData();
};

runSeed();