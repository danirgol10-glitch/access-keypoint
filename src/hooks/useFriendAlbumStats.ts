import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAcceptedFriends } from './useFriendships';
import { useAlbumConfig } from './useAlbumStats';

export interface FriendAlbumStats {
  friendId: string;
  username: string;
  ownedCount: number;
  duplicateCount: number;
  missingCount: number;
  progressPercent: number;
}

export function useFriendAlbumStats() {
  const { friends, isLoading: friendsLoading } = useAcceptedFriends();
  const { data: totalStickers, isLoading: configLoading } = useAlbumConfig();

  const friendIds = friends.map((f) => f.friendId);

  const { data: friendStickers, isLoading: stickersLoading } = useQuery({
    queryKey: ['friend-stickers-stats', friendIds],
    queryFn: async () => {
      if (friendIds.length === 0) return {};

      // Fetch all user_stickers for friends (we can see DUPLICATE via RLS)
      // We need to count HAVE + DUPLICATE for owned
      // But RLS only allows us to see DUPLICATE stickers for friends
      // So we'll use a different approach - count from what we can access
      
      // Actually, we need to think about this differently
      // The RLS policy only lets us see DUPLICATE stickers for friends
      // So we can't compute their full progress client-side
      
      // For now, let's show what we CAN see: their duplicates
      // And explain that we need a server function for full stats
      
      const { data, error } = await supabase
        .from('user_stickers')
        .select('user_id, status')
        .in('user_id', friendIds);

      if (error) {
        console.error('Error fetching friend stickers:', error);
        throw error;
      }

      // Group by friend
      const statsByFriend: Record<string, { owned: number; duplicate: number }> = {};
      
      for (const sticker of data ?? []) {
        if (!statsByFriend[sticker.user_id]) {
          statsByFriend[sticker.user_id] = { owned: 0, duplicate: 0 };
        }
        statsByFriend[sticker.user_id].owned++;
        if (sticker.status === 'DUPLICATE') {
          statsByFriend[sticker.user_id].duplicate++;
        }
      }

      return statsByFriend;
    },
    enabled: friendIds.length > 0,
  });

  const isLoading = friendsLoading || configLoading || stickersLoading;

  if (isLoading || !totalStickers) {
    return { friendStats: [], isLoading };
  }

  const friendStats: FriendAlbumStats[] = friends.map((friend) => {
    const stats = friendStickers?.[friend.friendId] ?? { owned: 0, duplicate: 0 };
    const ownedCount = stats.owned;
    const duplicateCount = stats.duplicate;
    const missingCount = totalStickers - ownedCount;
    const progressPercent = (ownedCount / totalStickers) * 100;

    return {
      friendId: friend.friendId,
      username: friend.username ?? 'unknown',
      ownedCount,
      duplicateCount,
      missingCount,
      progressPercent,
    };
  });

  return { friendStats, isLoading: false };
}
