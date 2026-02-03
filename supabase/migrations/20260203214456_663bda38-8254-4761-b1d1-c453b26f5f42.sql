-- Create friendships table
CREATE TABLE public.friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Prevent self-add
  CONSTRAINT no_self_friendship CHECK (requester_id != addressee_id)
);

-- Unique index to prevent duplicate relationships (treat A,B and B,A as same pair)
CREATE UNIQUE INDEX unique_friendship_pair 
ON public.friendships (LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id));

-- Enable RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Users can view friendships they're part of
CREATE POLICY "Users can view their friendships"
ON public.friendships
FOR SELECT
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Users can create friendship requests (as requester)
CREATE POLICY "Users can create friendship requests"
ON public.friendships
FOR INSERT
WITH CHECK (auth.uid() = requester_id);

-- Users can update friendships they're the addressee of (to accept/reject)
CREATE POLICY "Addressee can update friendship status"
ON public.friendships
FOR UPDATE
USING (auth.uid() = addressee_id);

-- Users can delete friendships they're part of
CREATE POLICY "Users can delete their friendships"
ON public.friendships
FOR DELETE
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Add SELECT policy to users table for username lookup
CREATE POLICY "Users can search by username"
ON public.users
FOR SELECT
USING (true);