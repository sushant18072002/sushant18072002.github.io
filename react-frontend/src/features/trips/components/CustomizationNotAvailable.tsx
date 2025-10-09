import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button';

interface CustomizationNotAvailableProps {
  tripTitle?: string;
  tripId?: string;
}

export const CustomizationNotAvailable: React.FC<CustomizationNotAvailableProps> = ({ 
  tripTitle, 
  tripId 
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center shadow-lg">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">🛠️</span>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Customization Coming Soon
        </h1>
        
        <p className="text-gray-600 mb-6">
          Trip customization for "{tripTitle || 'this trip'}" is not available yet. 
          We're working hard to bring you personalized travel experiences.
        </p>
        
        <div className="space-y-3">
          <Button 
            onClick={() => navigate(`/trips/${tripId}`)}
            className="w-full"
          >
            View Trip Details
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/trips')}
            className="w-full"
          >
            Browse Other Trips
          </Button>
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">What's Coming:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Custom flight selection</li>
            <li>• Hotel preferences</li>
            <li>• Activity customization</li>
            <li>• Flexible dates</li>
          </ul>
        </div>
      </div>
    </div>
  );
};