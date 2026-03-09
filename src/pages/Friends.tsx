import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Search, UserPlus, User, ChevronRight, Sparkles, MapPin, GraduationCap, Activity, Check, X, Bell } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFriendAlbumStats } from '@/hooks/useFriendAlbumStats';
import { useSendFriendRequest, useIncomingRequests, useRespondToRequest } from '@/hooks/useFriendships';
import { useSuggestedFriends } from '@/hooks/useSuggestedFriends';
import { useUserSearch } from '@/hooks/useUserSearch';
import { toast } from '@/hooks/use-toast';

/* ─── Reusable Sub-components ─── */

function PremiumCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative rounded-[20px] p-4 overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: 'var(--panel-gold-line)' }} />
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <Icon className="w-[18px] h-[18px]" style={{ color: 'rgba(255,255,255,0.5)' }} />
      <span className="text-[16px] font-semibold" style={{ color: '#FFFFFF' }}>{title}</span>
    </div>
  );
}

function AvatarCircle() {
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 avatar-themed">
      <div className="w-full h-full rounded-full flex items-center justify-center avatar-themed-inner">
        <User className="w-4 h-4" style={{ color: 'rgba(207,227,255,0.7)' }} />
      </div>
    </div>
  );
}

function UserRow({ username, detail, action, onAdd, isPending, chip, addLabel, pendingLabel, friendsLabel }: {
  username: string | null;
  detail: string;
  action: 'add' | 'pending' | 'friends';
  onAdd: () => void;
  isPending: boolean;
  chip?: { label: string; icon: React.ElementType };
  addLabel: string;
  pendingLabel: string;
  friendsLabel: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-[14px] transition-all duration-150 active:scale-[0.98] active:opacity-80" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <AvatarCircle />
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold truncate" style={{ color: '#FFFFFF' }}>@{username}</p>
        <p className="text-[12px] truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>{detail}</p>
      </div>

      {chip && (
        <span className="hidden sm:flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.70)' }}>
          <chip.icon className="w-3 h-3" />
          {chip.label}
        </span>
      )}

      {action === 'add' && (
        <button onClick={onAdd} disabled={isPending} className="flex items-center gap-1 text-[12px] font-semibold px-3 py-1.5 rounded-xl flex-shrink-0 transition-all duration-150 active:scale-95 disabled:opacity-50 relative overflow-hidden btn-themed">
          <span className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: 'var(--panel-gold-line)' }} />
          <UserPlus className="w-3.5 h-3.5" />
          {addLabel}
        </button>
      )}
      {action === 'pending' && (
        <span className="text-[12px] font-medium px-3 py-1.5 rounded-xl flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)', border: '1px dashed rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.75)' }}>
          {pendingLabel}
        </span>
      )}
      {action === 'friends' && (
        <span className="text-[12px] font-medium px-3 py-1.5 rounded-xl flex-shrink-0" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' }}>
          {friendsLabel}
        </span>
      )}
    </div>
  );
}

/* ─── Main Component ─── */

