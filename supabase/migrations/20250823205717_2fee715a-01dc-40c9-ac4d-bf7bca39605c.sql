-- Fix search path for notification function
CREATE OR REPLACE FUNCTION notify_client_payment()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;