
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Camera, Calendar, Users, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSupabaseData } from '@/hooks/useSupabaseData';

const PhotoSessionsPage = () => {
  const { recentJobs, isLoading } = useSupabaseData();
  
  const photoSessions = recentJobs.filter(job => job.type === 'photo_session');

  return (
    <ProtectedRoute requiredRoles={['admin', 'receptionist', 'photographer']}>
      <DashboardLayout>
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Camera size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Photo Sessions</h1>
                <p className="text-purple-100 mt-1">Manage photography projects and sessions</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <Calendar size={20} className="text-white" />
                  <div>
                    <p className="text-sm text-purple-100">Session Planning</p>
                    <p className="font-semibold">Schedule Shoots</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <Users size={20} className="text-white" />
                  <div>
                    <p className="text-sm text-purple-100">Client Coordination</p>
                    <p className="font-semibold">Manage Sessions</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <CheckCircle size={20} className="text-white" />
                  <div>
                    <p className="text-sm text-purple-100">Delivery</p>
                    <p className="font-semibold">Photo Delivery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <h2 className="text-2xl font-bold">Photo Sessions</h2>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : photoSessions.length > 0 ? (
              photoSessions.map(session => (
                <Card key={session.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{session.title}</h3>
                          <Badge variant="outline">{session.status}</Badge>
                        </div>
                        <p className="text-gray-600 mb-2">Client: {session.clients?.name || 'No client'}</p>
                        {session.due_date && (
                          <p className="text-sm text-gray-500">Due: {new Date(session.due_date).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Camera size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No photo sessions found.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default PhotoSessionsPage;
