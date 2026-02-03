-- Create user_stickers table for tracking sticker status per user
CREATE TABLE public.user_stickers (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  sticker_id UUID NOT NULL REFERENCES public.stickers(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('HAVE', 'NEED', 'DUPLICATE')),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, sticker_id)
);

-- Enable RLS
ALTER TABLE public.user_stickers ENABLE ROW LEVEL SECURITY;

-- Users can view their own sticker statuses
CREATE POLICY "Users can view their own sticker statuses"
ON public.user_stickers
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own sticker statuses
CREATE POLICY "Users can insert their own sticker statuses"
ON public.user_stickers
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own sticker statuses
CREATE POLICY "Users can update their own sticker statuses"
ON public.user_stickers
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own sticker statuses
CREATE POLICY "Users can delete their own sticker statuses"
ON public.user_stickers
FOR DELETE
USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_user_stickers_user_id ON public.user_stickers(user_id);
CREATE INDEX idx_user_stickers_status ON public.user_stickers(user_id, status);