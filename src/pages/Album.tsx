import { useState, useMemo, useCallback } from 'react';
import { useStickers, useTeamsAndSections } from '@/hooks/useStickers';
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

const Album = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: stickers, isLoading, error } = useStickers();
  const { teams, sections } = useTeamsAndSections(stickers);
  const { data: userStickers = {} } = useUserStickers();
  const cycleStickerStatus = useCycleStickerStatus();
  const { profile } = useUserProfile();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
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

  const handleStartQuickMode = () => {
    setQuickMode(true);
  };

  const handleSkip = () => {
    dismissFlag();
  };

  const handleDoneQuickMode = () => {
    setQuickMode(false);
    dismissFlag();
  };

  // In quick mode: tap cycles Not owned → Owned → Duplicate → Owned (no delete)
  const handleQuickTap = (stickerId: string) => {
    const status = getComputedStatus(userStickers, stickerId);
    if (status === 'NEED') {
      // NEED → HAVE
      cycleStickerStatus.mutate({ stickerId, currentStatus: 'NEED' });
    } else if (status === 'HAVE') {
      // HAVE → DUPLICATE
      cycleStickerStatus.mutate({ stickerId, currentStatus: 'HAVE' });
    } else {
      // DUPLICATE → HAVE (back to owned, not delete)
      // We need to update directly since the normal cycle goes DUPLICATE → NEED
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

  const filteredStickers = useMemo(() => {
    if (!stickers) return [];

    // In quick mode, disable filters
    if (quickMode) return stickers;

    return stickers.filter((sticker) => {
      const matchesSearch = sticker.code
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesTeam =
        selectedTeam === 'all' || sticker.team === selectedTeam;
      const matchesSection =
        selectedSection === 'all' || sticker.section === selectedSection;
      const computedStatus = getComputedStatus(userStickers, sticker.id);
      const matchesStatus = selectedStatus === 'all' || computedStatus === selectedStatus;

      return matchesSearch && matchesTeam && matchesSection && matchesStatus;
    });
  }, [stickers, searchQuery, selectedTeam, selectedSection, selectedStatus, userStickers, quickMode]);

  const quickDuplicateCount = useMemo(
    () => Object.values(userStickers).filter((s) => s.status === 'DUPLICATE').length,
    [userStickers]
  );

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
      {/* Onboarding Modal */}
      <QuickDuplicateOnboarding
        open={showOnboarding}
        onStart={handleStartQuickMode}
        onSkip={handleSkip}
      />

      {/* Quick Mode Header */}
      {quickMode && (
        <div className="sticky top-0 z-10 flex items-center justify-between bg-background/95 backdrop-blur py-2 px-1 border-b border-border -mx-4 -mt-4 mb-0 px-4">
          <span className="text-sm font-medium text-foreground">
            {quickDuplicateCount} duplicate{quickDuplicateCount !== 1 ? 's' : ''} selected
          </span>
          <Button size="sm" onClick={handleDoneQuickMode}>
            Done
          </Button>
        </div>
      )}

      {/* Search and Filters (hidden in quick mode) */}
      {!quickMode && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {teams.length > 0 && (
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="flex-1 min-w-[120px]">
                  <SelectValue placeholder="Team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team} value={team!}>
                      {team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {sections.length > 0 && (
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger className="flex-1 min-w-[120px]">
                  <SelectValue placeholder="Section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {sections.map((section) => (
                    <SelectItem key={section} value={section!}>
                      {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select
              value={selectedStatus}
              onValueChange={(v) => setSelectedStatus(v as StatusFilter)}
            >
              <SelectTrigger className="flex-1 min-w-[120px]">
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

      {/* Sticker Grid */}
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
                team={sticker.team}
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
