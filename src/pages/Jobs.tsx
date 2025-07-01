
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import JobManagement from '@/components/JobManagement';

const Jobs = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
          <p className="text-gray-600 mt-1">Manage jobs and client assignments</p>
        </div>
        <JobManagement />
      </div>
    </DashboardLayout>
  );
};

export default Jobs;
