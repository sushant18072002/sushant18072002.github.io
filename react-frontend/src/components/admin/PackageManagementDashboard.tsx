import React, { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface Package {
  _id: string;
  title: string;
  description: string;
  destinations: string[];
  duration: number;
  price: { amount: number; currency: string };
  category: string;
  images: Array<{ url: string; isPrimary: boolean }> | string[];
  status: string;
  featured: boolean;
}

interface PackageManagementDashboardProps {
  onCreatePackage: () => void;
  onEditPackage?: (packageId: string) => void;
}

const PackageManagementDashboard: React.FC<PackageManagementDashboardProps> = ({ onCreatePackage, onEditPackage }) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/admin/packages');
      if (response.success && response.data) {
        setPackages(response.data.packages || response.data);
      }
    } catch (error) {
      console.error('Failed to fetch packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;
    
    try {
      await apiService.delete(`/admin/packages/${id}`);
      setPackages(packages.filter(pkg => pkg._id !== id));
    } catch (error) {
      alert('Failed to delete package');
    }
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    try {
      const response = await apiService.put(`/admin/packages/${id}`, { featured: !featured });
      if (response.success) {
        setPackages(packages.map(pkg => 
          pkg._id === id ? { ...pkg, featured: !featured } : pkg
        ));
      } else {
        alert('Failed to update package: ' + (response.error?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Toggle featured error:', error);
      alert('Failed to update package');
    }
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.destinations.some(dest => dest.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || pkg.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || pkg.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getPrimaryImage = (images: Array<{ url: string; isPrimary: boolean }> | string[] | undefined) => {
    if (!images || images.length === 0) {
      return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop';
    }
    
    // Handle string array (old format)
    if (typeof images[0] === 'string') {
      return images[0] as string;
    }
    
    // Handle object array (new format)
    const imageObjects = images as Array<{ url: string; isPrimary: boolean }>;
    const primary = imageObjects.find(img => img.isPrimary);
    return primary?.url || imageObjects[0]?.url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-primary-900">Package Management</h2>
          <p className="text-primary-600">Manage your travel packages</p>
        </div>
        <Button onClick={onCreatePackage}>
          + Add Package
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search packages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="adventure">Adventure</option>
              <option value="luxury">Luxury</option>
              <option value="cultural">Cultural</option>
              <option value="beach">Beach</option>
              <option value="family">Family</option>
            </select>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-primary-600">
              {filteredPackages.length} of {packages.length} packages
            </span>
          </div>
        </div>
      </Card>

      {/* Package Grid */}
      {filteredPackages.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No packages found</h3>
          <p className="text-gray-600 mb-6">Create your first package to get started</p>
          <Button onClick={onCreatePackage}>Create Package</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map(pkg => (
            <Card key={pkg._id} className="overflow-hidden">
              <div className="relative">
                <img
                  src={getPrimaryImage(pkg.images)}
                  alt={pkg.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 left-2 flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold text-white ${
                    pkg.status === 'active' ? 'bg-emerald' : 'bg-red-500'
                  }`}>
                    {pkg.status.toUpperCase()}
                  </span>
                  {pkg.featured && (
                    <span className="px-2 py-1 rounded text-xs font-bold text-white bg-amber-500">
                      FEATURED
                    </span>
                  )}
                </div>
                <div className="absolute top-2 right-2">
                  <span className="bg-primary-900 text-white px-2 py-1 rounded text-xs font-bold">
                    {pkg.duration} days
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-semibold">
                    {pkg.category}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-primary-900 mb-2">{pkg.title}</h3>
                <p className="text-primary-600 mb-2">📍 {pkg.destinations.join(', ')}</p>
                <p className="text-primary-600 text-sm mb-4 line-clamp-2">{pkg.description}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <div className="text-xl font-bold text-emerald">
                    ${pkg.price.amount} {pkg.price.currency}
                  </div>
                  <div className="text-sm text-primary-500">
                    {pkg.images?.length || 0} image{(pkg.images?.length || 0) !== 1 ? 's' : ''}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleFeatured(pkg._id, pkg.featured)}
                    className="flex-1"
                  >
                    {pkg.featured ? 'Unfeature' : 'Feature'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => onEditPackage ? onEditPackage(pkg._id) : alert('Edit functionality coming soon')}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleDelete(pkg._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PackageManagementDashboard;