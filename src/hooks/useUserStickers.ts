import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type StickerStatus = 'HAVE' | 'NEED' | 'DUPLICATE';

export interface UserSticker {
  user_id: string;
  sticker_id: string;
  status: StickerStatus;
  updated_at: string;
}

export function useUserStickers() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-stickers', user?.id],
    queryFn: async (): Promise<Record<string, UserSticker>> => {
      if (!user) return {};

      const { data, error } = await supabase
        .from('user_stickers')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Return as a map keyed by sticker_id for fast lookup
      return (data ?? []).reduce((acc, item) => {
        acc[item.sticker_id] = item as UserSticker;
        return acc;
      }, {} as Record<string, UserSticker>);
    },
    enabled: !!user,
  });
}

export function useSetStickerStatus() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ stickerId, status }: { stickerId: string; status: StickerStatus }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_stickers')
        .upsert(
          {
            user_id: user.id,
            sticker_id: stickerId,
            status,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,sticker_id' }
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-stickers', user?.id] });
    },
  });
}

export function useClearStickerStatus() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stickerId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_stickers')
        .delete()
        .eq('user_id', user.id)
        .eq('sticker_id', stickerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-stickers', user?.id] });
    },
  });
}
