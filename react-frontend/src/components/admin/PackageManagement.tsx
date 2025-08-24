import React, { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface Package {
  _id: string;
  title: string;
  destinations: string[];
  duration: number;
  price: {
    amount: number;
    currency: string;
  };
  status: string;
  category: string;
}

interface PackageManagementProps {
  onCreatePackage: () => void;
}

const PackageManagement: React.FC<PackageManagementProps> = ({ onCreatePackage }) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err: any) {
      setError('Failed to load packages. Please try again.');
      console.error('Package fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;
    
    try {
      await apiService.delete(`/admin/packages/${id}`);
      setPackages(packages.filter(pkg => pkg._id !== id));
    } catch (err: any) {
      alert('Failed to delete package. Please try again.');
      console.error('Package delete error:', err);
    }
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
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary-900">Package Management</h2>
        <Button onClick={onCreatePackage}>Add Package</Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      {packages.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No packages found</h3>
          <p className="text-gray-600 mb-6">Create your first travel package to get started</p>
          <Button onClick={onCreatePackage}>Create Package</Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary-200">
                <th className="text-left py-3 px-4">Package</th>
                <th className="text-left py-3 px-4">Destinations</th>
                <th className="text-left py-3 px-4">Duration</th>
                <th className="text-left py-3 px-4">Price</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {packages.map(pkg => (
                <tr key={pkg._id} className="border-b border-primary-100">
                  <td className="py-3 px-4 font-semibold">{pkg.title}</td>
                  <td className="py-3 px-4">{pkg.destinations.join(', ')}</td>
                  <td className="py-3 px-4">{pkg.duration} days</td>
                  <td className="py-3 px-4 font-bold text-emerald">
                    {pkg.price?.currency || '$'}{pkg.price?.amount || 0}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      pkg.status === 'active' ? 'bg-emerald/20 text-emerald' : 'bg-red-100 text-red-700'
                    }`}>
                      {pkg.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleDelete(pkg._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default PackageManagement;