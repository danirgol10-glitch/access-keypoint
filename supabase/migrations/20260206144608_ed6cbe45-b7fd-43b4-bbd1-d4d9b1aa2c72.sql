-- Add unique constraint to prevent duplicate sticker_id within the same trade_request_id
ALTER TABLE public.trade_request_items 
ADD CONSTRAINT trade_request_items_unique_sticker_per_request 
UNIQUE (trade_request_id, sticker_id);