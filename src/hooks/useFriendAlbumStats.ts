import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAcceptedFriends } from './useFriendships';
import { useAlbumConfig } from './useAlbumStats';

export interface FriendAlbumStats {
  friendId: string;
  username: string;
  ownedCount: number;
  duplicateCount: number;
  haveCount: number;
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

      // With updated RLS, we can now see ALL friend stickers (HAVE + DUPLICATE)
      const { data, error } = await supabase
        .from('user_stickers')
        .select('user_id, status')
        .in('user_id', friendIds);

      if (error) {
        console.error('Error fetching friend stickers:', error);
        throw error;
      }

      // Group by friend - count owned (all rows) and duplicate (status=DUPLICATE)
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
    const haveCount = ownedCount - duplicateCount;
    const missingCount = totalStickers - ownedCount;
    const progressPercent = (ownedCount / totalStickers) * 100;

    return {
      friendId: friend.friendId,
      username: friend.username ?? 'unknown',
      ownedCount,
      duplicateCount,
      haveCount,
      missingCount,
      progressPercent,
    };
  });

  return { friendStats, isLoading: false };
}
