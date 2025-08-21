import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import AttendanceManagement from '@/components/AttendanceManagement';
import ProtectedRoute from '@/components/ProtectedRoute';

const AttendancePage = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <AttendanceManagement />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AttendancePage;