import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMessages } from '@/hooks/useMessages';
import { Skeleton } from '@/components/ui/skeleton';
import { BlockUserMenu } from '@/components/BlockUserMenu';
import { ArrowLeft, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ChatDetail = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
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
      return { otherUserId, otherUsername: otherUser?.username ?? t('common.unknown') };
    },
    enabled: !!conversationId && !!user?.id,
  });

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { if (conversationId && messages.length > 0) markAsRead(); }, [conversationId, messages.length, markAsRead]);

  const handleSend = async () => { const trimmed = text.trim(); if (!trimmed) return; setText(''); try { await sendMessage(trimmed); } catch (err) { console.error('Failed to send:', err); } };
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  return (
    <div className="flex flex-col h-screen page-bg">
      <header className="sticky top-0 z-10 px-4 py-3 header-themed">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="rounded-full h-9 w-9 flex items-center justify-center" style={{ background: 'var(--surface-input)' }}>
            <ArrowLeft className="h-5 w-5" style={{ color: 'var(--icon-default)' }} />
          </button>
          <h1 className="text-[16px] font-semibold flex-1" style={{ color: 'var(--text-primary)' }}>
            @{convoInfo?.otherUsername ?? <Skeleton className="h-5 w-24 inline-block" style={{ background: 'var(--surface-skeleton)' }} />}
          </h1>
          {convoInfo?.otherUserId && <BlockUserMenu userId={convoInfo.otherUserId} username={convoInfo.otherUsername} />}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-48 rounded-lg" style={{ background: 'var(--surface-skeleton)' }} />)}</div>
        ) : messages.length === 0 ? (
          <p className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>{t('chat.sayHello')}</p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${isMe ? 'rounded-br-md' : 'rounded-bl-md'}`}
                  style={isMe ? { background: `linear-gradient(135deg, var(--btn-gradient-from), var(--btn-gradient-to))`, color: '#FFFFFF' } : { background: 'var(--surface-input)', color: 'var(--text-primary)' }}>
                  <p className="text-sm break-words">{msg.text}</p>
                  <p className="text-[10px] mt-1" style={{ color: isMe ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)' }}>
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </main>

      <div className="p-3 header-themed" style={{ borderTop: '1px solid var(--surface-divider)' }}>
        <div className="flex gap-2 max-w-2xl mx-auto">
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={handleKeyDown}
            placeholder={t('chat.placeholder')} className="flex-1 px-4 py-2.5 text-[14px] rounded-2xl outline-none"
            style={{ background: 'var(--surface-input)', border: '1px solid var(--surface-input-border)', color: 'var(--text-primary)' }} disabled={isSending} />
          <button onClick={handleSend} disabled={!text.trim() || isSending}
            className="h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-95 disabled:opacity-50 btn-themed">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatDetail;
