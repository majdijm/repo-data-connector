
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PackageManagement from '@/components/PackageManagement';

const PackagesPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Package Management</h1>
          <p className="text-gray-600 mt-1">Manage pricing packages and client assignments</p>
        </div>
        <PackageManagement />
      </div>
    </DashboardLayout>
  );
};

export default PackagesPage;
