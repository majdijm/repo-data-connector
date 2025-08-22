import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import MonthlySalaryManagement from '@/components/MonthlySalaryManagement';
import ProtectedRoute from '@/components/ProtectedRoute';

const MonthlySalariesPage = () => {
  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'receptionist', 'photographer', 'designer', 'editor', 'ads_manager']}>
      <DashboardLayout>
        <MonthlySalaryManagement />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default MonthlySalariesPage;