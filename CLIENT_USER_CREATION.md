# How to Create Client Users

There are several ways to create client users in the system:

## Method 1: Through User Management (Admin/Receptionist)

1. **Navigate to Users Page**: Go to `/users` in the application
2. **Click "Create User"**: Use the "Create User" button 
3. **Fill Client Information**:
   - Name: Client's full name
   - Email: Client's email address (must be unique)
   - Role: Select "client" from the dropdown
   - Password: Set a temporary password (client can change later)
4. **Create Client Record**: The system will automatically create both:
   - A user account in the `users` table
   - A client record in the `clients` table

## Method 2: Through Client Management

1. **Navigate to Clients Page**: Go to `/clients` in the application
2. **Add New Client**: Use the client management interface
3. **Fill Client Details**:
   - Name, email, phone, address
   - This creates a client record
4. **Create User Account**: When the client needs system access:
   - Go to Users page
   - Create a user with the same email and role "client"
   - The system will link them automatically

## Method 3: Self Registration (If Enabled)

Clients can register themselves if self-registration is enabled:
1. Client goes to the login page
2. Clicks "Sign Up" 
3. Fills registration form with role "client"
4. System creates both user and client records

## Important Notes

- **Email Matching**: The system links users and clients by matching email addresses
- **Unique Emails**: Each email can only be used once in the system
- **Role Security**: Only clients can access client-specific features
- **Default Access**: Clients automatically get access to:
  - Client dashboard
  - Their own jobs and files
  - Payment information
  - Client portal

## After User Creation

Once created, clients can:
- Log in with their email and password
- View their projects and progress
- Access their files and payments
- Receive notifications about their jobs
- Use the client portal for full functionality

## Troubleshooting

**If client can't access their data:**
1. Verify the user account has role "client"
2. Check that email addresses match between user and client records
3. Ensure the client record exists in the clients table
4. Check RLS policies are properly configured

**If client gets permission errors:**
1. Confirm user role is set to "client" 
2. Verify the client record exists
3. Check that the email addresses match exactly