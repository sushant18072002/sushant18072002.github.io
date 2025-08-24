const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { auth } = require('../middleware/auth');

router.post('/tickets', auth, supportController.createTicket);
router.get('/tickets', auth, supportController.getUserTickets);
router.get('/tickets/:id', auth, supportController.getTicketDetails);
router.put('/tickets/:id', auth, supportController.updateTicket);
router.post('/tickets/:id/messages', auth, supportController.addTicketMessage);
router.get('/faq', supportController.getFAQ);

module.exports = router;