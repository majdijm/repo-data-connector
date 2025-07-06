
-- Add language preference to users table
ALTER TABLE public.users 
ADD COLUMN language VARCHAR(10) DEFAULT 'en' CHECK (language IN ('en', 'ar'));

-- Create calendar_events table for scheduling
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'job' CHECK (event_type IN ('job', 'meeting', 'appointment', 'other')),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for calendar_events
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for calendar_events
CREATE POLICY "Users can view their own calendar events"
  ON public.calendar_events 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own calendar events"
  ON public.calendar_events 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own calendar events"
  ON public.calendar_events 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own calendar events"
  ON public.calendar_events 
  FOR DELETE 
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all calendar events"
  ON public.calendar_events 
  FOR ALL 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Receptionists can manage all calendar events"
  ON public.calendar_events 
  FOR ALL 
  USING (get_current_user_role() = 'receptionist');
