const express = require('express');
const router = express.Router();

// Search locations (cities/destinations)
router.get('/search', async (req, res) => {
  try {
    const { City } = require('../models');
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({ 
        success: false, 
        error: { message: 'Query must be at least 2 characters' } 
      });
    }
    
    const locations = await City.find({
      name: { $regex: q, $options: 'i' }
    }).populate('country', 'name').limit(10);
    
    // Format response to include country name
    const formattedLocations = locations.map(city => ({
      _id: city._id,
      name: city.name,
      country: city.country?.name || 'Unknown',
      type: 'city'
    }));
    
    res.json({ success: true, data: { locations: formattedLocations } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

module.exports = router;