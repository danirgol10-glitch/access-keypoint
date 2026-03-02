import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAlbumStats } from '@/hooks/useAlbumStats';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProgressRing } from '@/components/ProgressRing';
import { CompletionCelebration } from '@/components/CompletionCelebration';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

  const handleCelebrationFinished = useCallback(() => {
    setCelebrating(false);
  }, []);

  return (
    <div className="flex flex-col p-4 space-y-4 relative">
      {/* Header Row */}
      <div className="w-full flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-12 w-12 border border-white/20 bg-transparent hover:bg-white/[0.08] text-[#CFE3FF]"
          onClick={() => navigate('/profile')}
        >
          <User className="h-5 w-5 stroke-[2.2]" />
        </Button>

        <h1 className="text-sm font-bold tracking-[0.12em] uppercase text-white">{t('home.progress')}</h1>

        {/* Spacer to balance layout */}
        <div className="h-12 w-12" />
      </div>

      {/* Hero Card with Pie Chart */}
      <div className="w-full">
        {statsLoading ? (
          <Card className="w-full hero-gradient border-0">
            <CardContent className="py-8 relative z-10">
              <div className="flex flex-col items-center">
                <Skeleton className="h-48 w-48 rounded-full bg-white/10" />
              </div>
            </CardContent>
          </Card>
        ) : stats ? (
          <Card className="w-full hero-gradient border-0 rounded-2xl">
            <div className="hero-vignette" />
            <div className="hero-noise" />
            <CardContent className="pt-7 pb-6 relative z-10">
              {profileLoading ? (
                <Skeleton className="h-4 w-24 mx-auto mb-3 bg-white/20" />
              ) : profile?.username ? (
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/[0.55] text-center mb-4">@{profile.username}</p>
              ) : null}
              <ProgressRing
                percent={stats.completionPercent}
                ownedCount={stats.ownedCount}
                totalStickers={stats.totalStickers}
                onComplete={handleCompletion}
              />
              <CompletionCelebration trigger={celebrating} onFinished={handleCelebrationFinished} />
            </CardContent>
          </Card>
        ) : null}
      </div>

      {/* Stats Row Card */}
      <div className="w-full">
        {statsLoading ? (
          <Card className="w-full">
            <CardContent className="py-5">
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col items-center">
                    <Skeleton className="h-6 w-12 mb-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : stats ? (
          <Card className="w-full border-0 bg-secondary/80 rounded-2xl">
            <CardContent className="py-5">
              <div className="grid grid-cols-3 divide-x divide-border/40">
                <div className="flex flex-col items-center gap-1 px-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-2xl font-black text-emerald-400">{stats.ownedCount}</span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('home.owned')}</span>
                </div>
                <div className="flex flex-col items-center gap-1 px-2">
                  <Search className="w-4 h-4 text-orange-400" />
                  <span className="text-2xl font-black text-foreground">{stats.missingCount}</span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('home.missing')}</span>
                </div>
                <div className="flex flex-col items-center gap-1 px-2">
                  <Copy className="w-4 h-4 text-primary" />
                  <span className="text-2xl font-black text-primary">{stats.duplicateCount}</span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('home.dupes')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
};

export default Home;
