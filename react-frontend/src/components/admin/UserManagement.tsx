import React, { useState } from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

const UserManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary-900">User Management</h2>
        <Button>+ Add User</Button>
      </div>

      <Card className="p-8 text-center">
        <div className="text-6xl mb-4">👥</div>
        <h3 className="text-xl font-semibold text-primary-900 mb-2">User Management</h3>
        <p className="text-primary-600 mb-6">Manage user accounts, roles, and permissions</p>
        <Button>Get Started</Button>
      </Card>
    </div>
  );
};

export default UserManagement;