
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useSupabaseData = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [clientPackages, setClientPackages] = useState<any[]>([]);
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
          
          // Fetch jobs for this client with more detailed debugging
          console.log('Fetching jobs for client:', clientRecord.id);
          console.log('Client record details:', clientRecord);
          
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
            console.error('Jobs error details:', {
              message: jobsError.message,
              details: jobsError.details,
              hint: jobsError.hint
            });
          } else {
            console.log('Fetched client jobs:', clientJobs);
            console.log('Number of jobs found:', clientJobs?.length || 0);
            
            // Log each job for debugging
            if (clientJobs && clientJobs.length > 0) {
              clientJobs.forEach((job, index) => {
                console.log(`Job ${index + 1}:`, {
                  id: job.id,
                  title: job.title,
                  status: job.status,
                  client_id: job.client_id,
                  created_at: job.created_at,
                  price: job.price,
                  package_included: job.package_included
                });
              });
            }
            
            setJobs(clientJobs || []);
          }

          // Fetch client packages for this client
          console.log('Fetching client packages for client:', clientRecord.id);
          const { data: clientPackagesData, error: packagesError } = await supabase
            .from('client_packages')
            .select(`
              *,
              packages (
                name,
                price,
                duration_months,
                description
              )
            `)
            .eq('client_id', clientRecord.id)
            .order('created_at', { ascending: false });

          if (packagesError) {
            console.error('Error fetching client packages:', packagesError);
          } else {
            console.log('Fetched client packages:', clientPackagesData);
            setClientPackages(clientPackagesData || []);
          }

          // Fetch payments for this client with auth debugging
          console.log('Fetching payments for client:', clientRecord.id);
          console.log('Current user ID from auth:', userProfile.id);
          console.log('Current user email:', userProfile.email);
          
          // Test the auth state
          const { data: authUser } = await supabase.auth.getUser();
          console.log('Auth user from supabase:', authUser?.user?.id, authUser?.user?.email);
          
          const { data: clientPayments, error: paymentsError } = await supabase
            .from('payments')
            .select('*')
            .eq('client_id', clientRecord.id)
            .order('created_at', { ascending: false });

          if (paymentsError) {
            console.error('Error fetching client payments:', paymentsError);
            console.error('Payments error details:', {
              message: paymentsError.message,
              details: paymentsError.details,
              hint: paymentsError.hint,
              code: paymentsError.code
            });
          } else {
            console.log('Fetched client payments:', clientPayments);
            console.log('Number of payments found:', clientPayments?.length || 0);
            if (clientPayments && clientPayments.length > 0) {
              clientPayments.forEach((payment, index) => {
                console.log(`Payment ${index + 1}:`, {
                  id: payment.id,
                  amount: payment.amount,
                  payment_date: payment.payment_date,
                  payment_method: payment.payment_method
                });
              });
            }
            setPayments(clientPayments || []);
          }

          // Fetch payment requests for this client
          console.log('Fetching payment requests for client:', clientRecord.id);
          const { data: clientPaymentRequests, error: paymentRequestsError } = await supabase
            .from('payment_requests')
            .select('*')
            .eq('client_id', clientRecord.id)
            .order('created_at', { ascending: false });

          if (paymentRequestsError) {
            console.error('Error fetching client payment requests:', paymentRequestsError);
            console.error('Payment requests error details:', {
              message: paymentRequestsError.message,
              details: paymentRequestsError.details,
              hint: paymentRequestsError.hint,
              code: paymentRequestsError.code
            });
          } else {
            console.log('Fetched client payment requests:', clientPaymentRequests);
            console.log('Number of payment requests found:', clientPaymentRequests?.length || 0);
            if (clientPaymentRequests && clientPaymentRequests.length > 0) {
              clientPaymentRequests.forEach((request, index) => {
                console.log(`Payment Request ${index + 1}:`, {
                  id: request.id,
                  amount: request.amount,
                  status: request.status,
                  due_date: request.due_date,
                  description: request.description
                });
              });
            }
            setPaymentRequests(clientPaymentRequests || []);
          }
        } else {
          console.log('No client record found, setting empty arrays');
          setJobs([]);
          setClients([]);
          setPayments([]);
          setPaymentRequests([]);
          setClientPackages([]);
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
        if (userProfile.role === 'admin' || userProfile.role === 'manager' || userProfile.role === 'receptionist') {
          // Admin, manager, and receptionist can see all jobs
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

        // Fetch clients (admin/manager/receptionist only)
        if (userProfile.role === 'admin' || userProfile.role === 'manager' || userProfile.role === 'receptionist') {
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
          setPaymentRequests([]);
          setClientPackages([]);
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
    if (userProfile?.id) {
      fetchData();
    }
  }, [userProfile?.id]);

  // Set up real-time subscription for payments and clients updates
  useEffect(() => {
    if (!userProfile?.id) return;

    const channels: any[] = [];

    // Subscribe to payments changes
    const paymentsChannel = supabase
      .channel('payments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments'
        },
        (payload) => {
          console.log('Payment change detected:', payload);
          // Refetch data when payments change
          fetchData();
        }
      )
      .subscribe();

    channels.push(paymentsChannel);

    // Subscribe to clients changes (for updated totals)
    const clientsChannel = supabase
      .channel('clients-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'clients'
        },
        (payload) => {
          console.log('Client totals updated:', payload);
          // Refetch data when client totals are updated
          fetchData();
        }
      )
      .subscribe();

    channels.push(clientsChannel);

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [userProfile?.id]);

  // Calculate stats with correct payment logic
  const calculateStats = () => {
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(job => job.status === 'in_progress' || job.status === 'pending').length;
    const pendingJobs = jobs.filter(job => job.status === 'pending').length;
    const completedJobs = jobs.filter(job => job.status === 'completed' || job.status === 'delivered').length;
    const totalClients = clients.length;
    const totalUsers = users.length;
    
    // Calculate total payments received
    const totalPayments = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    
    // Calculate total expected revenue from jobs and packages
    const individualJobsRevenue = jobs
      .filter(job => !job.package_included)
      .reduce((sum, job) => sum + (job.price || 0), 0);
    
    const packageRevenue = clientPackages
      .filter(pkg => pkg.is_active)
      .reduce((sum, pkg) => {
        const monthlyFee = pkg.packages?.price || 0;
        const duration = pkg.packages?.duration_months || 1;
        return sum + (monthlyFee * duration);
      }, 0);
    
    const totalExpectedRevenue = individualJobsRevenue + packageRevenue;
    const pendingPayments = Math.max(0, totalExpectedRevenue - totalPayments);
    
    return {
      totalJobs,
      activeJobs,
      pendingJobs,
      completedJobs,
      totalClients,
      totalUsers,
      totalRevenue: totalPayments,
      totalExpectedRevenue,
      pendingPayments
    };
  };

  const stats = calculateStats();
  const recentJobs = jobs.slice(0, 5);
  const isLoading = loading;

  return {
    jobs,
    clients,
    users,
    payments,
    paymentRequests,
    clientPackages,
    loading,
    error,
    stats,
    recentJobs,
    isLoading,
    refetch: fetchData
  };
};
