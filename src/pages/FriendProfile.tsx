import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { formatTimeAgoEs } from '@/lib/dateUtils';
import { supabase } from '@/integrations/supabase/client';
import { useFriendStickers } from '@/hooks/useFriendStickers';
import { useAlbumConfig } from '@/hooks/useAlbumStats';
import { useLanguage } from '@/contexts/LanguageContext';
import { BlockUserMenu } from '@/components/BlockUserMenu';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Check, Copy, Search } from 'lucide-react';

const FriendProfile = () => {
  const { friendId } = useParams<{ friendId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const { data: friendProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['friend-profile', friendId],
    queryFn: async () => {
      if (!friendId) return null;
      const { data } = await supabase.from('users').select('username, last_active_at').eq('id', friendId).single();
      return data;
    },
    enabled: !!friendId,
  });

  const { ownedCount, duplicateCount, haveCount, isLoading: stickersLoading } = useFriendStickers(friendId);
  const { data: totalStickers } = useAlbumConfig();
  const isLoading = profileLoading || stickersLoading;
  const missingCount = (totalStickers ?? 0) - ownedCount;
  const progressPercent = totalStickers ? (ownedCount / totalStickers) * 100 : 0;

  return (
    <div className="flex flex-col min-h-screen page-bg">
      <header className="sticky top-0 z-10 px-4 py-3 header-themed">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="rounded-full h-9 w-9 flex items-center justify-center" style={{ background: 'var(--surface-input)' }}>
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

      <main className="flex-1 px-4 pt-8 pb-24 max-w-md mx-auto w-full flex flex-col items-center justify-start gap-6">
        {isLoading ? (
          <div className="w-full premium-panel p-8 space-y-4">
            <Skeleton className="h-12 w-24 mx-auto" style={{ background: 'var(--surface-skeleton)' }} />
            <Skeleton className="h-3 w-full" style={{ background: 'var(--surface-skeleton)' }} />
            <Skeleton className="h-8 w-full" style={{ background: 'var(--surface-skeleton)' }} />
          </div>
        ) : (
          <div className="w-full premium-panel premium-panel-gold p-6 space-y-5">
            <div className="text-center">
              <p className="text-5xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {progressPercent.toFixed(1)}%
              </p>
              <p className="text-[13px] mt-1" style={{ color: 'var(--text-muted)' }}>
                {t('stats.ofStickers', { owned: ownedCount, total: totalStickers ?? 0 })}
              </p>
            </div>

            <Progress value={progressPercent} className="h-2.5" />

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center p-3 rounded-xl" style={{ background: 'var(--surface-card)' }}>
                <Check className="w-5 h-5 mb-1" style={{ color: 'var(--sticker-owned-color)' }} />
                <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{haveCount}</span>
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{t('friendProfile.owned')}</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-xl" style={{ background: 'var(--surface-card)' }}>
                <Copy className="w-5 h-5 mb-1" style={{ color: 'var(--sticker-duplicate-color)' }} />
                <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{duplicateCount}</span>
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{t('friendProfile.duplicates')}</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-xl" style={{ background: 'var(--surface-card)' }}>
                <Search className="w-5 h-5 mb-1" style={{ color: 'var(--icon-faint)' }} />
                <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{missingCount}</span>
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{t('friendProfile.missing')}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FriendProfile;
