import { useState, useMemo, useCallback } from 'react';
import { useStickers, useGroupsAndTeams } from '@/hooks/useStickers';
import { useUserStickers, useCycleStickerStatus, getComputedStatus, type ComputedStatus } from '@/hooks/useUserStickers';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { StickerCard } from '@/components/StickerCard';
import { QuickDuplicateOnboarding } from '@/components/QuickDuplicateOnboarding';
import { Button } from '@/components/ui/button';

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

  if (isLoading) return <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] p-6"><p className="animate-pulse" style={{ color: 'var(--text-secondary)' }}>{t('album.loading')}</p></div>;
  if (error) return <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] p-6"><p className="text-destructive">{t('album.failed')}</p></div>;

  return (
    <div className="relative px-4 pt-14 pb-28 space-y-4 max-w-md mx-auto">
      <div className="page-vignette" />
      <QuickDuplicateOnboarding open={showOnboarding} onStart={handleStartQuickMode} onSkip={handleSkip} />

      {quickMode && (
        <div className="sticky top-0 z-30 flex items-center justify-between py-2 px-4 -mx-4 -mt-4 mb-0 rounded-b-2xl header-themed">
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {t('album.duplicatesSelected', { count: quickDuplicateCount, s: quickDuplicateCount !== 1 ? 's' : '' })}
          </span>
          <Button size="sm" onClick={handleDoneQuickMode}>{t('album.done')}</Button>
        </div>
      )}

      <div className="relative z-20 text-center mb-2">
        <h1 className="text-[22px] font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>{t('nav.album')}</h1>
      </div>

      {!quickMode && (
        <div className="relative z-20 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-muted)' }} />
            <input placeholder={t('album.searchPlaceholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-[14px] rounded-2xl outline-none transition-all duration-200"
              style={{ background: 'var(--surface-input)', border: '1px solid var(--surface-input-border)', color: 'var(--text-primary)' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--input-focus-color)'; e.currentTarget.style.boxShadow = `0 0 12px var(--input-focus-glow)`; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--surface-input-border)'; e.currentTarget.style.boxShadow = 'none'; }} />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Select value={selectedScope} onValueChange={handleScopeChange}>
              <SelectTrigger className="flex-1 min-w-[100px] h-9 text-xs rounded-xl" style={{ background: 'var(--surface-input)', border: '1px solid var(--surface-input-border)', color: 'var(--text-primary)' }}>
                <SelectValue placeholder="Scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('album.allScopes')}</SelectItem>
                <SelectItem value="FWC">FWC</SelectItem>
                <SelectItem value="TEAM">{t('album.teams')}</SelectItem>
              </SelectContent>
            </Select>

            {selectedScope !== 'FWC' && groups.length > 0 && (
              <Select value={selectedGroup} onValueChange={handleGroupChange}>
                <SelectTrigger className="flex-1 min-w-[100px] h-9 text-xs rounded-xl" style={{ background: 'var(--surface-input)', border: '1px solid var(--surface-input-border)', color: 'var(--text-primary)' }}>
                  <SelectValue placeholder="Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('album.allGroups')}</SelectItem>
                  {groups.map((g) => <SelectItem key={g} value={g}>{t('album.group', { g })}</SelectItem>)}
                </SelectContent>
              </Select>
            )}

            {selectedGroup !== 'all' && teamsForGroup.length > 0 && (
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="flex-1 min-w-[120px] h-9 text-xs rounded-xl" style={{ background: 'var(--surface-input)', border: '1px solid var(--surface-input-border)', color: 'var(--text-primary)' }}>
                  <SelectValue placeholder="Team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('album.allTeams')}</SelectItem>
                  {teamsForGroup.map((tm) => <SelectItem key={tm.code} value={tm.code}>{tm.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}

            <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as StatusFilter)}>
              <SelectTrigger className="flex-1 min-w-[100px] h-9 text-xs rounded-xl" style={{ background: 'var(--surface-input)', border: '1px solid var(--surface-input-border)', color: 'var(--text-primary)' }}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('album.allStatus')}</SelectItem>
                <SelectItem value="NEED">{t('album.need')}</SelectItem>
                <SelectItem value="HAVE">{t('album.have')}</SelectItem>
                <SelectItem value="DUPLICATE">{t('album.duplicate')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {filteredStickers.length === 0 ? (
        <div className="relative z-20 flex-1 flex items-center justify-center py-12">
          <p style={{ color: 'var(--text-secondary)' }}>{t('album.noStickersFound')}</p>
        </div>
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
