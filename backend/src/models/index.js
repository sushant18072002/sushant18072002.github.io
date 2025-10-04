// Core Models
const User = require('./User');
const Session = require('./Session');
const Flight = require('./Flight');
const Hotel = require('./Hotel');
const Booking = require('./Booking');
const Review = require('./Review');
const BlogPost = require('./BlogPost');
const Notification = require('./Notification');
const SupportTicket = require('./SupportTicket');
const Setting = require('./Setting');
const Settings = require('./Settings');
const Airline = require('./Airline');
const Airport = require('./Airport');
const Currency = require('./Currency');
const Tag = require('./Tag');
const Payment = require('./Payment');
const Category = require('./Category');
const Activity = require('./Activity');

// New Unified Models
const Trip = require('./Trip');
const TripAppointment = require('./TripAppointment');
const TripBooking = require('./TripBooking');
const { Country, State, City } = require('./MasterData');

module.exports = {
  // Core Models
  User,
  Session,
  Flight,
  Hotel,
  Booking,
  Review,
  BlogPost,
  Notification,
  SupportTicket,
  Setting,
  Settings,
  Airline,
  Airport,
  Currency,
  Tag,
  Payment,
  
  // New Unified Models
  Trip,
  TripAppointment,
  TripBooking,
  Category,
  
  // Master Data Models
  Country,
  State,
  City,
  Activity
};