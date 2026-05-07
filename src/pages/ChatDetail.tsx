import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMessages } from '@/hooks/useMessages';
import { AvatarCircle } from '@/components/ui/avatar-circle';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { BlockUserMenu } from '@/components/BlockUserMenu';
import { ArrowLeft, MessageCircle, Send, User } from 'lucide-react';
import { formatTimeAgoEs } from '@/lib/dateUtils';

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
      const { data: otherUser } = await supabase.from('users').select('username, city, university_id').eq('id', otherUserId).single();
      let universityName: string | null = null;
      if (otherUser?.university_id) {
        const { data: uni } = await supabase.from('universities').select('name').eq('id', otherUser.university_id).single();
        universityName = uni?.name ?? null;
      }
      const cityUni = [otherUser?.city, universityName].filter(Boolean).join(' · ') || null;
      return { otherUserId, otherUsername: otherUser?.username ?? t('common.unknown'), cityUni };
    },
    enabled: !!conversationId && !!user?.id,
  });

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { if (conversationId && messages.length > 0) markAsRead(); }, [conversationId, messages.length, markAsRead]);

  const handleSend = async () => { const trimmed = text.trim(); if (!trimmed) return; setText(''); try { await sendMessage(trimmed); } catch (err) { console.error('Failed to send:', err); } };
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  return (
    <div className="flex h-full min-h-0 w-full max-w-full flex-col page-bg">
      <header className="z-10 flex-shrink-0 border-b border-[var(--surface-divider)] bg-[var(--surface-glass-strong)] px-4 pb-3 safe-header shadow-control backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Button type="button" variant="ghost" size="icon" aria-label="Volver" onClick={() => navigate(-1)} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <AvatarCircle
            initials={convoInfo?.otherUsername?.slice(0, 2).toUpperCase()}
            icon={<User />}
            size="md"
            className="shrink-0"
          />

          <div className="min-w-0 flex-1">
            {convoInfo?.otherUsername ? (
              <h1 className="truncate text-base font-semibold text-[var(--text-primary)]">@{convoInfo.otherUsername}</h1>
            ) : (
              <Skeleton className="h-5 w-28 bg-[var(--surface-skeleton)]" />
            )}
            {convoInfo?.cityUni && (
              <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">{convoInfo.cityUni}</p>
            )}
          </div>

          {convoInfo?.otherUserId && <BlockUserMenu userId={convoInfo.otherUserId} username={convoInfo.otherUsername} />}
        </div>
      </header>

      <main className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 [-webkit-overflow-scrolling:touch]">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                className={`h-12 rounded-2xl bg-[var(--surface-skeleton)] ${i % 2 === 0 ? 'ml-auto w-52' : 'mr-auto w-44'}`}
              />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <EmptyState className="py-10" icon={<MessageCircle />} title={t('chat.sayHello')} />
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[78%] break-words rounded-2xl px-4 py-2.5 shadow-control ${
                    isMe
                      ? 'rounded-br-md bg-[linear-gradient(135deg,var(--btn-gradient-from),var(--btn-gradient-to))] text-white'
                      : 'rounded-bl-md border border-[var(--surface-input-border)] bg-[var(--surface-input)] text-[var(--text-primary)]'
                  }`}
                >
                  <p className="text-sm leading-5">{msg.text}</p>
                  <p className={`mt-1 text-[10px] leading-none ${isMe ? 'text-white/65' : 'text-[var(--text-muted)]'}`}>
                    {formatTimeAgoEs(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </main>

      <div className="flex-shrink-0 border-t border-[var(--surface-divider)] bg-[var(--surface-glass-strong)] px-3 pt-3 safe-bottom backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('chat.placeholder')}
            disabled={isSending}
            className="flex-1"
          />
          <Button
            type="button"
            size="icon"
            onClick={handleSend}
            disabled={!text.trim() || isSending}
            aria-label={t('chat.placeholder')}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatDetail;
