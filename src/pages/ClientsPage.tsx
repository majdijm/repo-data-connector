
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ClientManagement from '@/components/ClientManagement';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Users, UserPlus, Building, Phone } from 'lucide-react';

const ClientsPage = () => {
  return (
    <ProtectedRoute requiredRoles={['admin', 'receptionist', 'photographer', 'designer', 'editor']}>
      <DashboardLayout>
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Users size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Client Management</h1>
                <p className="text-green-100 mt-1">Manage client information and relationships</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <UserPlus size={20} className="text-white" />
                  <div>
                    <p className="text-sm text-green-100">Client Onboarding</p>
                    <p className="font-semibold">Add New Clients</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <Building size={20} className="text-white" />
                  <div>
                    <p className="text-sm text-green-100">Profile Management</p>
                    <p className="font-semibold">Update Information</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <Phone size={20} className="text-white" />
                  <div>
                    <p className="text-sm text-green-100">Contact Management</p>
                    <p className="font-semibold">Stay Connected</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ClientManagement />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default ClientsPage;
