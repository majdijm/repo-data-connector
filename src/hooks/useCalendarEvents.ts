
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CalendarEvent {
  id: string;
  job_id: string | null;
  user_id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  event_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Job {
  id: string;
  title: string;
  type: string;
  status: string;
  due_date: string | null;
  client_id: string | null;
  assigned_to: string | null;
  description: string | null;
  price: number | null;
  clients?: {
    name: string;
  };
  users?: {
    name: string;
    role: string;
  };
}

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userProfile } = useAuth();

  const fetchEvents = async () => {
    if (!userProfile?.id) return;

    try {
      setLoading(true);
      
      // Fetch calendar events based on user role
      let eventsQuery = supabase.from('calendar_events').select('*');
      
      // If not admin or receptionist, only show user's own events
      if (!['admin', 'receptionist'].includes(userProfile.role)) {
        eventsQuery = eventsQuery.eq('user_id', userProfile.id);
      }
      
      const { data: eventsData, error: eventsError } = await eventsQuery.order('start_date', { ascending: true });

      if (eventsError) throw eventsError;

      // Fetch jobs based on user role
      let jobsQuery = supabase
        .from('jobs')
        .select(`
          *,
          clients (
            name
          ),
          users (
            name,
            role
          )
        `);

      // Apply role-based filtering
      if (userProfile.role === 'admin' || userProfile.role === 'receptionist') {
        // Admin and receptionist can see all jobs
        jobsQuery = jobsQuery.order('created_at', { ascending: false });
      } else if (userProfile.role === 'client') {
        // Client users: fetch their client record first, then get jobs
        console.log('Fetching jobs for client user in calendar:', userProfile.email);
        
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('email', userProfile.email)
          .single();

        if (clientError) {
          console.error('Error fetching client data for calendar:', clientError);
          setJobs([]);
          setEvents(eventsData || []);
          return;
        }

        if (clientData) {
          jobsQuery = jobsQuery.eq('client_id', clientData.id).order('created_at', { ascending: false });
        } else {
          setJobs([]);
          setEvents(eventsData || []);
          return;
        }
      } else {
        // Other roles only see jobs assigned to them
        jobsQuery = jobsQuery.eq('assigned_to', userProfile.id).order('created_at', { ascending: false });
      }

      const { data: jobsData, error: jobsError } = await jobsQuery;

      if (jobsError) throw jobsError;

      console.log('Fetched jobs:', jobsData);
      console.log('Fetched events:', eventsData);

      setEvents(eventsData || []);
      setJobs(jobsData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [userProfile?.id, userProfile?.role, userProfile?.email]);

  const createEvent = async (eventData: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert(eventData)
        .select()
        .single();

      if (error) throw error;

      setEvents(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
      throw err;
    }
  };

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setEvents(prev => prev.map(event => event.id === id ? data : event));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
      throw err;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEvents(prev => prev.filter(event => event.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
      throw err;
    }
  };

  return {
    events,
    jobs,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    refreshEvents: fetchEvents
  };
};
