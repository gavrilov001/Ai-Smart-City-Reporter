-- Complete Supabase Schema for Smart City Reporter
-- Copy and paste this entire script into Supabase SQL Editor
-- It will create all necessary tables with proper relationships

-- 1. Users Table (linked to Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text UNIQUE NOT NULL,
  role text DEFAULT 'citizen'::text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);

-- 3. Reports Table (main table)
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category_id uuid,
  title text NOT NULL,
  description text,
  latitude numeric,
  longitude numeric,
  address text,
  status text DEFAULT 'pending'::text,
  ai_suggested_category_id uuid,
  ai_suggestion_confidence numeric(3,2),
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT reports_pkey PRIMARY KEY (id),
  CONSTRAINT reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT reports_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL,
  CONSTRAINT reports_ai_suggested_category_fkey FOREIGN KEY (ai_suggested_category_id) REFERENCES public.categories(id) ON DELETE SET NULL
);

-- 4. Report Images Table (with AI analysis column)
CREATE TABLE IF NOT EXISTS public.report_images (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL,
  image_url text NOT NULL,
  ai_analysis jsonb,
  uploaded_at timestamp without time zone DEFAULT now(),
  CONSTRAINT report_images_pkey PRIMARY KEY (id),
  CONSTRAINT report_images_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE CASCADE
);

-- 5. Report History Table (audit trail)
CREATE TABLE IF NOT EXISTS public.report_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL,
  old_status text,
  new_status text,
  changed_by uuid,
  changed_at timestamp without time zone DEFAULT now(),
  CONSTRAINT report_history_pkey PRIMARY KEY (id),
  CONSTRAINT report_history_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE CASCADE,
  CONSTRAINT report_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id) ON DELETE SET NULL
);

-- 6. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- 7. Report Comments Table
CREATE TABLE IF NOT EXISTS public.report_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL,
  admin_id uuid NOT NULL,
  comment text NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT report_comments_pkey PRIMARY KEY (id),
  CONSTRAINT report_comments_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE CASCADE,
  CONSTRAINT report_comments_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- 8. Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  action text,
  entity_type text,
  entity_id uuid,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT activity_logs_pkey PRIMARY KEY (id),
  CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL
);

-- 9. Assignments Table (for assigning reports to admins)
CREATE TABLE IF NOT EXISTS public.assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL,
  assigned_to uuid NOT NULL,
  assigned_by uuid NOT NULL,
  assigned_at timestamp without time zone DEFAULT now(),
  CONSTRAINT assignments_pkey PRIMARY KEY (id),
  CONSTRAINT assignments_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE CASCADE,
  CONSTRAINT assignments_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT assignments_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id) ON DELETE CASCADE
);

-- ===================================
-- CREATE INDEXES FOR PERFORMANCE
-- ===================================

CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_category_id ON public.reports(category_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_ai_suggested_category ON public.reports(ai_suggested_category_id) WHERE ai_suggested_category_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_report_images_report_id ON public.report_images(report_id);
CREATE INDEX IF NOT EXISTS idx_report_images_ai_analysis ON public.report_images USING GIN (ai_analysis);

CREATE INDEX IF NOT EXISTS idx_report_history_report_id ON public.report_history(report_id);
CREATE INDEX IF NOT EXISTS idx_report_history_changed_by ON public.report_history(changed_by);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

CREATE INDEX IF NOT EXISTS idx_report_comments_report_id ON public.report_comments(report_id);
CREATE INDEX IF NOT EXISTS idx_report_comments_admin_id ON public.report_comments(admin_id);

CREATE INDEX IF NOT EXISTS idx_assignments_report_id ON public.assignments(report_id);
CREATE INDEX IF NOT EXISTS idx_assignments_assigned_to ON public.assignments(assigned_to);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- ===================================
-- INSERT SAMPLE CATEGORIES
-- ===================================

INSERT INTO public.categories (name, description) VALUES
  ('Road Damage', 'Potholes, cracks, and road surface damage'),
  ('Graffiti', 'Graffiti, vandalism, and wall damage'),
  ('Garbage/Waste', 'Litter, trash, and waste management issues'),
  ('Street Lighting', 'Broken street lights and lighting problems'),
  ('Flooding', 'Water accumulation and drainage issues'),
  ('Parks/Green Spaces', 'Park maintenance and vegetation issues'),
  ('Public Safety', 'Safety hazards and structural damage'),
  ('Sidewalk/Pedestrian', 'Pedestrian path and pavement damage'),
  ('Utilities', 'Power lines, pipes, and utility issues'),
  ('Parking', 'Parking violations and lot issues'),
  ('Air Quality', 'Pollution and air quality concerns'),
  ('Building Issues', 'Building damage and facade problems')
ON CONFLICT (name) DO NOTHING;

-- ===================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ===================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- ===================================
-- RLS POLICIES
-- ===================================

-- Users: Can read own profile
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Reports: Citizens can see their own, admins see all
CREATE POLICY "Users can read own reports" ON public.reports
  FOR SELECT USING (auth.uid() = user_id OR 
    EXISTS(SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'administrator'));

-- Report Images: Same as reports
CREATE POLICY "Users can read report images" ON public.report_images
  FOR SELECT USING (
    EXISTS(SELECT 1 FROM public.reports WHERE reports.id = report_images.report_id AND reports.user_id = auth.uid())
    OR EXISTS(SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'administrator')
  );

-- Categories: Everyone can read
CREATE POLICY "Everyone can read categories" ON public.categories
  FOR SELECT USING (true);

-- Notifications: Users can read own
CREATE POLICY "Users can read own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- ===================================
-- VERIFICATION
-- ===================================

-- Run these queries to verify everything was created:
-- SELECT * FROM information_schema.tables WHERE table_schema = 'public';
-- SELECT COUNT(*) as total_categories FROM public.categories;
-- SELECT COUNT(*) as total_users FROM public.users;
