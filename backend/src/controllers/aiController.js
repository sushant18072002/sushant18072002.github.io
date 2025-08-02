const { Itinerary } = require('../models');

// Template-based AI system (budget-friendly alternative to GPT-4)
const templates = {
  romantic: {
    paris: {
      duration: 5,
      activities: [
        { time: '14:00', title: 'Seine River Cruise', cost: 45, duration: 120 },
        { time: '19:00', title: 'Dinner at Eiffel Tower', cost: 120, duration: 180 },
        { time: '10:00', title: 'Louvre Museum', cost: 25, duration: 180 }
      ]
    },
    bali: {
      duration: 7,
      activities: [
        { time: '09:00', title: 'Sunrise at Mount Batur', cost: 60, duration: 240 },
        { time: '15:00', title: 'Couples Spa Treatment', cost: 80, duration: 120 }
      ]
    }
  },
  adventure: {
    nepal: {
      duration: 10,
      activities: [
        { time: '06:00', title: 'Everest Base Camp Trek', cost: 200, duration: 480 },
        { time: '14:00', title: 'Mountain Climbing', cost: 150, duration: 300 }
      ]
    }
  },
  cultural: {
    japan: {
      duration: 8,
      activities: [
        { time: '09:00', title: 'Temple Visit', cost: 15, duration: 120 },
        { time: '14:00', title: 'Tea Ceremony', cost: 40, duration: 90 }
      ]
    }
  }
};

const extractKeywords = (prompt) => {
  return prompt.toLowerCase().match(/\b\w+\b/g) || [];
};

const identifyDestination = (keywords) => {
  const destinations = {
    paris: ['paris', 'france', 'eiffel'],
    bali: ['bali', 'indonesia', 'ubud'],
    nepal: ['nepal', 'everest', 'himalaya'],
    japan: ['japan', 'tokyo', 'kyoto']
  };
  
  for (const [dest, terms] of Object.entries(destinations)) {
    if (terms.some(term => keywords.includes(term))) {
      return dest;
    }
  }
  return 'generic';
};

const identifyTheme = (keywords) => {
  const themes = {
    romantic: ['romantic', 'romance', 'couple', 'honeymoon'],
    adventure: ['adventure', 'hiking', 'extreme', 'active'],
    cultural: ['culture', 'museum', 'history', 'art']
  };
  
  for (const [theme, terms] of Object.entries(themes)) {
    if (terms.some(term => keywords.includes(term))) {
      return theme;
    }
  }
  return 'cultural';
};

const generateItinerary = async (req, res) => {
  try {
    const { prompt, preferences = {} } = req.body;
    
    const keywords = extractKeywords(prompt);
    const destination = identifyDestination(keywords);
    const theme = identifyTheme(keywords);
    
    const template = templates[theme]?.[destination];
    
    if (!template) {
      return res.status(400).json({
        success: false,
        error: 'Unable to generate itinerary for this destination/theme combination'
      });
    }

    const duration = preferences.duration || template.duration;
    const budget = preferences.budget || 'mid-range';
    
    // Generate days based on template
    const days = [];
    for (let i = 1; i <= duration; i++) {
      const dayActivities = template.activities.slice(0, 2); // Limit activities per day
      days.push({
        day: i,
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        activities: dayActivities.map(activity => ({
          ...activity,
          location: { name: `${destination} attraction`, coordinates: [0, 0] }
        }))
      });
    }

    const totalCost = days.reduce((sum, day) => 
      sum + day.activities.reduce((daySum, activity) => daySum + activity.cost, 0), 0
    );

    const itinerary = {
      title: `${theme.charAt(0).toUpperCase() + theme.slice(1)} ${destination.charAt(0).toUpperCase() + destination.slice(1)} Trip`,
      type: 'ai-generated',
      destination: { primary: destination },
      duration: { days: duration, nights: duration - 1 },
      budget: { estimated: totalCost, currency: 'USD', range: budget },
      days,
      status: 'draft'
    };

    res.json({
      success: true,
      data: { itinerary }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const saveGeneratedItinerary = async (req, res) => {
  try {
    const itineraryData = {
      ...req.body,
      userId: req.user.id,
      type: 'ai-generated'
    };

    const itinerary = await Itinerary.create(itineraryData);
    res.status(201).json({ success: true, data: { itinerary } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const refineItinerary = async (req, res) => {
  try {
    const { itineraryId, changes } = req.body;
    
    const itinerary = await Itinerary.findById(itineraryId);
    if (!itinerary) {
      return res.status(404).json({ success: false, error: 'Itinerary not found' });
    }

    if (itinerary.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Apply changes based on refinement requests
    for (const change of changes) {
      if (change.type === 'replace_activity') {
        const day = itinerary.days.find(d => d.day === change.day);
        if (day) {
          const activityIndex = day.activities.findIndex(a => a.title.includes(change.activityId));
          if (activityIndex !== -1) {
            day.activities[activityIndex].title = change.newActivity;
          }
        }
      }
    }

    await itinerary.save();
    res.json({ success: true, data: { itinerary } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getRecommendations = async (req, res) => {
  try {
    const { destination, interests = [] } = req.query;
    
    // Simple recommendation based on destination and interests
    const recommendations = {
      activities: [
        { name: 'Local Food Tour', rating: 4.8, cost: 50 },
        { name: 'Historical Walking Tour', rating: 4.6, cost: 30 },
        { name: 'Sunset Photography', rating: 4.7, cost: 25 }
      ],
      restaurants: [
        { name: 'Local Cuisine Restaurant', rating: 4.5, priceRange: '$$' },
        { name: 'Fine Dining Experience', rating: 4.9, priceRange: '$$$' }
      ]
    };

    res.json({ success: true, data: recommendations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getTemplates = async (req, res) => {
  try {
    const { destination, theme } = req.query;
    
    let availableTemplates = [];
    
    if (destination && theme) {
      const template = templates[theme]?.[destination];
      if (template) {
        availableTemplates.push({
          id: `${theme}-${destination}`,
          title: `${theme.charAt(0).toUpperCase() + theme.slice(1)} ${destination.charAt(0).toUpperCase() + destination.slice(1)}`,
          duration: template.duration,
          theme,
          destination,
          rating: 4.5,
          usageCount: Math.floor(Math.random() * 1000)
        });
      }
    } else {
      // Return all available templates
      for (const [themeKey, destinations] of Object.entries(templates)) {
        for (const [destKey, template] of Object.entries(destinations)) {
          availableTemplates.push({
            id: `${themeKey}-${destKey}`,
            title: `${themeKey.charAt(0).toUpperCase() + themeKey.slice(1)} ${destKey.charAt(0).toUpperCase() + destKey.slice(1)}`,
            duration: template.duration,
            theme: themeKey,
            destination: destKey,
            rating: 4.5,
            usageCount: Math.floor(Math.random() * 1000)
          });
        }
      }
    }

    res.json({ success: true, data: { templates: availableTemplates } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  generateItinerary,
  saveGeneratedItinerary,
  refineItinerary,
  getRecommendations,
  getTemplates
};