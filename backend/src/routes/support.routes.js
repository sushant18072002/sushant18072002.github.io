const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { auth } = require('../middleware/auth');
const { validateSupportTicket } = require('../middleware/validation');

// @desc    Create support ticket
// @route   POST /api/v1/support/tickets
// @access  Private
router.post('/tickets', auth, validateSupportTicket, supportController.createTicket);

// @desc    Get user tickets
// @route   GET /api/v1/support/tickets
// @access  Private
router.get('/tickets', auth, supportController.getUserTickets);

// @desc    Get ticket details
// @route   GET /api/v1/support/tickets/:id
// @access  Private
router.get('/tickets/:id', auth, supportController.getTicketDetails);

// @desc    Update ticket
// @route   PUT /api/v1/support/tickets/:id
// @access  Private
router.put('/tickets/:id', auth, supportController.updateTicket);

// @desc    Add message to ticket
// @route   POST /api/v1/support/tickets/:id/messages
// @access  Private
router.post('/tickets/:id/messages', auth, supportController.addTicketMessage);

// @desc    Get FAQ
// @route   GET /api/v1/support/faq
// @access  Public
router.get('/faq', supportController.getFAQ);

module.exports = router;