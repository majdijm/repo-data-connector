# Media Task Manager Database Schema

## Tables

### 1. Users
- `id` (PK): Serial/UUID
- `email`: String, unique
- `password`: String (hashed)
- `name`: String
- `role`: Enum ('admin', 'receptionist', 'photographer', 'designer', 'editor', 'client')
- `avatar`: String (URL)
- `is_active`: Boolean
- `created_at`: Timestamp
- `updated_at`: Timestamp

### 2. Clients
- `id` (PK): Serial/UUID
- `name`: String
- `email`: String, unique
- `phone`: String
- `address`: String
- `user_id`: Foreign Key (Users)
- `total_paid`: Decimal
- `total_due`: Decimal
- `created_at`: Timestamp
- `updated_at`: Timestamp

### 3. Jobs
- `id` (PK): Serial/UUID
- `title`: String
- `type`: Enum ('photo_session', 'video_editing', 'design')
- `status`: Enum ('pending', 'in_progress', 'review', 'completed', 'delivered')
- `client_id`: Foreign Key (Clients)
- `assigned_to`: Foreign Key (Users)
- `due_date`: Timestamp
- `session_date`: Timestamp
- `description`: Text
- `price`: Decimal
- `created_by`: Foreign Key (Users)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### 4. Job_Files
- `id` (PK): Serial/UUID
- `job_id`: Foreign Key (Jobs)
- `file_name`: String
- `file_path`: String
- `file_type`: String
- `file_size`: Integer
- `uploaded_by`: Foreign Key (Users)
- `is_final`: Boolean
- `created_at`: Timestamp

### 5. Payments
- `id` (PK): Serial/UUID
- `client_id`: Foreign Key (Clients)
- `job_id`: Foreign Key (Jobs)
- `amount`: Decimal
- `payment_date`: Timestamp
- `payment_method`: String
- `notes`: Text
- `recorded_by`: Foreign Key (Users)
- `created_at`: Timestamp

### 6. Notifications
- `id` (PK): Serial/UUID
- `user_id`: Foreign Key (Users)
- `title`: String
- `message`: Text
- `related_to`: String
- `related_id`: Integer
- `is_read`: Boolean
- `created_at`: Timestamp

### 7. Activity_Logs
- `id` (PK): Serial/UUID
- `user_id`: Foreign Key (Users)
- `action`: String
- `resource_type`: String
- `resource_id`: Integer
- `details`: JSON
- `ip_address`: String
- `user_agent`: String
- `created_at`: Timestamp

### 8. Feedback
- `id` (PK): Serial/UUID
- `job_id`: Foreign Key (Jobs)
- `client_id`: Foreign Key (Clients)
- `content`: Text
- `rating`: Integer
- `created_at`: Timestamp

## Relationships

1. Users (1) → Clients (0..1): A user with role 'client' has one client profile
2. Clients (1) → Jobs (0..n): A client can have multiple jobs
3. Users (1) → Jobs (0..n): A user can be assigned to multiple jobs
4. Jobs (1) → Job_Files (0..n): A job can have multiple files
5. Clients (1) → Payments (0..n): A client can have multiple payments
6. Jobs (1) → Payments (0..n): A job can have multiple payments
7. Users (1) → Notifications (0..n): A user can have multiple notifications
8. Jobs (1) → Feedback (0..n): A job can have multiple feedback entries
