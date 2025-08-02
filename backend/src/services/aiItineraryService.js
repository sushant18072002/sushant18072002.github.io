const { Destination, Activity, Hotel, Flight, Itinerary } = require('../models');

class AIItineraryService {
  // Generate AI-powered itinerary
  async generateItinerary(preferences) {
    try {
      const {
        destination,
        duration,
        budget,
        travelers,
        interests,
        travelStyle,
        startDate
      } = preferences;

      // Get destination data
      const destinationData = await Destination.findById(destination)
        .populate('cities')
        .populate('topAttractions');

      if (!destinationData) {
        throw new Error('Destination not found');
      }

      // Generate day-by-day itinerary
      const itinerary = await this.createDayByDayPlan({
        destination: destinationData,
        duration,
        budget,
        travelers,
        interests,
        travelStyle,
        startDate: new Date(startDate)
      });

      return itinerary;
    } catch (error) {
      throw new Error(`AI Itinerary Generation failed: ${error.message}`);
    }
  }

  // Create detailed day-by-day plan
  async createDayByDayPlan(params) {
    const { destination, duration, budget, interests, travelStyle, startDate } = params;
    const days = [];

    // Get activities based on interests
    const activities = await Activity.find({
      destination: destination._id,
      tags: { $in: interests },
      status: 'active'
    }).sort({ rating: -1 });

    // Budget allocation per day
    const dailyBudget = budget / duration;

    for (let dayNum = 1; dayNum <= duration; dayNum++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + dayNum - 1);

      const dayPlan = await this.generateDayPlan({
        dayNumber: dayNum,
        date: currentDate,
        destination,
        activities,
        dailyBudget,
        travelStyle,
        interests
      });

      days.push(dayPlan);
    }

    // Calculate total estimated cost
    const totalCost = days.reduce((sum, day) => 
      sum + day.activities.reduce((daySum, activity) => daySum + (activity.cost || 0), 0), 0
    );

