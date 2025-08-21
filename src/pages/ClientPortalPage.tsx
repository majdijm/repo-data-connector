import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ClientPortal from '@/components/ClientPortal';
import ProtectedRoute from '@/components/ProtectedRoute';

const ClientPortalPage = () => {
  return (
    <ProtectedRoute requiredRoles={['client']}>
      <DashboardLayout>
        <ClientPortal />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default ClientPortalPage;