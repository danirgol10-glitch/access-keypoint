import { useState, useMemo, useCallback } from 'react';
import { useStickers, useGroupsAndTeams } from '@/hooks/useStickers';
import {
  useUserStickers,
  useCycleStickerStatus,
  getComputedStatus,
  type ComputedStatus,
} from '@/hooks/useUserStickers';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScope, setSelectedScope] = useState<ScopeFilter>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');

  // Quick Duplicate Mode state
  const [quickMode, setQuickMode] = useState(false);

  const duplicateCount = useMemo(
    () => Object.values(userStickers).filter((s) => s.status === 'DUPLICATE').length,
    [userStickers]
  );

  const showOnboarding = profile?.first_login_flag === true && duplicateCount === 0 && !quickMode;

  const dismissFlag = useCallback(async () => {
    if (!user) return;
    await supabase.from('users').update({ first_login_flag: false }).eq('id', user.id);
    queryClient.invalidateQueries({ queryKey: ['user-profile', user.id] });
  }, [user, queryClient]);

  const handleStartQuickMode = () => setQuickMode(true);
  const handleSkip = () => dismissFlag();
  const handleDoneQuickMode = () => {
    setQuickMode(false);
    dismissFlag();
  };

  const handleQuickTap = (stickerId: string) => {
    const status = getComputedStatus(userStickers, stickerId);
    if (status === 'NEED') {
      cycleStickerStatus.mutate({ stickerId, currentStatus: 'NEED' });
    } else if (status === 'HAVE') {
      cycleStickerStatus.mutate({ stickerId, currentStatus: 'HAVE' });
    } else {
      supabase
        .from('user_stickers')
        .update({ status: 'HAVE', updated_at: new Date().toISOString() })
        .eq('user_id', user!.id)
        .eq('sticker_id', stickerId)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['user-stickers', user!.id] });
        });
    }
  };

  const handleStickerClick = (stickerId: string, currentStatus: ComputedStatus) => {
    if (quickMode) {
      handleQuickTap(stickerId);
    } else {
      cycleStickerStatus.mutate({ stickerId, currentStatus });
    }
  };

  // Teams available for the selected group
  const teamsForGroup = useMemo(() => {
    if (selectedGroup === 'all') return [];
    return teamsByGroup(selectedGroup);
  }, [selectedGroup, teamsByGroup]);

  // Reset team when group changes
  const handleGroupChange = (value: string) => {
    setSelectedGroup(value);
    setSelectedTeam('all');
  };

  // Reset group/team when scope changes
  const handleScopeChange = (value: string) => {
    setSelectedScope(value as ScopeFilter);
    setSelectedGroup('all');
    setSelectedTeam('all');
  };

  const filteredStickers = useMemo(() => {
    if (!stickers) return [];
    if (quickMode) return stickers;

    return stickers.filter((sticker) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        sticker.code.toLowerCase().includes(q) ||
        (sticker.team_name && sticker.team_name.toLowerCase().includes(q));
      const matchesScope =
        selectedScope === 'all' || sticker.scope === selectedScope;
      const matchesGroup =
        selectedGroup === 'all' || sticker.group_letter === selectedGroup;
      const matchesTeam =
        selectedTeam === 'all' || sticker.team_code === selectedTeam;
      const computedStatus = getComputedStatus(userStickers, sticker.id);
      const matchesStatus = selectedStatus === 'all' || computedStatus === selectedStatus;

      return matchesSearch && matchesScope && matchesGroup && matchesTeam && matchesStatus;
    });
  }, [stickers, searchQuery, selectedScope, selectedGroup, selectedTeam, selectedStatus, userStickers, quickMode]);

  const quickDuplicateCount = useMemo(
    () => Object.values(userStickers).filter((s) => s.status === 'DUPLICATE').length,
    [userStickers]
  );

  // Debug stats (dev only)
  const debugStats = useMemo(() => {
    if (!stickers || import.meta.env.PROD) return null;
    const total = stickers.length;
    const fwcCount = stickers.filter(s => s.scope === 'FWC').length;
    const teamCount = stickers.filter(s => s.scope === 'TEAM').length;
    const byGroup: Record<string, number> = {};
    for (const s of stickers) {
      if (s.group_letter) {
        byGroup[s.group_letter] = (byGroup[s.group_letter] || 0) + 1;
      }
    }
    return { total, fwcCount, teamCount, byGroup };
  }, [stickers]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] p-6">
        <p className="text-muted-foreground animate-pulse">Loading album...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] p-6">
        <p className="text-destructive">Failed to load stickers.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] p-4 space-y-4">
      <QuickDuplicateOnboarding
        open={showOnboarding}
        onStart={handleStartQuickMode}
        onSkip={handleSkip}
      />

      {quickMode && (
        <div className="sticky top-0 z-10 flex items-center justify-between bg-background/95 backdrop-blur py-2 border-b border-border -mx-4 -mt-4 mb-0 px-4">
          <span className="text-sm font-medium text-foreground">
            {quickDuplicateCount} duplicate{quickDuplicateCount !== 1 ? 's' : ''} selected
          </span>
          <Button size="sm" onClick={handleDoneQuickMode}>
            Done
          </Button>
        </div>
      )}

      {!quickMode && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by code or team name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {/* Scope filter */}
            <Select value={selectedScope} onValueChange={handleScopeChange}>
              <SelectTrigger className="flex-1 min-w-[100px]">
                <SelectValue placeholder="Scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scopes</SelectItem>
                <SelectItem value="FWC">FWC</SelectItem>
                <SelectItem value="TEAM">Teams</SelectItem>
              </SelectContent>
            </Select>

            {/* Group filter (only when TEAM or all) */}
            {selectedScope !== 'FWC' && groups.length > 0 && (
              <Select value={selectedGroup} onValueChange={handleGroupChange}>
                <SelectTrigger className="flex-1 min-w-[100px]">
                  <SelectValue placeholder="Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  {groups.map((g) => (
                    <SelectItem key={g} value={g}>Group {g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Team filter (only when a group is selected) */}
            {selectedGroup !== 'all' && teamsForGroup.length > 0 && (
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="flex-1 min-w-[120px]">
                  <SelectValue placeholder="Team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {teamsForGroup.map((t) => (
                    <SelectItem key={t.code} value={t.code}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Status filter */}
            <Select
              value={selectedStatus}
              onValueChange={(v) => setSelectedStatus(v as StatusFilter)}
            >
              <SelectTrigger className="flex-1 min-w-[100px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="NEED">Need</SelectItem>
                <SelectItem value="HAVE">Have</SelectItem>
                <SelectItem value="DUPLICATE">Duplicate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Dev debug stats */}
      {debugStats && (
        <details className="text-xs text-muted-foreground border border-border rounded p-2">
          <summary className="cursor-pointer font-medium">Debug: Sticker Stats</summary>
          <div className="mt-1 space-y-1">
            <p>Total: {debugStats.total} (expected 980)</p>
            <p>FWC: {debugStats.fwcCount} (expected 68)</p>
            <p>TEAM: {debugStats.teamCount} (expected 912)</p>
            <p>By group: {Object.entries(debugStats.byGroup).sort(([a], [b]) => a.localeCompare(b)).map(([g, c]) => `${g}=${c}`).join(', ')}</p>
          </div>
        </details>
      )}

      {filteredStickers.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">No stickers found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {filteredStickers.map((sticker) => {
            const computedStatus = getComputedStatus(userStickers, sticker.id);
            return (
              <StickerCard
                key={sticker.id}
                code={sticker.code}
                teamName={sticker.team_name}
                status={computedStatus}
                onClick={() => handleStickerClick(sticker.id, computedStatus)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Album;
