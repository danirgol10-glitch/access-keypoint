import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  city: string | null;
  created_at: string;
  last_active_at: string | null;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }

      return data;
    },
    enabled: !!user,
    staleTime: 1000 * 60, // 1 minute
  });

  const invalidateProfile = () => {
    return queryClient.invalidateQueries({ queryKey: ['user-profile', user?.id] });
  };

  const refetchProfile = () => {
    return query.refetch();
  };

  return {
    profile: query.data,
    isLoading: query.isLoading,
    error: query.error,
    invalidateProfile,
    refetchProfile,
  };
};
