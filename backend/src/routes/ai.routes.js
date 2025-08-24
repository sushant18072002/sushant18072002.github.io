const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const aiItineraryService = require('../services/aiItineraryService');
const { Itinerary } = require('../models');

// Generate AI trip
router.post('/generate-trip', auth, async (req, res) => {
  try {
    const {
      destination,
      duration,
      budget,
      travelers,
      interests,
      travelStyle,
      startDate
    } = req.body;

    // Validate required fields
    if (!destination || !duration || !budget || !startDate) {
      return res.status(400).json({
        success: false,
        error: { message: 'Missing required fields: destination, duration, budget, startDate' }
      });
    }

    // Generate AI itinerary
    const aiItinerary = await aiItineraryService.generateItinerary({
      destination,
      duration,
      budget,
      travelers: travelers || 1,
      interests: interests || ['sightseeing'],
      travelStyle: travelStyle || 'balanced',
      startDate
    });

    // Save to database
    const itinerary = new Itinerary({
      title: `AI Trip to ${aiItinerary.destination}`,
      description: `${duration}-day AI-generated itinerary`,
      user: req.user._id,
      type: 'ai-generated',
      destination: {
        primary: destination
      },
      duration: {
        days: duration,
        nights: duration - 1
      },
      dates: {
        startDate: new Date(startDate),
        endDate: new Date(new Date(startDate).getTime() + (duration - 1) * 24 * 60 * 60 * 1000)
      },
      travelers: {
        total: travelers || 1,
        adults: travelers || 1
      },
      budget: {
        total: budget,
        perPerson: budget / (travelers || 1),
        currency: aiItinerary.currency
      },
      preferences: {
        travelStyle,
        interests
      },
      days: aiItinerary.days,
      recommendations: aiItinerary.recommendations,
      aiGeneration: {
        prompt: JSON.stringify(req.body),
        model: 'custom-ai-v1',
        generatedAt: new Date()
      }
    });

    await itinerary.save();

    res.json({
      success: true,
      data: {
        itinerary,
        aiData: aiItinerary
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Customize AI itinerary
router.put('/itinerary/:id/customize', auth, async (req, res) => {
  try {
    const { modifications } = req.body;
    
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        error: { message: 'Itinerary not found' }
      });
    }

    // Apply modifications
    modifications.forEach(mod => {
      if (mod.type === 'activity') {
        const day = itinerary.days.find(d => d.day === mod.day);
        if (day) {
          const activity = day.activities.find(a => a.id === mod.activityId);
          if (activity) {
            Object.assign(activity, mod.changes);
            
            // Track customization
            itinerary.aiGeneration.customizations.push({
              type: 'activity_modified',
              original: JSON.stringify(activity),
              modified: JSON.stringify(mod.changes),
              modifiedAt: new Date()
            });
          }
        }
      }
    });

    await itinerary.save();

    res.json({
      success: true,
      data: { itinerary }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Get AI suggestions for improvements
router.post('/itinerary/:id/suggestions', auth, async (req, res) => {
  try {
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('destination.primary');

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        error: { message: 'Itinerary not found' }
      });
    }

    // Generate AI suggestions based on current itinerary
    const suggestions = await aiItineraryService.generateSuggestions(itinerary);

    res.json({
      success: true,
      data: { suggestions }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// AI chat for travel planning
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, context } = req.body;

    // Simple AI chat response (would integrate with actual AI service)
    const response = await generateChatResponse(message, context);

    res.json({
      success: true,
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Get AI templates
router.get('/templates', auth, async (req, res) => {
  try {
    const { AITemplate } = require('../models');
    const templates = await AITemplate.find({ isActive: true, isPublic: true })
      .select('name category description duration budget destinations')
      .sort({ 'metadata.popularity': -1 });
    
    res.json({ success: true, data: { templates } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Refine itinerary
router.post('/refine-itinerary', auth, async (req, res) => {
  try {
    const { itineraryId, refinements } = req.body;
    
    const itinerary = await Itinerary.findOne({
      _id: itineraryId,
      user: req.user._id
    });

    if (!itinerary) {
      return res.status(404).json({ success: false, error: { message: 'Itinerary not found' } });
    }

    // Apply refinements
    refinements.forEach(refinement => {
      if (refinement.type === 'budget_adjustment') {
        itinerary.budget.total = refinement.newBudget;
      } else if (refinement.type === 'activity_replacement') {
        const day = itinerary.days.find(d => d.day === refinement.day);
        if (day) {
          const activityIndex = day.activities.findIndex(a => a.id === refinement.oldActivityId);
          if (activityIndex !== -1) {
            day.activities[activityIndex] = refinement.newActivity;
          }
        }
      }
    });

    await itinerary.save();
    res.json({ success: true, data: { itinerary } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Helper function for chat (placeholder)
async function generateChatResponse(message, context) {
  const responses = {
    'budget': 'For budget travel, I recommend staying in hostels, eating at local restaurants, and using public transportation. What\'s your daily budget range?',
    'activities': 'Based on your interests, I suggest visiting museums in the morning, exploring local markets in the afternoon, and enjoying nightlife in the evening. What activities interest you most?',
    'weather': 'The weather can greatly impact your trip. Let me help you plan according to the season. When are you planning to travel?',
    'default': 'I\'d be happy to help you plan your trip! Could you tell me more about your destination, budget, and travel preferences?'
  };

  const key = Object.keys(responses).find(k => message.toLowerCase().includes(k)) || 'default';
  return responses[key];
}

module.exports = router;