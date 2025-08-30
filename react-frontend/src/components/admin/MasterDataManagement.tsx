import React, { useState } from 'react';
import CountryManagement from './CountryManagement';
import CategoryManagement from './CategoryManagement';
import CityManagement from './CityManagement';
import ActivityManagement from './ActivityManagement';
import AirlineManagement from './AirlineManagement';
import AirportManagement from './AirportManagement';
import Button from '@/components/common/Button';

const MasterDataManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('countries');

  const tabs = [
    { id: 'countries', label: 'Countries', icon: '🌍' },
    { id: 'categories', label: 'Categories', icon: '🏷️' },
    { id: 'cities', label: 'Cities', icon: '🏙️' },
    { id: 'airlines', label: 'Airlines', icon: '✈️' },
    { id: 'airports', label: 'Airports', icon: '🛫' },
    { id: 'activities', label: 'Activities', icon: '🎯' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary-900">Master Data Management</h2>
      </div>

      {/* Tabs */}
      <div className="border-b border-primary-200">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-ocean text-blue-ocean'
                  : 'border-transparent text-primary-500 hover:text-primary-700 hover:border-primary-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'countries' && <CountryManagement />}
        {activeTab === 'categories' && <CategoryManagement />}
        {activeTab === 'cities' && <CityManagement />}
        {activeTab === 'airlines' && <AirlineManagement />}
        {activeTab === 'airports' && <AirportManagement />}
        {activeTab === 'activities' && <ActivityManagement />}
      </div>
    </div>
  );
};

export default MasterDataManagement;