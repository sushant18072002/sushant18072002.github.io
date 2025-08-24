import React, { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface User {
  _id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
  };
  role: string;
  status: string;
  totalBookings: number;
  totalSpent: number;
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/admin/users');
      if (response.success && response.data) {
        setUsers(response.data.users || response.data);
      }
    } catch (err: any) {
      setError('Failed to load users. Please try again.');
      console.error('User fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await apiService.put(`/admin/users/${userId}`, { status: newStatus });
      setUsers(users.map(user => 
        user._id === userId ? { ...user, status: newStatus } : user
      ));
    } catch (err: any) {
      alert('Failed to update user status. Please try again.');
      console.error('User status update error:', err);
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
        <h2 className="text-2xl font-bold text-primary-900">User Management</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">Export Users</Button>
          <Button size="sm">Add User</Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      {users.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600 mb-6">Users will appear here once they register</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary-200">
                <th className="text-left py-3 px-4">User</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Role</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Bookings</th>
                <th className="text-left py-3 px-4">Total Spent</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className="border-b border-primary-100">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-ocean text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {user.profile?.firstName?.[0]}{user.profile?.lastName?.[0]}
                      </div>
                      <span className="font-semibold">
                        {user.profile?.firstName} {user.profile?.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-primary-100 text-primary-700'
                    }`}>
                      {user.role?.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      user.status === 'active' ? 'bg-emerald/20 text-emerald' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.status?.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold">{user.totalBookings || 0}</td>
                  <td className="py-3 px-4 font-bold text-emerald">${user.totalSpent || 0}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className={user.status === 'active' ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-green-600 border-green-200 hover:bg-green-50'}
                        onClick={() => handleStatusChange(user._id, user.status === 'active' ? 'suspended' : 'active')}
                      >
                        {user.status === 'active' ? 'Suspend' : 'Activate'}
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

export default UserManagement;