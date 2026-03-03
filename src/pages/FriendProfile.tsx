import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useFriendStickers } from '@/hooks/useFriendStickers';
import { useAlbumConfig } from '@/hooks/useAlbumStats';
import { useLanguage } from '@/contexts/LanguageContext';
import { BlockUserMenu } from '@/components/BlockUserMenu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Search, Package, User } from 'lucide-react';

type FilterType = 'all' | 'have' | 'duplicate';

const FriendProfile = () => {
  const { friendId } = useParams<{ friendId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: friendProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['friend-profile', friendId],
    queryFn: async () => {
      if (!friendId) return null;
      const { data, error } = await supabase.from('users').select('username, last_active_at').eq('id', friendId).single();
      if (error) return null;
      return data;
    },
    enabled: !!friendId,
  });

  const { stickers, ownedCount, duplicateCount, haveCount, isLoading: stickersLoading } = useFriendStickers(friendId);
  const { data: totalStickers } = useAlbumConfig();

  const isLoading = profileLoading || stickersLoading;
  const missingCount = (totalStickers ?? 0) - ownedCount;
  const progressPercent = totalStickers ? (ownedCount / totalStickers) * 100 : 0;

  const filterLabels: Record<FilterType, string> = {
    all: t('friendProfile.all'),
    have: t('friendProfile.have'),
    duplicate: t('friendProfile.duplicate'),
  };

  const filteredStickers = useMemo(() => {
    let result = stickers;
    if (filter === 'have') result = result.filter((s) => s.status === 'HAVE');
    else if (filter === 'duplicate') result = result.filter((s) => s.status === 'DUPLICATE');
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((s) => s.code.toLowerCase().includes(query) || s.display_name?.toLowerCase().includes(query) || s.team_name?.toLowerCase().includes(query));
    }
    result.sort((a, b) => a.code.localeCompare(b.code));
    return result;
  }, [stickers, filter, searchQuery]);

  return (
    <div className="flex flex-col min-h-screen page-bg">
      <header className="sticky top-0 z-10 px-4 py-3" style={{ background: 'rgba(7,28,71,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="rounded-full h-9 w-9 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <ArrowLeft className="h-5 w-5" style={{ color: 'rgba(255,255,255,0.7)' }} />
          </button>
          <div className="flex-1">
            {profileLoading ? <Skeleton className="h-6 w-32" style={{ background: 'rgba(255,255,255,0.06)' }} /> : (
              <div>
                <h1 className="text-[16px] font-semibold" style={{ color: '#FFFFFF' }}>@{friendProfile?.username ?? t('common.unknown')}</h1>
                {friendProfile?.last_active_at && <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('match.active', { time: formatDistanceToNow(new Date(friendProfile.last_active_at), { addSuffix: true }) })}</p>}
              </div>
            )}
          </div>
          {friendId && <BlockUserMenu userId={friendId} username={friendProfile?.username ?? null} />}
        </div>
      </header>

      <main className="flex-1 px-4 pt-4 pb-24 max-w-md mx-auto w-full space-y-4">
        <div className="premium-panel premium-panel-gold p-5">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-24 mx-auto" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <Skeleton className="h-4 w-48 mx-auto" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>
          ) : (
            <div className="text-center space-y-2">
              <p className="text-3xl font-bold" style={{ color: '#FFFFFF' }}>{progressPercent.toFixed(1)}%</p>
              <div className="flex justify-center gap-4 text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <span>{t('friendProfile.owned')} {ownedCount}</span><span>•</span><span>{t('friendProfile.duplicates')} {duplicateCount}</span><span>•</span><span>{t('friendProfile.missing')} {missingCount}</span>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
          <input placeholder={t('friendProfile.searchPlaceholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-[14px] rounded-2xl outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: '#FFFFFF' }} />
        </div>

        <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.10)' }}>
          {(['all', 'have', 'duplicate'] as FilterType[]).map((f) => {
            const count = f === 'all' ? stickers.length : f === 'have' ? haveCount : duplicateCount;
            return (
              <button key={f} onClick={() => setFilter(f)}
                className="flex-1 py-2 text-[12px] font-medium transition-colors"
                style={filter === f ? { background: 'linear-gradient(135deg, #0A2B73, #1E5AA6)', color: '#FFFFFF' } : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)' }}>
                {filterLabels[f]} ({count})
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="aspect-[3/4] rounded-[14px]" style={{ background: 'rgba(255,255,255,0.06)' }} />)}
          </div>
        ) : filteredStickers.length === 0 ? (
          <div className="premium-panel p-8 flex flex-col items-center text-center">
            <Package className="h-12 w-12 mb-3" style={{ color: 'rgba(255,255,255,0.2)' }} />
            <p className="text-[14px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {searchQuery.trim() ? t('friendProfile.noMatch') : filter !== 'all' ? t('friendProfile.noFilter', { filter: filterLabels[filter] }) : t('friendProfile.noMarked')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {filteredStickers.map((sticker) => (
              <div key={sticker.id} className="relative aspect-[3/4] rounded-[14px] p-2 flex flex-col items-center justify-center text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="absolute top-2 right-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: sticker.status === 'DUPLICATE' ? 'rgba(79,163,255,0.15)' : 'rgba(212,175,55,0.20)', color: sticker.status === 'DUPLICATE' ? 'hsl(222,100%,65%)' : '#D4AF37' }}>
                    {sticker.status === 'DUPLICATE' ? t('sticker.duplicate') : t('sticker.have')}
                  </span>
                </div>
                <span className="font-semibold text-sm" style={{ color: '#FFFFFF' }}>{sticker.code}</span>
                {sticker.team_name && <span className="text-[10px] mt-1 truncate w-full px-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{sticker.team_name}</span>}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default FriendProfile;
