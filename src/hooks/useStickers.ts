import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Sticker {
  id: string;
  code: string;
  scope: string | null;
  team_code: string | null;
  team_name: string | null;
  group_letter: string | null;
  number_in_team: number | null;
  display_name: string | null;
}

export function useStickers() {
  return useQuery({
    queryKey: ['stickers'],
    queryFn: async (): Promise<Sticker[]> => {
      // Fetch all 980 stickers in batches to avoid 1000-row limit
      const allStickers: Sticker[] = [];
      let from = 0;
      const batchSize = 500;

      while (true) {
        const { data, error } = await supabase
          .from('stickers')
          .select('id, code, scope, team_code, team_name, group_letter, number_in_team, display_name, sort_scope, sort_group, sort_team, sort_number')
          .order('sort_scope')
          .order('sort_group', { ascending: true, nullsFirst: false })
          .order('sort_team', { ascending: true, nullsFirst: false })
          .order('sort_number')
          .range(from, from + batchSize - 1);

        if (error) throw error;
        if (!data || data.length === 0) break;
        allStickers.push(...(data as Sticker[]));
        if (data.length < batchSize) break;
        from += batchSize;
      }

      return allStickers;
    },
  });
}

export function useGroupsAndTeams(stickers: Sticker[] | undefined) {
  const groups = [...new Set(stickers?.filter(s => s.scope === 'TEAM').map(s => s.group_letter).filter(Boolean) ?? [])].sort() as string[];

  const teamsByGroup = (group: string) => {
    const teamEntries = stickers?.filter(s => s.scope === 'TEAM' && s.group_letter === group) ?? [];
    const uniqueTeams = new Map<string, string>();
    for (const s of teamEntries) {
      if (s.team_code && !uniqueTeams.has(s.team_code)) {
        uniqueTeams.set(s.team_code, s.team_name ?? s.team_code);
      }
    }
    return [...uniqueTeams.entries()].map(([code, name]) => ({ code, name }));
  };

  return { groups, teamsByGroup };
}
