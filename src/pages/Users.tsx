
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import UserManagement from '@/components/UserManagement';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Users as UsersIcon, Shield, UserCheck } from 'lucide-react';

const Users = () => {
  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <UsersIcon size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">User Management</h1>
                <p className="text-teal-100 mt-1">Manage team members and client accounts</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <Shield size={20} className="text-white" />
                  <div>
                    <p className="text-sm text-teal-100">Role-Based Access</p>
                    <p className="font-semibold">Secure Management</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <UserCheck size={20} className="text-white" />
                  <div>
                    <p className="text-sm text-teal-100">User Permissions</p>
                    <p className="font-semibold">Granular Control</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <UsersIcon size={20} className="text-white" />
                  <div>
                    <p className="text-sm text-teal-100">Team Management</p>
                    <p className="font-semibold">Efficient Workflow</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <UserManagement />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Users;
