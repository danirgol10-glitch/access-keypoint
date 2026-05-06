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
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Package, Loader2 } from 'lucide-react';

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
    <div className="flex min-h-full flex-col page-bg">
      <header className="sticky top-0 z-10 px-4 pb-3 safe-header header-themed">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="rounded-full h-11 w-11 flex items-center justify-center" style={{ background: 'var(--surface-input)' }}>
            <ArrowLeft className="h-5 w-5" style={{ color: 'var(--icon-default)' }} />
          </button>
          <div className="flex-1">
            {profileLoading ? <Skeleton className="h-6 w-32" style={{ background: 'var(--surface-skeleton)' }} /> : (
              <div>
                <h1 className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>@{friendProfile?.username ?? t('common.unknown')}</h1>
                {friendProfile?.last_active_at && <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{t('match.active', { time: formatTimeAgoEs(friendProfile.last_active_at) })}</p>}
              </div>
            )}
          </div>
          {friendId && <BlockUserMenu userId={friendId} username={friendProfile?.username ?? null} />}
        </div>
      </header>

      <main className="flex-1 px-4 pt-4 pb-40 max-w-md mx-auto w-full space-y-4">
        <div className="text-center py-2">
          {isLoading ? <Skeleton className="h-5 w-48 mx-auto" style={{ background: 'var(--surface-skeleton)' }} /> : (
            <p style={{ color: 'var(--text-secondary)' }}>{t('friendDetail.hasStickers', { count, s: count !== 1 ? 's' : '' })}</p>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">{[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="aspect-[3/4] rounded-[14px]" style={{ background: 'var(--surface-skeleton)' }} />)}</div>
        ) : count === 0 ? (
          <div className="premium-panel p-8 flex flex-col items-center text-center">
            <Package className="h-12 w-12 mb-3" style={{ color: 'var(--icon-faint)' }} />
            <p className="text-[14px] mb-2" style={{ color: 'var(--text-secondary)' }}>{t('friendDetail.noMatch')}</p>
            <p className="text-[12px]" style={{ color: 'var(--text-hint)' }}>{t('friendDetail.askFriend', { username: friendProfile?.username ?? t('common.unknown') })}</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {helpfulStickers.map((sticker) => {
              const isSelected = selectedStickers.has(sticker.id);
              return (
                <button key={sticker.id} onClick={() => toggleSticker(sticker.id)}
                  className="relative aspect-[3/4] rounded-[14px] p-2 flex flex-col items-center justify-center text-center transition-all duration-150 active:scale-[0.96]"
                  style={{ background: isSelected ? 'var(--surface-card-hover)' : 'var(--surface-card)', border: isSelected ? `1px solid var(--sticker-selected)` : '1px solid var(--surface-card-border)' }}>
                  <div className="absolute top-2 right-2">
                    <Checkbox checked={isSelected} onCheckedChange={() => toggleSticker(sticker.id)} onClick={(e) => e.stopPropagation()} />
                  </div>
                  <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{sticker.code}</span>
                  {sticker.team_name && <span className="text-[10px] mt-1 truncate w-full px-1" style={{ color: 'var(--text-muted)' }}>{sticker.team_name}</span>}
                </button>
              );
            })}
          </div>
        )}
      </main>

      {count > 0 && (
        <div className="fixed left-0 right-0 bottom-app-nav z-20 px-4 py-3 header-themed" style={{ borderTop: '1px solid var(--surface-divider)' }}>
          <div className="max-w-md mx-auto">
            <button className="w-full h-11 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-50 btn-themed"
              disabled={selectedCount === 0 || isCreating} onClick={handleRequestClick}>
              {isCreating ? (<><Loader2 className="h-4 w-4 animate-spin mr-2 inline" />{t('friendDetail.sending')}</>) : selectedCount === 0 ? t('friendDetail.selectStickers') : t('friendDetail.request', { count: selectedCount })}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendDetail;
