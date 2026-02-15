
-- Add conversation_id to trade_requests
ALTER TABLE public.trade_requests ADD COLUMN conversation_id uuid;

-- Create conversations table
CREATE TABLE public.conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_a_id uuid NOT NULL REFERENCES public.users(id),
  user_b_id uuid NOT NULL REFERENCES public.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_message_at timestamp with time zone,
  CONSTRAINT conversations_unique_pair UNIQUE (user_a_id, user_b_id),
  CONSTRAINT conversations_ordered_pair CHECK (user_a_id < user_b_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.conversations(id),
  sender_id uuid NOT NULL REFERENCES public.users(id),
  text text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  read_at timestamp with time zone
);

-- Add FK from trade_requests to conversations
ALTER TABLE public.trade_requests
  ADD CONSTRAINT trade_requests_conversation_id_fkey
  FOREIGN KEY (conversation_id) REFERENCES public.conversations(id);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversations: participants can view
CREATE POLICY "Users can view their conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- Conversations: authenticated users can insert (app logic enforces ACCEPTED check)
CREATE POLICY "Authenticated users can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND (auth.uid() = user_a_id OR auth.uid() = user_b_id));

-- Conversations: participants can update (for last_message_at)
CREATE POLICY "Participants can update conversations"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- Messages: participants can view messages in their conversations
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND (c.user_a_id = auth.uid() OR c.user_b_id = auth.uid())
  ));

-- Messages: participants can send messages only if an ACCEPTED trade request exists
CREATE POLICY "Users can send messages in unlocked conversations"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
      AND (c.user_a_id = auth.uid() OR c.user_b_id = auth.uid())
    )
    AND EXISTS (
      SELECT 1 FROM public.trade_requests tr
      WHERE tr.conversation_id = messages.conversation_id
      AND tr.status = 'ACCEPTED'
    )
  );

-- Messages: users can update their own messages (for read_at by receiver)
CREATE POLICY "Users can update messages in their conversations"
  ON public.messages FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND (c.user_a_id = auth.uid() OR c.user_b_id = auth.uid())
  ));

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
