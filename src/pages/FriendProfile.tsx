import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useFriendStickers } from '@/hooks/useFriendStickers';
import { useAlbumConfig } from '@/hooks/useAlbumStats';
import { BlockUserMenu } from '@/components/BlockUserMenu';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Search, Package } from 'lucide-react';

type FilterType = 'all' | 'have' | 'duplicate';

const FriendProfile = () => {
  const { friendId } = useParams<{ friendId: string }>();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch friend's username
  const { data: friendProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['friend-profile', friendId],
    queryFn: async () => {
      if (!friendId) return null;

      const { data, error } = await supabase
        .from('users')
        .select('username, last_active_at')
        .eq('id', friendId)
        .single();

      if (error) {
        console.error('Error fetching friend profile:', error);
        return null;
      }

      return data;
    },
    enabled: !!friendId,
  });

  const { stickers, ownedCount, duplicateCount, haveCount, isLoading: stickersLoading } = useFriendStickers(friendId);
  const { data: totalStickers } = useAlbumConfig();

  const isLoading = profileLoading || stickersLoading;

  const missingCount = (totalStickers ?? 0) - ownedCount;
  const progressPercent = totalStickers ? (ownedCount / totalStickers) * 100 : 0;

  // Filter and search stickers
  const filteredStickers = useMemo(() => {
    let result = stickers;

    // Apply status filter
    if (filter === 'have') {
      result = result.filter((s) => s.status === 'HAVE');
    } else if (filter === 'duplicate') {
      result = result.filter((s) => s.status === 'DUPLICATE');
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.code.toLowerCase().includes(query) ||
          s.name?.toLowerCase().includes(query) ||
          s.team?.toLowerCase().includes(query) ||
          s.section?.toLowerCase().includes(query)
      );
    }

    // Sort by code
    result.sort((a, b) => a.code.localeCompare(b.code));

    return result;
  }, [stickers, filter, searchQuery]);

  const isDev = import.meta.env.DEV;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            {profileLoading ? (
              <Skeleton className="h-6 w-32" />
            ) : (
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  @{friendProfile?.username ?? 'Unknown'}
                </h1>
                {friendProfile?.last_active_at && (
                  <p className="text-xs text-muted-foreground">
                    Active {formatDistanceToNow(new Date(friendProfile.last_active_at), { addSuffix: true })}
                  </p>
                )}
              </div>
            )}
          </div>
          {friendId && (
            <BlockUserMenu userId={friendId} username={friendProfile?.username ?? null} />
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 pb-24">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Progress summary */}
          <Card>
            <CardContent className="py-4">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-24 mx-auto" />
                  <Skeleton className="h-4 w-48 mx-auto" />
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <p className="text-3xl font-bold text-foreground">
                    {progressPercent.toFixed(1)}%
                  </p>
                  <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                    <span>Owned {ownedCount}</span>
                    <span>•</span>
                    <span>Duplicates {duplicateCount}</span>
                    <span>•</span>
                    <span>Missing {missingCount}</span>
                  </div>
                  {isDev && (
                    <p className="text-xs text-muted-foreground/50 font-mono">
                      debug: friend_user_id={friendId} owned={ownedCount} dup={duplicateCount}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by code, name, team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter tabs */}
          <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="all">All ({stickers.length})</TabsTrigger>
              <TabsTrigger value="have">Have ({haveCount})</TabsTrigger>
              <TabsTrigger value="duplicate">Duplicate ({duplicateCount})</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Sticker list */}
          {isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
              ))}
            </div>
          ) : filteredStickers.length === 0 ? (
            <Card className="w-full">
              <CardContent className="flex flex-col items-center py-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  {searchQuery.trim()
                    ? 'No stickers match your search.'
                    : filter !== 'all'
                    ? `No ${filter} stickers.`
                    : 'This friend has not marked any stickers yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {filteredStickers.map((sticker) => (
                <div
                  key={sticker.id}
                  className="relative aspect-[3/4] rounded-lg border border-border bg-card p-2 flex flex-col items-center justify-center text-center"
                >
                  {/* Status badge */}
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant={sticker.status === 'DUPLICATE' ? 'default' : 'secondary'}
                      className="text-[10px] px-1.5 py-0"
                    >
                      {sticker.status === 'DUPLICATE' ? 'Dup' : 'Have'}
                    </Badge>
                  </div>

                  <span className="font-semibold text-foreground text-sm">
                    {sticker.code}
                  </span>
                  {sticker.team && (
                    <span className="text-xs text-muted-foreground mt-1 truncate w-full px-1">
                      {sticker.team}
                    </span>
                  )}
                  {sticker.section && !sticker.team && (
                    <span className="text-xs text-muted-foreground mt-1 truncate w-full px-1">
                      {sticker.section}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FriendProfile;
