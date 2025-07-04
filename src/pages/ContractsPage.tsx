
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ContractManagement from '@/components/ContractManagement';
import ProtectedRoute from '@/components/ProtectedRoute';
import { FileText, Upload, Shield, Eye } from 'lucide-react';

const ContractsPage = () => {
  return (
    <ProtectedRoute requiredRoles={['admin', 'receptionist']}>
      <DashboardLayout>
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <FileText size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Contract Management</h1>
                <p className="text-blue-100 mt-1">Upload and manage client contracts</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <Upload size={20} className="text-white" />
                  <div>
                    <p className="text-sm text-blue-100">Contract Upload</p>
                    <p className="font-semibold">Secure Storage</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <Shield size={20} className="text-white" />
                  <div>
                    <p className="text-sm text-blue-100">Access Control</p>
                    <p className="font-semibold">Client Privacy</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <Eye size={20} className="text-white" />
                  <div>
                    <p className="text-sm text-blue-100">Document Management</p>
                    <p className="font-semibold">Easy Access</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ContractManagement />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default ContractsPage;
