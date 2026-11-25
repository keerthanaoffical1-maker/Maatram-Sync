-- ==============================================================================
-- MAATRAM SYNC: DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- Target: Supabase PostgreSQL
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. ENUMS & DOMAINS
-- ==============================================================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'office', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE account_status AS ENUM ('Active', 'Inactive');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE availability_status AS ENUM ('available', 'unavailable', 'tentative');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE event_mode AS ENUM ('Online', 'Offline');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE event_status AS ENUM ('Draft', 'Scheduled', 'In Progress', 'Completed', 'Cancelled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;


-- ==============================================================================
-- 3. TABLES CREATION
-- ==============================================================================

-- 3.1 Institutions Table
CREATE TABLE IF NOT EXISTS public.institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_name TEXT NOT NULL,
  institution_code TEXT NOT NULL UNIQUE,
  location TEXT NOT NULL,
  contact_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  status account_status NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3.2 Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'student',
  institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
  academic_year TEXT,
  department TEXT,
  student_id TEXT UNIQUE,
  account_status account_status NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3.4 Availability Entries Table
CREATE TABLE IF NOT EXISTS public.availability_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  availability_status availability_status NOT NULL DEFAULT 'available',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_student_slot UNIQUE (student_id, date, start_time, end_time)
);

-- 3.5 Events Table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  event_mode event_mode NOT NULL DEFAULT 'Online',
  location TEXT,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  target_institutions TEXT[] DEFAULT '{}'::text[],
  target_academic_years TEXT[] DEFAULT '{}'::text[],
  required_participants INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status event_status NOT NULL DEFAULT 'Draft',
  mentor_name TEXT,
  meeting_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3.6 Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 4. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_institution ON public.profiles(institution_id);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_profiles_audience_filter ON public.profiles(role, account_status, institution_id, academic_year, department);
CREATE INDEX IF NOT EXISTS idx_availability_student_date ON public.availability_entries(student_id, date);
CREATE INDEX IF NOT EXISTS idx_availability_date_student_status ON public.availability_entries(date, student_id, availability_status);
CREATE INDEX IF NOT EXISTS idx_availability_date_time ON public.availability_entries(date, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_events_start_status ON public.events(start_datetime, status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at DESC);

-- ==============================================================================
-- 5. HELPER FUNCTIONS & TRIGGERS
-- ==============================================================================

-- Helper to get current authenticated user's role securely
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Helper to verify if caller is an active user
CREATE OR REPLACE FUNCTION public.is_active_account()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (account_status = 'Active') FROM public.profiles WHERE id = auth.uid();
$$;

-- Institution deletion safeguard: prevent deletion if students are assigned
CREATE OR REPLACE FUNCTION public.prevent_institution_delete_with_students()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  student_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO student_count FROM public.profiles WHERE institution_id = OLD.id;
  IF student_count > 0 THEN
    RAISE EXCEPTION 'Cannot delete institution "%" because % student records are still assigned to it. Reassign students first.', OLD.institution_name, student_count;
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_institution_delete ON public.institutions;
CREATE TRIGGER trg_prevent_institution_delete
BEFORE DELETE ON public.institutions
FOR EACH ROW
EXECUTE FUNCTION public.prevent_institution_delete_with_students();

-- Auto update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_events_updated_at ON public.events;
CREATE TRIGGER trg_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Auto-provision profile on new auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  assigned_role user_role := 'student';
BEGIN
  -- Default to 'student' role. Only explicitly marked metadata or admin can elevate.
  IF NEW.raw_user_meta_data->>'role' = 'office' THEN
    assigned_role := 'office';
  ELSIF NEW.raw_user_meta_data->>'role' = 'admin' THEN
    assigned_role := 'admin';
  END IF;

  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    phone,
    role,
    account_status
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    assigned_role,
    'Active'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 6.1 Institutions Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone authenticated can view institutions" ON public.institutions;
CREATE POLICY "Anyone authenticated can view institutions"
ON public.institutions FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can manage institutions" ON public.institutions;
CREATE POLICY "Admins can manage institutions"
ON public.institutions FOR ALL
TO authenticated
USING (public.get_user_role() = 'admin')
WITH CHECK (public.get_user_role() = 'admin');

-- ------------------------------------------------------------------------------
-- 6.2 Profiles Policies
-- ------------------------------------------------------------------------------
-- Users can read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Office team can view student profiles for planning
DROP POLICY IF EXISTS "Office team can view student profiles" ON public.profiles;
CREATE POLICY "Office team can view student profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  public.get_user_role() = 'office' AND role = 'student'
);

