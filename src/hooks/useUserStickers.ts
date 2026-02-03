import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type StickerStatus = 'HAVE' | 'DUPLICATE';
export type ComputedStatus = 'HAVE' | 'NEED' | 'DUPLICATE';

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

export function useCycleStickerStatus() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ stickerId, currentStatus }: { stickerId: string; currentStatus: ComputedStatus }) => {
      if (!user) throw new Error('Not authenticated');

      // Cycle: NEED -> HAVE -> DUPLICATE -> NEED
      if (currentStatus === 'NEED') {
        // Insert HAVE
        const { error } = await supabase
          .from('user_stickers')
          .upsert(
            {
              user_id: user.id,
              sticker_id: stickerId,
              status: 'HAVE',
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,sticker_id' }
          );
        if (error) throw error;
      } else if (currentStatus === 'HAVE') {
        // Update to DUPLICATE
        const { error } = await supabase
          .from('user_stickers')
          .update({ status: 'DUPLICATE', updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('sticker_id', stickerId);
        if (error) throw error;
      } else {
        // DUPLICATE -> NEED: delete the row
        const { error } = await supabase
          .from('user_stickers')
          .delete()
          .eq('user_id', user.id)
          .eq('sticker_id', stickerId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-stickers', user?.id] });
    },
  });
}

// Helper to compute status from user_stickers data
export function getComputedStatus(
  userStickers: Record<string, UserSticker>,
  stickerId: string
): ComputedStatus {
  const record = userStickers[stickerId];
  if (!record) return 'NEED';
  return record.status as ComputedStatus;
}
