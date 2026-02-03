import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserStickers } from './useUserStickers';

export interface AlbumStats {
  totalStickers: number;
  ownedCount: number;
  haveCount: number;
  duplicateCount: number;
  missingCount: number;
  completionPercent: number;
}

export function useAlbumConfig() {
  return useQuery({
    queryKey: ['album-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('album_config')
        .select('total_stickers')
        .eq('id', 1)
        .single();

      if (error) throw error;
      return data.total_stickers;
    },
  });
}

export function useAlbumStats(): {
  stats: AlbumStats | null;
  isLoading: boolean;
} {
  const { data: totalStickers, isLoading: configLoading } = useAlbumConfig();
  const { data: userStickers, isLoading: stickersLoading } = useUserStickers();

  const isLoading = configLoading || stickersLoading;

  if (isLoading || !totalStickers || !userStickers) {
    return { stats: null, isLoading };
  }

  const stickersArray = Object.values(userStickers);
  
  // HAVE or DUPLICATE = owned
  const ownedCount = stickersArray.length;
  const haveCount = stickersArray.filter(s => s.status === 'HAVE').length;
  const duplicateCount = stickersArray.filter(s => s.status === 'DUPLICATE').length;
  const missingCount = totalStickers - ownedCount;
  const completionPercent = (ownedCount / totalStickers) * 100;

  return {
    stats: {
      totalStickers,
      ownedCount,
      haveCount,
      duplicateCount,
      missingCount,
      completionPercent,
    },
    isLoading: false,
  };
}
