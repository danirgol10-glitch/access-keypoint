import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface University {
  id: string;
  name: string;
  city: string;
}

export function useUniversities(city?: string | null) {
  const query = useQuery({
    queryKey: ['universities', city ?? 'all'],
    queryFn: async () => {
      let q = supabase
        .from('universities')
        .select('id, name, city')
        .eq('is_active', true)
        .order('name');
      if (city) {
        q = q.eq('city', city);
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as University[];
    },
    staleTime: 1000 * 60 * 10,
  });

  return { universities: query.data ?? [], isLoading: query.isLoading };
}
