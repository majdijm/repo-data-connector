
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import UserManagement from '@/components/UserManagement';

const Users = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-2">Manage team members and client accounts</p>
        </div>

        <UserManagement />
      </div>
    </DashboardLayout>
  );
};

export default Users;
