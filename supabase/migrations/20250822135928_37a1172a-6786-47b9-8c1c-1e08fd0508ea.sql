-- Fix security warning by setting search_path for update_client_totals function
CREATE OR REPLACE FUNCTION public.update_client_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  client_total NUMERIC;
BEGIN
  -- Get the client_id from either NEW or OLD record
  IF TG_OP = 'DELETE' THEN
    -- Calculate new total for the client from OLD record
    SELECT COALESCE(SUM(amount), 0) INTO client_total
    FROM payments 
    WHERE client_id = OLD.client_id AND id != OLD.id;
    
    -- Update client's total_paid
    UPDATE clients 
    SET total_paid = client_total, updated_at = NOW()
    WHERE id = OLD.client_id;
    
    RETURN OLD;
  ELSE
    -- For INSERT and UPDATE operations
    -- Calculate new total for the client
    SELECT COALESCE(SUM(amount), 0) INTO client_total
    FROM payments 
    WHERE client_id = NEW.client_id;
    
    -- Update client's total_paid
    UPDATE clients 
    SET total_paid = client_total, updated_at = NOW()
    WHERE id = NEW.client_id;
    
    RETURN NEW;
  END IF;
END;
$$;