-- Fix remaining workflow functions search path warnings
CREATE OR REPLACE FUNCTION public.update_job_workflow_stage(job_id uuid, new_stage text, new_assigned_to uuid, stage_notes text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  current_history JSONB;
  new_history_entry JSONB;
BEGIN
  -- Get current workflow history
  SELECT workflow_history INTO current_history FROM public.jobs WHERE id = job_id;
  
  -- Create new history entry
  new_history_entry := jsonb_build_object(
    'stage', new_stage,
    'assigned_to', new_assigned_to,
    'completed_at', now(),
    'notes', stage_notes
  );
  
  -- Update job with new stage and assignment
  UPDATE public.jobs 
  SET 
    current_workflow_stage = new_stage,
    assigned_to = new_assigned_to,
    workflow_history = COALESCE(current_history, '[]'::jsonb) || new_history_entry,
    updated_at = now()
  WHERE id = job_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.initialize_job_workflow(job_id uuid, stages jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  UPDATE public.jobs 
  SET 
    workflow_stages = stages,
    current_workflow_stage = (stages->0->>'stage')::text
  WHERE id = job_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_job_workflow(job_id uuid, new_status text, new_assigned_to uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Update the job with the new status and assignment
  UPDATE public.jobs 
  SET 
    status = new_status,
    assigned_to = new_assigned_to,
    updated_at = now()
  WHERE id = job_id;
END;
$function$;