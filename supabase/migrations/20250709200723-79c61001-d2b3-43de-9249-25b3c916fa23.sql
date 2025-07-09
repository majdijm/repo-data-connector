
-- Create RPC function to handle workflow updates with elevated privileges
CREATE OR REPLACE FUNCTION update_job_workflow(
  job_id UUID,
  new_status TEXT,
  new_assigned_to UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the job with the new status and assignment
  UPDATE public.jobs 
  SET 
    status = new_status,
    assigned_to = new_assigned_to,
    updated_at = now()
  WHERE id = job_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_job_workflow(UUID, TEXT, UUID) TO authenticated;
