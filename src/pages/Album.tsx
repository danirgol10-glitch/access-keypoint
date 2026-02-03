import { useState, useMemo } from 'react';
import { useStickers, useTeamsAndSections } from '@/hooks/useStickers';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

const Album = () => {
  const { data: stickers, isLoading, error } = useStickers();
  const { teams, sections } = useTeamsAndSections(stickers);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');

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

      return matchesSearch && matchesTeam && matchesSection;
    });
  }, [stickers, searchQuery, selectedTeam, selectedSection]);

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

        <div className="flex gap-2">
          {teams.length > 0 && (
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="flex-1">
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
              <SelectTrigger className="flex-1">
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
            <div
              key={sticker.id}
              className="aspect-[3/4] rounded-lg border border-border bg-card p-2 flex flex-col items-center justify-center text-center"
            >
              <span className="font-semibold text-foreground text-sm">
                {sticker.code}
              </span>
              {sticker.team && (
                <span className="text-xs text-muted-foreground mt-1 truncate w-full">
                  {sticker.team}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Album;
