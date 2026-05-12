import { useRef, useState, type ElementType, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Bell, Check, ChevronRight, GraduationCap, Search, Sparkles, User, UserPlus, Users, X } from 'lucide-react';
import { AppCard } from '@/components/ui/app-card';
import { AvatarCircle } from '@/components/ui/avatar-circle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { ListRow } from '@/components/ui/list-row';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFriendAlbumStats } from '@/hooks/useFriendAlbumStats';
import { useSendFriendRequest, useIncomingRequests, useRespondToRequest } from '@/hooks/useFriendships';
import { useSuggestedFriends } from '@/hooks/useSuggestedFriends';
import { useUserSearch } from '@/hooks/useUserSearch';
import { toast } from '@/hooks/use-toast';

function SectionHeader({ icon: Icon, title, action }: { icon: ElementType; title: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[var(--surface-border)] bg-[var(--surface-input)] text-[var(--text-secondary)]">
          <Icon className="size-4" />
        </span>
        <h2 className="truncate text-base font-semibold text-[var(--text-primary)]">{title}</h2>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

function SummaryMetric({ icon: Icon, label, value }: { icon: ElementType; label: ReactNode; value: ReactNode }) {
  return (
    <div className="flex min-h-[88px] flex-col items-center justify-center gap-1.5 rounded-[var(--radius-lg)] border border-[var(--surface-border)] bg-[var(--surface-input)] px-2 py-3 text-center">
      <Icon className="size-3.5 shrink-0 text-[var(--text-secondary)]" />
      <p className="text-2xl font-bold leading-none text-[var(--text-primary)]">{value}</p>
      <span className="w-full text-[11px] font-semibold leading-tight text-[var(--text-secondary)]">{label}</span>
    </div>
  );
}

function UserRow({ username, detail, action, onAdd, isPending, chip, addLabel, pendingLabel, friendsLabel }: {
  username: string | null; detail: string; action: 'add' | 'pending' | 'friends'; onAdd: () => void; isPending: boolean;
  chip?: { label: string; icon: ElementType }; addLabel: string; pendingLabel: string; friendsLabel: string;
}) {
  const initials = username?.slice(0, 2).toUpperCase();
  const title = username ? `@${username}` : '@—';

  const trailing = (
    <div className="flex shrink-0 items-center gap-2">
      {chip && (
        <Badge variant="secondary" className="hidden items-center gap-1 whitespace-nowrap px-2 text-[10px] sm:flex">
          <chip.icon className="size-3" />
          {chip.label}
        </Badge>
      )}
      {action === 'add' && (
        <Button type="button" onClick={onAdd} disabled={isPending} className="shrink-0 px-3 text-xs">
          <UserPlus className="size-3.5" />
          {addLabel}
        </Button>
      )}
      {action === 'pending' && (
        <Badge variant="secondary" className="shrink-0 border-dashed">
          {pendingLabel}
        </Badge>
      )}
      {action === 'friends' && (
        <Badge variant="outline" className="shrink-0">
          {friendsLabel}
        </Badge>
      )}
    </div>
  );

  return (
    <ListRow
      leading={<AvatarCircle initials={initials} icon={<User />} size="sm" />}
      title={title}
      subtitle={detail}
      trailing={trailing}
      className="bg-[var(--surface-card)]"
    />
  );
}

const Friends = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { friendStats, isLoading: statsLoading } = useFriendAlbumStats();
  const sendRequest = useSendFriendRequest();
  const { results: searchResults, isSearching } = useUserSearch(searchQuery);
  const { suggestions, isLoading: suggestionsLoading } = useSuggestedFriends();
  const { incomingRequests, isLoading: incomingLoading } = useIncomingRequests();
  const respondToRequest = useRespondToRequest();

  const handleAddFriend = async (username: string) => {
    const result = await sendRequest.mutateAsync(username);
    if (result.success) toast({ title: t('trading.requestSent'), description: t('trading.requestSentTo', { username }) });
    else toast({ title: t('trading.error'), description: result.error ?? '', variant: 'destructive' });
  };

  const handleRespondToRequest = async (friendshipId: string, accept: boolean) => {
    try {
      await respondToRequest.mutateAsync({ friendshipId, accept });
      toast({ title: accept ? t('trading.friendAdded') : t('trading.requestRejected'), description: accept ? t('trading.youAreNowFriends') : t('trading.theRequestRejected') });
    } catch { toast({ title: t('trading.error'), description: t('trading.failedToRespond'), variant: 'destructive' }); }
  };

  const getSuggestionChip = (u: { city?: string | null; university_name?: string | null }) => {
    if (u.university_name) return { label: 'Misma universidad', icon: GraduationCap };
    return { label: 'Activo', icon: Activity };
  };

  const labels = { add: t('friends.add'), pending: t('trading.pending'), friends: t('friends.alreadyFriends') };

  return (
    <div className="relative mx-auto max-w-lg space-y-4 px-4 safe-page">
      <div className="page-vignette" />

      <PageHeader title={t('friends.title')} subtitle={t('friends.subtitle')} className="relative z-20 px-0 pb-0 pt-0" />

      <AppCard variant="hero" className="relative z-20 space-y-4 p-5">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[var(--text-primary)]">{t('friends.subtitle')}</p>
          <p className="text-xs leading-5 text-[var(--text-secondary)]">{t('friends.searchToConnect')}</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <SummaryMetric icon={Users} label="Amigos" value={statsLoading ? '…' : friendStats.length} />
          <SummaryMetric icon={Bell} label="Pendientes" value={incomingLoading ? '…' : incomingRequests.length} />
          <SummaryMetric icon={Sparkles} label="Sugeridos" value={suggestionsLoading ? '…' : suggestions.length} />
        </div>
      </AppCard>

      {!incomingLoading && incomingRequests.length > 0 && (
        <AppCard className="relative z-20 space-y-3 p-4">
          <SectionHeader icon={Bell} title={t('friends.requestsTitle', { count: incomingRequests.length })} />
          <div className="space-y-2">
            {incomingRequests.map((request) => (
              <ListRow
                key={request.id}
                leading={<AvatarCircle initials={request.requester?.username?.slice(0, 2).toUpperCase()} icon={<User />} size="sm" />}
                title={`@${request.requester?.username ?? t('common.unknown')}`}
                subtitle={t('friends.wantsToBeFriend')}
                trailing={
                  <div className="flex shrink-0 gap-1.5">
                    <Button
                      type="button"
                      size="icon"
                      aria-label={t('trade.accept')}
                      onClick={() => handleRespondToRequest(request.id, true)}
                      disabled={respondToRequest.isPending}
                    >
                      <Check className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label={t('trade.reject')}
                      onClick={() => handleRespondToRequest(request.id, false)}
                      disabled={respondToRequest.isPending}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                }
                className="bg-[var(--surface-card)]"
              />
            ))}
          </div>
        </AppCard>
      )}

      <AppCard className="relative z-20 space-y-3 p-4">
        <SectionHeader icon={Search} title={t('friends.searchUsers')} />
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder={t('friends.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>

        {isSearching && (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full rounded-[var(--radius-lg)] bg-[var(--surface-skeleton)]" />
            <Skeleton className="h-16 w-full rounded-[var(--radius-lg)] bg-[var(--surface-skeleton)]" />
          </div>
        )}

        {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
          <EmptyState
            className="py-6"
            icon={<Search />}
            title={t('friends.noResults')}
            description={t('friends.noResultsHint')}
            cta={
              <Button type="button" variant="secondary" onClick={() => setSearchQuery('')}>
                {t('friends.clearSearch')}
              </Button>
            }
          />
        )}

        {searchResults.length > 0 && (
          <div className="space-y-2">
            {searchResults.map((u) => (
              <UserRow key={u.id} username={u.username} detail={[u.city, u.university_name].filter(Boolean).join(' · ') || '—'}
                action={u.isFriend ? 'friends' : u.isPending ? 'pending' : 'add'} onAdd={() => handleAddFriend(u.username!)}
                isPending={sendRequest.isPending} addLabel={labels.add} pendingLabel={labels.pending} friendsLabel={labels.friends} />
            ))}
          </div>
        )}
      </AppCard>

      <AppCard className="relative z-20 space-y-3 p-4">
        <SectionHeader
          icon={Users}
          title={t('friends.myFriends')}
          action={
            <Badge variant="secondary" className="min-w-8 justify-center">
              {statsLoading ? '…' : friendStats.length}
            </Badge>
          }
        />
        {statsLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-20 w-full rounded-[var(--radius-lg)] bg-[var(--surface-skeleton)]" />
            <Skeleton className="h-20 w-full rounded-[var(--radius-lg)] bg-[var(--surface-skeleton)]" />
          </div>
        ) : friendStats.length === 0 ? (
          <EmptyState
            className="py-8"
            icon={<Users />}
            title={t('friends.noFriendsYet')}
            description={t('friends.searchToConnect')}
            cta={
              <Button type="button" onClick={() => searchInputRef.current?.focus()}>
                {t('friends.startSearch')}
              </Button>
            }
          />
        ) : (
          <div className="space-y-2">
            {friendStats.map((friend) => (
              <ListRow
                key={friend.friendId}
                interactive
                onClick={() => navigate(`/friend-profile/${friend.friendId}`)}
                leading={<AvatarCircle initials={friend.username?.slice(0, 2).toUpperCase()} icon={<User />} size="sm" />}
                title={`@${friend.username}`}
                subtitle={
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-card-border)]">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,var(--progress-bar-from),var(--progress-bar-to))] transition-all"
                        style={{ width: `${friend.progressPercent}%` }}
                      />
                    </div>
                    <span className="w-9 text-right text-[11px] font-medium text-[var(--text-secondary)]">{friend.progressPercent.toFixed(0)}%</span>
                  </div>
                }
                trailing={<ChevronRight className="size-4 text-[var(--text-faint)]" />}
                className="bg-[var(--surface-card)]"
              />
            ))}
          </div>
        )}
      </AppCard>

      {suggestions.length > 0 && (
        <AppCard className="relative z-20 space-y-3 p-4">
          <SectionHeader icon={Sparkles} title={t('friends.suggested')} />
          <p className="text-xs leading-5 text-[var(--text-secondary)]">{t('friends.suggestedDesc')}</p>
          {suggestionsLoading ? (
            <Skeleton className="h-16 w-full rounded-[var(--radius-lg)] bg-[var(--surface-skeleton)]" />
          ) : (
            <div className="space-y-2">
              {suggestions.map((u) => (
                <UserRow key={u.id} username={u.username} detail={[u.city, u.university_name].filter(Boolean).join(' · ') || '—'}
                  action="add" onAdd={() => handleAddFriend(u.username!)} isPending={sendRequest.isPending}
                  chip={getSuggestionChip(u)} addLabel={labels.add} pendingLabel={labels.pending} friendsLabel={labels.friends} />
              ))}
            </div>
          )}
        </AppCard>
      )}
    </div>
  );
};

export default Friends;