    return {
      destination: destination.name,
      duration,
      totalCost,
      currency: 'USD',
      days,
      recommendations: await this.generateRecommendations(destination, travelStyle),
      tips: await this.generateTravelTips(destination)
    };
  }

  // Generate plan for a single day
  async generateDayPlan(params) {
    const { dayNumber, date, destination, activities, dailyBudget, travelStyle, interests } = params;

    // Select activities based on day and preferences
    const dayActivities = this.selectActivitiesForDay({
      dayNumber,
      activities,
      dailyBudget,
      travelStyle,
      interests
    });

    // Create time-based schedule
    const schedule = this.createTimeSchedule(dayActivities, travelStyle);

    return {
      day: dayNumber,
      date,
      theme: this.getDayTheme(dayNumber, destination),
      activities: schedule,
      estimatedCost: schedule.reduce((sum, activity) => sum + (activity.cost || 0), 0),
      tips: this.getDayTips(dayNumber, travelStyle)
    };
  }

  // Select appropriate activities for the day
  selectActivitiesForDay({ dayNumber, activities, dailyBudget, travelStyle, interests }) {
    const selectedActivities = [];
    let remainingBudget = dailyBudget;

    // Day 1: Arrival and orientation
    if (dayNumber === 1) {
      selectedActivities.push({
        type: 'arrival',
        title: 'Arrival and Check-in',
        description: 'Arrive at destination and check into accommodation',
        duration: 120,
        cost: 0
      });

      selectedActivities.push({
        type: 'orientation',
        title: 'City Orientation Walk',
        description: 'Get familiar with the area around your accommodation',
        duration: 90,
        cost: 0
      });
    }

    // Select main activities based on interests and budget
    const availableActivities = activities.filter(activity => 
      activity.price <= remainingBudget * 0.7 // Reserve 30% for meals and transport
    );

    // Prioritize by travel style
    const prioritizedActivities = this.prioritizeByTravelStyle(availableActivities, travelStyle);

    // Add 2-3 main activities per day
    const mainActivities = prioritizedActivities.slice(0, travelStyle === 'relaxed' ? 2 : 3);
    
    mainActivities.forEach(activity => {
      selectedActivities.push({
        type: 'attraction',
        title: activity.name,
        description: activity.description,
        duration: activity.duration || 120,
        cost: activity.price || 0,
        location: activity.location,
        rating: activity.rating,
        tags: activity.tags
      });
      remainingBudget -= activity.price || 0;
    });

    // Add meals
    selectedActivities.push(...this.addMeals(remainingBudget, travelStyle));

    return selectedActivities;
  }

  // Create time-based schedule
  createTimeSchedule(activities, travelStyle) {
    const schedule = [];
    let currentTime = travelStyle === 'relaxed' ? 9 : 8; // Start time (24h format)

    activities.forEach(activity => {
      const startTime = this.formatTime(currentTime);
      const endTime = this.formatTime(currentTime + (activity.duration / 60));

      schedule.push({
        ...activity,
        startTime,
        endTime,
        duration: activity.duration
      });

      currentTime += (activity.duration / 60) + 0.5; // Add 30min buffer
    });

    return schedule.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  // Prioritize activities by travel style
  prioritizeByTravelStyle(activities, travelStyle) {
    switch (travelStyle) {
      case 'adventure':
        return activities.filter(a => a.tags?.includes('adventure')).concat(
          activities.filter(a => !a.tags?.includes('adventure'))
        );
      case 'cultural':
        return activities.filter(a => a.tags?.includes('cultural')).concat(
          activities.filter(a => !a.tags?.includes('cultural'))
        );
      case 'relaxed':
        return activities.filter(a => a.tags?.includes('relaxation')).concat(
          activities.filter(a => !a.tags?.includes('relaxation'))
        );
      case 'luxury':
        return activities.sort((a, b) => (b.price || 0) - (a.price || 0));
      default:
        return activities.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
  }

  // Add meal suggestions
  addMeals(budget, travelStyle) {
    const mealBudget = budget * 0.4; // 40% of remaining budget for meals
    const meals = [];

    const mealTypes = [
      { type: 'breakfast', time: 8, cost: mealBudget * 0.2 },
      { type: 'lunch', time: 13, cost: mealBudget * 0.4 },
      { type: 'dinner', time: 19, cost: mealBudget * 0.4 }
    ];

    mealTypes.forEach(meal => {
      meals.push({
        type: 'meal',
        title: this.getMealSuggestion(meal.type, travelStyle),
        description: `Recommended ${meal.type} based on your travel style`,
        duration: meal.type === 'dinner' ? 90 : 60,
        cost: meal.cost,
        mealType: meal.type
      });
    });

    return meals;
  }

  // Generate recommendations
  async generateRecommendations(destination, travelStyle) {
    const recommendations = {
      accommodation: await this.getAccommodationRecommendations(destination, travelStyle),
      restaurants: await this.getRestaurantRecommendations(destination, travelStyle),
      transportation: this.getTransportationRecommendations(destination, travelStyle),
      packing: this.getPackingRecommendations(destination),
      budgetTips: this.getBudgetTips(travelStyle)
    };

    return recommendations;
  }

  // Generate travel tips
  async generateTravelTips(destination) {
    return [
      `Best time to visit ${destination.name} is during ${destination.climate?.bestTimeToVisit?.description || 'peak season'}`,
      `Local currency is ${destination.costs?.currency || 'USD'}`,
      `Average daily budget ranges from $${destination.costs?.budgetPerDay?.budget || 50} to $${destination.costs?.budgetPerDay?.luxury || 200}`,
      'Book accommodations in advance during peak season',
      'Learn basic local phrases for better experience',
      'Keep copies of important documents',
      'Check visa requirements before travel'
    ];
  }

  // Helper methods
  getDayTheme(dayNumber, destination) {
    const themes = [
      'Arrival & Orientation',
      'Cultural Exploration',
      'Adventure & Activities',
      'Local Experiences',
      'Relaxation & Leisure',
      'Hidden Gems',
      'Departure Preparation'
    ];
    return themes[Math.min(dayNumber - 1, themes.length - 1)];
  }

  getDayTips(dayNumber, travelStyle) {
    const tips = {
      1: ['Take it easy on your first day', 'Stay hydrated', 'Get familiar with local transport'],
      2: ['Start early to avoid crowds', 'Try local breakfast', 'Carry a map or download offline maps'],
      3: ['Book popular attractions in advance', 'Wear comfortable shoes', 'Bring a portable charger']
    };
    return tips[dayNumber] || ['Enjoy your day', 'Stay safe', 'Make memories'];
  }

  getMealSuggestion(mealType, travelStyle) {
    const suggestions = {
      breakfast: {
        luxury: 'Fine dining hotel breakfast',
        cultural: 'Traditional local breakfast',
        adventure: 'Quick café breakfast',
        relaxed: 'Leisurely brunch spot'
      },
      lunch: {
        luxury: 'Michelin-starred restaurant',
        cultural: 'Authentic local cuisine',
        adventure: 'Street food exploration',
        relaxed: 'Scenic restaurant with view'
      },
      dinner: {
        luxury: 'Exclusive fine dining',
        cultural: 'Traditional dinner show',
        adventure: 'Local night market',
        relaxed: 'Romantic waterfront dining'
      }
    };
    return suggestions[mealType][travelStyle] || `Local ${mealType} spot`;
  }

  async getAccommodationRecommendations(destination, travelStyle) {
    const hotels = await Hotel.find({
      'location.city': { $in: destination.cities },
      status: 'active'
    }).limit(3).sort({ 'rating.overall': -1 });

    return hotels.map(hotel => ({
      name: hotel.name,
      rating: hotel.rating.overall,
      priceRange: hotel.pricing?.priceRange,
      reason: this.getAccommodationReason(hotel, travelStyle)
    }));
  }

  getAccommodationReason(hotel, travelStyle) {
    const reasons = {
      luxury: 'Premium amenities and service',
      cultural: 'Authentic local experience',
      adventure: 'Great location for activities',
      relaxed: 'Peaceful and comfortable'
    };
    return reasons[travelStyle] || 'Highly rated by travelers';
  }

  async getRestaurantRecommendations(destination, travelStyle) {
    // This would integrate with a restaurant database
    return [
      { name: 'Local Favorite Restaurant', cuisine: 'Traditional', priceRange: '$$' },
      { name: 'Popular Tourist Spot', cuisine: 'International', priceRange: '$$$' },
      { name: 'Hidden Gem Café', cuisine: 'Fusion', priceRange: '$' }
    ];
  }

  getTransportationRecommendations(destination, travelStyle) {
    return [
      'Use public transportation for authentic experience',
      'Consider ride-sharing for convenience',
      'Walking is great for exploring neighborhoods',
      'Rent a bike for eco-friendly travel'
    ];
  }

  getPackingRecommendations(destination) {
    return [
      'Comfortable walking shoes',
      'Weather-appropriate clothing',
      'Portable charger and adapters',
      'First aid kit and medications',
      'Travel insurance documents'
    ];
  }

  getBudgetTips(travelStyle) {
    const tips = {
      luxury: ['Book experiences in advance', 'Consider package deals', 'Use concierge services'],
      budget: ['Eat at local places', 'Use public transport', 'Look for free activities'],
      cultural: ['Visit museums on free days', 'Join walking tours', 'Stay in local neighborhoods'],
      adventure: ['Book group activities', 'Bring your own gear', 'Look for combo deals']
    };
    return tips[travelStyle] || tips.budget;
  }

  formatTime(hour) {
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }
}

module.exports = new AIItineraryService();