-- Admins can view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.get_user_role() = 'admin');

-- Admins can create and edit student profiles
DROP POLICY IF EXISTS "Admins can manage student profiles" ON public.profiles;
CREATE POLICY "Admins can manage student profiles"
ON public.profiles FOR ALL
TO authenticated
USING (public.get_user_role() = 'admin')
WITH CHECK (
  public.get_user_role() = 'admin'
  -- Ensures student registration form cannot accidentally create office or admin roles
  AND role = 'student'
);

-- ------------------------------------------------------------------------------
-- 6.3 Availability Entries Policies
-- ------------------------------------------------------------------------------
-- Students manage their own availability
DROP POLICY IF EXISTS "Students can view own availability" ON public.availability_entries;
CREATE POLICY "Students can view own availability"
ON public.availability_entries FOR SELECT
TO authenticated
USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can insert own availability" ON public.availability_entries;
CREATE POLICY "Students can insert own availability"
ON public.availability_entries FOR INSERT
TO authenticated
WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can update own availability" ON public.availability_entries;
CREATE POLICY "Students can update own availability"
ON public.availability_entries FOR UPDATE
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can delete own availability" ON public.availability_entries;
CREATE POLICY "Students can delete own availability"
ON public.availability_entries FOR DELETE
TO authenticated
USING (student_id = auth.uid());

-- Office team can read availability for overlap analysis
DROP POLICY IF EXISTS "Office team can view student availability" ON public.availability_entries;
CREATE POLICY "Office team can view student availability"
ON public.availability_entries FOR SELECT
TO authenticated
USING (public.get_user_role() = 'office');

-- Admins can read availability
DROP POLICY IF EXISTS "Admins can view student availability" ON public.availability_entries;
CREATE POLICY "Admins can view student availability"
ON public.availability_entries FOR SELECT
TO authenticated
USING (public.get_user_role() = 'admin');

-- ------------------------------------------------------------------------------
-- 6.4 Events Policies
-- ------------------------------------------------------------------------------
-- Office team has full management of events
DROP POLICY IF EXISTS "Office team can manage events" ON public.events;
CREATE POLICY "Office team can manage events"
ON public.events FOR ALL
TO authenticated
USING (public.get_user_role() = 'office')
WITH CHECK (public.get_user_role() = 'office');

-- Students can view scheduled events
DROP POLICY IF EXISTS "Students can view scheduled events" ON public.events;
CREATE POLICY "Students can view scheduled events"
ON public.events FOR SELECT
TO authenticated
USING (
  public.get_user_role() = 'student' AND status = 'Scheduled'
);

-- Admins can view events (read-only, cannot plan or manage sessions)
DROP POLICY IF EXISTS "Admins can view events" ON public.events;
CREATE POLICY "Admins can view events"
ON public.events FOR SELECT
TO authenticated
USING (public.get_user_role() = 'admin');

-- ------------------------------------------------------------------------------
-- 6.5 Activity Logs Policies
-- ------------------------------------------------------------------------------
-- Admins can view all activity logs
DROP POLICY IF EXISTS "Admins can view all logs" ON public.activity_logs;
CREATE POLICY "Admins can view all logs"
ON public.activity_logs FOR SELECT
TO authenticated
USING (public.get_user_role() = 'admin');

-- Office team can view operational logs
DROP POLICY IF EXISTS "Office team can view logs" ON public.activity_logs;
CREATE POLICY "Office team can view logs"
ON public.activity_logs FOR SELECT
TO authenticated
USING (public.get_user_role() = 'office');

-- Any authenticated user can insert audit logs for their own actions
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.activity_logs;
CREATE POLICY "Authenticated users can insert audit logs"
ON public.activity_logs FOR INSERT
TO authenticated
WITH CHECK (actor_id = auth.uid() OR actor_id IS NULL);
