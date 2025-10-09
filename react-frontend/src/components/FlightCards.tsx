import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import API_CONFIG from '@/config/api.config';


interface Airport {
  _id: string;
  code: string;
  name: string;
  city: string;
}

interface Route {
  from: Airport;
  to: Airport;
  count: number;
  avgPrice: number;
}

interface Flight {
  _id: string;
  flightNumber: string;
  airline: { name: string; code: string; logo?: string };
  route: {
    departure: { airport: Airport; scheduledTime: string };
    arrival: { airport: Airport; scheduledTime: string };
  };
  pricing: { economy: { totalPrice: number } };
  images?: Array<{ url: string; alt: string }>;
}


const PopularRoutesCards: React.FC = () => {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<Route[]>([]);

  useEffect(() => {
    loadPopularRoutes();
  }, []);

  const loadPopularRoutes = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/flights/popular-routes`);
      const data = await response.json();
      if (data.success) {
        setRoutes(data.data.routes || []);
      }
    } catch (error) {
      console.error('Failed to load popular routes:', error);
    }
  };

  return (
    <div className="mb-12">
      <h3 className="text-xl font-bold text-primary-900 mb-6">Popular Routes</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {routes.map((route, index) => (
          <Card 
            key={`${route.from?._id}-${route.to?._id}`}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              const url = `/flights?from=${route.from?.code}&to=${route.to?.code}&departDate=${today}&passengers=1&class=economy&autoSearch=true`;
              console.log('Navigating to:', url);
              navigate(url);
            }}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold text-primary-900">
                  {route.from?.city || 'Unknown'} → {route.to?.city || 'Unknown'}
                </div>
                <div className="text-sm text-primary-600">
                  {route.from?.code} - {route.to?.code}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-primary-900">
                  ${route.avgPrice?.toFixed(2)}
                </div>
                <div className="text-xs text-primary-500">
                  avg price
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const FlightDealsCards: React.FC = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState<Flight[]>([]);

  useEffect(() => {
    loadFlightDeals();
  }, []);

  const loadFlightDeals = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/flights/deals`);
      const data = await response.json();
      if (data.success) {
        setDeals(data.data.deals || []);
      }
    } catch (error) {
      console.error('Failed to load flight deals:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="mb-12">
      <h3 className="text-xl font-bold text-primary-900 mb-6">Today's Best Deals</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {deals.map((flight) => (
          <Card 
            key={flight._id}
            className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
            onClick={() => navigate(`/flights/${flight._id}`)}
          >
            <div className="relative">
              <img
                src={flight.images?.[0]?.url || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=300&h=150&fit=crop&auto=format'}
                alt={`${flight.airline?.name} Flight`}
                className="w-full h-32 object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=300&h=150&fit=crop&auto=format';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-2 left-2 right-2 text-white">
                <div className="text-sm font-semibold">
                  {flight.route?.departure?.airport?.city} → {flight.route?.arrival?.airport?.city}
                </div>
              </div>
            </div>
            <div className="p-4 text-center">
              <div className="text-sm text-primary-600 mb-2">
                {flight.airline?.name}
              </div>
              <div className="text-xl font-bold text-emerald mb-2">
                ${flight.pricing?.economy?.totalPrice}
              </div>
              <div className="text-xs text-primary-500">
                {formatDate(flight.route?.departure?.scheduledTime)}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export { PopularRoutesCards, FlightDealsCards };
