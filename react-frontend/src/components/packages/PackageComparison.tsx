import React, { useState } from 'react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';

interface Package {
  id: string;
  title: string;
  description: string;
  destination: string;
  duration: number;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  images: string[];
  highlights: string[];
  inclusions: string[];
  category: string;
}

interface PackageComparisonProps {
  packages: Package[];
  onClose: () => void;
  onSelectPackage: (packageId: string) => void;
}

const PackageComparison: React.FC<PackageComparisonProps> = ({ 
  packages, 
  onClose, 
  onSelectPackage 
}) => {
  const [selectedPackages] = useState<Package[]>(packages.slice(0, 3));

  const comparisonFeatures = [
    { key: 'destination', label: 'Destination', icon: '📍' },
    { key: 'duration', label: 'Duration', icon: '📅' },
    { key: 'price', label: 'Price', icon: '💰' },
    { key: 'rating', label: 'Rating', icon: '⭐' },
    { key: 'category', label: 'Category', icon: '🏷️' },
    { key: 'highlights', label: 'Highlights', icon: '✨' }
  ];

  const formatValue = (pkg: Package, key: string) => {
    switch (key) {
      case 'duration':
        return `${pkg.duration} days`;
      case 'price':
        return `$${pkg.price}`;
      case 'rating':
        return `${pkg.rating} ⭐`;
      case 'highlights':
        return pkg.highlights.slice(0, 2).join(', ');
      default:
        return pkg[key as keyof Package] as string;
    }
  };

  const getBestValue = (feature: string) => {
    switch (feature) {
      case 'price':
        return Math.min(...selectedPackages.map(pkg => pkg.price));
      case 'rating':
        return Math.max(...selectedPackages.map(pkg => pkg.rating));
      default:
        return null;
    }
  };

  const isBestValue = (pkg: Package, feature: string) => {
    const bestValue = getBestValue(feature);
    if (bestValue === null) return false;
    return (feature === 'price' && pkg.price === bestValue) || 
           (feature === 'rating' && pkg.rating === bestValue);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-primary-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-primary-900">Compare Packages</h2>
            <button onClick={onClose} className="text-2xl text-primary-400 hover:text-primary-600">×</button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-4">
              <div className="h-48"></div>
              {comparisonFeatures.map(feature => (
                <div key={feature.key} className="h-12 flex items-center font-semibold text-primary-900">
                  {feature.icon} {feature.label}
                </div>
              ))}
            </div>

            {selectedPackages.map(pkg => (
              <div key={pkg.id} className="space-y-4">
                <Card className="p-4">
                  <img
                    src={pkg.images[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop'}
                    alt={pkg.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-bold text-primary-900 mb-2">{pkg.title}</h3>
                  <Button size="sm" fullWidth onClick={() => onSelectPackage(pkg.id)}>
                    Select
                  </Button>
                </Card>

                {comparisonFeatures.map(feature => (
                  <div key={feature.key} className="h-12 flex items-center">
                    <div className={`p-2 rounded w-full text-sm ${
                      isBestValue(pkg, feature.key) 
                        ? 'bg-emerald text-white font-semibold' 
                        : 'bg-primary-50 text-primary-700'
                    }`}>
                      {formatValue(pkg, feature.key)}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageComparison;