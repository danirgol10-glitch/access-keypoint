import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from './useUserProfile';
import { useFriendships } from './useFriendships';
import { useBlockedUsers } from './useBlockedUsers';

export interface SuggestedUser {
  id: string;
  username: string | null;
  city: string | null;
  university_name: string | null;
}

export function useSuggestedFriends() {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { data: friendships } = useFriendships();
  const { blockedIds } = useBlockedUsers();

  // Build exclude set (self + existing friends + pending + blocked)
  const excludeIds = new Set<string>([user?.id ?? '']);
  friendships?.forEach(f => {
    excludeIds.add(f.requester_id);
    excludeIds.add(f.addressee_id);
  });
  blockedIds.forEach(id => excludeIds.add(id));

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['suggested-friends', profile?.city, profile?.university_id, Array.from(excludeIds).sort().join(',')],
    queryFn: async (): Promise<SuggestedUser[]> => {
      if (!user || !profile) return [];

      // Fetch users from same city or university
      let query = supabase
        .from('users')
        .select('id, username, city, university_id')
        .neq('id', user.id)
        .not('username', 'is', null)
        .limit(20);

      if (profile.city && profile.university_id) {
        query = query.or(`city.eq.${profile.city},university_id.eq.${profile.university_id}`);
      } else if (profile.city) {
        query = query.eq('city', profile.city);
      } else if (profile.university_id) {
        query = query.eq('university_id', profile.university_id);
      } else {
        return [];
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter out excluded
      const filtered = (data ?? []).filter(u => !excludeIds.has(u.id));

      // Get university names
      const uniIds = filtered.map(u => u.university_id).filter(Boolean) as string[];
      let uniMap: Record<string, string> = {};
      if (uniIds.length > 0) {
        const { data: unis } = await supabase.from('universities').select('id, name').in('id', uniIds);
        uniMap = Object.fromEntries((unis ?? []).map(u => [u.id, u.name]));
      }

      return filtered.slice(0, 10).map(u => ({
        id: u.id,
        username: u.username,
        city: u.city,
        university_name: u.university_id ? (uniMap[u.university_id] ?? null) : null,
      }));
    },
    enabled: !!user && !!profile,
  });

  return { suggestions, isLoading };
}
