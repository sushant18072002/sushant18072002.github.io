const mongoose = require('mongoose');

const airlineSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true }, // IATA code
  icaoCode: { type: String, uppercase: true }, // ICAO code
  name: { type: String, required: true },
  country: { type: String, required: true },
  logo: String,
  website: String,
  contact: {
    phone: String,
    email: String,
    customerService: String
  },
  fleet: [{
    aircraftType: String,
    count: Number,
    configuration: {
      first: Number,
      business: Number,
      economy: Number,
      total: Number
    }
  }],
  services: {
    classes: [{ type: String, enum: ['economy', 'premiumEconomy', 'business', 'first'] }],
    amenities: [String],
    baggage: {
      carry_on: {
        weight: Number,
        dimensions: String,
        pieces: Number
      },
      checked: {
        weight: Number,
        pieces: Number,
        fee: Number
      }
    },
    meals: [String],
    entertainment: [String]
  },
  hubs: [{ type: String }], // Airport codes
  destinations: [{ type: String }], // Airport codes
  alliance: String, // Star Alliance, OneWorld, SkyTeam
  rating: {
    overall: { type: Number, min: 0, max: 5 },
    safety: { type: Number, min: 0, max: 5 },
    service: { type: Number, min: 0, max: 5 },
    punctuality: { type: Number, min: 0, max: 100 }
  },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  metadata: {
    founded: Date,
    headquarters: String,
    ceo: String,
    employees: Number,
    revenue: Number
  }
}, { timestamps: true });

airlineSchema.index({ code: 1 });
airlineSchema.index({ country: 1, status: 1 });
airlineSchema.index({ name: 'text' });

module.exports = mongoose.model('Airline', airlineSchema);