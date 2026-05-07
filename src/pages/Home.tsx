import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAlbumStats } from '@/hooks/useAlbumStats';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProgressRing } from '@/components/ProgressRing';
import { CompletionCelebration } from '@/components/CompletionCelebration';
import { AppCard } from '@/components/ui/app-card';
import { AvatarCircle } from '@/components/ui/avatar-circle';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { StatTile } from '@/components/ui/stat-tile';
import { Check, Copy, Search, User } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { profile, isLoading: profileLoading } = useUserProfile();
  const { stats, isLoading: statsLoading } = useAlbumStats();
  const { t } = useLanguage();
  const [celebrating, setCelebrating] = useState(false);

  const handleCompletion = useCallback(() => {
    const key = `album_completed_${profile?.username || 'user'}`;
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, 'true');
    setCelebrating(true);
  }, [profile?.username]);

  const handleCelebrationFinished = useCallback(() => setCelebrating(false), []);
  const profileInitials = profile?.username?.slice(0, 2).toUpperCase();

  return (
    <div className="relative mx-auto max-w-lg space-y-4 px-4 safe-page">
      <div className="page-vignette" />

      <PageHeader
        title={t('home.progress')}
        className="relative z-20 px-0 pb-1 pt-0"
        action={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Abrir perfil"
            onClick={() => navigate('/profile')}
            className="rounded-full p-0 hover:bg-transparent"
          >
            <AvatarCircle initials={profileInitials} icon={<User className="h-5 w-5" />} size="md" />
          </Button>
        }
      />

      <div className="relative z-20 w-full">
        {statsLoading ? (
          <AppCard variant="hero" className="p-8">
            <div className="flex flex-col items-center">
              <Skeleton className="h-48 w-48 rounded-full bg-[var(--surface-skeleton)]" />
            </div>
          </AppCard>
        ) : stats ? (
          <AppCard variant="hero" className="p-0">
            <div className="hero-vignette" />
            <div className="hero-noise" />
            <div className="relative z-10 px-6 pb-6 pt-7">
              {profileLoading ? (
                <Skeleton className="mx-auto mb-3 h-4 w-24 bg-[var(--surface-skeleton)]" />
              ) : profile?.username ? (
                <p className="mb-4 text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--text-secondary)]">@{profile.username}</p>
              ) : null}
              <ProgressRing percent={stats.completionPercent} ownedCount={stats.ownedCount} totalStickers={stats.totalStickers} onComplete={handleCompletion} />
              <CompletionCelebration trigger={celebrating} onFinished={handleCelebrationFinished} />
            </div>
          </AppCard>
        ) : (
          <EmptyState
            icon={<Search />}
            title="No pudimos cargar tu progreso"
            description="Abre tu álbum para revisar tu colección e intentar de nuevo."
            cta={
              <Button type="button" onClick={() => navigate('/album')}>
                {t('nav.album')}
              </Button>
            }
          />
        )}
      </div>

      <div className="relative z-20 w-full">
        {statsLoading ? (
          <AppCard className="p-4">
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex min-h-[104px] flex-col items-center justify-center rounded-[var(--radius-lg)] border border-[var(--surface-border)] bg-[var(--surface-input)] p-3">
                  <Skeleton className="mb-2 h-7 w-12 bg-[var(--surface-skeleton)]" />
                  <Skeleton className="h-4 w-16 bg-[var(--surface-skeleton)]" />
                </div>
              ))}
            </div>
          </AppCard>
        ) : stats ? (
          <div className="grid grid-cols-3 gap-2">
            <StatTile
              value={stats.ownedCount}
              label={t('home.owned')}
              icon={<Check />}
              tone="success"
              className="min-h-[104px] p-3"
            />
            <StatTile
              value={stats.missingCount}
              label={t('home.missing')}
              icon={<Search />}
              tone="warning"
              className="min-h-[104px] p-3"
            />
            <StatTile
              value={stats.duplicateCount}
              label={t('home.dupes')}
              icon={<Copy />}
              tone="info"
              className="min-h-[104px] p-3"
            />
          </div>
        ) : null}
      </div>

      {stats && (
        <div className="relative z-20 grid grid-cols-2 gap-3">
          <Button type="button" onClick={() => navigate('/album')}>
            {t('nav.album')}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/trading')}>
            {t('nav.trading')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Home;
