import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from './useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { useUserStickers } from './useUserStickers';
import { useStickers } from './useStickers';
import { useBlockedUsers } from './useBlockedUsers';

export interface CityMatch {
  userId: string;
  username: string | null;
  matchCount: number;
  duplicateTotal: number;
  lastActiveAt: string | null;
  sameUniversity: boolean;
}

export type SortMode = 'default' | 'most_active';

export function sortMatches<T extends { matchCount: number; duplicateTotal: number; lastActiveAt: string | null; sameUniversity?: boolean }>(
  items: T[],
  mode: SortMode,
): T[] {
  const sorted = [...items];
  sorted.sort((a, b) => {
    if (mode === 'most_active') {
      return (b.lastActiveAt ?? '').localeCompare(a.lastActiveAt ?? '');
    }
    // default: match_count → same_university → last_active_at → duplicate_total
    if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
    const aUni = a.sameUniversity ? 1 : 0;
    const bUni = b.sameUniversity ? 1 : 0;
    if (bUni !== aUni) return bUni - aUni;
    const cmp = (b.lastActiveAt ?? '').localeCompare(a.lastActiveAt ?? '');
    if (cmp !== 0) return cmp;
    return b.duplicateTotal - a.duplicateTotal;
  });
  return sorted;
}

export function useCityMatches() {
  const { user } = useAuth();
  const { profile, isLoading: profileLoading } = useUserProfile();
  const { data: myStickers, isLoading: myStickersLoading } = useUserStickers();
  const { data: allStickers, isLoading: allStickersLoading } = useStickers();
  const { blockedIds, isLoading: blockedLoading } = useBlockedUsers();

  const city = profile?.city ?? null;

  const { data: cityUsers, isLoading: cityUsersLoading } = useQuery({
    queryKey: ['city-users', city],
    queryFn: async () => {
      if (!city) return [];
      const { data, error } = await supabase
        .from('users')
        .select('id, username, last_active_at, university_id')
        .eq('city', city)
        .neq('id', user!.id);
      if (error) { console.error('Error fetching city users:', error); throw error; }
      return data ?? [];
    },
    enabled: !!user && !!city,
  });

  const cityUserIds = cityUsers?.map(u => u.id) ?? [];

  const { data: cityDuplicates, isLoading: duplicatesLoading } = useQuery({
    queryKey: ['city-duplicates', cityUserIds],
    queryFn: async () => {
      if (cityUserIds.length === 0) return {};
      const { data, error } = await supabase
        .from('user_stickers')
        .select('user_id, sticker_id')
        .in('user_id', cityUserIds)
        .eq('status', 'DUPLICATE');
      if (error) { console.error('Error fetching city duplicates:', error); throw error; }
      const grouped: Record<string, Set<string>> = {};
      for (const row of data ?? []) {
        if (!grouped[row.user_id]) grouped[row.user_id] = new Set();
        grouped[row.user_id].add(row.sticker_id);
      }
      return grouped;
    },
    enabled: !!user && cityUserIds.length > 0,
  });

  const cityMatches: CityMatch[] = [];
  const allLoaded = !profileLoading && !myStickersLoading && !allStickersLoading && !cityUsersLoading && !duplicatesLoading && !blockedLoading;

  if (allLoaded && allStickers && myStickers && cityUsers) {
    const myOwnedStickerIds = new Set(Object.keys(myStickers));
    const myNeedStickerIds = new Set(
      allStickers.filter(s => !myOwnedStickerIds.has(s.id)).map(s => s.id)
    );
    const blockedSet = new Set(blockedIds);
    const myUniId = profile?.university_id ?? null;

    for (const cityUser of cityUsers) {
      if (blockedSet.has(cityUser.id)) continue;
      const dupSet = cityDuplicates?.[cityUser.id] ?? new Set();
      let matchCount = 0;
      for (const stickerId of dupSet) {
        if (myNeedStickerIds.has(stickerId)) matchCount++;
      }
      cityMatches.push({
        userId: cityUser.id,
        username: cityUser.username ?? null,
        matchCount,
        duplicateTotal: dupSet.size,
        lastActiveAt: cityUser.last_active_at ?? null,
        sameUniversity: !!(myUniId && cityUser.university_id === myUniId),
      });
    }

    // Default sort: match_count → same_university → last_active_at → duplicate_total
    cityMatches.sort((a, b) => {
      if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
      const aUni = a.sameUniversity ? 1 : 0;
      const bUni = b.sameUniversity ? 1 : 0;
      if (bUni !== aUni) return bUni - aUni;
      const cmp = (b.lastActiveAt ?? '').localeCompare(a.lastActiveAt ?? '');
      if (cmp !== 0) return cmp;
      return b.duplicateTotal - a.duplicateTotal;
    });
  }

  const isLoading = profileLoading || myStickersLoading || allStickersLoading || cityUsersLoading || duplicatesLoading || blockedLoading;
  const usersWithMatches = cityMatches.filter(m => m.matchCount > 0);

  return {
    cityMatches,
    usersWithMatches,
    isLoading,
    city,
    hasCityUsers: (cityUsers?.length ?? 0) > 0,
  };
}
