# Affordable AI Alternatives (No OpenAI GPT-4)

## 🎯 AI Strategy for Limited Computing Power

### Core Principle: Rule-Based + Simple ML + Open Source Models

Instead of expensive GPT-4 API calls, we'll use a hybrid approach combining:
1. **Rule-based systems** for structured responses
2. **Open-source models** running locally
3. **Simple ML algorithms** for recommendations
4. **Template-based generation** for itineraries

## 🤖 AI Components Implementation

### 1. Trip Planning AI (Rule-Based + Templates)

#### Template-Based Itinerary Generator
```javascript
// Rule-based itinerary generation
class ItineraryGenerator {
  constructor() {
    this.templates = {
      romantic: {
        paris: {
          duration: 5,
          activities: [
            { day: 1, time: '14:00', activity: 'Seine River Cruise', cost: 45 },
            { day: 1, time: '19:00', activity: 'Dinner at Eiffel Tower', cost: 120 },
            { day: 2, time: '10:00', activity: 'Louvre Museum', cost: 25 }
          ]
        }
      },
      adventure: {
        bali: {
          duration: 7,
          activities: [
            { day: 1, time: '09:00', activity: 'Volcano Hiking', cost: 80 },
            { day: 2, time: '06:00', activity: 'Sunrise at Mount Batur', cost: 60 }
          ]
        }
      }
    };
  }

  generateItinerary(prompt, preferences) {
    // Extract keywords from prompt
    const keywords = this.extractKeywords(prompt);
    const destination = this.identifyDestination(keywords);
    const theme = this.identifyTheme(keywords);
    
    // Get base template
    const template = this.templates[theme]?.[destination];
    if (!template) {
      return this.generateGenericItinerary(destination, preferences);
    }
    
    // Customize template based on preferences
    return this.customizeTemplate(template, preferences);
  }

  extractKeywords(prompt) {
    const keywords = prompt.toLowerCase().match(/\b\w+\b/g);
    return keywords || [];
  }

  identifyDestination(keywords) {
    const destinations = {
      paris: ['paris', 'france', 'eiffel'],
      bali: ['bali', 'indonesia', 'ubud'],
      tokyo: ['tokyo', 'japan', 'shibuya'],
      london: ['london', 'uk', 'britain']
    };
    
    for (const [dest, terms] of Object.entries(destinations)) {
      if (terms.some(term => keywords.includes(term))) {
        return dest;
      }
    }
    return 'generic';
  }

  identifyTheme(keywords) {
    const themes = {
      romantic: ['romantic', 'romance', 'couple', 'honeymoon'],
      adventure: ['adventure', 'hiking', 'extreme', 'active'],
      cultural: ['culture', 'museum', 'history', 'art'],
      relaxation: ['relax', 'spa', 'beach', 'peaceful']
    };
    
    for (const [theme, terms] of Object.entries(themes)) {
      if (terms.some(term => keywords.includes(term))) {
        return theme;
      }
    }
    return 'general';
  }
}
```

#### Natural Language Processing (Compromise.js)
```javascript
// Lightweight NLP using Compromise.js (free alternative)
const nlp = require('compromise');

class TravelNLP {
  constructor() {
    this.destinations = ['paris', 'bali', 'tokyo', 'london', 'rome'];
    this.activities = ['museum', 'restaurant', 'beach', 'hiking', 'shopping'];
    this.themes = ['romantic', 'adventure', 'cultural', 'relaxation'];
  }

  parseUserInput(text) {
    const doc = nlp(text);
    
    return {
      destinations: this.extractDestinations(doc),
      activities: this.extractActivities(doc),
      themes: this.extractThemes(doc),
      duration: this.extractDuration(doc),
      budget: this.extractBudget(doc),
      travelers: this.extractTravelers(doc)
    };
  }

  extractDestinations(doc) {
    const places = doc.places().out('array');
    return places.filter(place => 
      this.destinations.includes(place.toLowerCase())
    );
  }

  extractDuration(doc) {
    const numbers = doc.numbers().out('array');
    const timeWords = ['day', 'days', 'week', 'weeks', 'month'];
    
    // Look for patterns like "5 days", "1 week"
    const text = doc.out('text').toLowerCase();
    for (const num of numbers) {
      for (const timeWord of timeWords) {
        if (text.includes(`${num} ${timeWord}`)) {
          return this.convertToDays(num, timeWord);
        }
      }
    }
    return 5; // default
  }

  convertToDays(num, unit) {
    const multipliers = {
      day: 1, days: 1,
      week: 7, weeks: 7,
      month: 30, months: 30
    };
    return parseInt(num) * (multipliers[unit] || 1);
  }
}
```

### 2. Recommendation Engine (Collaborative Filtering)

#### Simple Collaborative Filtering
```javascript
class SimpleRecommendationEngine {
  constructor() {
    this.userPreferences = new Map();
    this.itemSimilarity = new Map();
  }

  // Train on user interaction data
  train(interactions) {
    // interactions: [{ userId, itemId, rating, type }]
    this.buildUserProfiles(interactions);
    this.calculateItemSimilarity(interactions);
  }

  buildUserProfiles(interactions) {
    interactions.forEach(({ userId, itemId, rating, type }) => {
      if (!this.userPreferences.has(userId)) {
        this.userPreferences.set(userId, {});
      }
      
      const userProfile = this.userPreferences.get(userId);
      if (!userProfile[type]) userProfile[type] = {};
      userProfile[type][itemId] = rating;
    });
  }

  calculateItemSimilarity(interactions) {
    // Simple cosine similarity between items
    const items = [...new Set(interactions.map(i => i.itemId))];
    
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const similarity = this.cosineSimilarity(
          this.getItemVector(items[i], interactions),
          this.getItemVector(items[j], interactions)
        );
        
        this.itemSimilarity.set(`${items[i]}-${items[j]}`, similarity);
      }
    }
  }

  getRecommendations(userId, type = 'hotel', limit = 10) {
    const userProfile = this.userPreferences.get(userId);
    if (!userProfile || !userProfile[type]) {
      return this.getPopularItems(type, limit);
    }

    // Find similar users
    const similarUsers = this.findSimilarUsers(userId);
    
    // Get recommendations based on similar users
    const recommendations = this.generateRecommendations(
      userId, similarUsers, type, limit
    );

    return recommendations;
  }

  findSimilarUsers(userId, limit = 5) {
    const targetUser = this.userPreferences.get(userId);
    const similarities = [];

    for (const [otherUserId, otherUser] of this.userPreferences) {
      if (otherUserId === userId) continue;
      
      const similarity = this.calculateUserSimilarity(targetUser, otherUser);
      similarities.push({ userId: otherUserId, similarity });
    }

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  calculateUserSimilarity(user1, user2) {
    // Jaccard similarity for simplicity
    const items1 = new Set(Object.keys(user1.hotel || {}));
    const items2 = new Set(Object.keys(user2.hotel || {}));
    
    const intersection = new Set([...items1].filter(x => items2.has(x)));
    const union = new Set([...items1, ...items2]);
    
    return intersection.size / union.size;
  }
}
```

### 3. Price Prediction (Simple Linear Regression)

#### Basic Price Trend Analysis
```javascript
class SimplePricePrediction {
  constructor() {
    this.priceHistory = new Map();
    this.seasonalFactors = {
      1: 0.8,  // January - low season
      2: 0.8,  // February
      3: 0.9,  // March
      4: 1.1,  // April - high season
      5: 1.2,  // May
      6: 1.3,  // June - peak season
      7: 1.4,  // July - peak season
      8: 1.3,  // August
      9: 1.1,  // September
      10: 1.0, // October
      11: 0.9, // November
      12: 1.2  // December - holidays
    };
  }

  addPriceData(itemId, price, date) {
    if (!this.priceHistory.has(itemId)) {
      this.priceHistory.set(itemId, []);
    }
    
    this.priceHistory.get(itemId).push({
      price,
      date: new Date(date),
      month: new Date(date).getMonth() + 1,
      dayOfWeek: new Date(date).getDay()
    });
  }

  predictPrice(itemId, targetDate) {
    const history = this.priceHistory.get(itemId);
    if (!history || history.length < 3) {
      return null; // Not enough data
    }

    // Calculate base price (average of recent prices)
    const recentPrices = history.slice(-10);
    const basePrice = recentPrices.reduce((sum, p) => sum + p.price, 0) / recentPrices.length;

    // Apply seasonal factor
    const targetMonth = new Date(targetDate).getMonth() + 1;
    const seasonalFactor = this.seasonalFactors[targetMonth];

    // Apply day-of-week factor
    const targetDay = new Date(targetDate).getDay();
    const dayFactor = this.getDayOfWeekFactor(targetDay);

    // Calculate trend
    const trend = this.calculateTrend(history);

    const predictedPrice = basePrice * seasonalFactor * dayFactor * (1 + trend);
    
    return {
      predictedPrice: Math.round(predictedPrice),
      confidence: this.calculateConfidence(history.length),
      factors: {
        basePrice,
        seasonalFactor,
        dayFactor,
        trend
      }
    };
  }

  getDayOfWeekFactor(dayOfWeek) {
    // 0 = Sunday, 6 = Saturday
    const factors = {
      0: 1.1, // Sunday
      1: 0.9, // Monday
      2: 0.9, // Tuesday
      3: 0.9, // Wednesday
      4: 1.0, // Thursday
      5: 1.2, // Friday
      6: 1.1  // Saturday
    };
    return factors[dayOfWeek] || 1.0;
  }

  calculateTrend(history) {
    if (history.length < 5) return 0;

    // Simple linear regression
    const recent = history.slice(-30); // Last 30 data points
    const n = recent.length;
    
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    recent.forEach((point, index) => {
      sumX += index;
      sumY += point.price;
      sumXY += index * point.price;
      sumXX += index * index;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const avgPrice = sumY / n;
    
    return slope / avgPrice; // Normalize by average price
  }

  calculateConfidence(dataPoints) {
    if (dataPoints < 5) return 0.3;
    if (dataPoints < 15) return 0.6;
    if (dataPoints < 30) return 0.8;
    return 0.9;
  }
}
```

### 4. Sentiment Analysis (VADER Sentiment)

