-- ==============================================================================
-- Migration: Smart Availability Recommendation Engine Database Optimization
-- Target: Supabase PostgreSQL
-- ==============================================================================

-- 1. Composite index for availability lookup by date, student_id, and status
CREATE INDEX IF NOT EXISTS idx_availability_date_student_status 
ON public.availability_entries(date, student_id, availability_status);

-- 2. Range index for time-interval queries
CREATE INDEX IF NOT EXISTS idx_availability_date_time 
ON public.availability_entries(date, start_time, end_time);

-- 3. Composite audience filtering index on profiles for active students
CREATE INDEX IF NOT EXISTS idx_profiles_audience_filter 
ON public.profiles(role, account_status, institution_id, academic_year, department);
