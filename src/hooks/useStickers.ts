import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Sticker {
  id: string;
  code: string;
  team: string | null;
  section: string | null;
  number: number | null;
  name: string | null;
}

export function useStickers() {
  return useQuery({
    queryKey: ['stickers'],
    queryFn: async (): Promise<Sticker[]> => {
      const { data, error } = await supabase
        .from('stickers')
        .select('id, code, team, section, number, name')
        .order('code');

      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useTeamsAndSections(stickers: Sticker[] | undefined) {
  const teams = [...new Set(stickers?.map(s => s.team).filter(Boolean) ?? [])].sort();
  const sections = [...new Set(stickers?.map(s => s.section).filter(Boolean) ?? [])].sort();
  return { teams, sections };
}
