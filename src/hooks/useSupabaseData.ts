
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
}

export const useSupabaseData = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalJobs: 0,
    pendingJobs: 0,
    completedJobs: 0,
    totalRevenue: 0,
    pendingPayments: 0,
  });
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch clients count
      const { count: clientsCount, error: clientsError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      if (clientsError) throw clientsError;

      // Fetch jobs with client information
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select(`
          *,
          clients (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;

      // Fetch payments for revenue calculation
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('amount');

      if (paymentsError) throw paymentsError;

      // Calculate stats
      const totalRevenue = paymentsData?.reduce((sum, payment) => sum + Number(payment.amount || 0), 0) || 0;
      const pendingJobs = jobsData?.filter(job => job.status === 'pending').length || 0;
      const completedJobs = jobsData?.filter(job => job.status === 'completed').length || 0;

      // Get pending payments count (jobs with no payments)
      const jobsWithPayments = new Set(paymentsData?.map(p => p.job_id) || []);
      const pendingPayments = jobsData?.filter(job => !jobsWithPayments.has(job.id)).length || 0;

      setStats({
        totalClients: clientsCount || 0,
        totalJobs: jobsData?.length || 0,
        pendingJobs,
        completedJobs,
        totalRevenue,
        pendingPayments,
      });

      // Set recent jobs (last 10)
      setRecentJobs(jobsData?.slice(0, 10) || []);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  return {
    stats,
    recentJobs,
    isLoading,
    error,
    refetch: fetchDashboardData,
  };
};
