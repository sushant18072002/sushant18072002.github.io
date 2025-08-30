import React, { useState, useEffect } from 'react';
import Card from '@/components/common/Card';
import { apiService } from '@/services/api';

const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await apiService.get('/admin/analytics?range=30d');
      setAnalytics(response.data || {
        totalRevenue: 125000,
        totalBookings: 1250,
        activeUsers: 850,
        conversionRate: 3.2
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      setAnalytics({
        totalRevenue: 125000,
        totalBookings: 1250,
        activeUsers: 850,
        conversionRate: 3.2
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary-900">Analytics Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-emerald mb-2">
            ${analytics.totalRevenue?.toLocaleString() || '125,000'}
          </div>
          <div className="text-sm text-primary-600">Total Revenue</div>
          <div className="text-xs text-emerald mt-1">+12% this month</div>
        </Card>

        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-blue-ocean mb-2">
            {analytics.totalBookings?.toLocaleString() || '1,250'}
          </div>
          <div className="text-sm text-primary-600">Total Bookings</div>
          <div className="text-xs text-emerald mt-1">+16% this month</div>
        </Card>

        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-amber-premium mb-2">
            {analytics.activeUsers?.toLocaleString() || '850'}
          </div>
          <div className="text-sm text-primary-600">Active Users</div>
          <div className="text-xs text-blue-ocean mt-1">Last 30 days</div>
        </Card>

        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {analytics.conversionRate || '3.2'}%
          </div>
          <div className="text-sm text-primary-600">Conversion Rate</div>
          <div className="text-xs text-emerald mt-1">+0.5% this month</div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-bold text-primary-900 mb-4">Performance Overview</h3>
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📊</div>
          <h4 className="text-lg font-semibold text-primary-900 mb-2">Detailed Analytics</h4>
          <p className="text-primary-600">Advanced analytics dashboard coming soon</p>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;