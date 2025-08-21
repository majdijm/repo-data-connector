-- Add foreign key relationship between attendance and users tables
ALTER TABLE public.attendance 
ADD CONSTRAINT attendance_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;