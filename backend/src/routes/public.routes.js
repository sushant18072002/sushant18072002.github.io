const express = require('express');
const router = express.Router();

// Hotel public routes
router.get('/hotels/popular-destinations', async (req, res) => {
  try {
    const { Hotel } = require('../models');
    const destinations = await Hotel.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$location.city', count: { $sum: 1 }, avgPrice: { $avg: '$pricing.averageNightlyRate' } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);
    res.json({ success: true, data: { destinations } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.get('/hotels/deals', async (req, res) => {
  try {
    const { Hotel } = require('../models');
    const deals = await Hotel.find({ status: 'active', featured: true }).limit(6);
    res.json({ success: true, data: { deals } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});



module.exports = router;