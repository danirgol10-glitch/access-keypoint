import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/hooks/useMessages';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ChatDetail = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, sendMessage, isSending, markAsRead } = useMessages(conversationId);

  const { data: convoInfo } = useQuery({
    queryKey: ['conversation-info', conversationId],
    queryFn: async () => {
      if (!conversationId || !user?.id) return null;
      const { data: convo } = await supabase.from('conversations').select('*').eq('id', conversationId).single();
      if (!convo) return null;
      const otherUserId = convo.user_a_id === user.id ? convo.user_b_id : convo.user_a_id;
      const { data: otherUser } = await supabase.from('users').select('username').eq('id', otherUserId).single();
      return { otherUsername: otherUser?.username ?? 'Unknown' };
    },
    enabled: !!conversationId && !!user?.id,
  });

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { if (conversationId && messages.length > 0) markAsRead(); }, [conversationId, messages.length, markAsRead]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText('');
    try { await sendMessage(trimmed); } catch (err) { console.error('Failed to send:', err); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex flex-col h-screen page-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 px-4 py-3" style={{ background: 'rgba(7,28,71,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="rounded-full h-9 w-9 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <ArrowLeft className="h-5 w-5" style={{ color: 'rgba(255,255,255,0.7)' }} />
          </button>
          <h1 className="text-[16px] font-semibold" style={{ color: '#FFFFFF' }}>
            @{convoInfo?.otherUsername ?? <Skeleton className="h-5 w-24 inline-block" style={{ background: 'rgba(255,255,255,0.06)' }} />}
          </h1>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-48 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }} />)}
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center py-8" style={{ color: 'rgba(255,255,255,0.5)' }}>Say hello! 👋</p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${isMe ? 'rounded-br-md' : 'rounded-bl-md'}`}
                  style={isMe ? { background: 'linear-gradient(135deg, #0A2B73, #1E5AA6)', color: '#FFFFFF' } : { background: 'rgba(255,255,255,0.06)', color: '#FFFFFF' }}
                >
                  <p className="text-sm break-words">{msg.text}</p>
                  <p className="text-[10px] mt-1" style={{ color: isMe ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.4)' }}>
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
      <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(7,28,71,0.95)' }}>
        <div className="flex gap-2 max-w-2xl mx-auto">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 text-[14px] rounded-2xl outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: '#FFFFFF' }}
            disabled={isSending}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || isSending}
            className="h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-95 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #0A2B73, #1E5AA6)', border: '1px solid rgba(255,255,255,0.12)', color: '#FFFFFF' }}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatDetail;
