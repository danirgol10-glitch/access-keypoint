import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface University {
  id: string;
  name: string;
}

export function useUniversities() {
  const query = useQuery({
    queryKey: ['universities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('universities')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return (data ?? []) as University[];
    },
    staleTime: 1000 * 60 * 10,
  });

  return { universities: query.data ?? [], isLoading: query.isLoading };
}
