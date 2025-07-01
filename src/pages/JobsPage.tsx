
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import JobManagement from '@/components/JobManagement';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Briefcase, Calendar, Users, TrendingUp } from 'lucide-react';

const JobsPage = () => {
  return (
    <ProtectedRoute requiredRoles={['admin', 'receptionist', 'photographer', 'designer', 'editor']}>
      <DashboardLayout>
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Briefcase size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Job Management</h1>
                <p className="text-blue-100 mt-1">Create, assign, and track project progress</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <Calendar size={20} className="text-white" />
                  <div>
                    <p className="text-sm text-blue-100">Project Planning</p>
                    <p className="font-semibold">Schedule & Assign</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <Users size={20} className="text-white" />
                  <div>
                    <p className="text-sm text-blue-100">Team Collaboration</p>
                    <p className="font-semibold">Assign Tasks</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <TrendingUp size={20} className="text-white" />
                  <div>
                    <p className="text-sm text-blue-100">Progress Tracking</p>
                    <p className="font-semibold">Real-time Updates</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <JobManagement />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default JobsPage;
