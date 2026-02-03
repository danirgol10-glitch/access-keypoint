-- Create users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  username TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can view their own record
CREATE POLICY "Users can view their own record"
ON public.users
FOR SELECT
USING (auth.uid() = id);

-- Users can insert their own record
CREATE POLICY "Users can insert their own record"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Users can update their own record
CREATE POLICY "Users can update their own record"
ON public.users
FOR UPDATE
USING (auth.uid() = id);