-- Clean up all users except majdijm@gmail.com
-- Delete all related data first to avoid foreign key conflicts

-- Delete all activity logs
DELETE FROM activity_logs WHERE user_id != '0bc6b800-e8b9-4880-8bbc-c317d096aeab';

-- Delete all calendar events
DELETE FROM calendar_events WHERE user_id != '0bc6b800-e8b9-4880-8bbc-c317d096aeab';

-- Delete all job comments
DELETE FROM job_comments WHERE user_id != '0bc6b800-e8b9-4880-8bbc-c317d096aeab';

-- Delete all job files
DELETE FROM job_files WHERE uploaded_by != '0bc6b800-e8b9-4880-8bbc-c317d096aeab';

-- Delete all notifications
DELETE FROM notifications WHERE user_id != '0bc6b800-e8b9-4880-8bbc-c317d096aeab';

-- Delete all payments
DELETE FROM payments WHERE received_by != '0bc6b800-e8b9-4880-8bbc-c317d096aeab';

-- Delete all salaries
DELETE FROM salaries WHERE user_id != '0bc6b800-e8b9-4880-8bbc-c317d096aeab' OR created_by != '0bc6b800-e8b9-4880-8bbc-c317d096aeab';

-- Delete all jobs not created by or assigned to admin
DELETE FROM jobs WHERE 
  (created_by IS NOT NULL AND created_by != '0bc6b800-e8b9-4880-8bbc-c317d096aeab') OR
  (assigned_to IS NOT NULL AND assigned_to != '0bc6b800-e8b9-4880-8bbc-c317d096aeab') OR
  (original_assigned_to IS NOT NULL AND original_assigned_to != '0bc6b800-e8b9-4880-8bbc-c317d096aeab');

-- Delete all payment requests
DELETE FROM payment_requests WHERE requested_by != '0bc6b800-e8b9-4880-8bbc-c317d096aeab';

-- Delete all client contracts
DELETE FROM client_contracts WHERE uploaded_by != '0bc6b800-e8b9-4880-8bbc-c317d096aeab';

-- Delete all expenses
DELETE FROM expenses WHERE recorded_by != '0bc6b800-e8b9-4880-8bbc-c317d096aeab';

-- Finally, delete all users except the admin
DELETE FROM users WHERE email != 'majdijm@gmail.com';