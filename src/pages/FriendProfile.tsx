import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { formatTimeAgoEs } from '@/lib/dateUtils';
import { supabase } from '@/integrations/supabase/client';
import { useFriendStickers } from '@/hooks/useFriendStickers';
import { useAlbumConfig } from '@/hooks/useAlbumStats';
import { useLanguage } from '@/contexts/LanguageContext';
import { BlockUserMenu } from '@/components/BlockUserMenu';
import { AppCard } from '@/components/ui/app-card';
import { AvatarCircle } from '@/components/ui/avatar-circle';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { StatTile } from '@/components/ui/stat-tile';
import { Check, Copy, Search, User } from 'lucide-react';

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
    <div className="relative mx-auto max-w-lg space-y-4 px-4 safe-page">
      <div className="page-vignette" />
      <PageHeader
        title={profileLoading ? t('common.unknown') : `@${friendProfile?.username ?? t('common.unknown')}`}
        showBackButton
        onBack={() => navigate(-1)}
        action={friendId ? <BlockUserMenu userId={friendId} username={friendProfile?.username ?? null} /> : undefined}
        className="relative z-20 px-0 pb-0 pt-0"
      />

      {isLoading ? (
        <div className="relative z-20 space-y-4">
          <AppCard variant="hero" className="space-y-4 p-5">
            <div className="flex items-center gap-4">
              <Skeleton className="size-14 rounded-full bg-[var(--surface-skeleton)]" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-5 w-36 bg-[var(--surface-skeleton)]" />
                <Skeleton className="h-4 w-44 bg-[var(--surface-skeleton)]" />
              </div>
            </div>
            <Skeleton className="h-12 w-28 bg-[var(--surface-skeleton)]" />
            <Skeleton className="h-3 w-full bg-[var(--surface-skeleton)]" />
          </AppCard>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-[var(--radius-xl)] bg-[var(--surface-skeleton)]" />)}
          </div>
        </div>
      ) : (
        <>
          <AppCard variant="hero" className="relative z-20 space-y-5 p-5">
            <div className="flex items-center gap-4">
              <AvatarCircle initials={friendProfile?.username?.slice(0, 2).toUpperCase()} icon={<User />} size="lg" />
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-lg font-bold text-[var(--text-primary)]">@{friendProfile?.username ?? t('common.unknown')}</h2>
                {friendProfile?.last_active_at && <p className="mt-1 text-xs text-[var(--text-muted)]">{t('match.active', { time: formatTimeAgoEs(friendProfile.last_active_at) })}</p>}
              </div>
            </div>

            <div className="space-y-3 text-center">
              <p className="text-5xl font-bold text-[var(--text-primary)]">
                {progressPercent.toFixed(1)}%
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                {t('stats.ofStickers', { owned: ownedCount, total: totalStickers ?? 0 })}
              </p>
              <Progress value={progressPercent} className="h-2.5" />
            </div>
          </AppCard>

          <div className="relative z-20 grid grid-cols-3 gap-3">
            <StatTile value={haveCount} label={t('friendProfile.has')} icon={<Check />} tone="success" className="p-3" />
            <StatTile value={duplicateCount} label={t('friendProfile.duplicates')} icon={<Copy />} tone="info" className="p-3" />
            <StatTile value={missingCount} label={t('friendProfile.isMissing')} icon={<Search />} tone="warning" className="p-3" />
          </div>
        </>
      )}
    </div>
  );
};

export default FriendProfile;
