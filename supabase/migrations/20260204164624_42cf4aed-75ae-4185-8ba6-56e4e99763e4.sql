-- Create trade_requests table
CREATE TABLE public.trade_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'SENT' CHECK (status IN ('SENT', 'ACCEPTED', 'REJECTED', 'CANCELLED')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trade_request_items table
CREATE TABLE public.trade_request_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trade_request_id UUID NOT NULL REFERENCES public.trade_requests(id) ON DELETE CASCADE,
  sticker_id UUID NOT NULL REFERENCES public.stickers(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.trade_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_request_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for trade_requests
CREATE POLICY "Users can view their own trade requests"
ON public.trade_requests
FOR SELECT
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create trade requests"
ON public.trade_requests
FOR INSERT
WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update their own trade requests"
ON public.trade_requests
FOR UPDATE
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- RLS policies for trade_request_items
CREATE POLICY "Users can view items of their trade requests"
ON public.trade_request_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.trade_requests tr
    WHERE tr.id = trade_request_items.trade_request_id
    AND (tr.from_user_id = auth.uid() OR tr.to_user_id = auth.uid())
  )
);

CREATE POLICY "Users can insert items for their own requests"
ON public.trade_request_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.trade_requests tr
    WHERE tr.id = trade_request_items.trade_request_id
    AND tr.from_user_id = auth.uid()
  )
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_trade_request_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_trade_requests_updated_at
BEFORE UPDATE ON public.trade_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_trade_request_updated_at();