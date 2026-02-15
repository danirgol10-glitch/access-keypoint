import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from './useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { useUserStickers } from './useUserStickers';
import { useStickers } from './useStickers';

export interface CityMatch {
  userId: string;
  username: string | null;
  matchCount: number;
}

export function useCityMatches() {
  const { user } = useAuth();
  const { profile, isLoading: profileLoading } = useUserProfile();
  const { data: myStickers, isLoading: myStickersLoading } = useUserStickers();
  const { data: allStickers, isLoading: allStickersLoading } = useStickers();

  const city = profile?.city ?? null;

  // Fetch users in the same city (excluding self)
  const { data: cityUsers, isLoading: cityUsersLoading } = useQuery({
    queryKey: ['city-users', city],
    queryFn: async () => {
      if (!city) return [];

      const { data, error } = await supabase
        .from('users')
        .select('id, username')
        .eq('city', city)
        .neq('id', user!.id);

      if (error) {
        console.error('Error fetching city users:', error);
        throw error;
      }
      return data ?? [];
    },
    enabled: !!user && !!city,
  });

  const cityUserIds = cityUsers?.map(u => u.id) ?? [];

  // Fetch DUPLICATE stickers from all city users
  const { data: cityDuplicates, isLoading: duplicatesLoading } = useQuery({
    queryKey: ['city-duplicates', cityUserIds],
    queryFn: async () => {
      if (cityUserIds.length === 0) return {};

      const { data, error } = await supabase
        .from('user_stickers')
        .select('user_id, sticker_id')
        .in('user_id', cityUserIds)
        .eq('status', 'DUPLICATE');

      if (error) {
        console.error('Error fetching city duplicates:', error);
        throw error;
      }

      const grouped: Record<string, Set<string>> = {};
      for (const row of data ?? []) {
        if (!grouped[row.user_id]) {
          grouped[row.user_id] = new Set();
        }
        grouped[row.user_id].add(row.sticker_id);
      }
      return grouped;
    },
    enabled: !!user && cityUserIds.length > 0,
  });

  // Compute matches
  const cityMatches: CityMatch[] = [];

  const allLoaded = !profileLoading && !myStickersLoading && !allStickersLoading && !cityUsersLoading && !duplicatesLoading;

  if (allLoaded && allStickers && myStickers && cityUsers) {
    const myOwnedStickerIds = new Set(Object.keys(myStickers));
    const myNeedStickerIds = new Set(
      allStickers.filter(s => !myOwnedStickerIds.has(s.id)).map(s => s.id)
    );

    for (const cityUser of cityUsers) {
      const dupSet = cityDuplicates?.[cityUser.id] ?? new Set();

      let matchCount = 0;
      for (const stickerId of dupSet) {
        if (myNeedStickerIds.has(stickerId)) {
          matchCount++;
        }
      }

      cityMatches.push({
        userId: cityUser.id,
        username: cityUser.username ?? null,
        matchCount,
      });
    }

    cityMatches.sort((a, b) => b.matchCount - a.matchCount);
  }

  const isLoading = profileLoading || myStickersLoading || allStickersLoading || cityUsersLoading || duplicatesLoading;
  const usersWithMatches = cityMatches.filter(m => m.matchCount > 0);

  return {
    cityMatches,
    usersWithMatches,
    isLoading,
    city,
    hasCityUsers: (cityUsers?.length ?? 0) > 0,
  };
}
