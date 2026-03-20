import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type ReportReason = 'spam' | 'inappropriate' | 'scam' | 'other';

export function useReports() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const reportMutation = useMutation({
    mutationFn: async ({
      reportedUserId,
      reason,
      optionalMessage,
    }: {
      reportedUserId: string;
      reason: ReportReason;
      optionalMessage?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase.from('reports').insert({
        reporter_id: user.id,
        reported_user_id: reportedUserId,
        reason,
        optional_message: optionalMessage || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  return {
    report: reportMutation.mutateAsync,
    isReporting: reportMutation.isPending,
  };
}

/** Check if a target user is restricted (3+ distinct reporters) */
export function useIsRestricted(userId: string | undefined) {
  const { data: isRestricted = false, isLoading } = useQuery({
    queryKey: ['user-restricted', userId],
    queryFn: async () => {
      if (!userId) return false;
      const { data, error } = await supabase.rpc('get_report_count', {
        target_user_id: userId,
      });
      if (error) {
        console.error('Error checking restriction:', error);
        return false;
      }
      return (data ?? 0) >= 3;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  return { isRestricted, isLoading };
}
