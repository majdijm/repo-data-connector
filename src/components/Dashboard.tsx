
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  Clock,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

import AdminDashboard from '@/components/dashboards/AdminDashboard';
import ReceptionistDashboard from '@/components/dashboards/ReceptionistDashboard';
import PhotographerDashboard from '@/components/dashboards/PhotographerDashboard';
import DesignerDashboard from '@/components/dashboards/DesignerDashboard';
import EditorDashboard from '@/components/dashboards/EditorDashboard';
import ClientDashboard from '@/components/dashboards/ClientDashboard';

interface DashboardStats {
  totalClients: number;
  totalJobs: number;
  pendingJobs: number;
  completedJobs: number;
  totalRevenue: number;
  pendingPayments: number;
}

const Dashboard = () => {
  const { userProfile, isLoading: authLoading, error: authError, refreshUserProfile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalJobs: 0,
    pendingJobs: 0,
    completedJobs: 0,
    totalRevenue: 0,
    pendingPayments: 0,
  });
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && userProfile) {
      fetchDashboardData();
    } else if (!authLoading && !userProfile) {
      setIsLoading(false);
    }
  }, [userProfile, authLoading]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch clients count
      const { count: clientsCount, error: clientsError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      if (clientsError && clientsError.code !== 'PGRST116') {
        console.error('Clients error:', clientsError);
      }

      // Fetch jobs data
      const { data: jobs, count: jobsCount, error: jobsError } = await supabase
        .from('jobs')
        .select('*, clients(name)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(5);

      if (jobsError && jobsError.code !== 'PGRST116') {
        console.error('Jobs error:', jobsError);
      }

      // Fetch jobs by status
      const { count: pendingCount, error: pendingError } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (pendingError && pendingError.code !== 'PGRST116') {
        console.error('Pending jobs error:', pendingError);
      }

      const { count: completedCount, error: completedError } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      if (completedError && completedError.code !== 'PGRST116') {
        console.error('Completed jobs error:', completedError);
      }

      // Fetch payment statistics
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount');

      if (paymentsError && paymentsError.code !== 'PGRST116') {
        console.error('Payments error:', paymentsError);
      }

      const totalRevenue = payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

      setStats({
        totalClients: clientsCount || 0,
        totalJobs: jobsCount || 0,
        pendingJobs: pendingCount || 0,
        completedJobs: completedCount || 0,
        totalRevenue,
        pendingPayments: 0,
      });

      setRecentJobs(jobs || []);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    await refreshUserProfile();
    if (userProfile) {
      await fetchDashboardData();
    }
  };

  // Show loading state
  if (authLoading || isLoading) {
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

  // Route to role-specific dashboard
  switch (userProfile.role) {
    case 'admin':
      return <AdminDashboard stats={stats} recentJobs={recentJobs} />;
    case 'receptionist':
      return <ReceptionistDashboard stats={stats} recentJobs={recentJobs} />;
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

export default Dashboard;
