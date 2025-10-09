import React, { useState, useEffect } from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { corporateService } from '@/services/corporate.service';

const CorporateManagement: React.FC = () => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('companies');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'companies') {
        // Admin endpoint to get all companies
        const response = await fetch('/api/admin/corporate/companies', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        setCompanies(data.data?.companies || []);
      } else {
        // Admin endpoint to get all corporate bookings
        const response = await fetch('/api/admin/corporate/bookings', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        setBookings(data.data?.bookings || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyAction = async (companyId: string, action: 'activate' | 'suspend') => {
    try {
      await fetch(`/api/admin/corporate/companies/${companyId}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      loadData();
    } catch (error) {
      console.error(`Failed to ${action} company:`, error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary-900">Corporate Management</h2>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'companies' ? 'default' : 'outline'}
            onClick={() => setActiveTab('companies')}
          >
            Companies
          </Button>
          <Button
            variant={activeTab === 'bookings' ? 'default' : 'outline'}
            onClick={() => setActiveTab('bookings')}
          >
            Bookings
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {activeTab === 'companies' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Registered Companies</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Company</th>
                      <th className="text-left py-2">Employees</th>
                      <th className="text-left py-2">Total Spent</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map((company) => (
                      <tr key={company._id} className="border-b">
                        <td className="py-3">
                          <div>
                            <div className="font-medium">{company.name}</div>
                            <div className="text-sm text-gray-500">{company.contact?.email}</div>
                          </div>
                        </td>
                        <td className="py-3">{company.stats?.totalEmployees || 0}</td>
                        <td className="py-3">${company.stats?.totalSpent?.toLocaleString() || 0}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            company.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {company.status}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            {company.status === 'active' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCompanyAction(company._id, 'suspend')}
                              >
                                Suspend
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleCompanyAction(company._id, 'activate')}
                              >
                                Activate
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {activeTab === 'bookings' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Corporate Bookings</h3>
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{booking.bookingReference}</h4>
                        <p className="text-sm text-gray-600">
                          {booking.company?.name} • {booking.corporate?.department}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.travelers?.length} travelers • ${booking.pricing?.total}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending-approval' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default CorporateManagement;