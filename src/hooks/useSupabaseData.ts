
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
  client_id: string | null;
  assigned_to: string | null;
  due_date: string | null;
  clients?: {
    name: string;
  };
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

      console.log('Fetching dashboard data for user:', userProfile.role, userProfile.email);

      if (userProfile.role === 'client') {
        // For clients, we need to find their client record and get their jobs
        console.log('Fetching client data for email:', userProfile.email);
        
        // First, find the client record
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('email', userProfile.email)
          .maybeSingle();

        if (clientError) {
          console.error('Error fetching client data:', clientError);
          throw clientError;
        }

        if (!clientData) {
          console.log('No client record found for email:', userProfile.email);
          setStats({
            totalClients: 0,
            totalJobs: 0,
            pendingJobs: 0,
            completedJobs: 0,
            totalRevenue: 0,
            pendingPayments: 0,
          });
          setRecentJobs([]);
          setClients([]);
          return;
        }

        console.log('Found client data:', clientData);

        // Now fetch jobs for this client with better error handling
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select(`
            *,
            clients (
              name
            )
          `)
          .eq('client_id', clientData.id)
          .order('created_at', { ascending: false });

        if (jobsError) {
          console.error('Error fetching client jobs:', jobsError);
          // Don't throw here, just log and continue with empty jobs
          console.warn('Continuing with empty jobs list');
        }

        console.log('Found client jobs:', jobsData);

        // Fetch payments for this client
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('amount, job_id')
          .eq('client_id', clientData.id);

        if (paymentsError) {
          console.error('Error fetching client payments:', paymentsError);
          // Don't throw here, just log and continue
          console.warn('Continuing without payment data');
        }

        const jobsDataTyped = jobsData || [];
        const paymentsDataTyped = paymentsData || [];

        // Calculate stats for client
        const totalRevenue = paymentsDataTyped.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
        const pendingJobs = jobsDataTyped.filter(job => job.status === 'pending').length;
        const completedJobs = jobsDataTyped.filter(job => ['completed', 'delivered'].includes(job.status)).length;

        console.log('Client stats calculated:', {
          totalJobs: jobsDataTyped.length,
          pendingJobs,
          completedJobs,
          totalRevenue
        });

        setStats({
          totalClients: 1, // The client themselves
          totalJobs: jobsDataTyped.length,
          pendingJobs,
          completedJobs,
          totalRevenue,
          pendingPayments: 0, // Clients don't see pending payments
        });

        setRecentJobs(jobsDataTyped.slice(0, 10));
        setClients([clientData]);

      } else {
        // For admin/receptionist/team members - original logic
        let jobsQuery = supabase.from('jobs').select(`
          *,
          clients (
            name
          )
        `);

        let clientsQuery = supabase.from('clients').select('*');

        // Apply role-based filtering for team members
        if (['photographer', 'designer', 'editor'].includes(userProfile.role)) {
          jobsQuery = jobsQuery.eq('assigned_to', user.id);
        }

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

        setRecentJobs(jobsData.slice(0, 10));
        setClients(clientsData);
      }

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
