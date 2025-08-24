import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { aiItineraryService } from '@/services/aiItinerary.service';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const AIItineraryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [dreamInput, setDreamInput] = useState('');
  const [conversation, setConversation] = useState([]);
  const [aiConfidence, setAiConfidence] = useState(0);
  const [generatedItineraries, setGeneratedItineraries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversationInput, setConversationInput] = useState('');

  const exampleDreams = [
    { id: 'romantic', text: 'Romantic Europe with great food and art' },
    { id: 'adventure', text: 'Adventure in Asia with temples and nature' },
    { id: 'relaxing', text: 'Relaxing beach vacation with wellness' }
  ];

  const progressSteps = [
    { id: 1, icon: '💭', title: 'Dream Input', desc: 'Share your vision' },
    { id: 2, icon: '🤖', title: 'AI Analysis', desc: 'Understanding preferences' },
    { id: 3, icon: '💬', title: 'Smart Questions', desc: 'Clarifying details' },
    { id: 4, icon: '✨', title: 'Dream Creation', desc: 'Crafting perfect trips' },
    { id: 5, icon: '🎉', title: 'Ready to Book', desc: 'Your perfect journey' }
  ];

  useEffect(() => {
    const similarId = searchParams.get('similar');
    if (similarId) {
      setDreamInput(`Create something similar to the ${similarId} itinerary but with my personal preferences`);
    }
  }, [searchParams]);

  const fillExample = (type: string) => {
    const example = exampleDreams.find(e => e.id === type);
    if (example) {
      setDreamInput(example.text);
    }
  };

  const startDreamBuilding = async () => {
    if (!dreamInput.trim()) return;
    
    setLoading(true);
    setCurrentStep(2);
    
    try {
      const response = await aiItineraryService.startDreamBuilding({ dream: dreamInput });
      
      // Simulate AI conversation flow
      setTimeout(() => {
        setCurrentStep(3);
        setConversation([
          {
            type: 'ai',
            message: `I love your dream! "${dreamInput}". Let me ask a few questions to make it perfect for you.`,
            timestamp: new Date()
          },
          {
            type: 'ai',
            message: 'What\'s your ideal trip duration? And what\'s most important to you - adventure, relaxation, culture, or luxury?',
            timestamp: new Date()
          }
        ]);
        setAiConfidence(25);
      }, 2000);
      
    } catch (error) {
      console.error('Error starting dream building:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendResponse = async () => {
    if (!conversationInput.trim()) return;
    
    const userMessage = {
      type: 'user',
      message: conversationInput,
      timestamp: new Date()
    };
    
    setConversation(prev => [...prev, userMessage]);
    setConversationInput('');
    setLoading(true);
    
    try {
      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          type: 'ai',
          message: generateAIResponse(conversationInput),
          timestamp: new Date()
        };
        
        setConversation(prev => [...prev, aiResponse]);
        setAiConfidence(prev => Math.min(prev + 25, 100));
        
        if (aiConfidence >= 75) {
          setTimeout(() => {
            setCurrentStep(4);
            generateItineraries();
          }, 1500);
        }
        
        setLoading(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error sending response:', error);
      setLoading(false);
    }
  };

  const generateAIResponse = (userInput: string) => {
    const responses = [
      "Perfect! I'm getting a clearer picture. One more thing - what's your budget range per person?",
      "Excellent choices! Now I have everything I need. Let me create 3 amazing options for you...",
      "Great! I can see you value authentic experiences. Let me craft something special..."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateItineraries = async () => {
    setCurrentStep(4);
    setLoading(true);
    
    try {
      // Simulate itinerary generation
      setTimeout(() => {
        const mockItineraries = [
          {
            id: 'option-1',
            title: 'Classic Romance',
            description: 'Traditional romantic experience with luxury touches',
            duration: '7 days',
            price: 3200,
            highlights: ['🍷 Wine tastings', '🌅 Sunset dinners', '🏨 5-star hotels'],
            image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=250&fit=crop',
            confidence: 95
          },
          {
            id: 'option-2',
            title: 'Adventure Romance',
            description: 'Perfect blend of adventure and romantic moments',
            duration: '8 days',
            price: 2800,
            highlights: ['🚁 Helicopter tours', '💕 Couples spa', '🏔️ Mountain views'],
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop',
            confidence: 88
          },
          {
            id: 'option-3',
            title: 'Cultural Romance',
            description: 'Romantic journey through art, history, and culture',
            duration: '6 days',
            price: 2400,
            highlights: ['🎭 Private tours', '🍽️ Michelin dining', '🎨 Art galleries'],
            image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=250&fit=crop',
            confidence: 92
          }
        ];
        
        setGeneratedItineraries(mockItineraries);
        setCurrentStep(5);
        setLoading(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error generating itineraries:', error);
      setLoading(false);
    }
  };

  const bookDreamTrip = (itineraryId?: string) => {
    const selectedItinerary = itineraryId ? 
      generatedItineraries.find(i => i.id === itineraryId) : 
      generatedItineraries[0];
    
    if (selectedItinerary) {
      navigate(`/itineraries/${selectedItinerary.id}/booking`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-primary-50 py-6 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/itineraries')}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-900 transition-colors"
            >
              <span>←</span>
              <span>Back to Itineraries</span>
            </button>
          </div>
          
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-blue-ocean text-white rounded-lg font-semibold">
              🤖 AI Builder
            </button>
            <button 
              onClick={() => navigate('/packages')}
              className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-semibold hover:bg-primary-200"
            >
              📦 Packages
            </button>
            <button 
              onClick={() => navigate('/custom-builder')}
              className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-semibold hover:bg-primary-200"
            >
              🛠️ Custom
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Dream Input Section */}
            {currentStep === 1 && (
              <Card className="p-8">
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold text-primary-900 mb-4">🧠 AI Dream Builder</h1>
                  <p className="text-xl text-primary-600">Describe your perfect trip and watch AI create magic in real-time</p>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-primary-900 mb-4">💡 How to describe your dream trip:</h3>
                  <div className="flex flex-wrap gap-3 mb-6">
                    {exampleDreams.map(example => (
                      <button
                        key={example.id}
                        onClick={() => fillExample(example.id)}
                        className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors text-sm"
                      >
                        "{example.text}"
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <textarea
                    value={dreamInput}
                    onChange={(e) => setDreamInput(e.target.value)}
                    placeholder="Tell me about your dream trip... Where do you want to go? What experiences excite you? What's your style?"
                    rows={4}
                    className="w-full p-4 border border-primary-200 rounded-xl focus:ring-2 focus:ring-blue-ocean focus:border-transparent resize-none"
                  />
                  
                  <div className="text-center">
                    <Button
                      size="lg"
                      onClick={startDreamBuilding}
                      disabled={!dreamInput.trim() || loading}
                      className="px-8"
                    >
                      {loading ? <LoadingSpinner size="sm" /> : '✨ Start Building My Dream'}
                    </Button>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-primary-600">
                    ℹ️ AI creates personalized suggestions based on your input. Final bookings require human verification.
                  </p>
                </div>
              </Card>
            )}

            {/* Conversation Section */}
            {currentStep === 3 && (
              <Card className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-ocean text-white rounded-full flex items-center justify-center text-2xl">
                    🤖
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary-900">AI Assistant</h3>
                    <p className="text-primary-600">Understanding your dream...</p>
                  </div>
                </div>
                
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {conversation.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-blue-ocean text-white'
                            : 'bg-primary-100 text-primary-900'
                        }`}
                      >
                        {message.message}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-primary-100 px-4 py-3 rounded-lg">
                        <LoadingSpinner size="sm" />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={conversationInput}
                    onChange={(e) => setConversationInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendResponse()}
                    placeholder="Tell me more about your preferences..."
                    className="flex-1 px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                  />
                  <Button onClick={sendResponse} disabled={!conversationInput.trim() || loading}>
                    Send
                  </Button>
                </div>
              </Card>
            )}

            {/* Results Section */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-3xl font-bold text-primary-900 mb-2">Your Dream Trip is Ready!</h2>
                  <p className="text-primary-600">AI has crafted 3 perfect options based on your preferences</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {generatedItineraries.map((itinerary, index) => (
                    <Card key={itinerary.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                      <div className="relative">
                        <img
                          src={itinerary.image}
                          alt={itinerary.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-3 left-3 bg-emerald text-white px-2 py-1 rounded text-xs font-bold">
                          {itinerary.confidence}% Match
                        </div>
                        <div className="absolute top-3 right-3 bg-primary-900 text-white px-2 py-1 rounded text-xs font-bold">
                          {itinerary.duration}
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-primary-900 mb-2">{itinerary.title}</h3>
                        <p className="text-primary-600 mb-4">{itinerary.description}</p>
                        
                        <div className="space-y-2 mb-4">
                          {itinerary.highlights.map((highlight, idx) => (
                            <div key={idx} className="text-sm text-primary-700">{highlight}</div>
                          ))}
                        </div>
                        
                        <div className="text-2xl font-bold text-emerald mb-4">
                          From ${itinerary.price.toLocaleString()}
                        </div>
                        
                        <div className="space-y-2">
                          <Button
                            fullWidth
                            onClick={() => bookDreamTrip(itinerary.id)}
                          >
                            Book This Dream
                          </Button>
                          <Button
                            fullWidth
                            variant="outline"
                            onClick={() => navigate(`/itineraries/${itinerary.id}/customize`)}
                          >
                            Customize Further
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                
                <div className="text-center space-y-4">
                  <div className="flex justify-center gap-4">
                    <Button onClick={() => setCurrentStep(1)}>Create New Dream</Button>
                    <Button variant="outline" onClick={() => setCurrentStep(3)}>Refine Preferences</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {(currentStep === 2 || currentStep === 4) && (
              <Card className="p-12 text-center">
                <LoadingSpinner size="lg" className="mb-4" />
                <h3 className="text-xl font-bold text-primary-900 mb-2">
                  {currentStep === 2 ? 'AI is analyzing your dream...' : 'Creating your perfect itineraries...'}
                </h3>
                <p className="text-primary-600">
                  {currentStep === 2 ? 'Understanding your preferences and style' : 'Crafting 3 amazing options just for you'}
                </p>
              </Card>
            )}
          </div>

          {/* AI Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Progress Flow */}
              <Card className="p-6">
                <h3 className="text-lg font-bold text-primary-900 mb-4">🎯 AI Progress</h3>
                <div className="space-y-4">
                  {progressSteps.map(step => (
                    <div
                      key={step.id}
                      className={`flex items-center gap-3 ${
                        currentStep >= step.id ? 'text-primary-900' : 'text-primary-400'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                          currentStep >= step.id ? 'bg-blue-ocean text-white' : 'bg-primary-100'
                        }`}
                      >
                        {step.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{step.title}</div>
                        <div className="text-xs">{step.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* AI Confidence */}
              <Card className="p-6">
                <h3 className="text-lg font-bold text-primary-900 mb-4">🧠 AI Confidence</h3>
                <div className="text-center mb-4">
                  <div className="relative w-20 h-20 mx-auto">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-primary-200"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 36}`}
                        strokeDashoffset={`${2 * Math.PI * 36 * (1 - aiConfidence / 100)}`}
                        className="text-blue-ocean transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-primary-900">{aiConfidence}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Understanding:</span>
                    <span className="font-semibold">
                      {aiConfidence < 25 ? 'Getting started' : 
                       aiConfidence < 50 ? 'Learning' :
                       aiConfidence < 75 ? 'Good grasp' : 'Excellent'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Readiness:</span>
                    <span className="font-semibold">
                      {aiConfidence < 75 ? 'Building' : 'Ready to create'}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIItineraryPage;