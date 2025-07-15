-- Add back the previous users without erasing existing ones
INSERT INTO public.users (email, name, role, password, is_active, created_at) VALUES
('majdijm@gmail.com', 'Admin User', 'admin', 'admin123', true, now()),
('foodspott2016@gmail.com', 'Reception User', 'receptionist', 'admin123', true, now()),
('breaktheegg0@gmail.com', 'Client 1', 'client', 'admin123', true, now()),
('girlgizmo57@gmail.com', 'Client 2', 'client', 'admin123', true, now()),
('myhandgadgets@gmail.com', 'Photography User', 'photographer', 'admin123', true, now()),
('quranlight2019@gmail.com', 'Video Production User', 'editor', 'admin123', true, now()),
('rtopr.beauty@gmail.com', 'Designer User', 'designer', 'admin123', true, now())
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  password = EXCLUDED.password,
  updated_at = now();