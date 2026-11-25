-- ==============================================================================
-- MAATRAM SYNC: SEED DATA FOR SUPABASE
-- Run after schema.sql
-- ==============================================================================

-- 1. Insert Initial Institutions
INSERT INTO public.institutions (id, institution_name, institution_code, location, contact_details, status)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'College of Engineering, Guindy', 'CEG', 'Anna University, Chennai, Tamil Nadu', '{"dean": "Dr. K. Senthil Kumar", "email": "ceg.academics@annauniv.edu", "phone": "+91 44 2235 7004"}', 'Active'),
  ('c0000000-0000-0000-0000-000000000002', 'Madras Institute of Technology', 'MIT', 'Chromepet, Chennai, Tamil Nadu', '{"coordinator": "Dr. R. Rajendran", "email": "mit.placement@mitindia.edu", "phone": "+91 44 2223 2403"}', 'Active'),
  ('c0000000-0000-0000-0000-000000000003', 'PSG College of Technology', 'PSG', 'Peelamedu, Coimbatore, Tamil Nadu', '{"dean": "Dr. P. Radhakrishnan", "email": "psg.liaison@psgtech.edu", "phone": "+91 422 257 2177"}', 'Active'),
  ('c0000000-0000-0000-0000-000000000004', 'Coimbatore Institute of Technology', 'CIT', 'Civil Aerodrome Post, Coimbatore', '{"director": "Dr. V. Selladurai", "email": "cit.office@cit.edu.in", "phone": "+91 422 257 4071"}', 'Active'),
  ('c0000000-0000-0000-0000-000000000005', 'SSN College of Engineering', 'SSN', 'Kalavakkam, Old Mahabalipuram Road, Chennai', '{"principal": "Dr. V. E. Annamalai", "email": "ssn.placement@ssn.edu.in", "phone": "+91 44 2746 9700"}', 'Active'),
  ('c0000000-0000-0000-0000-000000000006', 'Thiagarajar College of Engineering', 'TCE', 'Thiruparankundram, Madurai, Tamil Nadu', '{"coordinator": "Dr. S. Baskar", "email": "tce.academic@tce.edu", "phone": "+91 452 248 2240"}', 'Active'),
  ('c0000000-0000-0000-0000-000000000007', 'Government College of Technology', 'GCT', 'Thadagam Road, Coimbatore, Tamil Nadu', '{"principal": "Dr. P. Thamarai", "email": "gct.principal@gct.ac.in", "phone": "+91 422 243 2221"}', 'Active')
ON CONFLICT (institution_code) DO NOTHING;

-- 2. Note for Demo Auth Users:
-- In Supabase, auth users are created through `auth.users`.
-- To manually seed test auth users in the Supabase SQL editor:
/*
-- Insert student user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'student@maatram.dev',
  crypt('Student@123', gen_salt('bf')),
  now(),
  '{"full_name": "Priya Dharshini K", "role": "student"}'
) ON CONFLICT DO NOTHING;

-- Insert office user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'office@maatram.dev',
  crypt('Office@123', gen_salt('bf')),
  now(),
  '{"full_name": "Senthil Nathan R", "role": "office"}'
) ON CONFLICT DO NOTHING;

-- Insert admin user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
  'a0000000-0000-0000-0000-000000000003',
  'admin@maatram.dev',
  crypt('Admin@123', gen_salt('bf')),
  now(),
  '{"full_name": "Dr. Ananya Sundaram", "role": "admin"}'
) ON CONFLICT DO NOTHING;
*/
