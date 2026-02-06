-- Drop the old restrictive policy that only shows DUPLICATE stickers
DROP POLICY IF EXISTS "Users can view friends duplicate stickers" ON public.user_stickers;

-- Add new policy that allows viewing ALL friend stickers (HAVE + DUPLICATE)
CREATE POLICY "Users can view friends stickers"
ON public.user_stickers
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM friendships
    WHERE status = 'ACCEPTED'
    AND (
      (requester_id = auth.uid() AND addressee_id = user_stickers.user_id)
      OR (addressee_id = auth.uid() AND requester_id = user_stickers.user_id)
    )
  )
);