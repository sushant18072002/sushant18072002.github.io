import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('itinerary');
  const [dreamInput, setDreamInput] = useState('');
  const [liveCounter, setLiveCounter] = useState(2847);
  const [selectedOption, setSelectedOption] = useState('ai-magic');

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCounter(prev => prev + Math.floor(Math.random() * 5) + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const switchTab = (tabName: string) => {
    setActiveTab(tabName);
  };

  const selectItineraryOption = (option: string) => {
    setSelectedOption(option);
  };

  const performSearch = () => {
    if (activeTab === 'itinerary') {
      if (!dreamInput.trim()) return;
      
      if (selectedOption === 'ai-magic') {
        navigate('/itineraries/ai');
      } else if (selectedOption === 'packages') {
        navigate('/packages');
      } else {
        navigate('/itineraries/custom');
      }
    } else if (activeTab === 'flights') {
      navigate('/flights');
    } else {
      navigate('/hotels');
    }
  };

  const selectAdventure = (type: string) => {
    navigate(`/packages?category=${type}`);
  };

  const viewDestination = (id: string) => {
    navigate(`/itinerary-details?destination=${id}`);
  };

  const viewPackage = (id: string) => {
    navigate(`/packages/${id}`);
  };

  const adventureCategories = [
    {
      icon: '🏖️',
      title: 'Luxury resort at the sea',
      places: '9,326 places',
      type: 'luxury',
    },
    {
      icon: '🏕️',
      title: 'Camping amidst the wild',
      places: '12,326 places',
      type: 'camping',
    },
    {
      icon: '🏔️',
      title: 'Mountain house',
      places: '8,945 places',
      type: 'mountain',
    },
  ];

  const planningOptions = [
    {
      icon: '🧠',
      title: 'AI Dream Builder',
      description: 'Describe your dream trip and watch AI create magic',
      badge: '⚡ Most Popular',
      features: ['✨ Natural language input', '⚡ Ready in 2 minutes'],
      buttonText: 'Start Dreaming',
      href: '/itineraries/ai',
    },
    {
      icon: '📦',
      title: 'Ready Packages',
      description: 'Expert-curated trips ready to book instantly',
      badge: '🌟 Ready',
      features: ['🏆 Expert curated', '⚡ Instant booking'],
      buttonText: 'Browse Packages',
      href: '/packages',
    },
    {
      icon: '🛠️',
      title: 'Custom Builder',
      description: 'Step-by-step control over every detail',
      badge: '🎯 Pro',
      features: ['🎛️ Full control', '📋 5-step wizard'],
      buttonText: 'Start Building',
      href: '/itineraries/custom',
    },
  ];

  const featuredPackages = [
    {
      id: 1,
      title: 'Japan Adventure',
      location: 'Tokyo • Kyoto • Osaka',
      duration: '7 Days',
      price: '$2,890',
      rating: '4.9',
      reviews: '124',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=256&h=228&fit=crop',
    },
    {
      id: 2,
      title: 'Paris Romance',
      location: 'Paris • Versailles • Loire Valley',
      duration: '5 Days',
      price: '$1,890',
      rating: '4.8',
      reviews: '89',
      image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=256&h=228&fit=crop',
    },
    {
      id: 3,
      title: 'Bali Escape',
      location: 'Ubud • Seminyak • Nusa Penida',
      duration: '10 Days',
      price: '$1,590',
      rating: '4.9',
      reviews: '156',
      image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=256&h=228&fit=crop',
    },
    {
      id: 4,
      title: 'Iceland Nature',
      location: 'Reykjavik • Golden Circle • Blue Lagoon',
      duration: '8 Days',
      price: '$3,290',
      rating: '4.7',
      reviews: '67',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=256&h=228&fit=crop',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero relative h-[calc(100vh-88px)] flex items-center mt-[88px] overflow-visible">
        <img 
          className="hero-bg absolute top-0 left-0 w-full h-full object-cover z-[1]" 
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&h=1080&fit=crop" 
          alt="Beautiful landscape" 
        />
        <div className="hero-overlay absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[rgba(15,23,42,0.4)] via-[rgba(30,64,175,0.3)] to-[rgba(16,185,129,0.4)] z-[2]"></div>
        
        <div className="hero-content relative z-10 max-w-[1280px] mx-auto px-4 md:px-20 grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-5 items-center w-full h-full">
          <div className="hero-text text-white text-center lg:text-left">
            <div className="hero-badge inline-flex items-center gap-3 bg-white/20 backdrop-blur-[10px] border border-white/30 px-5 py-3 rounded-full text-sm mb-6">
              <div className="live-dot w-2 h-2 bg-emerald rounded-full animate-pulse"></div>
              <span>{liveCounter.toLocaleString()} dreams planned today</span>
            </div>
            
            <h1 className="hero-title text-4xl md:text-6xl lg:text-[96px] font-bold leading-tight lg:leading-[96px] mb-3 font-['DM_Sans']">
              Air, sleep, dream
            </h1>
            <p className="hero-subtitle text-2xl font-normal leading-8 mb-5 font-['Poppins'] opacity-90">
              Find and book a great experience.
            </p>
            <button 
              className="hero-cta bg-blue-ocean text-white border-none px-6 py-4 rounded-3xl text-base font-bold cursor-pointer transition-all duration-300 font-['DM_Sans'] inline-flex items-center gap-2 hover:bg-emerald hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(88,194,125,0.3)]"
              onClick={() => document.querySelector('.search-widget')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            >
              Start your search
            </button>
          </div>

          {/* Search Widget */}
          <div className="search-widget bg-white/98 backdrop-blur-[16px] rounded-3xl p-4 md:p-8 shadow-[0_40px_64px_-32px_rgba(15,15,15,0.10)] border border-white max-w-[620px] relative z-[5] mx-auto lg:mx-0">
            {/* Search Tabs */}
            <div className="search-tabs flex bg-transparent shadow-[0_-1px_0_#e6e8ec_inset] mb-2">
              <button
                onClick={() => switchTab('flights')}
                className={`search-tab bg-none border-none py-4 pr-12 pb-[31px] pl-0 font-bold text-sm cursor-pointer relative font-['DM_Sans'] transition-colors ${
                  activeTab === 'flights'
                    ? 'text-primary-900 after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-12 after:h-0.5 after:bg-primary-900'
                    : 'text-primary-400 hover:text-primary-900'
                }`}
              >
                Flights
              </button>
              <button
                onClick={() => switchTab('hotels')}
                className={`search-tab bg-none border-none py-4 pr-12 pb-[31px] pl-0 font-bold text-sm cursor-pointer relative font-['DM_Sans'] transition-colors ${
                  activeTab === 'hotels'
                    ? 'text-primary-900 after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-12 after:h-0.5 after:bg-primary-900'
                    : 'text-primary-400 hover:text-primary-900'
                }`}
              >
                Hotels
              </button>
              <button
                onClick={() => switchTab('itinerary')}
                className={`search-tab bg-none border-none py-4 pr-12 pb-[31px] pl-0 font-bold text-sm cursor-pointer relative font-['DM_Sans'] transition-colors ${
                  activeTab === 'itinerary'
                    ? 'text-primary-900 after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-12 after:h-0.5 after:bg-primary-900'
                    : 'text-primary-400 hover:text-primary-900'
                }`}
              >
                Complete Trip
              </button>
            </div>

            {/* Search Forms */}
            <div className={`search-content ${activeTab === 'flights' ? 'block' : 'hidden'}`}>
              <div className="search-form flex flex-col gap-1">
                <div className="form-row grid grid-cols-2 gap-3 items-end">
                  <div className="form-field flex-1 flex items-center bg-white rounded-2xl py-3 px-4 pl-14 relative min-h-[56px]">
                    <div className="field-icon absolute left-4 top-1/2 -translate-y-1/2 text-xl">📍</div>
                    <div className="field-content flex-1 flex flex-col gap-1">
                      <div className="field-label text-lg font-semibold text-primary-900 font-['Poppins']">Flying from</div>
                      <input className="field-input border-none bg-none text-sm text-primary-400 font-['Poppins'] outline-none w-full" placeholder="Departure city" />
                    </div>
                  </div>
                  <div className="form-field flex-1 flex items-center bg-white rounded-2xl py-3 px-4 pl-14 relative min-h-[56px]">
                    <div className="field-icon absolute left-4 top-1/2 -translate-y-1/2 text-xl">📍</div>
                    <div className="field-content flex-1 flex flex-col gap-1">
                      <div className="field-label text-lg font-semibold text-primary-900 font-['Poppins']">Flying to</div>
                      <input className="field-input border-none bg-none text-sm text-primary-400 font-['Poppins'] outline-none w-full" placeholder="Destination city" />
                    </div>
                  </div>
                </div>
                <div className="form-row grid grid-cols-2 gap-3 items-end">
                  <div className="form-field flex-1 flex items-center bg-white rounded-2xl py-3 px-4 pl-14 relative min-h-[56px]">
                    <div className="field-icon absolute left-4 top-1/2 -translate-y-1/2 text-xl">📅</div>
                    <div className="field-content flex-1 flex flex-col gap-1">
                      <div className="field-label text-lg font-semibold text-primary-900 font-['Poppins']">Departure</div>
                      <input type="date" className="field-input border-none bg-none text-sm text-primary-400 font-['Poppins'] outline-none w-full" />
                    </div>
                  </div>
                  <div className="form-field flex-1 flex items-center bg-white rounded-2xl py-3 px-4 pl-14 relative min-h-[56px]">
                    <div className="field-icon absolute left-4 top-1/2 -translate-y-1/2 text-xl">📅</div>
                    <div className="field-content flex-1 flex flex-col gap-1">
                      <div className="field-label text-lg font-semibold text-primary-900 font-['Poppins']">Return</div>
                      <input type="date" className="field-input border-none bg-none text-sm text-primary-400 font-['Poppins'] outline-none w-full" />
                    </div>
                  </div>
                </div>
                <div className="form-row grid grid-cols-[1fr_auto] gap-3 items-end">
                  <div className="form-field flex-1 flex items-center bg-white rounded-2xl py-3 px-4 pl-14 relative min-h-[56px]">
                    <div className="field-icon absolute left-4 top-1/2 -translate-y-1/2 text-xl">👥</div>
                    <div className="field-content flex-1 flex flex-col gap-1">
                      <div className="field-label text-lg font-semibold text-primary-900 font-['Poppins']">Travelers</div>
                      <select className="field-input border-none bg-none text-sm text-primary-400 font-['Poppins'] outline-none w-full">
                        <option>1 guest</option>
                        <option>2 guests</option>
                        <option>3 guests</option>
                        <option>4+ guests</option>
                      </select>
                    </div>
                  </div>
                  <button 
                    onClick={performSearch}
                    className="search-btn w-auto h-12 bg-blue-ocean border-none rounded-xl cursor-pointer flex items-center justify-center text-sm ml-4 transition-all duration-300 text-white font-['DM_Sans'] font-bold gap-2 px-5 min-w-[120px] hover:bg-emerald hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(88,194,125,0.3)]"
                  >
                    <span>Search Flights</span>
                  </button>
                </div>
              </div>
            </div>

            <div className={`search-content ${activeTab === 'hotels' ? 'block' : 'hidden'}`}>
              <div className="search-form flex flex-col gap-1">
                <div className="form-row grid grid-cols-1 gap-3 items-end">
                  <div className="form-field flex-1 flex items-center bg-white rounded-2xl py-3 px-4 pl-14 relative min-h-[56px]">
                    <div className="field-icon absolute left-4 top-1/2 -translate-y-1/2 text-xl">📍</div>
                    <div className="field-content flex-1 flex flex-col gap-1">
                      <div className="field-label text-lg font-semibold text-primary-900 font-['Poppins']">Location</div>
                      <input className="field-input border-none bg-none text-sm text-primary-400 font-['Poppins'] outline-none w-full" placeholder="Where are you going?" />
                    </div>
                  </div>
                </div>
                <div className="form-row grid grid-cols-2 gap-3 items-end">
                  <div className="form-field flex-1 flex items-center bg-white rounded-2xl py-3 px-4 pl-14 relative min-h-[56px]">
                    <div className="field-icon absolute left-4 top-1/2 -translate-y-1/2 text-xl">📅</div>
                    <div className="field-content flex-1 flex flex-col gap-1">
                      <div className="field-label text-lg font-semibold text-primary-900 font-['Poppins']">Check in</div>
                      <input type="date" className="field-input border-none bg-none text-sm text-primary-400 font-['Poppins'] outline-none w-full" />
                    </div>
                  </div>
                  <div className="form-field flex-1 flex items-center bg-white rounded-2xl py-3 px-4 pl-14 relative min-h-[56px]">
                    <div className="field-icon absolute left-4 top-1/2 -translate-y-1/2 text-xl">📅</div>
                    <div className="field-content flex-1 flex flex-col gap-1">
                      <div className="field-label text-lg font-semibold text-primary-900 font-['Poppins']">Check out</div>
                      <input type="date" className="field-input border-none bg-none text-sm text-primary-400 font-['Poppins'] outline-none w-full" />
                    </div>
                  </div>
                </div>
                <div className="form-row grid grid-cols-[1fr_auto] gap-3 items-end">
                  <div className="form-field flex-1 flex items-center bg-white rounded-2xl py-3 px-4 pl-14 relative min-h-[56px]">
                    <div className="field-icon absolute left-4 top-1/2 -translate-y-1/2 text-xl">👥</div>
                    <div className="field-content flex-1 flex flex-col gap-1">
                      <div className="field-label text-lg font-semibold text-primary-900 font-['Poppins']">Travelers</div>
                      <select className="field-input border-none bg-none text-sm text-primary-400 font-['Poppins'] outline-none w-full">
                        <option>1 guest</option>
                        <option>2 guests</option>
                        <option>3 guests</option>
                        <option>4+ guests</option>
                      </select>
                    </div>
                  </div>
                  <button 
                    onClick={performSearch}
                    className="search-btn w-auto h-12 bg-blue-ocean border-none rounded-xl cursor-pointer flex items-center justify-center text-sm ml-4 transition-all duration-300 text-white font-['DM_Sans'] font-bold gap-2 px-5 min-w-[120px] hover:bg-emerald hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(88,194,125,0.3)]"
                  >
                    <span>Search Hotels</span>
                  </button>
                </div>
              </div>
            </div>

            <div className={`search-content ${activeTab === 'itinerary' ? 'block' : 'hidden'} active min-h-[240px]`}>
              <div className="search-form flex flex-col gap-1">
                <div className="form-row grid grid-cols-1 gap-3 items-end">
                  <div className="form-field full-width col-span-full flex-1 flex items-center bg-white rounded-2xl py-3 px-4 pl-14 relative min-h-[56px]">
                    <div className="field-icon absolute left-4 top-1/2 -translate-y-1/2 text-xl">✨</div>
                    <div className="field-content flex-1 flex flex-col gap-1">
                      <div className="field-label text-lg font-semibold text-primary-900 font-['Poppins']">Describe your dream trip</div>
                      <input 
                        value={dreamInput}
                        onChange={(e) => setDreamInput(e.target.value)}
                        className="field-input border-none bg-none text-sm text-primary-400 font-['Poppins'] outline-none w-full" 
                        placeholder="e.g., Romantic getaway in Paris, Adventure in Japan, Beach relaxation in Bali..." 
                      />
                    </div>
                  </div>
                </div>
                <div className="form-row grid grid-cols-2 gap-3 items-end">
                  <div className="form-field flex-1 flex items-center bg-white rounded-2xl py-3 px-4 pl-14 relative min-h-[56px]">
                    <div className="field-icon absolute left-4 top-1/2 -translate-y-1/2 text-xl">📅</div>
                    <div className="field-content flex-1 flex flex-col gap-1">
                      <div className="field-label text-lg font-semibold text-primary-900 font-['Poppins']">When</div>
                      <input type="date" className="field-input border-none bg-none text-sm text-primary-400 font-['Poppins'] outline-none w-full" />
                    </div>
                  </div>
                  <div className="form-field flex-1 flex items-center bg-white rounded-2xl py-3 px-4 pl-14 relative min-h-[56px]">
                    <div className="field-icon absolute left-4 top-1/2 -translate-y-1/2 text-xl">⏱️</div>
                    <div className="field-content flex-1 flex flex-col gap-1">
                      <div className="field-label text-lg font-semibold text-primary-900 font-['Poppins']">Duration</div>
                      <select className="field-input border-none bg-none text-sm text-primary-400 font-['Poppins'] outline-none w-full">
                        <option>3-5 days</option>
                        <option>1 week</option>
                        <option>2 weeks</option>
                        <option>1 month</option>
                        <option>Flexible</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="form-row grid grid-cols-2 gap-3 items-end">
                  <div className="form-field flex-1 flex items-center bg-white rounded-2xl py-3 px-4 pl-14 relative min-h-[56px]">
                    <div className="field-icon absolute left-4 top-1/2 -translate-y-1/2 text-xl">👥</div>
                    <div className="field-content flex-1 flex flex-col gap-1">
                      <div className="field-label text-lg font-semibold text-primary-900 font-['Poppins']">Travelers</div>
                      <select className="field-input border-none bg-none text-sm text-primary-400 font-['Poppins'] outline-none w-full">
                        <option>Solo traveler</option>
                        <option>Couple</option>
                        <option>Family (3-4)</option>
                        <option>Group (5+)</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-field flex-1 flex items-center bg-white rounded-2xl py-3 px-4 pl-14 relative min-h-[56px]">
                    <div className="field-icon absolute left-4 top-1/2 -translate-y-1/2 text-xl">💰</div>
                    <div className="field-content flex-1 flex flex-col gap-1">
                      <div className="field-label text-lg font-semibold text-primary-900 font-['Poppins']">Budget</div>
                      <select className="field-input border-none bg-none text-sm text-primary-400 font-['Poppins'] outline-none w-full">
                        <option>Budget-friendly</option>
                        <option>Mid-range</option>
                        <option>Luxury</option>
                        <option>No limit</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="itinerary-options grid grid-cols-3 gap-1.5 my-2">
                  <div 
                    className={`option-card bg-gradient-to-br from-blue-ocean/5 to-emerald/5 border-2 border-blue-ocean/10 rounded-lg py-1.5 px-1 text-center cursor-pointer transition-all duration-300 min-h-[50px] flex flex-col justify-center relative hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(59,113,254,0.15)] hover:border-blue-ocean ${
                      selectedOption === 'ai-magic' ? 'selected border-blue-ocean bg-gradient-to-br from-blue-ocean/10 to-emerald/10 shadow-[0_4px_12px_rgba(59,113,254,0.2)]' : ''
                    }`}
                    onClick={() => selectItineraryOption('ai-magic')}
                  >
                    <div className="option-badge badge-popular absolute -top-1 left-1/2 -translate-x-1/2 text-[0.55rem] px-1 py-0.5 rounded-md font-bold font-['DM_Sans'] bg-emerald text-white">⚡ Popular</div>
                    <div className="text-[1.3rem] mb-1">🧠</div>
                    <div className="text-[0.8rem] font-semibold text-primary-900 mb-1">AI Magic</div>
                    <div className="text-[0.65rem] text-primary-400 leading-tight">AI creates perfect trip</div>
                  </div>
                  <div 
                    className={`option-card bg-gradient-to-br from-blue-ocean/5 to-emerald/5 border-2 border-blue-ocean/10 rounded-lg py-1.5 px-1 text-center cursor-pointer transition-all duration-300 min-h-[50px] flex flex-col justify-center relative hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(59,113,254,0.15)] hover:border-blue-ocean ${
                      selectedOption === 'packages' ? 'selected border-blue-ocean bg-gradient-to-br from-blue-ocean/10 to-emerald/10 shadow-[0_4px_12px_rgba(59,113,254,0.2)]' : ''
                    }`}
                    onClick={() => selectItineraryOption('packages')}
                  >
                    <div className="option-badge badge-ready absolute -top-1 left-1/2 -translate-x-1/2 text-[0.55rem] px-1 py-0.5 rounded-md font-bold font-['DM_Sans'] bg-amber-premium text-white">🌟 Ready</div>
                    <div className="text-[1.3rem] mb-1">📦</div>
                    <div className="text-[0.8rem] font-semibold text-primary-900 mb-1">Packages</div>
                    <div className="text-[0.65rem] text-primary-400 leading-tight">Pre-made adventures</div>
                  </div>
                  <div 
                    className={`option-card bg-gradient-to-br from-blue-ocean/5 to-emerald/5 border-2 border-blue-ocean/10 rounded-lg py-1.5 px-1 text-center cursor-pointer transition-all duration-300 min-h-[50px] flex flex-col justify-center relative hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(59,113,254,0.15)] hover:border-blue-ocean ${
                      selectedOption === 'custom' ? 'selected border-blue-ocean bg-gradient-to-br from-blue-ocean/10 to-emerald/10 shadow-[0_4px_12px_rgba(59,113,254,0.2)]' : ''
                    }`}
                    onClick={() => selectItineraryOption('custom')}
                  >
                    <div className="option-badge badge-pro absolute -top-1 left-1/2 -translate-x-1/2 text-[0.55rem] px-1 py-0.5 rounded-md font-bold font-['DM_Sans'] bg-blue-ocean text-white">🎯 Pro</div>
                    <div className="text-[1.3rem] mb-1">🛠️</div>
                    <div className="text-[0.8rem] font-semibold text-primary-900 mb-1">Custom</div>
                    <div className="text-[0.65rem] text-primary-400 leading-tight">Build from scratch</div>
                  </div>
                </div>
                <button 
                  onClick={performSearch}
                  className="search-btn full-width w-full ml-0 mt-1 text-base px-6 h-12 bg-blue-ocean border-none rounded-xl cursor-pointer flex items-center justify-center transition-all duration-300 text-white font-['DM_Sans'] font-bold gap-2 hover:bg-emerald hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(88,194,125,0.3)]"
                >
                  <span className="search-icon text-lg">✨</span>
                  <span>Create My Dream Trip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Adventure Categories */}
      <section className="adventure-section py-16 md:py-[136px] bg-white">
        <div className="container max-w-[1280px] mx-auto px-4 md:px-20">
          <div className="section-header text-center mb-16">
            <h2 className="section-title text-5xl font-bold leading-[56px] text-primary-900 mb-3 font-['DM_Sans']">
              Let's go on an adventure
            </h2>
            <p className="section-subtitle text-2xl font-normal leading-8 text-primary-400 font-['Poppins']">
              Find and book a great experience.
            </p>
          </div>

          <div className="adventure-grid grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-[1120px] mx-auto">
            {adventureCategories.map((category, index) => (
              <div
                key={index}
                className="adventure-card flex items-center gap-4 cursor-pointer transition-all duration-300 p-6 rounded-2xl bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]"
                onClick={() => selectAdventure(category.type)}
              >
                <div className="adventure-icon w-40 h-40 flex items-center justify-center text-[80px] rounded-3xl bg-gradient-to-br from-[#C1FFF7] to-[#93E9DE]">
                  {category.icon}
                </div>
                <div className="adventure-content flex-1">
                  <h3 className="text-base font-medium leading-6 text-primary-900 mb-2 font-['Poppins']">
                    {category.title}
                  </h3>
                  <div className="adventure-badge bg-primary-200 text-primary-900 px-3 rounded-[13px] text-xs font-bold uppercase leading-[26px] inline-block font-['Poppins']">
                    {category.places}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section className="destinations-section py-20 bg-white relative">
        <div className="container max-w-[1280px] mx-auto px-20">
          <div className="section-header text-center mb-16">
            <h2 className="section-title text-5xl font-bold leading-[56px] text-primary-900 mb-3 font-['DM_Sans']">
              Explore mountains in New Zealand
            </h2>
          </div>
          
          <div className="destinations-slider flex gap-8 overflow-x-auto scroll-smooth pb-5">
            {[1,2,3,4].map((item, index) => (
              <div key={index} className="destination-card min-w-[256px] cursor-pointer transition-all duration-300 rounded-3xl overflow-hidden bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]" onClick={() => viewDestination('new-zealand-mountains')}>
                <div className="destination-image relative w-64 h-64 rounded-3xl overflow-hidden mb-5">
                  <img src={`https://images.unsplash.com/photo-${index % 2 === 0 ? '1506905925346-21bda4d32df4' : '1464822759844-d150baec3e5e'}?w=400&h=400&fit=crop`} alt="Mountain house" className="w-full h-full object-cover" />
                  <div className="destination-badge absolute top-4 left-4 bg-primary-900 text-white px-3 rounded-[13px] text-xs font-bold uppercase leading-[26px] font-['Poppins']">{index % 2 === 0 ? '20% off' : `from $${190 + index * 40}`}</div>
                </div>
                <div className="destination-info">
                  <h3 className="text-base font-medium leading-6 text-primary-900 mb-2 font-['Poppins']">Mountain house</h3>
                  <div className="destination-rating flex items-center gap-1.5 text-xs font-semibold text-primary-400 font-['Poppins']">
                    <span className="rating-icon">⭐</span>
                    <span>{(Math.random() * 100000 + 300000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="slider-controls absolute top-1/2 right-20 -translate-y-1/2 flex gap-2">
            <button className="slider-btn w-10 h-10 border-none rounded-2xl bg-white text-primary-400 cursor-pointer flex items-center justify-center text-lg transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:bg-blue-ocean hover:text-white">‹</button>
            <button className="slider-btn w-10 h-10 border-none rounded-2xl bg-white text-primary-400 cursor-pointer flex items-center justify-center text-lg transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:bg-blue-ocean hover:text-white">›</button>
          </div>
        </div>
      </section>

      {/* Planning Options */}
      <section className="planning-section py-[136px] bg-white">
        <div className="container max-w-[1280px] mx-auto px-20">
          <div className="section-header text-center mb-16">
            <h2 className="section-title text-5xl font-bold leading-[56px] text-primary-900 mb-3 font-['DM_Sans']">
              How do you want to plan your trip?
            </h2>
            <p className="section-subtitle text-2xl font-normal leading-8 text-primary-400 font-['Poppins']">
              Choose the perfect way to create your dream journey
            </p>
          </div>

          <div className="planning-grid grid grid-cols-3 gap-8 max-w-[1120px] mx-auto">
            {planningOptions.map((option, index) => (
              <div
                key={index}
                className={`planning-card bg-white rounded-2xl py-6 px-5 text-center cursor-pointer transition-all duration-300 border-2 relative hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:border-blue-ocean ${
                  index === 0 ? 'featured border-blue-ocean shadow-[0_8px_25px_rgba(59,113,254,0.15)]' : 'border-transparent'
                }`}
                onClick={() => navigate(option.href)}
              >
                {option.badge && (
                  <div className={`planning-badge absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-2xl text-xs font-bold font-['DM_Sans'] ${
                    index === 0 ? 'bg-emerald text-white' : 'bg-blue-ocean text-white'
                  }`}>
                    {option.badge}
                  </div>
                )}
                
                <div className="planning-icon text-[32px] my-4">{option.icon}</div>
                <h3 className="text-lg font-bold text-primary-900 mb-2 font-['DM_Sans']">
                  {option.title}
                </h3>
                <p className="text-sm text-primary-400 leading-5 mb-4 font-['Poppins']">{option.description}</p>
                
                <div className="planning-features mb-5">
                  {option.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="feature text-xs text-primary-900 mb-1.5 font-['DM_Sans'] font-medium">
                      {feature}
                    </div>
                  ))}
                </div>
                
                <button className="planning-cta bg-blue-ocean text-white border-none py-3 px-6 rounded-2xl text-sm font-bold cursor-pointer transition-all duration-300 font-['DM_Sans'] w-full hover:bg-emerald hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(88,194,125,0.3)]">
                  {option.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Packages */}
      <section className="packages-section py-[136px] bg-white">
        <div className="container max-w-[1280px] mx-auto px-20">
          <div className="section-header text-center mb-16">
            <h2 className="section-title text-5xl font-bold leading-[56px] text-primary-900 mb-3 font-['DM_Sans']">
              Ready-made adventures
            </h2>
            <p className="section-subtitle text-2xl font-normal leading-8 text-primary-400 font-['Poppins']">
              Handcrafted itineraries by travel experts
            </p>
          </div>

          <div className="packages-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12">
            {featuredPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="package-card bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]"
                onClick={() => viewPackage(pkg.id.toString())}
              >
                <div className="package-image relative h-[228px] overflow-hidden">
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="package-badge absolute top-4 left-4 bg-primary-900 text-white py-1 px-2 rounded-lg text-xs font-bold font-['DM_Sans']">
                    {pkg.duration}
                  </div>
                  <div className="package-price absolute top-4 right-4 bg-emerald text-white py-1 px-2 rounded-lg text-xs font-bold font-['DM_Sans']">
                    {pkg.price}
                  </div>
                </div>
                
                <div className="package-info p-5">
                  <h3 className="text-base font-medium text-primary-900 mb-1 font-['Poppins']">{pkg.title}</h3>
                  <p className="text-xs text-primary-400 mb-3 font-['Poppins']">{pkg.location}</p>
                  <div className="package-rating flex justify-between items-center text-xs font-['Poppins']">
                    <span className="text-primary-900 font-semibold">⭐ {pkg.rating}</span>
                    <span className="text-primary-400">({pkg.reviews} reviews)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="packages-cta text-center">
            <button 
              onClick={() => navigate('/packages')}
              className="view-all-btn bg-transparent border-2 border-primary-200 text-primary-900 py-3 px-6 rounded-2xl text-sm font-bold cursor-pointer transition-all duration-300 font-['DM_Sans'] hover:border-blue-ocean hover:text-blue-ocean"
            >
              View all packages
            </button>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="social-proof py-20 bg-white">
        <div className="container max-w-[1280px] mx-auto px-20">
          <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 max-w-[1000px] mx-auto text-center">
            <div className="stat-item p-8 bg-gradient-to-br from-white to-blue-ocean/[0.02] rounded-3xl border border-primary-200 transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(59,113,254,0.1)] hover:border-blue-ocean before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-blue-ocean before:via-emerald before:to-amber-premium">
              <div className="stat-number text-[40px] font-black bg-gradient-to-br from-blue-ocean to-emerald bg-clip-text text-transparent mb-2 font-['DM_Sans']">50,000+</div>
              <div className="stat-label text-base text-primary-400 font-medium font-['Poppins']">Happy Travelers</div>
            </div>
            <div className="stat-item p-8 bg-gradient-to-br from-white to-blue-ocean/[0.02] rounded-3xl border border-primary-200 transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(59,113,254,0.1)] hover:border-blue-ocean before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-blue-ocean before:via-emerald before:to-amber-premium">
              <div className="stat-number text-[40px] font-black bg-gradient-to-br from-blue-ocean to-emerald bg-clip-text text-transparent mb-2 font-['DM_Sans']">4.9⭐</div>
              <div className="stat-label text-base text-primary-400 font-medium font-['Poppins']">Average Rating</div>
            </div>
            <div className="stat-item p-8 bg-gradient-to-br from-white to-blue-ocean/[0.02] rounded-3xl border border-primary-200 transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(59,113,254,0.1)] hover:border-blue-ocean before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-blue-ocean before:via-emerald before:to-amber-premium">
              <div className="stat-number text-[40px] font-black bg-gradient-to-br from-blue-ocean to-emerald bg-clip-text text-transparent mb-2 font-['DM_Sans']">200+</div>
              <div className="stat-label text-base text-primary-400 font-medium font-['Poppins']">Destinations</div>
            </div>
            <div className="stat-item p-8 bg-gradient-to-br from-white to-blue-ocean/[0.02] rounded-3xl border border-primary-200 transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(59,113,254,0.1)] hover:border-blue-ocean before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-blue-ocean before:via-emerald before:to-amber-premium">
              <div className="stat-number text-[40px] font-black bg-gradient-to-br from-blue-ocean to-emerald bg-clip-text text-transparent mb-2 font-['DM_Sans']">24/7</div>
              <div className="stat-label text-base text-primary-400 font-medium font-['Poppins']">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Travel Blog */}
      <section className="travel-blog py-20 bg-white">
        <div className="container max-w-[1280px] mx-auto px-20">
          <div className="section-header text-center mb-16">
            <h2 className="section-title text-5xl font-bold leading-[56px] text-primary-900 mb-3 font-['DM_Sans']">
              Latest travel insights & tips
            </h2>
            <p className="section-subtitle text-2xl font-normal leading-8 text-primary-400 font-['Poppins']">
              Expert advice and inspiration for your next adventure
            </p>
          </div>
          
          <div className="blog-grid grid grid-cols-3 gap-8 mb-10">
            <div className="blog-card bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]" onClick={() => navigate('/blog/travel-planning-2024')}>
              <div className="blog-image relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=350&h=200&fit=crop" alt="Travel Planning" className="w-full h-[200px] object-cover transition-transform duration-300 hover:scale-105" />
                <div className="blog-category absolute top-4 left-4 bg-blue-ocean text-white py-1.5 px-3 rounded-xl text-xs font-semibold">Planning</div>
              </div>
              <div className="blog-content p-6">
                <h4 className="text-lg font-bold text-primary-900 mb-2 leading-tight">Ultimate Travel Planning Guide 2024</h4>
                <p className="text-sm text-primary-400 leading-relaxed mb-4">Everything you need to know to plan your perfect trip</p>
                <div className="blog-meta flex justify-between text-xs text-primary-400">
                  <span>Dec 15, 2024</span>
                  <span>8 min read</span>
                </div>
              </div>
            </div>
            
            <div className="blog-card bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]" onClick={() => navigate('/blog/budget-travel-tips')}>
              <div className="blog-image relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=350&h=200&fit=crop" alt="Budget Travel" className="w-full h-[200px] object-cover transition-transform duration-300 hover:scale-105" />
                <div className="blog-category absolute top-4 left-4 bg-blue-ocean text-white py-1.5 px-3 rounded-xl text-xs font-semibold">Budget Tips</div>
              </div>
              <div className="blog-content p-6">
                <h4 className="text-lg font-bold text-primary-900 mb-2 leading-tight">Travel More, Spend Less: Budget Secrets</h4>
                <p className="text-sm text-primary-400 leading-relaxed mb-4">Smart strategies to explore the world without breaking the bank</p>
                <div className="blog-meta flex justify-between text-xs text-primary-400">
                  <span>Dec 12, 2024</span>
                  <span>7 min read</span>
                </div>
              </div>
            </div>
            
            <div className="blog-card bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]" onClick={() => navigate('/blog/best-destinations-2024')}>
              <div className="blog-image relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=350&h=200&fit=crop" alt="Best Destinations" className="w-full h-[200px] object-cover transition-transform duration-300 hover:scale-105" />
                <div className="blog-category absolute top-4 left-4 bg-blue-ocean text-white py-1.5 px-3 rounded-xl text-xs font-semibold">Destinations</div>
              </div>
              <div className="blog-content p-6">
                <h4 className="text-lg font-bold text-primary-900 mb-2 leading-tight">Top 10 Must-Visit Destinations 2024</h4>
                <p className="text-sm text-primary-400 leading-relaxed mb-4">Discover the most amazing places to add to your travel bucket list</p>
                <div className="blog-meta flex justify-between text-xs text-primary-400">
                  <span>Dec 10, 2024</span>
                  <span>6 min read</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="blog-cta text-center">
            <a href="/blog" className="view-all-btn bg-blue-ocean text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 inline-block hover:bg-emerald hover:-translate-y-0.5">View All Articles</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;