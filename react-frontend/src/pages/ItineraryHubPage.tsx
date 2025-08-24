import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { itineraryService } from '@/services/itinerary.service';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const ItineraryHubPage: React.FC = () => {
  const navigate = useNavigate();
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All', icon: '' },
    { id: 'romance', label: 'Romance', icon: '💕' },
    { id: 'adventure', label: 'Adventure', icon: '🏔️' },
    { id: 'culture', label: 'Culture', icon: '🎭' },
    { id: 'wellness', label: 'Wellness', icon: '🧘' },
    { id: 'budget', label: 'Budget', icon: '💰' },
    { id: 'luxury', label: 'Luxury', icon: '💎' }
  ];

  const featuredItineraries = [
    {
      id: 'paris-romance',
      title: 'Paris Romance',
      description: 'Eiffel Tower dinners, Seine cruises, cozy cafes',
      image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop',
      price: 2400,
      rating: 4.9,
      reviews: 89,
      duration: '5 Days',
      tags: ['romance', 'luxury', 'europe'],
      badges: ['🔥 Trending']
    },
    {
      id: 'japan-culture',
      title: 'Japan Discovery',
      description: 'Temples, sushi, cherry blossoms',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop',
      price: 3200,
      rating: 4.8,
      reviews: 156,
      duration: '10 Days',
      tags: ['culture', 'adventure', 'asia'],
      badges: ['Cultural']
    },
    {
      id: 'bali-wellness',
      title: 'Bali Wellness Retreat',
      description: 'Yoga, spas, beaches, meditation',
      image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=300&fit=crop',
      price: 1800,
      rating: 4.9,
      reviews: 203,
      duration: '7 Days',
      tags: ['wellness', 'relaxation', 'asia'],
      badges: ['Wellness']
    },
    {
      id: 'iceland-adventure',
      title: 'Iceland Adventure',
      description: 'Northern lights, glaciers, waterfalls',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      price: 3600,
      rating: 4.7,
      reviews: 134,
      duration: '8 Days',
      tags: ['adventure', 'nature', 'europe'],
      badges: ['Adventure']
    },
    {
      id: 'greece-islands',
      title: 'Greek Islands',
      description: 'Santorini sunsets, Mykonos beaches',
      image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400&h=300&fit=crop',
      price: 2900,
      rating: 4.8,
      reviews: 178,
      duration: '9 Days',
      tags: ['romance', 'luxury', 'europe'],
      badges: ['Romance']
    },
    {
      id: 'thailand-adventure',
      title: 'Thailand Explorer',
      description: 'Temples, street food, islands',
      image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=300&fit=crop',
      price: 1200,
      rating: 4.6,
      reviews: 267,
      duration: '12 Days',
      tags: ['budget', 'adventure', 'asia'],
      badges: ['Budget']
    }
  ];

  useEffect(() => {
    loadItineraries();
  }, []);

  const loadItineraries = async () => {
    try {
      const response = await itineraryService.getFeaturedItineraries();
      setItineraries(response.data.itineraries || featuredItineraries);
    } catch (error) {
      setItineraries(featuredItineraries);
    } finally {
      setLoading(false);
    }
  };

  const filteredItineraries = itineraries.filter(itinerary => {
    const matchesSearch = itinerary.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         itinerary.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || itinerary.tags.includes(activeFilter);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-900 mb-4">
            Your next amazing trip starts here
          </h1>
          <p className="text-xl text-primary-600 mb-8">
            See beautiful itineraries, pick what you love, customize to make it yours
          </p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search destinations, activities, or vibes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-primary-200 rounded-xl focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl">🔍</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {filters.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeFilter === filter.id
                      ? 'bg-blue-ocean text-white'
                      : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                  }`}
                >
                  {filter.icon && <span className="mr-1">{filter.icon}</span>}
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Trips */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary-900 mb-2">✨ Amazing Trips People Love</h2>
            <p className="text-primary-600">Real itineraries, real experiences, ready to customize</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItineraries.map(itinerary => (
                <Card
                  key={itinerary.id}
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300"
                  onClick={() => navigate(`/itineraries/${itinerary.id}`)}
                >
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={itinerary.image}
                      alt={itinerary.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      {itinerary.badges.map((badge, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded-full text-xs font-bold text-white ${
                            badge.includes('Trending') ? 'bg-red-500' :
                            badge.includes('Cultural') ? 'bg-purple-500' :
                            badge.includes('Wellness') ? 'bg-green-500' :
                            badge.includes('Adventure') ? 'bg-orange-500' :
                            badge.includes('Romance') ? 'bg-pink-500' :
                            'bg-blue-500'
                          }`}
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                    <div className="absolute top-3 right-3 bg-primary-900 text-white px-2 py-1 rounded text-xs font-bold">
                      {itinerary.duration}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex flex-wrap gap-1 mb-3">
                      {itinerary.tags.slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs"
                        >
                          {filters.find(f => f.id === tag)?.icon} {filters.find(f => f.id === tag)?.label}
                        </span>
                      ))}
                    </div>
                    
                    <h3 className="text-xl font-bold text-primary-900 mb-2">{itinerary.title}</h3>
                    <p className="text-primary-600 mb-4">{itinerary.description}</p>
                    
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-2xl font-bold text-emerald">From ${itinerary.price.toLocaleString()}</div>
                      <div className="flex items-center gap-1">
                        <span className="text-amber-premium">⭐</span>
                        <span className="font-semibold">{itinerary.rating}</span>
                        <span className="text-sm text-primary-500">({itinerary.reviews})</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/itineraries/${itinerary.id}/customize`);
                        }}
                      >
                        Customize
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/ai-itinerary?similar=${itinerary.id}`);
                        }}
                      >
                        AI Similar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/itineraries/all')}
              className="mb-4"
            >
              🌍 View All 300+ Itineraries
            </Button>
            <p className="text-primary-600">Or create something new with AI</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-900 mb-4">It's This Simple</h2>
            <p className="text-primary-600">Three easy ways to get your perfect trip</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'See & Love', desc: 'Browse beautiful trips and find one you love' },
              { step: '2', title: 'Customize', desc: 'Adjust dates, activities, and budget to fit you' },
              { step: '3', title: 'Book & Go', desc: "Everything's planned - just pack and enjoy" }
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-blue-ocean text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-primary-900 mb-2">{item.title}</h3>
                <p className="text-primary-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alternative Options */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-900 mb-4">Or Try These Options</h2>
            <p className="text-primary-600">Different ways to create your perfect trip</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="text-center p-8 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate('/ai-itinerary')}>
              <div className="text-6xl mb-4">🧠</div>
              <h3 className="text-2xl font-bold text-primary-900 mb-4">Start From Scratch</h3>
              <p className="text-primary-600 mb-6">Tell AI your dream trip and get 3 custom options in minutes</p>
              <Button>Try AI Builder</Button>
            </Card>
            
            <Card className="text-center p-8 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate('/custom-builder')}>
              <div className="text-6xl mb-4">🛠️</div>
              <h3 className="text-2xl font-bold text-primary-900 mb-4">Build Step-by-Step</h3>
              <p className="text-primary-600 mb-6">Full control with guided questions to create exactly what you want</p>
              <Button variant="outline">Custom Builder</Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">47K+</div>
              <div className="text-primary-300">Happy Travelers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.9★</div>
              <div className="text-primary-300">Average Rating</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-primary-300">Would Recommend</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ItineraryHubPage;