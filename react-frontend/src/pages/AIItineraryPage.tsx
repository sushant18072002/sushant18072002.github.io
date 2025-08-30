import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const AIItineraryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiResults, setAiResults] = useState<any[]>([]);
  const [conversation, setConversation] = useState<any[]>([]);
  const [userInput, setUserInput] = useState('');
  
  // Extract parameters from URL
  const initialData = {
    description: searchParams.get('description') || '',
    destination: searchParams.get('destination') || '',
    type: searchParams.get('type') || '',
    date: searchParams.get('date') || '',
    travelers: searchParams.get('travelers') || 'couple',
    budget: searchParams.get('budget') || 'mid-range'
  };

  useEffect(() => {
    // If coming from home page with parameters, start AI conversation
    if (initialData.description || initialData.destination) {
      startAIConversation();
    }
  }, []);

  const startAIConversation = async () => {
    setCurrentStep(2);
    setLoading(true);
    
    // Create initial AI message based on user input
    const welcomeMessage = createWelcomeMessage();
    setConversation([welcomeMessage]);
    
    // Simulate AI thinking time
    setTimeout(() => {
      setLoading(false);
      askFollowUpQuestion();
    }, 2000);
  };
  
  const createWelcomeMessage = () => {
    let message = "Hi! I'm your AI travel assistant. ";
    
    if (initialData.description) {
      message += `I see you're dreaming of: "${initialData.description}". `;
    }
    if (initialData.destination) {
      message += `${initialData.destination} sounds amazing! `;
    }
    if (initialData.type) {
      message += `A ${initialData.type} experience would be perfect. `;
    }
    
    message += "Let me ask a few quick questions to create your perfect trip.";
    
    return {
      type: 'ai',
      message,
      timestamp: new Date()
    };
  };
  
  const askFollowUpQuestion = () => {
    const questions = [
      "How many days would you like your trip to be?",
      "What's most important to you: adventure, relaxation, culture, or luxury?",
      "Any specific experiences you absolutely want to include?"
    ];
    
    const question = {
      type: 'ai',
      message: questions[0],
      timestamp: new Date()
    };
    
    setConversation(prev => [...prev, question]);
  };
  
  const generateTripOptions = async () => {
    setCurrentStep(3);
    setLoading(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const mockResults = [
        {
          id: 1,
          title: `${initialData.destination || 'Amazing'} ${initialData.type || 'Adventure'}`,
          description: `Perfect ${initialData.travelers} trip with ${initialData.budget} budget`,
          duration: '7 days, 6 nights',
          price: initialData.budget === 'luxury' ? 4500 : initialData.budget === 'budget' ? 1200 : 2500,
          highlights: ['🏨 Handpicked hotels', '🎯 Curated experiences', '📱 24/7 support'],
          image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=250&fit=crop',
          confidence: 95
        },
        {
          id: 2,
          title: `Alternative ${initialData.destination || 'Journey'}`,
          description: `Different perspective on your dream trip`,
          duration: '5 days, 4 nights',
          price: (initialData.budget === 'luxury' ? 4500 : initialData.budget === 'budget' ? 1200 : 2500) * 0.8,
          highlights: ['🌟 Unique experiences', '🍽️ Local cuisine', '🚗 Private transport'],
          image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop',
          confidence: 88
        }
      ];
      
      setAiResults(mockResults);
      setLoading(false);
    }, 3000);
  };

  const handleUserResponse = () => {
    if (!userInput.trim()) return;
    
    const userMessage = {
      type: 'user',
      message: userInput,
      timestamp: new Date()
    };
    
    setConversation(prev => [...prev, userMessage]);
    setUserInput('');
    
    // After a few exchanges, generate trip options
    if (conversation.length >= 4) {
      const finalMessage = {
        type: 'ai',
        message: "Perfect! I have everything I need. Let me create some amazing trip options for you...",
        timestamp: new Date()
      };
      setConversation(prev => [...prev, finalMessage]);
      
      setTimeout(() => {
        generateTripOptions();
      }, 2000);
    } else {
      // Continue conversation
      setTimeout(() => {
        const responses = [
          "Great choice! What's your ideal budget range per person?",
          "Excellent! Any specific activities or experiences you want to include?",
          "Perfect! Let me create some options for you..."
        ];
        
        const aiResponse = {
          type: 'ai',
          message: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date()
        };
        
        setConversation(prev => [...prev, aiResponse]);
      }, 1500);
    }
  };
  
  const selectTrip = (tripId: number) => {
    // For now, redirect to trips page
    // Later: create actual trip and redirect to booking
    navigate('/trips?ai-generated=true');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-2">🤖 AI Trip Planner</h1>
          <p className="text-xl opacity-90">Your personal travel assistant</p>
          {initialData.destination && (
            <div className="mt-4 bg-white/20 rounded-lg px-4 py-2 inline-block">
              Planning your trip to {initialData.destination}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Step 1: Welcome or Direct Entry */}
        {currentStep === 1 && (
          <Card className="p-8 text-center">
            <div className="text-6xl mb-4">✨</div>
            <h2 className="text-2xl font-bold text-primary-900 mb-4">
              Let's plan your perfect trip!
            </h2>
            <p className="text-primary-600 mb-8">
              Tell me about your dream destination and I'll create personalized recommendations
            </p>
            
            <div className="max-w-md mx-auto">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="e.g., I want a romantic getaway in Paris with great food and art..."
                rows={4}
                className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent mb-4"
              />
              <Button 
                onClick={() => {
                  if (userInput.trim()) {
                    setConversation([{ type: 'user', message: userInput, timestamp: new Date() }]);
                    setUserInput('');
                    startAIConversation();
                  }
                }}
                size="lg" 
                className="w-full"
                disabled={!userInput.trim()}
              >
                Start Planning 🚀
              </Button>
            </div>
            
            <div className="mt-8 text-sm text-primary-500">
              <p>💡 Try: "Beach vacation in Bali", "Cultural tour of Japan", "Adventure in New Zealand"</p>
            </div>
          </Card>
        )}

        {/* Step 2: AI Conversation */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  🤖
                </div>
                <div>
                  <h3 className="font-bold text-primary-900">AI Travel Assistant</h3>
                  <p className="text-sm text-primary-600">Understanding your preferences...</p>
                </div>
              </div>
              
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {conversation.map((message, index) => (
                  <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-primary-900'
                    }`}>
                      {message.message}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 px-4 py-3 rounded-lg flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                )}
              </div>
              
              {!loading && (
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleUserResponse()}
                    placeholder="Type your response..."
                    className="flex-1 px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                  />
                  <Button onClick={handleUserResponse} disabled={!userInput.trim()}>
                    Send
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Step 3: AI Results */}
        {currentStep === 3 && (
          <div className="space-y-6">
            {loading ? (
              <Card className="p-12 text-center">
                <LoadingSpinner size="lg" />
                <h3 className="text-xl font-bold text-primary-900 mt-4 mb-2">
                  Creating your perfect trip options...
                </h3>
                <p className="text-primary-600">
                  Analyzing destinations, activities, and accommodations
                </p>
              </Card>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-primary-900 mb-2">🎉 Your Perfect Trips</h2>
                  <p className="text-primary-600">AI has created these personalized options for you</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {aiResults.map((trip) => (
                    <Card key={trip.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                      <img src={trip.image} alt={trip.title} className="w-full h-48 object-cover" />
                      
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-bold text-primary-900">{trip.title}</h3>
                          <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">
                            {trip.confidence}% match
                          </div>
                        </div>
                        
                        <p className="text-primary-600 mb-4">{trip.description}</p>
                        
                        <div className="space-y-2 mb-4">
                          {trip.highlights.map((highlight: string, idx: number) => (
                            <div key={idx} className="text-sm text-primary-700">{highlight}</div>
                          ))}
                        </div>
                        
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <div className="text-2xl font-bold text-green-600">
                              ${trip.price.toLocaleString()}
                            </div>
                            <div className="text-sm text-primary-500">{trip.duration}</div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Button fullWidth onClick={() => selectTrip(trip.id)}>
                            Choose This Trip
                          </Button>
                          <Button fullWidth variant="outline" onClick={() => navigate('/trips')}>
                            View Similar Trips
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                
                <div className="text-center mt-8">
                  <Button variant="outline" onClick={() => {
                    setCurrentStep(1);
                    setConversation([]);
                    setAiResults([]);
                    setUserInput('');
                  }}>
                    ↻ Start Over
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
        
        {/* Coming Soon Notice */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg text-center">
          <p className="text-sm text-blue-800">
            🚧 <strong>AI Features Coming Soon!</strong> Currently showing demo results. 
            Real AI integration with personalized recommendations will be available soon.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIItineraryPage;