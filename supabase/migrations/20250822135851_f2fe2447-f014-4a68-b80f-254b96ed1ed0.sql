-- Create function to update client total_paid when payments change
CREATE OR REPLACE FUNCTION public.update_client_totals()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update client totals when payments change
DROP TRIGGER IF EXISTS trigger_update_client_totals_on_payment_insert ON payments;
DROP TRIGGER IF EXISTS trigger_update_client_totals_on_payment_update ON payments;
DROP TRIGGER IF EXISTS trigger_update_client_totals_on_payment_delete ON payments;

CREATE TRIGGER trigger_update_client_totals_on_payment_insert
  AFTER INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_client_totals();

CREATE TRIGGER trigger_update_client_totals_on_payment_update
  AFTER UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_client_totals();

CREATE TRIGGER trigger_update_client_totals_on_payment_delete
  AFTER DELETE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_client_totals();

-- Update existing client totals based on current payment data
UPDATE clients 
SET total_paid = COALESCE((
  SELECT SUM(amount) 
  FROM payments 
  WHERE payments.client_id = clients.id
), 0);