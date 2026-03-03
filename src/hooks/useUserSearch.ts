import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useFriendships } from './useFriendships';

export interface SearchResult {
  id: string;
  username: string | null;
  city: string | null;
  university_name: string | null;
  isFriend: boolean;
  isPending: boolean;
}

export function useUserSearch(query: string) {
  const { user } = useAuth();
  const { data: friendships } = useFriendships();

  const trimmed = query.trim();

  const { data: results = [], isLoading: isSearching } = useQuery({
    queryKey: ['user-search', trimmed],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!user || trimmed.length < 2) return [];

      const { data, error } = await supabase
        .from('users')
        .select('id, username, city, university_id')
        .ilike('username', `%${trimmed}%`)
        .neq('id', user.id)
        .limit(10);

      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Fetch university names for results
      const uniIds = data.map(u => u.university_id).filter(Boolean) as string[];
      let uniMap: Record<string, string> = {};
      if (uniIds.length > 0) {
        const { data: unis } = await supabase
          .from('universities')
          .select('id, name')
          .in('id', uniIds);
        uniMap = Object.fromEntries((unis ?? []).map(u => [u.id, u.name]));
      }

      // Build friend/pending sets
      const friendSet = new Set<string>();
      const pendingSet = new Set<string>();
      friendships?.forEach(f => {
        const otherId = f.requester_id === user.id ? f.addressee_id : f.requester_id;
        if (f.status === 'ACCEPTED') friendSet.add(otherId);
        if (f.status === 'PENDING') pendingSet.add(otherId);
      });

      return data.map(u => ({
        id: u.id,
        username: u.username,
        city: u.city,
        university_name: u.university_id ? (uniMap[u.university_id] ?? null) : null,
        isFriend: friendSet.has(u.id),
        isPending: pendingSet.has(u.id),
      }));
    },
    enabled: !!user && trimmed.length >= 2,
  });

  return { results, isSearching };
}
