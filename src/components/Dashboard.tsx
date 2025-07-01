
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle,
  RefreshCw
} from 'lucide-react';

import AdminDashboard from '@/components/dashboards/AdminDashboard';
import ReceptionistDashboard from '@/components/dashboards/ReceptionistDashboard';
import PhotographerDashboard from '@/components/dashboards/PhotographerDashboard';
import DesignerDashboard from '@/components/dashboards/DesignerDashboard';
import EditorDashboard from '@/components/dashboards/EditorDashboard';
import ClientDashboard from '@/components/dashboards/ClientDashboard';

const Dashboard = () => {
  const { userProfile, isLoading: authLoading, error: authError, refreshUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRefresh = async () => {
    await refreshUserProfile();
  };

  // Show loading state only when auth is loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show auth error
  if (authError) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Authentication Error: {authError}
          </AlertDescription>
        </Alert>
        <Button onClick={handleRefresh} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  // Show data error
  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <Button onClick={handleRefresh} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  // Show profile setup message if no profile
  if (!userProfile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome!</h1>
          <p className="text-gray-600 mt-1">Setting up your profile...</p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your user profile is being created. This may take a moment.
          </AlertDescription>
        </Alert>

        <Button onClick={handleRefresh} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
    );
  }

  // Route to role-specific dashboard with proper role checking
  const renderDashboard = () => {
    switch (userProfile.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'receptionist':
        return <ReceptionistDashboard />;
      case 'photographer':
        return <PhotographerDashboard userProfile={userProfile} />;
      case 'designer':
        return <DesignerDashboard userProfile={userProfile} />;
      case 'editor':
        return <EditorDashboard userProfile={userProfile} />;
      case 'client':
        return <ClientDashboard userProfile={userProfile} />;
      default:
        return (
          <div className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Unknown role: {userProfile.role}. Please contact an administrator.
              </AlertDescription>
            </Alert>
            <Button onClick={handleRefresh} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        );
    }
  };

  return renderDashboard();
};

export default Dashboard;