const Friends = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const { friendStats, isLoading: statsLoading } = useFriendAlbumStats();
  const sendRequest = useSendFriendRequest();
  const { results: searchResults, isSearching } = useUserSearch(searchQuery);
  const { suggestions, isLoading: suggestionsLoading } = useSuggestedFriends();

  const { incomingRequests, isLoading: incomingLoading } = useIncomingRequests();
  const respondToRequest = useRespondToRequest();

  const handleAddFriend = async (username: string) => {
    const result = await sendRequest.mutateAsync(username);
    if (result.success) {
      toast({ title: t('trading.requestSent'), description: t('trading.requestSentTo', { username }) });
    } else {
      toast({ title: t('trading.error'), description: result.error ?? '', variant: 'destructive' });
    }
  };

  const handleRespondToRequest = async (friendshipId: string, accept: boolean) => {
    try {
      await respondToRequest.mutateAsync({ friendshipId, accept });
      toast({
        title: accept ? 'Friend added!' : 'Request rejected',
        description: accept ? 'You are now friends!' : 'The request has been rejected.',
      });
    } catch {
      toast({ title: 'Error', description: 'Failed to respond to request', variant: 'destructive' });
    }
  };

  const getSuggestionChip = (u: { city?: string | null; university_name?: string | null }) => {
    if (u.city) return { label: 'Same city', icon: MapPin };
    if (u.university_name) return { label: 'Same university', icon: GraduationCap };
    return { label: 'Active', icon: Activity };
  };

  const labels = {
    add: t('friends.add'),
    pending: t('trading.pending'),
    friends: t('friends.alreadyFriends'),
  };

  return (
    <div className="min-h-screen pb-28 page-bg">
      <div className="pointer-events-none fixed top-0 left-0 right-0 h-32 z-10" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.25), transparent)' }} />

      <div className="relative z-20 px-4 pt-14 space-y-4 max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-2">
          <h1 className="text-[22px] font-bold tracking-wide" style={{ color: '#FFFFFF' }}>{t('friends.title')}</h1>
          <p className="text-[13px] mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>Find and manage your community</p>
        </div>

        {/* INCOMING FRIEND REQUESTS */}
        {!incomingLoading && incomingRequests.length > 0 && (
          <PremiumCard>
            <SectionHeader icon={Bell} title={`Friend Requests (${incomingRequests.length})`} />
            <div className="space-y-2 mt-3">
              {incomingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center gap-3 p-3 rounded-[14px]"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <AvatarCircle />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold truncate" style={{ color: '#FFFFFF' }}>
                      @{request.requester?.username ?? 'unknown'}
                    </p>
                    <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.45)' }}>Wants to be your friend</p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleRespondToRequest(request.id, true)}
                      disabled={respondToRequest.isPending}
                      className="h-8 w-8 rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 btn-themed"
                    >
                      <Check className="w-4 h-4" style={{ color: '#FFFFFF' }} />
                    </button>
                    <button
                      onClick={() => handleRespondToRequest(request.id, false)}
                      disabled={respondToRequest.isPending}
                      className="h-8 w-8 rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                    >
                      <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.6)' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </PremiumCard>
        )}

        {/* SEARCH */}
        <PremiumCard>
          <SectionHeader icon={Search} title={t('friends.searchUsers')} />
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
            <input
              type="text"
              placeholder={t('friends.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-[14px] rounded-2xl outline-none transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: '#FFFFFF' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--input-focus-color)'; e.currentTarget.style.boxShadow = `0 0 12px var(--input-focus-glow)`; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>
          {isSearching && (
            <div className="space-y-2 mt-3">
              <Skeleton className="h-14 w-full rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <Skeleton className="h-14 w-full rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>
          )}
          {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
            <p className="text-[13px] text-center py-4" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('friends.noResults')}</p>
          )}
          {searchResults.length > 0 && (
            <div className="space-y-2 mt-3">
              {searchResults.map((u) => (
                <UserRow
                  key={u.id}
                  username={u.username}
                  detail={[u.city, u.university_name].filter(Boolean).join(' · ') || '—'}
                  action={u.isFriend ? 'friends' : u.isPending ? 'pending' : 'add'}
                  onAdd={() => handleAddFriend(u.username!)}
                  isPending={sendRequest.isPending}
                  addLabel={labels.add}
                  pendingLabel={labels.pending}
                  friendsLabel={labels.friends}
                />
              ))}
            </div>
          )}
        </PremiumCard>

        {/* MY FRIENDS */}
        <PremiumCard>
          <div className="flex items-center justify-between">
            <SectionHeader icon={Users} title={t('friends.myFriends')} />
            <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.7)' }}>
              {statsLoading ? '…' : friendStats.length}
            </span>
          </div>
          {statsLoading ? (
            <div className="space-y-2 mt-3">
              <Skeleton className="h-16 w-full rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <Skeleton className="h-16 w-full rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>
          ) : friendStats.length === 0 ? (
            <div className="flex flex-col items-center py-8 gap-2">
              <Users className="w-8 h-8" style={{ color: 'rgba(255,255,255,0.2)' }} />
              <p className="text-[14px] font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('friends.noFriendsYet')}</p>
              <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('friends.searchToConnect')}</p>
            </div>
          ) : (
            <div className="space-y-2 mt-3">
              {friendStats.map((friend) => (
                <button
                  key={friend.friendId}
                  onClick={() => navigate(`/friend-profile/${friend.friendId}`)}
                  className="w-full flex items-center gap-3 p-3 rounded-[14px] text-left transition-all duration-150 active:scale-[0.98] active:opacity-80"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <AvatarCircle />
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <span className="text-[14px] font-semibold truncate block" style={{ color: '#FFFFFF' }}>@{friend.username}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${friend.progressPercent}%`, background: `linear-gradient(90deg, var(--progress-bar-from), var(--progress-bar-to))` }} />
                      </div>
                      <span className="text-[11px] font-medium w-9 text-right" style={{ color: 'rgba(255,255,255,0.55)' }}>{friend.progressPercent.toFixed(0)}%</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }} />
                </button>
              ))}
            </div>
          )}
        </PremiumCard>

        {/* SUGGESTIONS */}
        {suggestions.length > 0 && (
          <PremiumCard>
            <SectionHeader icon={Sparkles} title={t('friends.suggested')} />
            <p className="text-[12px] -mt-1 mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>Same city and university first</p>
            {suggestionsLoading ? (
              <Skeleton className="h-14 w-full rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }} />
            ) : (
              <div className="space-y-2">
                {suggestions.map((u) => (
                  <UserRow
                    key={u.id}
                    username={u.username}
                    detail={[u.city, u.university_name].filter(Boolean).join(' · ') || '—'}
                    action="add"
                    onAdd={() => handleAddFriend(u.username!)}
                    isPending={sendRequest.isPending}
                    chip={getSuggestionChip(u)}
                    addLabel={labels.add}
                    pendingLabel={labels.pending}
                    friendsLabel={labels.friends}
                  />
                ))}
              </div>
            )}
          </PremiumCard>
        )}
      </div>
    </div>
  );
};

export default Friends;
