import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useBlockedUsers() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: blockedIds = [], isLoading } = useQuery({
    queryKey: ['blocked-users', user?.id],
    queryFn: async (): Promise<string[]> => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('blocked_users')
        .select('blocked_id')
        .eq('blocker_id', user.id);
      if (error) {
        console.error('Error fetching blocked users:', error);
        return [];
      }
      return data.map((r) => r.blocked_id);
    },
    enabled: !!user?.id,
  });

  const blockMutation = useMutation({
    mutationFn: async (blockedId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('blocked_users')
        .insert({ blocker_id: user.id, blocked_id: blockedId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-users'] });
      queryClient.invalidateQueries({ queryKey: ['city-users'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['trade-requests'] });
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
    },
  });

  const unblockMutation = useMutation({
    mutationFn: async (blockedId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', blockedId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-users'] });
      queryClient.invalidateQueries({ queryKey: ['city-users'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['trade-requests'] });
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
    },
  });

  return {
    blockedIds,
    isLoading,
    isBlocked: (userId: string) => blockedIds.includes(userId),
    block: blockMutation.mutateAsync,
    isBlocking: blockMutation.isPending,
    unblock: unblockMutation.mutateAsync,
    isUnblocking: unblockMutation.isPending,
  };
}
