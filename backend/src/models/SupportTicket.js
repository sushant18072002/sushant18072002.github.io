const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  ticketNumber: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['booking_issue', 'payment_problem', 'technical_support', 'general_inquiry', 'complaint', 'refund_request'],
    required: true 
  },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: { 
    type: String, 
    enum: ['open', 'in_progress', 'waiting_customer', 'resolved', 'closed'], 
    default: 'open' 
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin user
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderType: { type: String, enum: ['customer', 'admin'], required: true },
    message: { type: String, required: true },
    attachments: [String],
    timestamp: { type: Date, default: Date.now }
  }],
  relatedBooking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  tags: [String],
  resolution: {
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date,
    resolutionNote: String,
    customerSatisfaction: { type: Number, min: 1, max: 5 }
  }
}, { timestamps: true });

supportTicketSchema.index({ userId: 1, status: 1, createdAt: -1 });
supportTicketSchema.index({ ticketNumber: 1 });
supportTicketSchema.index({ assignedTo: 1, status: 1 });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);