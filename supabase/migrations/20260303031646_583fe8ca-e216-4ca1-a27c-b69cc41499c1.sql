
-- Fix: Both SELECT policies on users are restrictive, meaning NO rows can ever be returned.
-- Drop them and recreate as permissive policies.

DROP POLICY IF EXISTS "Users can search by username" ON public.users;
DROP POLICY IF EXISTS "Users can view their own record" ON public.users;

-- Permissive: users can always view their own full record
CREATE POLICY "Users can view their own record"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Permissive: anyone authenticated can see basic user info (for search, friend lists, etc.)
CREATE POLICY "Users can search by username"
  ON public.users FOR SELECT
  USING (true);
