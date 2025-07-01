
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalClients: number;
  totalJobs: number;
  pendingJobs: number;
  completedJobs: number;
  totalRevenue: number;
  pendingPayments: number;
}

interface Job {
  id: string;
  title: string;
  type: string;
  status: string;
  price: number;
  created_at: string;
  clients?: {
    name: string;
  };
  assigned_to?: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  total_paid: number;
  total_due: number;
  created_at: string;
}

export const useSupabaseData = () => {
  const { user, userProfile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalJobs: 0,
    pendingJobs: 0,
    completedJobs: 0,
    totalRevenue: 0,
    pendingPayments: 0,
  });
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!user || !userProfile) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching dashboard data for user:', userProfile.role);

      // Fetch data based on user role
      let jobsQuery = supabase.from('jobs').select(`
        *,
        clients (
          name
        )
      `);

      let clientsQuery = supabase.from('clients').select('*');

      // Apply role-based filtering
      if (userProfile.role === 'client') {
        // Clients see only their own jobs
        jobsQuery = jobsQuery.eq('client_id', userProfile.id);
        clientsQuery = clientsQuery.eq('email', userProfile.email);
      } else if (['photographer', 'designer', 'editor'].includes(userProfile.role)) {
        // Team members see only assigned jobs
        jobsQuery = jobsQuery.eq('assigned_to', user.id);
      }
      // Admins and receptionists see all data (no additional filtering)

      const [jobsResult, clientsResult, paymentsResult] = await Promise.all([
        jobsQuery.order('created_at', { ascending: false }),
        clientsQuery.order('created_at', { ascending: false }),
        supabase.from('payments').select('amount, job_id')
      ]);

      if (jobsResult.error) {
        console.error('Error fetching jobs:', jobsResult.error);
        throw jobsResult.error;
      }

      if (clientsResult.error) {
        console.error('Error fetching clients:', clientsResult.error);
        throw clientsResult.error;
      }

      if (paymentsResult.error) {
        console.error('Error fetching payments:', paymentsResult.error);
        throw paymentsResult.error;
      }

      const jobsData = jobsResult.data || [];
      const clientsData = clientsResult.data || [];
      const paymentsData = paymentsResult.data || [];

      // Calculate stats
      const totalRevenue = paymentsData.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
      const pendingJobs = jobsData.filter(job => job.status === 'pending').length;
      const completedJobs = jobsData.filter(job => job.status === 'completed').length;

      // Get pending payments count (jobs with no payments)
      const jobsWithPayments = new Set(paymentsData.map(p => p.job_id).filter(Boolean));
      const pendingPayments = jobsData.filter(job => !jobsWithPayments.has(job.id)).length;

      setStats({
        totalClients: clientsData.length,
        totalJobs: jobsData.length,
        pendingJobs,
        completedJobs,
        totalRevenue,
        pendingPayments,
      });

      // Set recent jobs (last 10)
      setRecentJobs(jobsData.slice(0, 10));
      setClients(clientsData);

      console.log('Dashboard data loaded successfully');

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && userProfile) {
      fetchDashboardData();
    }
  }, [user, userProfile]);

  return {
    stats,
    recentJobs,
    clients,
    isLoading,
    error,
    refetch: fetchDashboardData,
  };
};
