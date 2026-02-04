-- Allow users to view their accepted friends' DUPLICATE stickers
CREATE POLICY "Users can view friends duplicate stickers"
ON public.user_stickers
FOR SELECT
USING (
  status = 'DUPLICATE' 
  AND EXISTS (
    SELECT 1 FROM public.friendships
    WHERE status = 'ACCEPTED'
    AND (
      (requester_id = auth.uid() AND addressee_id = user_stickers.user_id)
      OR (addressee_id = auth.uid() AND requester_id = user_stickers.user_id)
    )
  )
);