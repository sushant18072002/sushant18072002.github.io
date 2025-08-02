// Core Models
const User = require('./User');
const Flight = require('./Flight');
const Hotel = require('./Hotel').default;
const Booking = require('./Booking');
const Itinerary = require('./Itinerary');
const Review = require('./Review');
const Destination = require('./Destination');
const Package = require('./Package');
const BlogPost = require('./BlogPost');

// New Models
const Session = require('./Session');
const Notification = require('./Notification');
const SupportTicket = require('./SupportTicket');
const AuditLog = require('./AuditLog');
const Analytics = require('./Analytics');
const SearchLog = require('./SearchLog');
const PriceAlert = require('./PriceAlert');
const EmailTemplate = require('./EmailTemplate');
const Setting = require('./Setting');
const Activity = require('./Activity');
const Airline = require('./Airline');
const Airport = require('./Airport');
const Country = require('./Country');
const City = require('./City');
const Currency = require('./Currency');
const AITemplate = require('./AITemplate');

module.exports = {
  // Core Models
  User,
  Flight,
  Hotel,
  Booking,
  Itinerary,
  Review,
  Destination,
  Package,
  BlogPost,
  
  // New Models
  Session,
  Notification,
  SupportTicket,
  AuditLog,
  Analytics,
  SearchLog,
  PriceAlert,
  EmailTemplate,
  Setting,
  Activity,
  Airline,
  Airport,
  Country,
  City,
  Currency,
  AITemplate
};