
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import FinancialManagement from '@/components/FinancialManagement';
import ExpenseManagement from '@/components/ExpenseManagement';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Calculator, TrendingUp, Users, Receipt } from 'lucide-react';

const FinancialPage = () => {
  return (
    <ProtectedRoute requiredRoles={['admin', 'receptionist']}>
      <DashboardLayout>
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Calculator size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Financial Management</h1>
                <p className="text-green-100 mt-1">Manage salaries and business expenses</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <Users size={20} className="text-white" />
                  <div>
                    <p className="text-sm text-green-100">Employee Salaries</p>
                    <p className="font-semibold">Track & Manage</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <Receipt size={20} className="text-white" />
                  <div>
                    <p className="text-sm text-green-100">Business Expenses</p>
                    <p className="font-semibold">Record & Monitor</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <TrendingUp size={20} className="text-white" />
                  <div>
                    <p className="text-sm text-green-100">Financial Tracking</p>
                    <p className="font-semibold">Analysis & Reports</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <FinancialManagement />
          <ExpenseManagement />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default FinancialPage;
