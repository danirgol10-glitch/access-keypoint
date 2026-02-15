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
}

export type SortMode = 'best_match' | 'most_duplicates' | 'most_active';

export function sortMatches<T extends { matchCount: number; duplicateTotal: number; lastActiveAt: string | null }>(
  items: T[],
  mode: SortMode,
): T[] {
  const sorted = [...items];
  sorted.sort((a, b) => {
    if (mode === 'most_duplicates') {
      if (b.duplicateTotal !== a.duplicateTotal) return b.duplicateTotal - a.duplicateTotal;
      if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
      return (b.lastActiveAt ?? '').localeCompare(a.lastActiveAt ?? '');
    }
    if (mode === 'most_active') {
      const cmp = (b.lastActiveAt ?? '').localeCompare(a.lastActiveAt ?? '');
      if (cmp !== 0) return cmp;
      if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
      return b.duplicateTotal - a.duplicateTotal;
    }
    // best_match (default)
    if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
    if (b.duplicateTotal !== a.duplicateTotal) return b.duplicateTotal - a.duplicateTotal;
    return (b.lastActiveAt ?? '').localeCompare(a.lastActiveAt ?? '');
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
        .select('id, username, last_active_at')
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
      });
    }

    // Default sort: best_match
    cityMatches.sort((a, b) => {
      if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
      if (b.duplicateTotal !== a.duplicateTotal) return b.duplicateTotal - a.duplicateTotal;
      return (b.lastActiveAt ?? '').localeCompare(a.lastActiveAt ?? '');
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
