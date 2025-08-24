const { SupportTicket } = require('../models');

const createTicket = async (req, res) => {
  try {
    const { subject, category, message, priority = 'medium' } = req.body;
    
    const ticketNumber = 'TK' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
    
    const ticket = await SupportTicket.create({
      ticketNumber,
      userId: req.user._id,
      subject,
      category,
      priority,
      messages: [{
        sender: req.user._id,
        senderType: 'customer',
        message
      }]
    });

    await ticket.populate('userId', 'email profile.firstName profile.lastName');

    res.status(201).json({ success: true, data: { ticket } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const getUserTickets = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { userId: req.user._id };
    if (status) query.status = status;

    const tickets = await SupportTicket.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SupportTicket.countDocuments(query);

    res.json({
      success: true,
      data: {
        tickets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const getTicketDetails = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('userId', 'email profile.firstName profile.lastName')
      .populate('assignedTo', 'profile.firstName profile.lastName')
      .populate('messages.sender', 'profile.firstName profile.lastName');

    if (!ticket) {
      return res.status(404).json({ success: false, error: { message: 'Ticket not found' } });
    }

    if (ticket.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: { message: 'Access denied' } });
    }

    res.json({ success: true, data: { ticket } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const updateTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, error: { message: 'Ticket not found' } });
    }

    if (ticket.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: { message: 'Access denied' } });
    }

    const updatedTicket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: { ticket: updatedTicket } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const addTicketMessage = async (req, res) => {
  try {
    const { message } = req.body;
    
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, error: { message: 'Ticket not found' } });
    }

    if (ticket.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: { message: 'Access denied' } });
    }

    ticket.messages.push({
      sender: req.user._id,
      senderType: req.user.role === 'admin' ? 'admin' : 'customer',
      message
    });

    await ticket.save();
    await ticket.populate('messages.sender', 'profile.firstName profile.lastName');

    res.json({ success: true, data: { ticket } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const getFAQ = async (req, res) => {
  try {
    const faq = [
      {
        id: 1,
        category: 'Booking',
        question: 'How can I cancel my booking?',
        answer: 'You can cancel your booking from your dashboard or contact our support team.'
      },
      {
        id: 2,
        category: 'Payment',
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards, PayPal, and bank transfers.'
      },
      {
        id: 3,
        category: 'Travel',
        question: 'Can I modify my travel dates?',
        answer: 'Yes, you can modify your travel dates subject to availability and fare rules.'
      },
      {
        id: 4,
        category: 'Account',
        question: 'How do I reset my password?',
        answer: 'Click on "Forgot Password" on the login page and follow the instructions.'
      }
    ];

    res.json({ success: true, data: { faq } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

module.exports = {
  createTicket,
  getUserTickets,
  getTicketDetails,
  updateTicket,
  addTicketMessage,
  getFAQ
};