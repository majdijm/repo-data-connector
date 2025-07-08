
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PaymentManagement from '@/components/PaymentManagement';
import ProtectedRoute from '@/components/ProtectedRoute';
import { CreditCard, DollarSign, TrendingUp, FileText } from 'lucide-react';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useAuth } from '@/contexts/AuthContext';

const PaymentsPage = () => {
  const { canManagePayments } = useRoleAccess();
  const { userProfile } = useAuth();

  console.log('PaymentsPage Access Check:', {
    userProfile: userProfile?.role,
    canManagePayments: canManagePayments()
  });

  return (
    <ProtectedRoute requiredRoles={['admin', 'receptionist']}>
      <DashboardLayout>
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <CreditCard size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Payment Management</h1>
                <p className="text-orange-100 mt-1">Track payments and financial records</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <DollarSign size={20} className="text-white" />
                  <div>
                    <p className="text-sm text-orange-100">Payment Recording</p>
                    <p className="font-semibold">Track Transactions</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <TrendingUp size={20} className="text-white" />
                  <div>
                    <p className="text-sm text-orange-100">Financial Tracking</p>
                    <p className="font-semibold">Revenue Analysis</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <FileText size={20} className="text-white" />
                  <div>
                    <p className="text-sm text-orange-100">Payment History</p>
                    <p className="font-semibold">Detailed Records</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {canManagePayments() ? (
            <PaymentManagement />
          ) : (
            <div className="text-center p-8 bg-red-50 rounded-lg">
              <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
              <p className="text-red-600">
                You don't have permission to access the payments page. 
                Current role: {userProfile?.role}
              </p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default PaymentsPage;