#### Simple Sentiment Analysis
```javascript
// Using VADER sentiment (rule-based, no ML training needed)
const vader = require('vader-sentiment');

class ReviewSentimentAnalyzer {
  constructor() {
    this.aspectKeywords = {
      cleanliness: ['clean', 'dirty', 'tidy', 'messy', 'spotless', 'filthy'],
      service: ['staff', 'service', 'helpful', 'rude', 'friendly', 'professional'],
      location: ['location', 'convenient', 'central', 'remote', 'accessible'],
      value: ['price', 'expensive', 'cheap', 'worth', 'value', 'overpriced'],
      comfort: ['comfortable', 'cozy', 'cramped', 'spacious', 'bed', 'room']
    };
  }

  analyzeReview(reviewText) {
    // Overall sentiment
    const overallSentiment = vader.SentimentIntensityAnalyzer.polarity_scores(reviewText);
    
    // Aspect-based sentiment
    const aspectSentiments = this.analyzeAspects(reviewText);
    
    // Extract key phrases
    const keyPhrases = this.extractKeyPhrases(reviewText);
    
    return {
      overall: {
        positive: overallSentiment.pos,
        negative: overallSentiment.neg,
        neutral: overallSentiment.neu,
        compound: overallSentiment.compound,
        sentiment: this.classifySentiment(overallSentiment.compound)
      },
      aspects: aspectSentiments,
      keyPhrases,
      summary: this.generateSummary(overallSentiment, aspectSentiments)
    };
  }

  analyzeAspects(text) {
    const aspects = {};
    const sentences = text.split(/[.!?]+/);
    
    for (const [aspect, keywords] of Object.entries(this.aspectKeywords)) {
      const relevantSentences = sentences.filter(sentence =>
        keywords.some(keyword => 
          sentence.toLowerCase().includes(keyword.toLowerCase())
        )
      );
      
      if (relevantSentences.length > 0) {
        const aspectText = relevantSentences.join('. ');
        const sentiment = vader.SentimentIntensityAnalyzer.polarity_scores(aspectText);
        
        aspects[aspect] = {
          sentiment: this.classifySentiment(sentiment.compound),
          score: sentiment.compound,
          mentions: relevantSentences.length
        };
      }
    }
    
    return aspects;
  }

  classifySentiment(compound) {
    if (compound >= 0.05) return 'positive';
    if (compound <= -0.05) return 'negative';
    return 'neutral';
  }

  extractKeyPhrases(text) {
    // Simple keyword extraction
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'was', 'are', 'were']);
    
    const wordFreq = {};
    words.forEach(word => {
      if (!stopWords.has(word) && word.length > 3) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });
    
    return Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  generateSummary(overall, aspects) {
    const sentiment = this.classifySentiment(overall.compound);
    const strongAspects = Object.entries(aspects)
      .filter(([, data]) => Math.abs(data.score) > 0.3)
      .sort(([, a], [, b]) => Math.abs(b.score) - Math.abs(a.score));
    
    let summary = `Overall ${sentiment} review`;
    
    if (strongAspects.length > 0) {
      const topAspect = strongAspects[0];
      summary += `. Particularly ${topAspect[1].sentiment} about ${topAspect[0]}`;
    }
    
    return summary;
  }
}
```

### 5. Chatbot (Rule-Based + Intent Recognition)

