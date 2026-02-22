import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from './useUserProfile';
import { useUserStickers } from './useUserStickers';
import { useStickers } from './useStickers';
import { useBlockedUsers } from './useBlockedUsers';
import { supabase } from '@/integrations/supabase/client';

export interface UniversityMatch {
  userId: string;
  username: string | null;
  matchCount: number;
  duplicateTotal: number;
  lastActiveAt: string | null;
}

export function useUniversityMatches() {
  const { user } = useAuth();
  const { profile, isLoading: profileLoading } = useUserProfile();
  const { data: myStickers, isLoading: myStickersLoading } = useUserStickers();
  const { data: allStickers, isLoading: allStickersLoading } = useStickers();
  const { blockedIds, isLoading: blockedLoading } = useBlockedUsers();

  const universityId = profile?.university_id ?? null;
  const city = profile?.city ?? null;

  const { data: uniUsers, isLoading: uniUsersLoading } = useQuery({
    queryKey: ['uni-users', universityId, city],
    queryFn: async () => {
      if (!universityId || !city) return [];
      const { data, error } = await supabase
        .from('users')
        .select('id, username, last_active_at')
        .eq('university_id', universityId)
        .eq('city', city)
        .neq('id', user!.id);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user && !!universityId && !!city,
  });

  const uniUserIds = uniUsers?.map(u => u.id) ?? [];

  const { data: uniDuplicates, isLoading: duplicatesLoading } = useQuery({
    queryKey: ['uni-duplicates', uniUserIds],
    queryFn: async () => {
      if (uniUserIds.length === 0) return {};
      const { data, error } = await supabase
        .from('user_stickers')
        .select('user_id, sticker_id')
        .in('user_id', uniUserIds)
        .eq('status', 'DUPLICATE');
      if (error) throw error;
      const grouped: Record<string, Set<string>> = {};
      for (const row of data ?? []) {
        if (!grouped[row.user_id]) grouped[row.user_id] = new Set();
        grouped[row.user_id].add(row.sticker_id);
      }
      return grouped;
    },
    enabled: !!user && uniUserIds.length > 0,
  });

  const matches: UniversityMatch[] = [];
  const allLoaded = !profileLoading && !myStickersLoading && !allStickersLoading && !uniUsersLoading && !duplicatesLoading && !blockedLoading;

  if (allLoaded && allStickers && myStickers && uniUsers) {
    const myOwnedIds = new Set(Object.keys(myStickers));
    const myNeedIds = new Set(allStickers.filter(s => !myOwnedIds.has(s.id)).map(s => s.id));
    const blockedSet = new Set(blockedIds);

    for (const u of uniUsers) {
      if (blockedSet.has(u.id)) continue;
      const dupSet = uniDuplicates?.[u.id] ?? new Set();
      let matchCount = 0;
      for (const sid of dupSet) {
        if (myNeedIds.has(sid)) matchCount++;
      }
      matches.push({
        userId: u.id,
        username: u.username ?? null,
        matchCount,
        duplicateTotal: dupSet.size,
        lastActiveAt: u.last_active_at ?? null,
      });
    }

    matches.sort((a, b) => {
      if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
      const cmp = (b.lastActiveAt ?? '').localeCompare(a.lastActiveAt ?? '');
      if (cmp !== 0) return cmp;
      return b.duplicateTotal - a.duplicateTotal;
    });
  }

  const isLoading = profileLoading || myStickersLoading || allStickersLoading || uniUsersLoading || duplicatesLoading || blockedLoading;
  const usersWithMatches = matches.filter(m => m.matchCount > 0);

  return {
    universityMatches: matches,
    usersWithMatches,
    isLoading,
    universityId,
    hasUniUsers: (uniUsers?.length ?? 0) > 0,
  };
}
