import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FriendSticker {
  id: string;
  sticker_id: string;
  status: 'HAVE' | 'DUPLICATE';
  code: string;
  display_name: string | null;
  team_code: string | null;
  team_name: string | null;
  group_letter: string | null;
}

export function useFriendStickers(friendId: string | undefined) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['friend-stickers', friendId],
    queryFn: async (): Promise<FriendSticker[]> => {
      if (!friendId) return [];

      const { data: userStickers, error: stickersError } = await supabase
        .from('user_stickers')
        .select(`
          sticker_id,
          status,
          stickers (
            id,
            code,
            display_name,
            team_code,
            team_name,
            group_letter
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
          display_name: string | null;
          team_code: string | null;
          team_name: string | null;
          group_letter: string | null;
        };
        return {
          id: sticker.id,
          sticker_id: item.sticker_id,
          status: item.status as 'HAVE' | 'DUPLICATE',
          code: sticker.code,
          display_name: sticker.display_name,
          team_code: sticker.team_code,
          team_name: sticker.team_name,
          group_letter: sticker.group_letter,
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
