
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Palette, Brush, Eye, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSupabaseData } from '@/hooks/useSupabaseData';

const DesignTasksPage = () => {
  const { recentJobs, isLoading } = useSupabaseData();
  
  const designTasks = recentJobs.filter(job => job.type === 'design');

  return (
    <ProtectedRoute requiredRoles={['admin', 'receptionist', 'designer']}>
      <DashboardLayout>
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Palette size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Design Projects</h1>
                <p className="text-indigo-100 mt-1">Manage design tasks and creative projects</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <Brush size={20} className="text-white" />
                  <div>
                    <p className="text-sm text-indigo-100">Creative Design</p>
                    <p className="font-semibold">Design & Create</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <Eye size={20} className="text-white" />
                  <div>
                    <p className="text-sm text-indigo-100">Client Review</p>
                    <p className="font-semibold">Review Process</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <CheckCircle size={20} className="text-white" />
                  <div>
                    <p className="text-sm text-indigo-100">Final Assets</p>
                    <p className="font-semibold">Asset Delivery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <h2 className="text-2xl font-bold">Design Tasks</h2>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : designTasks.length > 0 ? (
              designTasks.map(task => (
                <Card key={task.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{task.title}</h3>
                          <Badge variant="outline">{task.status}</Badge>
                        </div>
                        <p className="text-gray-600 mb-2">Client: {task.clients?.name || 'No client'}</p>
                        {task.due_date && (
                          <p className="text-sm text-gray-500">Due: {new Date(task.due_date).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Palette size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No design tasks found.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DesignTasksPage;
