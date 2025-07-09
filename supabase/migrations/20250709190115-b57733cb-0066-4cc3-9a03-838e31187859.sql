
-- First, get the user IDs we need to work with
DO $$
DECLARE
    old_photographer_id uuid;
    new_photographer_id uuid;
BEGIN
    -- Get the ID of the user to be deleted
    SELECT id INTO old_photographer_id 
    FROM users 
    WHERE email = 'photographer@example.com';
    
    -- Get the ID of the user to assign jobs to
    SELECT id INTO new_photographer_id 
    FROM users 
    WHERE email = 'myhandgadgets@gmail.com';
    
    -- Check if both users exist
    IF old_photographer_id IS NULL THEN
        RAISE NOTICE 'User photographer@example.com not found';
        RETURN;
    END IF;
    
    IF new_photographer_id IS NULL THEN
        RAISE NOTICE 'User myhandgadgets@gmail.com not found';
        RETURN;
    END IF;
    
    -- Update all jobs assigned to the old photographer
    UPDATE jobs 
    SET assigned_to = new_photographer_id,
        updated_at = now()
    WHERE assigned_to = old_photographer_id;
    
    -- Update any calendar events assigned to the old photographer
    UPDATE calendar_events 
    SET user_id = new_photographer_id,
        updated_at = now()
    WHERE user_id = old_photographer_id;
    
    -- Update any job files uploaded by the old photographer
    UPDATE job_files 
    SET uploaded_by = new_photographer_id
    WHERE uploaded_by = old_photographer_id;
    
    -- Update any job comments by the old photographer
    UPDATE job_comments 
    SET user_id = new_photographer_id,
        updated_at = now()
    WHERE user_id = old_photographer_id;
    
    -- Update any notifications for the old photographer
    UPDATE notifications 
    SET user_id = new_photographer_id
    WHERE user_id = old_photographer_id;
    
    -- Update any payments received by the old photographer
    UPDATE payments 
    SET received_by = new_photographer_id
    WHERE received_by = old_photographer_id;
    
    -- Update any activity logs for the old photographer
    UPDATE activity_logs 
    SET user_id = new_photographer_id
    WHERE user_id = old_photographer_id;
    
    -- Update any salary records for the old photographer
    UPDATE salaries 
    SET user_id = new_photographer_id,
        updated_at = now()
    WHERE user_id = old_photographer_id;
    
    -- Finally, delete the old photographer user
    DELETE FROM users WHERE id = old_photographer_id;
    
    RAISE NOTICE 'Successfully transferred all data from photographer@example.com to myhandgadgets@gmail.com and deleted the old user';
END $$;
