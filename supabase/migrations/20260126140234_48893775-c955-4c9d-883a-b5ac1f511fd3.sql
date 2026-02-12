-- 1. Create app_role enum for role management
CREATE TYPE public.app_role AS ENUM ('admin', 'staff');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- 3. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create security definer function to check roles (prevents recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. Create function to check if user is authenticated
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL
$$;

-- 6. Create function to check if user has any staff role (admin or staff)
CREATE OR REPLACE FUNCTION public.is_staff_or_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'staff')
  )
$$;

-- 7. RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Only admins can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 8. Drop existing PUBLIC policies on nps_cards
DROP POLICY IF EXISTS "Allow public delete on nps_cards" ON public.nps_cards;
DROP POLICY IF EXISTS "Allow public insert on nps_cards" ON public.nps_cards;
DROP POLICY IF EXISTS "Allow public read on nps_cards" ON public.nps_cards;
DROP POLICY IF EXISTS "Allow public update on nps_cards" ON public.nps_cards;

-- 9. Create secure policies for nps_cards
CREATE POLICY "Staff can read nps_cards"
ON public.nps_cards FOR SELECT
TO authenticated
USING (public.is_staff_or_admin(auth.uid()));

CREATE POLICY "Staff can insert nps_cards"
ON public.nps_cards FOR INSERT
TO authenticated
WITH CHECK (public.is_staff_or_admin(auth.uid()));

CREATE POLICY "Staff can update nps_cards"
ON public.nps_cards FOR UPDATE
TO authenticated
USING (public.is_staff_or_admin(auth.uid()));

CREATE POLICY "Only admins can delete nps_cards"
ON public.nps_cards FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 10. Drop existing PUBLIC policies on nps_daily
DROP POLICY IF EXISTS "Allow public delete on nps_daily" ON public.nps_daily;
DROP POLICY IF EXISTS "Allow public insert on nps_daily" ON public.nps_daily;
DROP POLICY IF EXISTS "Allow public read on nps_daily" ON public.nps_daily;
DROP POLICY IF EXISTS "Allow public update on nps_daily" ON public.nps_daily;

-- 11. Create secure policies for nps_daily
CREATE POLICY "Staff can read nps_daily"
ON public.nps_daily FOR SELECT
TO authenticated
USING (public.is_staff_or_admin(auth.uid()));

CREATE POLICY "Staff can insert nps_daily"
ON public.nps_daily FOR INSERT
TO authenticated
WITH CHECK (public.is_staff_or_admin(auth.uid()));

CREATE POLICY "Staff can update nps_daily"
ON public.nps_daily FOR UPDATE
TO authenticated
USING (public.is_staff_or_admin(auth.uid()));

CREATE POLICY "Only admins can delete nps_daily"
ON public.nps_daily FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 12. Drop existing PUBLIC policies on nps_comments
DROP POLICY IF EXISTS "Allow public delete on nps_comments" ON public.nps_comments;
DROP POLICY IF EXISTS "Allow public insert on nps_comments" ON public.nps_comments;
DROP POLICY IF EXISTS "Allow public read on nps_comments" ON public.nps_comments;
DROP POLICY IF EXISTS "Allow public update on nps_comments" ON public.nps_comments;

-- 13. Create secure policies for nps_comments (contains sensitive client data)
CREATE POLICY "Staff can read nps_comments"
ON public.nps_comments FOR SELECT
TO authenticated
USING (public.is_staff_or_admin(auth.uid()));

CREATE POLICY "Staff can insert nps_comments"
ON public.nps_comments FOR INSERT
TO authenticated
WITH CHECK (public.is_staff_or_admin(auth.uid()));

CREATE POLICY "Staff can update nps_comments"
ON public.nps_comments FOR UPDATE
TO authenticated
USING (public.is_staff_or_admin(auth.uid()));

CREATE POLICY "Only admins can delete nps_comments"
ON public.nps_comments FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));