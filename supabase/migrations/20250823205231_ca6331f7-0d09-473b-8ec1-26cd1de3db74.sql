-- Fix RLS policy to allow clients to view their own packages
CREATE POLICY "Clients can view their own packages" 
ON public.client_packages 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM clients c 
  JOIN users u ON u.email = c.email 
  WHERE c.id = client_packages.client_id 
  AND u.id = auth.uid()
));

-- Create notification triggers for payment events
CREATE OR REPLACE FUNCTION notify_client_payment()
RETURNS TRIGGER AS $$
DECLARE
  client_user_id UUID;
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- Get the user ID for the client
  SELECT u.id INTO client_user_id
  FROM users u 
  JOIN clients c ON c.email = u.email
  WHERE c.id = NEW.client_id;

  IF client_user_id IS NOT NULL THEN
    IF TG_TABLE_NAME = 'payments' THEN
      notification_title := 'Payment Received';
      notification_message := 'We have received your payment of $' || NEW.amount || '. Thank you!';
    ELSIF TG_TABLE_NAME = 'payment_requests' THEN
      notification_title := 'New Payment Request';
      notification_message := 'A new payment request of $' || NEW.amount || ' has been created for your account.';
    END IF;

    -- Insert notification
    INSERT INTO notifications (user_id, title, message, created_at)
    VALUES (client_user_id, notification_title, notification_message, NOW());
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for payment notifications
CREATE TRIGGER trigger_notify_payment
  AFTER INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION notify_client_payment();

CREATE TRIGGER trigger_notify_payment_request
  AFTER INSERT ON payment_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_client_payment();