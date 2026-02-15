import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useAcceptedFriends } from './useFriendships';
import { useUserStickers } from './useUserStickers';
import { useStickers } from './useStickers';

export interface FriendMatch {
  friendId: string;
  username: string | null;
  matchCount: number;
}

export function useFriendMatches() {
  const { user } = useAuth();
  const { friends, isLoading: friendsLoading } = useAcceptedFriends();
  const { data: myStickers, isLoading: myStickersLoading } = useUserStickers();
  const { data: allStickers, isLoading: allStickersLoading } = useStickers();

  const friendIds = friends.map(f => f.friendId);

  // Fetch all friends' DUPLICATE stickers in one query
  const { data: friendDuplicates, isLoading: duplicatesLoading } = useQuery({
    queryKey: ['friend-duplicates', friendIds],
    queryFn: async () => {
      if (friendIds.length === 0) return {};

      const { data, error } = await supabase
        .from('user_stickers')
        .select('user_id, sticker_id')
        .in('user_id', friendIds)
        .eq('status', 'DUPLICATE');

      if (error) {
        console.error('Error fetching friend duplicates:', error);
        throw error;
      }

      // Group by user_id for efficient lookup
      const grouped: Record<string, Set<string>> = {};
      for (const row of data ?? []) {
        if (!grouped[row.user_id]) {
          grouped[row.user_id] = new Set();
        }
        grouped[row.user_id].add(row.sticker_id);
      }
      return grouped;
    },
    enabled: !!user && friendIds.length > 0,
  });

  // Compute match counts
  const friendMatches: FriendMatch[] = [];
  
  if (!friendsLoading && !myStickersLoading && !duplicatesLoading && !allStickersLoading && allStickers && myStickers) {
    // My NEED stickers = all stickers that I don't have in my user_stickers
    const myOwnedStickerIds = new Set(Object.keys(myStickers));
    const myNeedStickerIds = new Set(
      allStickers.filter(s => !myOwnedStickerIds.has(s.id)).map(s => s.id)
    );

    for (const friend of friends) {
      const friendDupSet = friendDuplicates?.[friend.friendId] ?? new Set();
      
      // Count intersection: friend's DUPLICATE ∩ my NEED
      let matchCount = 0;
      for (const stickerId of friendDupSet) {
        if (myNeedStickerIds.has(stickerId)) {
          matchCount++;
        }
      }

      friendMatches.push({
        friendId: friend.friendId,
        username: friend.username ?? null,
        matchCount,
      });
    }

    // Sort by matchCount descending
    friendMatches.sort((a, b) => b.matchCount - a.matchCount);
  }

  const isLoading = friendsLoading || myStickersLoading || duplicatesLoading || allStickersLoading;

  // Check if any friend has duplicates at all
  const anyFriendHasDuplicates = Object.values(friendDuplicates ?? {}).some(set => set.size > 0);
  const friendsWithMatches = friendMatches.filter(m => m.matchCount > 0);

  return {
    friendMatches,
    friendsWithMatches,
    isLoading,
    hasFriends: friends.length > 0,
    anyFriendHasDuplicates,
  };
}
