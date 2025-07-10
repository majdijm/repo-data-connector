
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useSupabaseData = () => {
  const [jobs, setJobs] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userProfile } = useAuth();

  const fetchClientData = async (email) => {
    console.log('Fetching client data for email:', email);
    
    try {
      // First, try to get existing client record
      const { data: existingClient, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching client data:', fetchError);
        
        // If it's a 406 error, try to create a client record
        if (fetchError.code === 'PGRST301' || fetchError.message.includes('406')) {
          console.log('Creating client record for:', email);
          
          const { data: newClient, error: createError } = await supabase
            .from('clients')
            .insert({
              email: email,
              name: userProfile?.name || email.split('@')[0],
              total_paid: 0,
              total_due: 0
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating client record:', createError);
            return null;
          }

          console.log('Client record created successfully:', newClient);
          return newClient;
        }
        
        return null;
      }

      if (!existingClient) {
        console.log('No client record found for email:', email);
        
        // Try to create a client record if none exists
        console.log('Creating client record for:', email);
        
        const { data: newClient, error: createError } = await supabase
          .from('clients')
          .insert({
            email: email,
            name: userProfile?.name || email.split('@')[0],
            total_paid: 0,
            total_due: 0
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating client record:', createError);
          return null;
        }

        console.log('Client record created successfully:', newClient);
        return newClient;
      }

      console.log('Found existing client record:', existingClient);
      return existingClient;
    } catch (err) {
      console.error('Unexpected error in fetchClientData:', err);
      return null;
    }
  };

  const fetchDashboardData = async () => {
    if (!userProfile?.id) {
      console.log('No user profile available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching dashboard data for user:', userProfile.role, userProfile.email);

      if (userProfile.role === 'client') {
        // For clients, fetch their own data
        const clientData = await fetchClientData(userProfile.email);
        
        if (clientData) {
          setClients([clientData]);
          
          // Fetch jobs for this client
          const { data: jobsData, error: jobsError } = await supabase
            .from('jobs')
            .select(`
              *,
              clients (
                name,
                email
              )
            `)
            .eq('client_id', clientData.id);

          if (jobsError) {
            console.error('Error fetching client jobs:', jobsError);
          } else {
            console.log('Fetched client jobs:', jobsData);
            setJobs(jobsData || []);
          }

          // Fetch payments for this client
          const { data: paymentsData, error: paymentsError } = await supabase
            .from('payments')
            .select('*')
            .eq('client_id', clientData.id);

          if (paymentsError) {
            console.error('Error fetching client payments:', paymentsError);
          } else {
            setPayments(paymentsData || []);
          }
        } else {
          console.log('No client data available');
          setJobs([]);
          setPayments([]);
          setClients([]);
        }
      } else {
        // For other roles, fetch data based on permissions
        const queries = [];

        // Fetch jobs based on role
        if (userProfile.role === 'admin' || userProfile.role === 'receptionist') {
          queries.push(
            supabase
              .from('jobs')
              .select(`
                *,
                clients (
                  name,
                  email
                )
              `)
              .order('created_at', { ascending: false })
          );
        } else {
          // Team members only see assigned jobs
          queries.push(
            supabase
              .from('jobs')
              .select(`
                *,
                clients (
                  name,
                  email
                )
              `)
              .eq('assigned_to', userProfile.id)
              .order('created_at', { ascending: false })
          );
        }

        // Fetch other data for admin/receptionist
        if (userProfile.role === 'admin' || userProfile.role === 'receptionist') {
          queries.push(
            supabase.from('clients').select('*').order('created_at', { ascending: false }),
            supabase.from('users').select('*').order('created_at', { ascending: false }),
            supabase.from('payments').select('*').order('created_at', { ascending: false })
          );
        }

        const results = await Promise.all(queries);
        
        setJobs(results[0]?.data || []);
        
        if (results.length > 1) {
          setClients(results[1]?.data || []);
          setUsers(results[2]?.data || []);
          setPayments(results[3]?.data || []);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [userProfile?.id, userProfile?.role, userProfile?.email]);

  return {
    jobs,
    clients,
    users,
    payments,
    loading,
    error,
    refetch: fetchDashboardData
  };
};
