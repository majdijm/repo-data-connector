
import React from 'react';
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
  const { user, userProfile, isLoading: authLoading, error: authError, refreshUserProfile } = useAuth();

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

  // If user exists but no profile, show a default dashboard
  if (user && !userProfile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome!</h1>
          <p className="text-gray-600 mt-1">Your profile is being set up...</p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your user profile is being created. You can start using the system, but some features may be limited until your profile is complete.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-2">Getting Started</h3>
            <p className="text-gray-600">Welcome to the Media Task Manager. Your profile will be available shortly.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-2">Contact Support</h3>
            <p className="text-gray-600">If you need help setting up your account, please contact your administrator.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-2">Refresh Profile</h3>
            <Button onClick={handleRefresh} className="flex items-center gap-2 mt-2">
              <RefreshCw className="h-4 w-4" />
              Check Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Route to role-specific dashboard based on user profile role
  const renderRoleBasedDashboard = () => {
    if (!userProfile) {
      return <AdminDashboard />; // Default fallback
    }

    console.log('Rendering dashboard for role:', userProfile.role);
    
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

  return renderRoleBasedDashboard();
};

export default Dashboard;
