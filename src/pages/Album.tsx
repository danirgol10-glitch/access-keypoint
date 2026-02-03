import { useState, useMemo } from 'react';
import { useStickers, useTeamsAndSections } from '@/hooks/useStickers';
import {
  useUserStickers,
  useSetStickerStatus,
  useClearStickerStatus,
  type StickerStatus,
} from '@/hooks/useUserStickers';
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
import { StickerStatusDrawer } from '@/components/StickerStatusDrawer';

type StatusFilter = 'all' | 'unmarked' | 'HAVE' | 'NEED' | 'DUPLICATE';

const Album = () => {
  const { data: stickers, isLoading, error } = useStickers();
  const { teams, sections } = useTeamsAndSections(stickers);
  const { data: userStickers = {} } = useUserStickers();
  const setStickerStatus = useSetStickerStatus();
  const clearStickerStatus = useClearStickerStatus();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState<{
    id: string;
    code: string;
  } | null>(null);

  const filteredStickers = useMemo(() => {
    if (!stickers) return [];

    return stickers.filter((sticker) => {
      const matchesSearch = sticker.code
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesTeam =
        selectedTeam === 'all' || sticker.team === selectedTeam;
      const matchesSection =
        selectedSection === 'all' || sticker.section === selectedSection;

      // Status filter
      const userStatus = userStickers[sticker.id]?.status ?? null;
      let matchesStatus = true;
      if (selectedStatus === 'unmarked') {
        matchesStatus = userStatus === null;
      } else if (selectedStatus !== 'all') {
        matchesStatus = userStatus === selectedStatus;
      }

      return matchesSearch && matchesTeam && matchesSection && matchesStatus;
    });
  }, [stickers, searchQuery, selectedTeam, selectedSection, selectedStatus, userStickers]);

  const handleStickerClick = (sticker: { id: string; code: string }) => {
    setSelectedSticker(sticker);
    setDrawerOpen(true);
  };

  const handleSelectStatus = (status: StickerStatus) => {
    if (selectedSticker) {
      setStickerStatus.mutate(
        { stickerId: selectedSticker.id, status },
        { onSuccess: () => setDrawerOpen(false) }
      );
    }
  };

  const handleClearStatus = () => {
    if (selectedSticker) {
      clearStickerStatus.mutate(selectedSticker.id, {
        onSuccess: () => setDrawerOpen(false),
      });
    }
  };

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

  const currentStickerStatus = selectedSticker
    ? userStickers[selectedSticker.id]?.status ?? null
    : null;

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] p-4 space-y-4">
      {/* Search and Filters */}
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
              <SelectItem value="unmarked">Unmarked</SelectItem>
              <SelectItem value="HAVE">Have</SelectItem>
              <SelectItem value="NEED">Need</SelectItem>
              <SelectItem value="DUPLICATE">Duplicate</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sticker Grid */}
      {filteredStickers.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">No stickers found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {filteredStickers.map((sticker) => (
            <StickerCard
              key={sticker.id}
              code={sticker.code}
              team={sticker.team}
              status={userStickers[sticker.id]?.status ?? null}
              onClick={() => handleStickerClick({ id: sticker.id, code: sticker.code })}
            />
          ))}
        </div>
      )}

      {/* Status Drawer */}
      <StickerStatusDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        stickerCode={selectedSticker?.code ?? ''}
        currentStatus={currentStickerStatus}
        onSelectStatus={handleSelectStatus}
        onClear={handleClearStatus}
        isLoading={setStickerStatus.isPending || clearStickerStatus.isPending}
      />
    </div>
  );
};

export default Album;
