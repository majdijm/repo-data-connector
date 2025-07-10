import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useSupabaseData = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { userProfile } = useAuth();

  const fetchClientData = async () => {
    if (!userProfile?.email) return;

    try {
      console.log(`Fetching client data for email: ${userProfile.email}`);
      
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('email', userProfile.email)
        .single();

      if (clientError) {
        console.error('Error fetching client data:', clientError);
        console.log(`No client record found for email: ${userProfile.email}`);
        return null;
      }

      console.log('Found existing client record:', clientData);
      return clientData;
    } catch (err) {
      console.error('Error in fetchClientData:', err);
      return null;
    }
  };

  const fetchData = async () => {
    if (!userProfile?.id) return;

    console.log(`Fetching dashboard data for user: ${userProfile.role} ${userProfile.email}`);
    
    try {
      setLoading(true);

      // Handle client role differently
      if (userProfile.role === 'client') {
        const clientRecord = await fetchClientData();
        
        if (clientRecord) {
          setClients([clientRecord]);
          
          // Fetch jobs for this client
          console.log('Fetching jobs for client:', clientRecord.id);
          const { data: clientJobs, error: jobsError } = await supabase
            .from('jobs')
            .select(`
              *,
              clients (
                name,
                email
              )
            `)
            .eq('client_id', clientRecord.id)
            .order('created_at', { ascending: false });

          if (jobsError) {
            console.error('Error fetching client jobs:', jobsError);
          } else {
            console.log('Fetched client jobs:', clientJobs);
            setJobs(clientJobs || []);
          }

          // Fetch payments for this client
          const { data: clientPayments, error: paymentsError } = await supabase
            .from('payments')
            .select('*')
            .eq('client_id', clientRecord.id)
            .order('created_at', { ascending: false });

          if (paymentsError) {
            console.error('Error fetching client payments:', paymentsError);
          } else {
            setPayments(clientPayments || []);
          }
        } else {
          setJobs([]);
          setClients([]);
          setPayments([]);
        }
        
        setUsers([]);
      } else {
        // For non-client users, fetch data based on role permissions
        let jobsQuery = supabase.from('jobs').select(`
          *,
          clients (
            name,
            email
          )
        `);

        // Apply role-based filtering
        if (userProfile.role === 'admin' || userProfile.role === 'receptionist') {
          // Admin and receptionist can see all jobs
          jobsQuery = jobsQuery.order('created_at', { ascending: false });
        } else {
          // Other roles only see jobs assigned to them
          jobsQuery = jobsQuery.eq('assigned_to', userProfile.id).order('created_at', { ascending: false });
        }

        const { data: jobsData, error: jobsError } = await jobsQuery;

        if (jobsError) {
          console.error('Error fetching jobs:', jobsError);
        } else {
          setJobs(jobsData || []);
        }

        // Fetch clients (admin/receptionist only)
        if (userProfile.role === 'admin' || userProfile.role === 'receptionist') {
          const { data: clientsData, error: clientsError } = await supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false });

          if (clientsError) {
            console.error('Error fetching clients:', clientsError);
          } else {
            setClients(clientsData || []);
          }

          const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

          if (usersError) {
            console.error('Error fetching users:', usersError);
          } else {
            setUsers(usersData || []);
          }

          const { data: paymentsData, error: paymentsError } = await supabase
            .from('payments')
            .select(`
              *,
              clients (
                name
              )
            `)
            .order('created_at', { ascending: false });

          if (paymentsError) {
            console.error('Error fetching payments:', paymentsError);
          } else {
            setPayments(paymentsData || []);
          }
        } else {
          setClients([]);
          setUsers([]);
          setPayments([]);
        }
      }

      console.log('Dashboard data loaded successfully');
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userProfile?.id, userProfile?.role, userProfile?.email]);

  // Calculate stats
  const stats = {
    totalJobs: jobs.length,
    activeJobs: jobs.filter(job => job.status === 'in_progress' || job.status === 'pending').length,
    completedJobs: jobs.filter(job => job.status === 'completed' || job.status === 'delivered').length,
    totalClients: clients.length,
    totalUsers: users.length,
    totalRevenue: payments.reduce((sum, payment) => sum + (payment.amount || 0), 0),
    pendingPayments: jobs.reduce((sum, job) => sum + (job.price || 0), 0) - payments.reduce((sum, payment) => sum + (payment.amount || 0), 0),
  };

  const recentJobs = jobs.slice(0, 5);
  const isLoading = loading;

  return {
    jobs,
    clients,
    users,
    payments,
    loading,
    error,
    stats,
    recentJobs,
    isLoading,
    refetch: fetchData
  };
};
