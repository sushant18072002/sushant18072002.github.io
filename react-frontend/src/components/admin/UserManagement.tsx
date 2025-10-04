import React, { useState, useEffect } from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { apiService } from '@/services/api.service';

interface User {
  _id: string;
  email: string;
  role: string;
  status: string;
  active: boolean;
  emailVerified: boolean;
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    nationality?: string;
    passportNumber?: string;
    passportExpiry?: string;
  };
  preferences?: {
    currency?: string;
    language?: string;
    timezone?: string;
  };
  loyaltyPoints?: number;
  totalBookings?: number;
  totalSpent?: number;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
  emailVerifiedAt?: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  const loadUsers = async (page = 1, search = '', role = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(role && { role })
      });
      
      const response = await apiService.get(`/admin/users?${params}`);
      
      if (response.success) {
        setUsers(response.data.users || []);
        setTotalPages(response.data.pagination?.pages || 1);
        setCurrentPage(page);
      } else {
        setError('Failed to load users');
      }
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSearch = () => {
    loadUsers(1, searchQuery, selectedRole);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await apiService.put(`/admin/users/${userId}`, { role: newRole });
      if (response.success) {
        loadUsers(currentPage, searchQuery, selectedRole);
      }
    } catch (err) {
      console.error('Error updating user role:', err);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const response = await apiService.put(`/admin/users/${userId}`, { status: newStatus });
      if (response.success) {
        loadUsers(currentPage, searchQuery, selectedRole);
      }
    } catch (err) {
      console.error('Error updating user status:', err);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-primary-900">User Management</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => loadUsers(currentPage, searchQuery, selectedRole)}>
            🔄 Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
          </select>
          <Button onClick={handleSearch}>Search</Button>
        </div>
      </Card>

      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {/* Users Table */}
      <Card className="overflow-hidden">
        {users.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-primary-900 mb-2">No Users Found</h3>
            <p className="text-primary-600">No users match your search criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.profile?.firstName && user.profile?.lastName
                            ? `${user.profile.firstName} ${user.profile.lastName}`
                            : user.email}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.status}
                        onChange={(e) => handleStatusChange(user._id, e.target.value)}
                        className={`text-sm border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 ${
                          user.status === 'active' ? 'text-green-600 border-green-300' :
                          user.status === 'inactive' ? 'text-yellow-600 border-yellow-300' :
                          'text-red-600 border-red-300'
                        }`}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserDetails(true);
                        }}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowUserDetails(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary-900">User Details</h2>
                <button
                  onClick={() => setShowUserDetails(false)}
                  className="text-2xl text-primary-400 hover:text-primary-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-semibold text-primary-900 mb-3">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Full Name</label>
                      <p className="text-base text-gray-900">
                        {selectedUser.profile?.firstName && selectedUser.profile?.lastName
                          ? `${selectedUser.profile.firstName} ${selectedUser.profile.lastName}`
                          : 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Email</label>
                      <p className="text-base text-gray-900">{selectedUser.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-base text-gray-900">{selectedUser.profile?.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Role</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        selectedUser.role === 'moderator' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedUser.role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Account Status */}
                <div>
                  <h3 className="text-lg font-semibold text-primary-900 mb-3">Account Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedUser.status === 'active' ? 'bg-green-100 text-green-800' :
                        selectedUser.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                        selectedUser.status === 'suspended' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedUser.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Email Verified</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedUser.emailVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedUser.emailVerified ? 'Verified' : 'Not Verified'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Joined Date</label>
                      <p className="text-base text-gray-900">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Last Login</label>
                      <p className="text-base text-gray-900">
                        {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                {(selectedUser.profile?.dateOfBirth || selectedUser.profile?.nationality || selectedUser.profile?.gender) && (
                  <div>
                    <h3 className="text-lg font-semibold text-primary-900 mb-3">Additional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedUser.profile?.dateOfBirth && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Date of Birth</label>
                          <p className="text-base text-gray-900">{new Date(selectedUser.profile.dateOfBirth).toLocaleDateString()}</p>
                        </div>
                      )}
                      {selectedUser.profile?.gender && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Gender</label>
                          <p className="text-base text-gray-900 capitalize">{selectedUser.profile.gender}</p>
                        </div>
                      )}
                      {selectedUser.profile?.nationality && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Nationality</label>
                          <p className="text-base text-gray-900">{selectedUser.profile.nationality}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowUserDetails(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      // Handle edit user action
                      console.log('Edit user:', selectedUser._id);
                    }}
                    className="flex-1"
                  >
                    Edit User
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => loadUsers(currentPage - 1, searchQuery, selectedRole)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => loadUsers(currentPage + 1, searchQuery, selectedRole)}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default UserManagement;