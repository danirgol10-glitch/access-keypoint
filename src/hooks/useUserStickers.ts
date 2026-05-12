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

type UserStickersById = Record<string, UserSticker>;

const userStickersQueryKey = (userId?: string) => ['user-stickers', userId] as const;

const getNextStickerStatus = (currentStatus: ComputedStatus): ComputedStatus => {
  if (currentStatus === 'NEED') return 'HAVE';
  if (currentStatus === 'HAVE') return 'DUPLICATE';
  return 'NEED';
};

const applyStatusToCache = (
  currentStickers: UserStickersById | undefined,
  userId: string,
  stickerId: string,
  nextStatus: ComputedStatus,
): UserStickersById => {
  const nextStickers: UserStickersById = { ...(currentStickers ?? {}) };

  if (nextStatus === 'NEED') {
    delete nextStickers[stickerId];
    return nextStickers;
  }

  nextStickers[stickerId] = {
    user_id: userId,
    sticker_id: stickerId,
    status: nextStatus,
    updated_at: new Date().toISOString(),
  };

  return nextStickers;
};

export function useUserStickers() {
  const { user } = useAuth();

  return useQuery({
    queryKey: userStickersQueryKey(user?.id),
    queryFn: async (): Promise<UserStickersById> => {
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
      }, {} as UserStickersById);
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
      const updatedAt = new Date().toISOString();

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
              updated_at: updatedAt,
            },
            { onConflict: 'user_id,sticker_id' }
          );
        if (error) throw error;
      } else if (currentStatus === 'HAVE') {
        // Update to DUPLICATE
        const { error } = await supabase
          .from('user_stickers')
          .update({ status: 'DUPLICATE', updated_at: updatedAt })
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
    onMutate: async ({ stickerId, currentStatus }) => {
      if (!user) return undefined;

      const queryKey = userStickersQueryKey(user.id);
      await queryClient.cancelQueries({ queryKey });

      const previousStickers = queryClient.getQueryData<UserStickersById>(queryKey);
      const nextStatus = getNextStickerStatus(currentStatus);

      queryClient.setQueryData<UserStickersById>(queryKey, (currentStickers) =>
        applyStatusToCache(currentStickers, user.id, stickerId, nextStatus)
      );

      return { previousStickers, queryKey };
    },
    onError: (_error, _variables, context) => {
      if (context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousStickers ?? {});
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userStickersQueryKey(user?.id) });
    },
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
    onMutate: async ({ stickerId, status }) => {
      if (!user) return undefined;

      const queryKey = userStickersQueryKey(user.id);
      await queryClient.cancelQueries({ queryKey });

      const previousStickers = queryClient.getQueryData<UserStickersById>(queryKey);

      queryClient.setQueryData<UserStickersById>(queryKey, (currentStickers) =>
        applyStatusToCache(currentStickers, user.id, stickerId, status)
      );

      return { previousStickers, queryKey };
    },
    onError: (_error, _variables, context) => {
      if (context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousStickers ?? {});
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userStickersQueryKey(user?.id) });
    },
  });
}

// Helper to compute status from user_stickers data
export function getComputedStatus(
  userStickers: UserStickersById,
  stickerId: string
): ComputedStatus {
  const record = userStickers[stickerId];
  if (!record) return 'NEED';
  return record.status as ComputedStatus;
}
