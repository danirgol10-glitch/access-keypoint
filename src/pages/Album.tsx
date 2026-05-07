import { useState, useMemo, useCallback } from 'react';
import { useStickers, useGroupsAndTeams } from '@/hooks/useStickers';
import { useUserStickers, useCycleStickerStatus, getComputedStatus, type ComputedStatus } from '@/hooks/useUserStickers';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Check, Copy, Search } from 'lucide-react';
import { StickerCard } from '@/components/StickerCard';
import { QuickDuplicateOnboarding } from '@/components/QuickDuplicateOnboarding';
import { AppCard } from '@/components/ui/app-card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { StatTile } from '@/components/ui/stat-tile';

type StatusFilter = 'all' | 'HAVE' | 'NEED' | 'DUPLICATE';
type ScopeFilter = 'all' | 'FWC' | 'TEAM';

const Album = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: stickers, isLoading, error } = useStickers();
  const { groups, teamsByGroup } = useGroupsAndTeams(stickers);
  const { data: userStickers = {} } = useUserStickers();
  const cycleStickerStatus = useCycleStickerStatus();
  const { profile } = useUserProfile();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScope, setSelectedScope] = useState<ScopeFilter>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');
  const [quickMode, setQuickMode] = useState(false);

  const duplicateCount = useMemo(() => Object.values(userStickers).filter((s) => s.status === 'DUPLICATE').length, [userStickers]);
  const showOnboarding = profile?.first_login_flag === true && duplicateCount === 0 && !quickMode;

  const dismissFlag = useCallback(async () => {
    if (!user) return;
    await supabase.from('users').update({ first_login_flag: false }).eq('id', user.id);
    queryClient.invalidateQueries({ queryKey: ['user-profile', user.id] });
  }, [user, queryClient]);

  const handleStartQuickMode = () => setQuickMode(true);
  const handleSkip = () => dismissFlag();
  const handleDoneQuickMode = () => { setQuickMode(false); dismissFlag(); };

  const handleQuickTap = (stickerId: string) => {
    const status = getComputedStatus(userStickers, stickerId);
    if (status === 'NEED') { cycleStickerStatus.mutate({ stickerId, currentStatus: 'NEED' }); }
    else if (status === 'HAVE') { cycleStickerStatus.mutate({ stickerId, currentStatus: 'HAVE' }); }
    else { supabase.from('user_stickers').update({ status: 'HAVE', updated_at: new Date().toISOString() }).eq('user_id', user!.id).eq('sticker_id', stickerId).then(() => { queryClient.invalidateQueries({ queryKey: ['user-stickers', user!.id] }); }); }
  };

  const handleStickerClick = (stickerId: string, currentStatus: ComputedStatus) => {
    if (quickMode) handleQuickTap(stickerId);
    else cycleStickerStatus.mutate({ stickerId, currentStatus });
  };

  const teamsForGroup = useMemo(() => { if (selectedGroup === 'all') return []; return teamsByGroup(selectedGroup); }, [selectedGroup, teamsByGroup]);
  const handleGroupChange = (value: string) => { setSelectedGroup(value); setSelectedTeam('all'); };
  const handleScopeChange = (value: string) => { setSelectedScope(value as ScopeFilter); setSelectedGroup('all'); setSelectedTeam('all'); };
  const hasActiveFilters = Boolean(searchQuery) || selectedScope !== 'all' || selectedGroup !== 'all' || selectedTeam !== 'all' || selectedStatus !== 'all';
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedScope('all');
    setSelectedGroup('all');
    setSelectedTeam('all');
    setSelectedStatus('all');
  };

  const filteredStickers = useMemo(() => {
    if (!stickers) return [];
    if (quickMode) return stickers;
    return stickers.filter((sticker) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || sticker.code.toLowerCase().includes(q) || (sticker.team_name && sticker.team_name.toLowerCase().includes(q));
      const matchesScope = selectedScope === 'all' || sticker.scope === selectedScope;
      const matchesGroup = selectedGroup === 'all' || sticker.group_letter === selectedGroup;
      const matchesTeam = selectedTeam === 'all' || sticker.team_code === selectedTeam;
      const computedStatus = getComputedStatus(userStickers, sticker.id);
      const matchesStatus = selectedStatus === 'all' || computedStatus === selectedStatus;
      return matchesSearch && matchesScope && matchesGroup && matchesTeam && matchesStatus;
    });
  }, [stickers, searchQuery, selectedScope, selectedGroup, selectedTeam, selectedStatus, userStickers, quickMode]);

  const quickDuplicateCount = useMemo(() => Object.values(userStickers).filter((s) => s.status === 'DUPLICATE').length, [userStickers]);
  const albumSummary = useMemo(() => {
    const total = stickers?.length ?? 0;
    const owned = stickers?.reduce((count, sticker) => {
      const computedStatus = getComputedStatus(userStickers, sticker.id);
      return computedStatus === 'HAVE' || computedStatus === 'DUPLICATE' ? count + 1 : count;
    }, 0) ?? 0;

    return {
      total,
      owned,
      missing: Math.max(total - owned, 0),
      duplicates: duplicateCount,
    };
  }, [stickers, userStickers, duplicateCount]);

  if (isLoading) return (
    <div className="relative mx-auto max-w-lg px-4 safe-page page-bg">
      <div className="page-vignette" />
      <PageHeader title={t('nav.album')} className="relative z-20 px-0 pb-1 pt-0" />
      <AppCard variant="hero" className="relative z-20 space-y-4 p-5">
        <div>
          <Skeleton className="mb-3 h-4 w-28 bg-[var(--surface-skeleton)]" />
          <Skeleton className="h-9 w-20 bg-[var(--surface-skeleton)]" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-[var(--radius-lg)] bg-[var(--surface-skeleton)]" />
          ))}
        </div>
        <p className="text-sm font-medium text-[var(--text-secondary)]">{t('album.loading')}</p>
        <p className="text-xs leading-5 text-[var(--text-hint)]">{t('album.loadingDetail')}</p>
      </AppCard>
      <div className="relative z-20 mt-4 grid grid-cols-3 gap-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] rounded-[14px] bg-[var(--surface-skeleton)]" />
        ))}
      </div>
    </div>
  );
  if (error) return (
    <div className="relative mx-auto max-w-lg px-4 safe-page page-bg">
      <div className="page-vignette" />
      <PageHeader title={t('nav.album')} className="relative z-20 px-0 pb-1 pt-0" />
      <EmptyState
        className="relative z-20 mt-8"
        icon={<AlertCircle />}
        title={t('album.failed')}
        description={t('album.failedDetail')}
        cta={
          <Button type="button" onClick={() => window.location.reload()} className="w-full">
            {t('album.retry')}
          </Button>
        }
      />
    </div>
  );

  return (
    <div className="relative mx-auto max-w-lg space-y-4 px-4 safe-page">
      <div className="page-vignette" />
      <QuickDuplicateOnboarding open={showOnboarding} onStart={handleStartQuickMode} onSkip={handleSkip} />

      {quickMode && (
        <div className="sticky top-[var(--safe-area-inset-top)] z-30 -mx-4 -mt-4 mb-1 flex items-center justify-between gap-3 rounded-b-2xl border-b border-[var(--surface-border)] bg-[var(--surface-glass-strong)] px-4 py-2.5 shadow-card backdrop-blur-xl">
          <span className="min-w-0 text-sm font-semibold text-[var(--text-primary)]">
            {t('album.duplicatesSelected', { count: quickDuplicateCount, s: quickDuplicateCount !== 1 ? 's' : '' })}
          </span>
          <Button type="button" className="shrink-0" onClick={handleDoneQuickMode}>{t('album.done')}</Button>
        </div>
      )}

      <PageHeader title={t('nav.album')} className="relative z-20 px-0 pb-0 pt-0" />

      <AppCard variant="hero" className="relative z-20 space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">Total</p>
            <p className="mt-2 text-4xl font-bold leading-none text-[var(--text-primary)]">{albumSummary.total}</p>
          </div>
          <div className="rounded-full border border-[var(--surface-border)] bg-[var(--surface-input)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
            {filteredStickers.length}/{albumSummary.total}
          </div>
        </div>
      </AppCard>

      <div className="relative z-20 grid grid-cols-3 gap-2">
        <StatTile value={albumSummary.owned} label={t('album.have')} icon={<Check />} tone="success" className="min-h-[104px] p-3" />
        <StatTile value={albumSummary.missing} label={t('album.need')} icon={<Search />} tone="warning" className="min-h-[104px] p-3" />
        <StatTile value={albumSummary.duplicates} label={t('album.duplicate')} icon={<Copy />} tone="info" className="min-h-[104px] p-3" />
      </div>

      {!quickMode && (
        <AppCard className="relative z-20 space-y-3 p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <Input
              placeholder={t('album.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Select value={selectedScope} onValueChange={handleScopeChange}>
              <SelectTrigger>
                <SelectValue placeholder={t('album.allScopes')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('album.allScopes')}</SelectItem>
                <SelectItem value="FWC">FWC</SelectItem>
                <SelectItem value="TEAM">{t('album.teams')}</SelectItem>
              </SelectContent>
            </Select>

            {selectedScope !== 'FWC' && groups.length > 0 && (
              <Select value={selectedGroup} onValueChange={handleGroupChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('album.allGroups')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('album.allGroups')}</SelectItem>
                  {groups.map((g) => <SelectItem key={g} value={g}>{t('album.group', { g })}</SelectItem>)}
                </SelectContent>
              </Select>
            )}

            {selectedGroup !== 'all' && teamsForGroup.length > 0 && (
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger>
                  <SelectValue placeholder={t('album.allTeams')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('album.allTeams')}</SelectItem>
                  {teamsForGroup.map((tm) => <SelectItem key={tm.code} value={tm.code}>{tm.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}

            <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as StatusFilter)}>
              <SelectTrigger>
                <SelectValue placeholder={t('album.allStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('album.allStatus')}</SelectItem>
                <SelectItem value="NEED">{t('album.need')}</SelectItem>
                <SelectItem value="HAVE">{t('album.have')}</SelectItem>
                <SelectItem value="DUPLICATE">{t('album.duplicate')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center justify-between gap-3 border-t border-[var(--surface-divider)] pt-3">
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                {filteredStickers.length}/{albumSummary.total}
              </span>
              <Button type="button" variant="ghost" onClick={clearFilters}>
                {t('album.clearFilters')}
              </Button>
            </div>
          )}
        </AppCard>
      )}

      {filteredStickers.length === 0 ? (
        <EmptyState
          className="relative z-20"
          icon={<Search />}
          title={t('album.noStickersFound')}
          description={t('album.noStickersHint')}
          cta={hasActiveFilters ? (
            <Button type="button" onClick={clearFilters} className="w-full">
              {t('album.clearFilters')}
            </Button>
          ) : undefined}
        />
      ) : (
        <div className="relative z-20 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {filteredStickers.map((sticker) => {
            const computedStatus = getComputedStatus(userStickers, sticker.id);
            return <StickerCard key={sticker.id} code={sticker.code} teamName={sticker.team_name} status={computedStatus} onClick={() => handleStickerClick(sticker.id, computedStatus)} />;
          })}
        </div>
      )}
    </div>
  );
};

export default Album;
