import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import SessionPaymentManagement from '@/components/SessionPaymentManagement';
import ProtectedRoute from '@/components/ProtectedRoute';

const SessionPaymentsPage = () => {
  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'receptionist', 'photographer', 'designer', 'editor', 'ads_manager']}>
      <DashboardLayout>
        <SessionPaymentManagement />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default SessionPaymentsPage;