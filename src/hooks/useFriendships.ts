import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useBlockedUsers } from './useBlockedUsers';

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  created_at: string;
  // Joined user data
  requester?: { username: string | null };
  addressee?: { username: string | null };
}

export const useFriendships = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['friendships', user?.id],
    queryFn: async (): Promise<Friendship[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          requester:users!friendships_requester_id_fkey(username),
          addressee:users!friendships_addressee_id_fkey(username)
        `)
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (error) {
        console.error('Error fetching friendships:', error);
        throw error;
      }

      return (data as unknown as Friendship[]) ?? [];
    },
    enabled: !!user,
  });
};

export const useIncomingRequests = () => {
  const { data: friendships, isLoading } = useFriendships();
  const { user } = useAuth();

  const incomingRequests = friendships?.filter(
    (f) => f.addressee_id === user?.id && f.status === 'PENDING'
  ) ?? [];

  return { incomingRequests, isLoading };
};

export const useOutgoingRequests = () => {
  const { data: friendships, isLoading } = useFriendships();
  const { user } = useAuth();

  const outgoingRequests = friendships?.filter(
    (f) => f.requester_id === user?.id && f.status === 'PENDING'
  ) ?? [];

  return { outgoingRequests, isLoading };
};

export const useAcceptedFriends = () => {
  const { data: friendships, isLoading } = useFriendships();
  const { user } = useAuth();
  const { blockedIds } = useBlockedUsers();

  const blockedSet = new Set(blockedIds);
  const friends = friendships?.filter((f) => f.status === 'ACCEPTED').map((f) => {
    const isRequester = f.requester_id === user?.id;
    return {
      friendshipId: f.id,
      friendId: isRequester ? f.addressee_id : f.requester_id,
      username: isRequester ? f.addressee?.username : f.requester?.username,
    };
  }).filter(f => !blockedSet.has(f.friendId)) ?? [];

  return { friends, isLoading };
};

export const useSendFriendRequest = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (username: string): Promise<{ success: boolean; error?: string }> => {
      if (!user) return { success: false, error: 'Not authenticated' };

      // Find user by username (case-insensitive)
      const { data: targetUser, error: findError } = await supabase
        .from('users')
        .select('id, username')
        .ilike('username', username)
        .maybeSingle();

      if (findError) {
        console.error('Error finding user:', findError);
        return { success: false, error: 'Error searching for user' };
      }

      if (!targetUser) {
        return { success: false, error: 'User not found' };
      }

      if (targetUser.id === user.id) {
        return { success: false, error: "You can't add yourself" };
      }

      // Check for existing relationship
      const { data: existing } = await supabase
        .from('friendships')
        .select('id, status')
        .or(`and(requester_id.eq.${user.id},addressee_id.eq.${targetUser.id}),and(requester_id.eq.${targetUser.id},addressee_id.eq.${user.id})`)
        .maybeSingle();

      if (existing) {
        if (existing.status === 'ACCEPTED') {
          return { success: false, error: 'Already friends' };
        }
        if (existing.status === 'PENDING') {
          return { success: false, error: 'Request already pending' };
        }
        if (existing.status === 'REJECTED') {
          return { success: false, error: 'Request was previously rejected' };
        }
      }

      // Create friendship request
      const { error: insertError } = await supabase
        .from('friendships')
        .insert({
          requester_id: user.id,
          addressee_id: targetUser.id,
          status: 'PENDING',
        });

      if (insertError) {
        console.error('Error creating friendship:', insertError);
        return { success: false, error: 'Failed to send request' };
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
    },
  });
};

export const useRespondToRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ friendshipId, accept }: { friendshipId: string; accept: boolean }) => {
      const { error } = await supabase
        .from('friendships')
        .update({ status: accept ? 'ACCEPTED' : 'REJECTED' })
        .eq('id', friendshipId);

      if (error) {
        console.error('Error responding to request:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
    },
  });
};
