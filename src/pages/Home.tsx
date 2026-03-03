import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAlbumStats } from '@/hooks/useAlbumStats';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProgressRing } from '@/components/ProgressRing';
import { CompletionCelebration } from '@/components/CompletionCelebration';
import { Skeleton } from '@/components/ui/skeleton';
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
    <div className="relative px-4 pt-14 pb-28 space-y-4 max-w-md mx-auto">
      <div className="page-vignette" />

      {/* Header Row */}
      <div className="relative z-20 w-full flex items-center justify-between">
        <button
          onClick={() => navigate('/profile')}
          className="rounded-full h-12 w-12 flex items-center justify-center transition-all duration-150 active:scale-95"
          style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)' }}
        >
          <User className="h-5 w-5" style={{ color: 'rgba(207,227,255,0.7)' }} />
        </button>

        <h1 className="text-sm font-bold tracking-[0.12em] uppercase" style={{ color: '#FFFFFF' }}>{t('home.progress')}</h1>

        <div className="h-12 w-12" />
      </div>

      {/* Hero Card with Pie Chart */}
      <div className="relative z-20 w-full">
        {statsLoading ? (
          <div className="premium-panel premium-panel-gold p-8">
            <div className="flex flex-col items-center">
              <Skeleton className="h-48 w-48 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>
          </div>
        ) : stats ? (
          <div className="hero-gradient rounded-[20px] border-0">
            <div className="hero-vignette" />
            <div className="hero-noise" />
            <div className="pt-7 pb-6 relative z-10 px-6">
              {profileLoading ? (
                <Skeleton className="h-4 w-24 mx-auto mb-3" style={{ background: 'rgba(255,255,255,0.1)' }} />
              ) : profile?.username ? (
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-center mb-4" style={{ color: 'rgba(255,255,255,0.55)' }}>@{profile.username}</p>
              ) : null}
              <ProgressRing
                percent={stats.completionPercent}
                ownedCount={stats.ownedCount}
                totalStickers={stats.totalStickers}
                onComplete={handleCompletion}
              />
              <CompletionCelebration trigger={celebrating} onFinished={handleCelebrationFinished} />
            </div>
          </div>
        ) : null}
      </div>

      {/* Stats Row */}
      <div className="relative z-20 w-full">
        {statsLoading ? (
          <div className="premium-panel p-5">
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center">
                  <Skeleton className="h-6 w-12 mb-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  <Skeleton className="h-4 w-16" style={{ background: 'rgba(255,255,255,0.06)' }} />
                </div>
              ))}
            </div>
          </div>
        ) : stats ? (
          <div className="premium-panel p-5">
            <div className="grid grid-cols-3 divide-x" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex flex-col items-center gap-1 px-2">
                <Check className="w-4 h-4" style={{ color: 'hsl(142, 72%, 46%)' }} />
                <span className="text-2xl font-black" style={{ color: 'hsl(142, 72%, 55%)' }}>{stats.ownedCount}</span>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.45)' }}>{t('home.owned')}</span>
              </div>
              <div className="flex flex-col items-center gap-1 px-2">
                <Search className="w-4 h-4" style={{ color: 'hsl(30, 90%, 55%)' }} />
                <span className="text-2xl font-black" style={{ color: '#FFFFFF' }}>{stats.missingCount}</span>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.45)' }}>{t('home.missing')}</span>
              </div>
              <div className="flex flex-col items-center gap-1 px-2">
                <Copy className="w-4 h-4" style={{ color: 'hsl(222, 100%, 56%)' }} />
                <span className="text-2xl font-black" style={{ color: 'hsl(222, 100%, 65%)' }}>{stats.duplicateCount}</span>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.45)' }}>{t('home.dupes')}</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Home;
