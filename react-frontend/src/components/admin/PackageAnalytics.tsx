import React, { useState, useEffect } from 'react';
import Card from '@/components/common/Card';
import { apiService } from '@/services/api';

interface PackageStats {
  totalPackages: number;
  activePackages: number;
  featuredPackages: number;
  averagePrice: number;
  categoryBreakdown: Array<{ category: string; count: number }>;
  recentPackages: Array<{ title: string; createdAt: string; status: string }>;
}

const PackageAnalytics: React.FC = () => {
  const [stats, setStats] = useState<PackageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await apiService.get('/admin/packages');
      if (response.success && response.data) {
        const packages = response.data.packages || [];
        
        const categoryBreakdown = packages.reduce((acc: any, pkg: any) => {
          const category = pkg.category || 'Other';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {});

        const totalPrice = packages.reduce((sum: number, pkg: any) => {
          return sum + (pkg.price?.amount || 0);
        }, 0);

        setStats({
          totalPackages: packages.length,
          activePackages: packages.filter((pkg: any) => pkg.status === 'active').length,
          featuredPackages: packages.filter((pkg: any) => pkg.featured).length,
          averagePrice: packages.length > 0 ? Math.round(totalPrice / packages.length) : 0,
          categoryBreakdown: Object.entries(categoryBreakdown).map(([category, count]) => ({
            category,
            count: count as number
          })),
          recentPackages: packages.slice(0, 5).map((pkg: any) => ({
            title: pkg.title,
            createdAt: new Date().toLocaleDateString(), // Mock date
            status: pkg.status
          }))
        });
      }
    } catch (error) {
      console.error('Failed to load package stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-primary-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-primary-200 rounded"></div>
            <div className="h-3 bg-primary-200 rounded w-5/6"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="p-6">
        <p className="text-primary-600">Failed to load package analytics</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-primary-900">Package Analytics</h3>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-ocean mb-1">{stats.totalPackages}</div>
          <div className="text-sm text-primary-600">Total Packages</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-emerald mb-1">{stats.activePackages}</div>
          <div className="text-sm text-primary-600">Active Packages</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-amber-premium mb-1">{stats.featuredPackages}</div>
          <div className="text-sm text-primary-600">Featured Packages</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 mb-1">${stats.averagePrice}</div>
          <div className="text-sm text-primary-600">Average Price</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold text-primary-900 mb-4">Category Breakdown</h4>
          <div className="space-y-3">
            {stats.categoryBreakdown.map(({ category, count }) => (
              <div key={category} className="flex justify-between items-center">
                <span className="text-primary-700 capitalize">{category}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-primary-200 rounded-full h-2">
                    <div 
                      className="bg-blue-ocean h-2 rounded-full" 
                      style={{ width: `${(count / stats.totalPackages) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-primary-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Packages */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold text-primary-900 mb-4">Recent Packages</h4>
          <div className="space-y-3">
            {stats.recentPackages.map((pkg, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-primary-100 last:border-b-0">
                <div>
                  <div className="font-medium text-primary-900">{pkg.title}</div>
                  <div className="text-sm text-primary-600">{pkg.createdAt}</div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  pkg.status === 'active' ? 'bg-emerald text-white' : 'bg-primary-200 text-primary-700'
                }`}>
                  {pkg.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PackageAnalytics;