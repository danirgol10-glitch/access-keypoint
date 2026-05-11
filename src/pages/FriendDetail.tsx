import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { formatTimeAgoEs } from '@/lib/dateUtils';
import { supabase } from '@/integrations/supabase/client';
import { useFriendHelpfulStickers } from '@/hooks/useFriendHelpfulStickers';
import { useTradeRequests } from '@/hooks/useTradeRequests';
import { useUserProfile } from '@/hooks/useUserProfile';
import { BlockUserMenu } from '@/components/BlockUserMenu';
import { AppCard } from '@/components/ui/app-card';
import { AvatarCircle } from '@/components/ui/avatar-circle';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Loader2, Package, User } from 'lucide-react';

const FriendDetail = () => {
  const { friendId } = useParams<{ friendId: string }>();
  const navigate = useNavigate();
  const [selectedStickers, setSelectedStickers] = useState<Set<string>>(new Set());
  const { createRequest, isCreating } = useTradeRequests();
  const { profile: myProfile } = useUserProfile();
  const { t } = useLanguage();

  const { data: friendProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['friend-profile', friendId],
    queryFn: async () => { if (!friendId) return null; const { data } = await supabase.from('users').select('username, last_active_at').eq('id', friendId).single(); return data; },
    enabled: !!friendId,
  });

  const { helpfulStickers, isLoading: stickersLoading, count } = useFriendHelpfulStickers(friendId);
  const isLoading = profileLoading || stickersLoading;

  const toggleSticker = (stickerId: string) => { setSelectedStickers(prev => { const next = new Set(prev); if (next.has(stickerId)) next.delete(stickerId); else next.add(stickerId); return next; }); };

  const handleRequestClick = async () => {
    if (!friendId || selectedStickers.size === 0) return;
    const validStickers = Array.from(selectedStickers).filter(id => helpfulStickers.some(s => s.id === id));
    if (validStickers.length === 0) { toast({ title: t('friendDetail.noValid'), description: t('friendDetail.noValidDesc'), variant: 'destructive' }); setSelectedStickers(new Set()); return; }
    try { await createRequest({ toUserId: friendId, stickerIds: validStickers, fromUsername: myProfile?.username ?? undefined }); toast({ title: t('trading.requestSent'), description: t('trading.tradeRequestSent') }); setSelectedStickers(new Set()); }
    catch { toast({ title: t('common.error'), description: t('friendDetail.failSend'), variant: 'destructive' }); }
  };

  const selectedCount = selectedStickers.size;

  return (
    <div className="relative mx-auto max-w-lg space-y-4 px-4 safe-page">
      <div className="page-vignette" />
      <PageHeader
        title={profileLoading ? t('common.unknown') : `@${friendProfile?.username ?? t('common.unknown')}`}
        showBackButton
        onBack={() => navigate(-1)}
        action={friendId ? <BlockUserMenu userId={friendId} username={friendProfile?.username ?? null} /> : undefined}
        className="relative z-20 px-0 pb-0 pt-0"
      />

      <AppCard variant="hero" className="relative z-20 p-5">
        <div className="flex items-center gap-4">
          <AvatarCircle initials={friendProfile?.username?.slice(0, 2).toUpperCase()} icon={<User />} size="lg" />
          <div className="min-w-0 flex-1">
            {profileLoading ? (
              <Skeleton className="h-5 w-36 bg-[var(--surface-skeleton)]" />
            ) : (
              <h2 className="truncate text-lg font-bold text-[var(--text-primary)]">@{friendProfile?.username ?? t('common.unknown')}</h2>
            )}
            {friendProfile?.last_active_at && <p className="mt-1 text-xs text-[var(--text-muted)]">{t('match.active', { time: formatTimeAgoEs(friendProfile.last_active_at) })}</p>}
            {isLoading ? (
              <Skeleton className="mt-3 h-4 w-44 bg-[var(--surface-skeleton)]" />
            ) : (
              <p className="mt-3 text-sm text-[var(--text-secondary)]">{t('friendDetail.hasStickers', { count, s: count !== 1 ? 's' : '' })}</p>
            )}
          </div>
        </div>
      </AppCard>

      <section className="relative z-20 pb-40">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="aspect-[3/4] rounded-[14px] bg-[var(--surface-skeleton)]" />)}
          </div>
        ) : count === 0 ? (
          <EmptyState
            icon={<Package />}
            title={t('friendDetail.noMatch')}
            description={t('friendDetail.askFriend', { username: friendProfile?.username ?? t('common.unknown') })}
          />
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {helpfulStickers.map((sticker) => {
              const isSelected = selectedStickers.has(sticker.id);
              return (
                <button key={sticker.id} onClick={() => toggleSticker(sticker.id)}
                  className={[
                    'tap-target pressable relative flex aspect-[3/4] flex-col items-center justify-center rounded-[14px] border p-2 text-center shadow-control outline-none transition-[background-color,border-color,box-shadow,transform,opacity]',
                    '[transition-duration:var(--motion-duration-base)] [transition-timing-function:var(--motion-ease-standard)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0',
                    isSelected ? 'border-[var(--sticker-selected)] bg-[var(--surface-card-hover)]' : 'border-[var(--surface-card-border)] bg-[var(--surface-card)]',
                  ].join(' ')}>
                  <div className="absolute right-2 top-2">
                    <Checkbox checked={isSelected} onCheckedChange={() => toggleSticker(sticker.id)} onClick={(e) => e.stopPropagation()} />
                  </div>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{sticker.code}</span>
                  {sticker.team_name && <span className="mt-1 w-full truncate px-1 text-[10px] text-[var(--text-muted)]">{sticker.team_name}</span>}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {count > 0 && (
        <div className="fixed left-0 right-0 bottom-app-nav z-20 border-t border-[var(--surface-divider)] px-4 py-3 header-themed">
          <div className="mx-auto max-w-lg">
            <Button className="w-full" disabled={selectedCount === 0 || isCreating} onClick={handleRequestClick}>
              {isCreating ? (<><Loader2 className="h-4 w-4 animate-spin" />{t('friendDetail.sending')}</>) : selectedCount === 0 ? t('friendDetail.selectStickers') : t('friendDetail.request', { count: selectedCount })}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendDetail;
