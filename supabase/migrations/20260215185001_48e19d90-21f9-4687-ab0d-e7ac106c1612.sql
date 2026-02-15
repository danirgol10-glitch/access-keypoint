-- Allow users to view DUPLICATE stickers of other users in the same city
CREATE POLICY "Users can view duplicate stickers of same city users"
ON public.user_stickers
FOR SELECT
USING (
  status = 'DUPLICATE'
  AND EXISTS (
    SELECT 1 FROM public.users AS viewer
    JOIN public.users AS owner ON owner.id = user_stickers.user_id
    WHERE viewer.id = auth.uid()
      AND viewer.city IS NOT NULL
      AND viewer.city = owner.city
      AND owner.id != auth.uid()
  )
);
