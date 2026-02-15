import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/hooks/useMessages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ChatDetail = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, sendMessage, isSending, markAsRead } =
    useMessages(conversationId);

  // Get conversation info for header
  const { data: convoInfo } = useQuery({
    queryKey: ['conversation-info', conversationId],
    queryFn: async () => {
      if (!conversationId || !user?.id) return null;

      const { data: convo } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (!convo) return null;

      const otherUserId =
        convo.user_a_id === user.id ? convo.user_b_id : convo.user_a_id;

      const { data: otherUser } = await supabase
        .from('users')
        .select('username')
        .eq('id', otherUserId)
        .single();

      return { otherUsername: otherUser?.username ?? 'Unknown' };
    },
    enabled: !!conversationId && !!user?.id,
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark as read on mount
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      markAsRead();
    }
  }, [conversationId, messages.length, markAsRead]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText('');
    try {
      await sendMessage(trimmed);
    } catch (err) {
      console.error('Failed to send:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">
            @{convoInfo?.otherUsername ?? <Skeleton className="h-5 w-24 inline-block" />}
          </h1>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-48 rounded-lg" />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Say hello! 👋
          </p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isMe
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-secondary text-secondary-foreground rounded-bl-md'
                  }`}
                >
                  <p className="text-sm break-words">{msg.text}</p>
                  <p
                    className={`text-[10px] mt-1 ${
                      isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}
                  >
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </main>

      {/* Input */}
      <div className="border-t border-border bg-background p-3">
        <div className="flex gap-2 max-w-2xl mx-auto">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1"
            disabled={isSending}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!text.trim() || isSending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatDetail;
