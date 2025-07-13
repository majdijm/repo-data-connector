-- Update the specific job to delivered status
UPDATE public.jobs 
SET status = 'delivered', updated_at = NOW() 
WHERE id = 'c32ebc2a-3d1a-447e-bd32-e445151a46bd';