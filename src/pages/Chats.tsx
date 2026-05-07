import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { AvatarCircle } from '@/components/ui/avatar-circle';
import { ListRow } from '@/components/ui/list-row';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import { useConversations } from '@/hooks/useConversations';
import { MessageCircle } from 'lucide-react';
import { formatTimeAgoEs } from '@/lib/dateUtils';

const Chats = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { data: conversations = [], isLoading } = useConversations();

  return (
    <div className="relative mx-auto max-w-lg space-y-4 px-4 safe-page">
      <div className="page-vignette" />

      <PageHeader title={t('chat.conversations')} className="relative z-20 px-0 pb-0 pt-0" />

      {isLoading ? (
        <div className="relative z-20 space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-[var(--radius-lg)] bg-[var(--surface-skeleton)]" />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <EmptyState
          className="relative z-20"
          icon={<MessageCircle />}
          title={t('chat.emptyTitle')}
          description={t('chat.emptyDesc')}
          cta={
            <Button type="button" onClick={() => navigate('/trading')}>
              {t('chat.findTrade')}
            </Button>
          }
        />
      ) : (
        <div className="relative z-20 space-y-2">
          {conversations.map((convo) => {
            const username = convo.other_username ?? t('chat.unknownUser');
            const initials = convo.other_username?.slice(0, 2).toUpperCase();

            return (
              <ListRow
                key={convo.id}
                interactive
                onClick={() => navigate(`/chat/${convo.id}`)}
                leading={<AvatarCircle initials={initials} icon={<MessageCircle />} size="md" />}
                title={`@${username}`}
                subtitle={convo.last_message_text ?? t('chat.noMessagesYet')}
                trailing={
                  <div className="flex flex-col items-end gap-2">
                    {convo.last_message_at && (
                      <span className="whitespace-nowrap text-[11px] font-medium text-[var(--text-hint)]">
                        {formatTimeAgoEs(convo.last_message_at)}
                      </span>
                    )}
                    {convo.unread_count > 0 && (
                      <Badge className="flex h-6 min-w-6 justify-center px-1.5 text-[10px]">
                        {convo.unread_count > 99 ? '99+' : convo.unread_count}
                      </Badge>
                    )}
                  </div>
                }
                className="bg-[var(--surface-card)]"
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Chats;
