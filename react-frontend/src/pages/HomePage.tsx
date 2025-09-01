import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HowItWorks from '../components/home/HowItWorks';
import FeaturedDestinations from '../components/home/FeaturedDestinations';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    travelers: '2'
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative h-[80vh] bg-gradient-to-r from-blue-600 via-blue-700 to-emerald-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <img 
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop" 
          alt="Travel destination" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <div className="text-center mb-12">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 font-['DM_Sans'] leading-[0.9] tracking-tight">
              Air, sleep,<br/>dream
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 font-['Poppins'] mb-8 max-w-2xl mx-auto">
              Find and book a great experience.
            </p>
          </div>

          {/* Horizontal Search Widget */}
          <div className="max-w-5xl mx-auto w-full">
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20">
              {/* Tab Navigation */}
              <div className="flex items-center gap-8 mb-6 border-b border-gray-200 pb-4">
                <button className="text-blue-600 font-bold font-['DM_Sans'] text-sm border-b-2 border-blue-600 pb-2">
                  Stays
                </button>
                <button className="text-gray-500 font-bold font-['DM_Sans'] text-sm hover:text-gray-700">
                  Flights
                </button>
                <button className="text-gray-500 font-bold font-['DM_Sans'] text-sm hover:text-gray-700">
                  Cars
                </button>
                <button className="text-gray-500 font-bold font-['DM_Sans'] text-sm hover:text-gray-700">
                  Things to do
                </button>
              </div>

              {/* Search Form */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">
                    Location
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Where are you going?"
                      className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-['Poppins'] text-lg"
                      value={searchData.location}
                      onChange={(e) => setSearchData({...searchData, location: e.target.value})}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      📍
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">
                    Check in
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-['Poppins']"
                    value={searchData.checkIn}
                    onChange={(e) => setSearchData({...searchData, checkIn: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">
                    Check out
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-['Poppins']"
                    value={searchData.checkOut}
                    onChange={(e) => setSearchData({...searchData, checkOut: e.target.value})}
                  />
                </div>

                <div className="flex items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">
                      Travelers
                    </label>
                    <select
                      className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-['Poppins']"
                      value={searchData.travelers}
                      onChange={(e) => setSearchData({...searchData, travelers: e.target.value})}
                    >
                      <option value="1">1 adult</option>
                      <option value="2">2 adults</option>
                      <option value="3">3 adults</option>
                      <option value="4">4 adults</option>
                    </select>
                  </div>
                  <button className="ml-4 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center transition-colors shadow-lg">
                    🔍
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Adventure Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 font-['DM_Sans']">
              Let's go on an adventure
            </h2>
            <p className="text-xl text-gray-600 font-['Poppins']">
              Find and book a great experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Luxury resort at the sea", places: "9,326 places", icon: "🏖️", color: "from-blue-400 to-cyan-400" },
              { title: "Camping amidst the wild", places: "12,326 places", icon: "🏕️", color: "from-green-400 to-emerald-400" },
              { title: "Mountain adventures", places: "5,326 places", icon: "🏔️", color: "from-purple-400 to-pink-400" }
            ].map((category, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 h-64 mb-6">
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-80`}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl">{category.icon}</span>
                  </div>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2 font-['Poppins']">
                  {category.title}
                </h3>
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-bold font-['DM_Sans'] uppercase">
                  {category.places}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />

      {/* Featured Destinations */}
      <FeaturedDestinations />

      {/* Newsletter CTA */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-black text-white mb-4 font-['DM_Sans']">
            Go somewhere
          </h2>
          <p className="text-xl text-gray-300 mb-12 font-['Poppins']">
            Let's go on an adventure
          </p>
          
          <div className="max-w-md mx-auto">
            <div className="flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-2xl border-0 font-['Poppins'] text-lg"
              />
              <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold font-['DM_Sans'] hover:bg-blue-700 transition-colors">
                →
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;