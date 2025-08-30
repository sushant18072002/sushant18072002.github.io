const express = require('express');
const router = express.Router();

// Search airports
router.get('/search', async (req, res) => {
  try {
    const { Airport } = require('../models');
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({ 
        success: false, 
        error: { message: 'Query must be at least 2 characters' } 
      });
    }
    
    const airports = await Airport.find({
      $or: [
        { code: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
        { city: { $regex: q, $options: 'i' } }
      ]
    }).limit(10);
    
    res.json({ success: true, data: { airports } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Get single airport
router.get('/:id', async (req, res) => {
  try {
    const { Airport } = require('../models');
    const airport = await Airport.findById(req.params.id);
    
    if (!airport) {
      return res.status(404).json({ success: false, error: { message: 'Airport not found' } });
    }
    
    res.json({ success: true, data: { airport } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

module.exports = router;