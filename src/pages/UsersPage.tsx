
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import UserManagement from '@/components/UserManagement';
import ProtectedRoute from '@/components/ProtectedRoute';

const UsersPage = () => {
  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <DashboardLayout>
        <UserManagement />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default UsersPage;
