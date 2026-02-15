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
  duplicateTotal: number;
  lastActiveAt: string | null;
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
      if (error) { console.error('Error fetching friend duplicates:', error); throw error; }
      const grouped: Record<string, Set<string>> = {};
      for (const row of data ?? []) {
        if (!grouped[row.user_id]) grouped[row.user_id] = new Set();
        grouped[row.user_id].add(row.sticker_id);
      }
      return grouped;
    },
    enabled: !!user && friendIds.length > 0,
  });

  // Fetch last_active_at for friends
  const { data: friendProfiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['friend-profiles-active', friendIds],
    queryFn: async () => {
      if (friendIds.length === 0) return {};
      const { data, error } = await supabase
        .from('users')
        .select('id, last_active_at')
        .in('id', friendIds);
      if (error) { console.error('Error fetching friend profiles:', error); throw error; }
      const map: Record<string, string | null> = {};
      for (const row of data ?? []) {
        map[row.id] = row.last_active_at;
      }
      return map;
    },
    enabled: !!user && friendIds.length > 0,
  });

  const friendMatches: FriendMatch[] = [];

  if (!friendsLoading && !myStickersLoading && !duplicatesLoading && !allStickersLoading && !profilesLoading && allStickers && myStickers) {
    const myOwnedStickerIds = new Set(Object.keys(myStickers));
    const myNeedStickerIds = new Set(
      allStickers.filter(s => !myOwnedStickerIds.has(s.id)).map(s => s.id)
    );

    for (const friend of friends) {
      const friendDupSet = friendDuplicates?.[friend.friendId] ?? new Set();
      let matchCount = 0;
      for (const stickerId of friendDupSet) {
        if (myNeedStickerIds.has(stickerId)) matchCount++;
      }

      friendMatches.push({
        friendId: friend.friendId,
        username: friend.username ?? null,
        matchCount,
        duplicateTotal: friendDupSet.size,
        lastActiveAt: friendProfiles?.[friend.friendId] ?? null,
      });
    }

    friendMatches.sort((a, b) => {
      if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
      if (b.duplicateTotal !== a.duplicateTotal) return b.duplicateTotal - a.duplicateTotal;
      return (b.lastActiveAt ?? '').localeCompare(a.lastActiveAt ?? '');
    });
  }

  const isLoading = friendsLoading || myStickersLoading || duplicatesLoading || allStickersLoading || profilesLoading;
  const friendsWithMatches = friendMatches.filter(m => m.matchCount > 0);

  return {
    friendMatches,
    friendsWithMatches,
    isLoading,
    hasFriends: friends.length > 0,
  };
}
