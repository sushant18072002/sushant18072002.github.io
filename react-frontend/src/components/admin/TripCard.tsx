import React from 'react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';

interface Trip {
  _id: string;
  title: string;
  description: string;
  primaryDestination?: { name: string };
  category?: { name: string; icon: string };
  duration?: { days: number; nights: number };
  pricing?: { estimated: number; currency: string };
  type: string;
  status: string;
  featured: boolean;
  stats?: { views: number; bookings: number };
  images?: Array<{ url: string; alt: string; isPrimary: boolean }>;
}

interface TripCardProps {
  trip: Trip;
  onEdit: (tripId: string) => void;
  onToggleFeatured: (tripId: string, featured: boolean) => void;
  onDuplicate: (tripId: string) => void;
  onDelete: (tripId: string) => void;
}

const TripCard: React.FC<TripCardProps> = ({
  trip,
  onEdit,
  onToggleFeatured,
  onDuplicate,
  onDelete
}) => {
  const primaryImage = trip.images?.find(img => img.isPrimary) || trip.images?.[0];

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      {primaryImage && (
        <div className="h-48 overflow-hidden">
          <img
            src={primaryImage.url?.startsWith('http') ? primaryImage.url : `http://localhost:3000${primaryImage.url}`}
            alt={primaryImage.alt || trip.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop';
            }}
          />
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-primary-900 truncate">
                {trip.title}
              </h3>
              {trip.featured && (
                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                  ⭐ Featured
                </span>
              )}
            </div>
            <p className="text-sm text-primary-600 mb-2">
              📍 {trip.primaryDestination?.name || 'Multiple Destinations'}
            </p>
            <p className="text-sm text-primary-500 line-clamp-2">
              {trip.description}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span className="text-primary-500">Duration:</span>
            <div className="font-semibold">{trip.duration?.days || 0} days</div>
          </div>
          <div>
            <span className="text-primary-500">Price:</span>
            <div className="font-semibold text-emerald">
              ${trip.pricing?.estimated?.toLocaleString() || '0'}
            </div>
          </div>
          <div>
            <span className="text-primary-500">Views:</span>
            <div className="font-semibold">{trip.stats?.views || 0}</div>
          </div>
          <div>
            <span className="text-primary-500">Bookings:</span>
            <div className="font-semibold">{trip.stats?.bookings || 0}</div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className={`px-2 py-1 rounded text-xs font-semibold ${
            trip.status === 'published' ? 'bg-emerald text-white' :
            trip.status === 'draft' ? 'bg-amber-100 text-amber-800' :
            'bg-primary-200 text-primary-700'
          }`}>
            {trip.status}
          </span>
          <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs capitalize">
            {trip.type}
          </span>
          {trip.category && (
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
              {trip.category.icon} {trip.category.name}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(trip._id)}
            className="flex-1"
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onToggleFeatured(trip._id, trip.featured)}
            className={trip.featured ? 'bg-amber-50 text-amber-700' : ''}
            title={trip.featured ? 'Remove from featured' : 'Add to featured'}
          >
            {trip.featured ? '⭐' : '☆'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDuplicate(trip._id)}
            title="Duplicate trip"
          >
            📋
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(trip._id)}
            className="text-red-600 hover:bg-red-50"
            title="Archive trip"
          >
            🗑️
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default TripCard;