#### Simple Intent-Based Chatbot
```javascript
class TravelChatbot {
  constructor() {
    this.intents = {
      greeting: {
        patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon'],
        responses: [
          'Hello! How can I help you plan your perfect trip today?',
          'Hi there! Ready to explore the world?',
          'Welcome to TravelAI! What adventure are you planning?'
        ]
      },
      flight_search: {
        patterns: ['flight', 'fly', 'plane', 'airline', 'ticket'],
        responses: [
          'I can help you find flights! Where would you like to go?',
          'Looking for flights? Tell me your departure and destination cities.',
          'Let me help you search for the best flight deals!'
        ]
      },
      hotel_search: {
        patterns: ['hotel', 'accommodation', 'stay', 'room', 'lodge'],
        responses: [
          'I can help you find great hotels! Which city are you visiting?',
          'Looking for a place to stay? What\'s your destination?',
          'Let me help you find the perfect accommodation!'
        ]
      },
      itinerary: {
        patterns: ['itinerary', 'plan', 'trip', 'vacation', 'holiday'],
        responses: [
          'I\'d love to help plan your trip! Tell me about your dream destination.',
          'Let\'s create an amazing itinerary! Where do you want to go?',
          'Trip planning is my specialty! What kind of experience are you looking for?'
        ]
      },
      price: {
        patterns: ['price', 'cost', 'expensive', 'cheap', 'budget'],
        responses: [
          'I can help you find options within your budget. What\'s your price range?',
          'Let me find the best deals for you! What\'s your budget?',
          'Budget-friendly options are available! Tell me your preferred price range.'
        ]
      }
    };
    
    this.context = new Map(); // Store conversation context per user
  }

  processMessage(userId, message) {
    const intent = this.detectIntent(message);
    const entities = this.extractEntities(message);
    
    // Update context
    this.updateContext(userId, intent, entities);
    
    // Generate response
    const response = this.generateResponse(userId, intent, entities);
    
    return {
      response,
      intent,
      entities,
      suggestions: this.getSuggestions(intent)
    };
  }

  detectIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    for (const [intentName, intentData] of Object.entries(this.intents)) {
      for (const pattern of intentData.patterns) {
        if (lowerMessage.includes(pattern)) {
          return intentName;
        }
      }
    }
    
    return 'unknown';
  }

  extractEntities(message) {
    const entities = {};
    
    // Extract cities (simple pattern matching)
    const cities = ['paris', 'london', 'tokyo', 'new york', 'bali', 'rome'];
    const foundCities = cities.filter(city => 
      message.toLowerCase().includes(city)
    );
    if (foundCities.length > 0) {
      entities.cities = foundCities;
    }
    
    // Extract dates (simple regex)
    const datePattern = /\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\d{4}-\d{2}-\d{2}\b/g;
    const dates = message.match(datePattern);
    if (dates) {
      entities.dates = dates;
    }
    
    // Extract numbers (for budget, travelers, etc.)
    const numbers = message.match(/\b\d+\b/g);
    if (numbers) {
      entities.numbers = numbers.map(n => parseInt(n));
    }
    
    return entities;
  }

  generateResponse(userId, intent, entities) {
    const intentData = this.intents[intent];
    
    if (!intentData) {
      return "I'm not sure I understand. Could you please rephrase that? I can help you with flights, hotels, and trip planning!";
    }
    
    // Get random response from intent
    const baseResponse = intentData.responses[
      Math.floor(Math.random() * intentData.responses.length)
    ];
    
    // Personalize based on entities
    return this.personalizeResponse(baseResponse, entities);
  }

  personalizeResponse(response, entities) {
    if (entities.cities && entities.cities.length > 0) {
      const city = entities.cities[0];
      response += ` I see you're interested in ${city}!`;
    }
    
    if (entities.numbers && entities.numbers.length > 0) {
      const budget = entities.numbers.find(n => n > 100); // Assume budget
      if (budget) {
        response += ` With a budget around $${budget}, I can find great options for you.`;
      }
    }
    
    return response;
  }

  getSuggestions(intent) {
    const suggestions = {
      greeting: ['Search flights', 'Find hotels', 'Plan a trip'],
      flight_search: ['Round trip', 'One way', 'Multi-city'],
      hotel_search: ['Budget hotels', 'Luxury resorts', 'Family-friendly'],
      itinerary: ['Weekend getaway', '1-week vacation', 'Custom trip'],
      unknown: ['Search flights', 'Find hotels', 'Get help']
    };
    
    return suggestions[intent] || suggestions.unknown;
  }
}
```

## 💰 Cost Comparison

### Traditional AI (GPT-4) vs Our Approach

| Component | GPT-4 Cost | Our Approach | Monthly Savings |
|-----------|------------|--------------|-----------------|
| Itinerary Generation | $500-1000 | $0 (templates) | $500-1000 |
| Recommendations | $200-400 | $50 (compute) | $150-350 |
| Sentiment Analysis | $100-200 | $0 (VADER) | $100-200 |
| Chatbot | $300-600 | $0 (rule-based) | $300-600 |
| **Total Monthly** | **$1100-2200** | **$50** | **$1050-2150** |

## 🚀 Implementation Timeline

### Phase 1: Rule-Based Systems (Week 1-2)
- Template-based itinerary generator
- Simple chatbot with intent recognition
- Basic sentiment analysis

### Phase 2: Simple ML (Week 3-4)
- Collaborative filtering recommendations
- Price prediction with linear regression
- Enhanced NLP with Compromise.js

### Phase 3: Optimization (Week 5-6)
- Performance tuning
- Cache implementation
- User feedback integration

## 📊 Performance Expectations

### Accuracy Comparison
- **GPT-4 Itineraries**: 90-95% user satisfaction
- **Our Templates**: 75-85% user satisfaction (with good templates)
- **GPT-4 Recommendations**: 85-90% relevance
- **Our Collaborative Filtering**: 70-80% relevance

### Response Times
- **Template Generation**: <100ms
- **Recommendations**: <200ms
- **Sentiment Analysis**: <50ms
- **Chatbot**: <100ms

The trade-off is acceptable for a budget-conscious implementation, and accuracy can improve over time with more data and template refinement.