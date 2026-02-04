import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useUserStickers } from './useUserStickers';
import { useStickers, Sticker } from './useStickers';

export interface HelpfulSticker extends Sticker {
  // Extended with sticker details
}

export function useFriendHelpfulStickers(friendId: string | undefined) {
  const { user } = useAuth();
  const { data: myStickers, isLoading: myStickersLoading } = useUserStickers();
  const { data: allStickers, isLoading: allStickersLoading } = useStickers();

  // Fetch friend's DUPLICATE stickers
  const { data: friendDuplicates, isLoading: friendDuplicatesLoading } = useQuery({
    queryKey: ['friend-duplicates-detail', friendId],
    queryFn: async () => {
      if (!friendId) return [];

      const { data, error } = await supabase
        .from('user_stickers')
        .select('sticker_id')
        .eq('user_id', friendId)
        .eq('status', 'DUPLICATE');

      if (error) {
        console.error('Error fetching friend duplicates:', error);
        throw error;
      }

      return data?.map(d => d.sticker_id) ?? [];
    },
    enabled: !!user && !!friendId,
  });

  // Compute helpful stickers: intersection of my NEED and friend's DUPLICATE
  let helpfulStickers: HelpfulSticker[] = [];

  if (!myStickersLoading && !allStickersLoading && !friendDuplicatesLoading && allStickers && myStickers && friendDuplicates) {
    // My NEED stickers = all stickers that I don't have in my user_stickers
    const myOwnedStickerIds = new Set(Object.keys(myStickers));
    const friendDuplicateSet = new Set(friendDuplicates);

    // Filter all stickers to those that:
    // 1. I don't own (NEED)
    // 2. Friend has as DUPLICATE
    helpfulStickers = allStickers.filter(
      sticker => !myOwnedStickerIds.has(sticker.id) && friendDuplicateSet.has(sticker.id)
    );

    // Sort by code for consistent display
    helpfulStickers.sort((a, b) => a.code.localeCompare(b.code));
  }

  const isLoading = myStickersLoading || allStickersLoading || friendDuplicatesLoading;

  return {
    helpfulStickers,
    isLoading,
    count: helpfulStickers.length,
  };
}
