import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FriendSticker {
  id: string;
  sticker_id: string;
  status: 'HAVE' | 'DUPLICATE';
  code: string;
  name: string | null;
  team: string | null;
  section: string | null;
}

export function useFriendStickers(friendId: string | undefined) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['friend-stickers', friendId],
    queryFn: async (): Promise<FriendSticker[]> => {
      if (!friendId) return [];

      // Fetch friend's stickers with sticker details
      const { data: userStickers, error: stickersError } = await supabase
        .from('user_stickers')
        .select(`
          sticker_id,
          status,
          stickers (
            id,
            code,
            name,
            team,
            section
          )
        `)
        .eq('user_id', friendId);

      if (stickersError) {
        console.error('Error fetching friend stickers:', stickersError);
        throw stickersError;
      }

      return (userStickers ?? []).map((item) => {
        const sticker = item.stickers as unknown as {
          id: string;
          code: string;
          name: string | null;
          team: string | null;
          section: string | null;
        };
        return {
          id: sticker.id,
          sticker_id: item.sticker_id,
          status: item.status as 'HAVE' | 'DUPLICATE',
          code: sticker.code,
          name: sticker.name,
          team: sticker.team,
          section: sticker.section,
        };
      });
    },
    enabled: !!friendId,
  });

  const stickers = data ?? [];
  const ownedCount = stickers.length;
  const duplicateCount = stickers.filter((s) => s.status === 'DUPLICATE').length;
  const haveCount = ownedCount - duplicateCount;

  return {
    stickers,
    ownedCount,
    duplicateCount,
    haveCount,
    isLoading,
    error,
  };
}
