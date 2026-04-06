import { useNavigate } from 'react-router-dom';
import { useConversations } from '@/hooks/useConversations';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle } from 'lucide-react';
import { formatTimeAgoEs } from '@/lib/dateUtils';

const Chats = () => {
  const navigate = useNavigate();
  const { data: conversations = [], isLoading } = useConversations();

  return (
    <div className="relative px-4 pt-14 pb-28 max-w-md mx-auto">
      <div className="page-vignette" />
      <div className="relative z-20 space-y-4">
        <div className="text-center mb-2">
          <h1 className="text-[22px] font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>Chats</h1>
        </div>
        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" style={{ background: 'var(--surface-skeleton)' }} />)}</div>
        ) : conversations.length === 0 ? (
          <div className="premium-panel p-8 flex flex-col items-center text-center">
            <MessageCircle className="h-12 w-12 mb-3" style={{ color: 'var(--icon-faint)' }} />
            <p className="text-[14px] font-medium" style={{ color: 'var(--text-secondary)' }}>No chats yet</p>
            <p className="text-[12px] mt-1" style={{ color: 'var(--text-hint)' }}>Chats unlock when a trade request is accepted.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((convo) => (
              <button key={convo.id} className="w-full flex items-center gap-3 p-4 rounded-[16px] text-left transition-all duration-150 active:scale-[0.98]"
                style={{ background: 'var(--surface-card)', border: '1px solid var(--surface-card-border)' }} onClick={() => navigate(`/chat/${convo.id}`)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[14px] truncate" style={{ color: 'var(--text-primary)' }}>@{convo.other_username ?? 'Desconocido'}</span>
                    {convo.unread_count > 0 && (
                      <span className="text-[10px] font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1" style={{ background: 'hsl(var(--badge-bg))', color: '#FFFFFF' }}>{convo.unread_count}</span>
                    )}
                  </div>
                  <p className="text-[13px] truncate mt-1" style={{ color: 'var(--text-muted)' }}>{convo.last_message_text ?? 'Sin mensajes aún'}</p>
                </div>
                {convo.last_message_at && <span className="text-[11px] whitespace-nowrap" style={{ color: 'var(--text-hint)' }}>{formatTimeAgoEs(convo.last_message_at)}</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chats;
