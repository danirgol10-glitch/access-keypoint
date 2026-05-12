import { useState, useMemo, useEffect, forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatTimeAgoEs } from '@/lib/dateUtils';
import { useTradeRequests } from '@/hooks/useTradeRequests';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/contexts/AuthContext';
import { sortMatches, type SortMode } from '@/hooks/useCityMatches';
import { useFriendMatches } from '@/hooks/useFriendMatches';
import { useUniversityMatches } from '@/hooks/useUniversityMatches';
import { useLanguage } from '@/contexts/LanguageContext';
import { FriendMatchCard } from '@/components/FriendMatchCard';
import { AppCard } from '@/components/ui/app-card';
import { AvatarCircle } from '@/components/ui/avatar-circle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ListRow } from '@/components/ui/list-row';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Users, GraduationCap, ChevronRight, Check, X, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DiscoveryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: ReactNode;
  badge: number;
  muted?: boolean;
}

const DiscoveryButton = forwardRef<HTMLButtonElement, DiscoveryButtonProps>(
  ({ icon, label, badge, muted = false, className, ...props }, ref) => (
    <button
      ref={ref}
      {...props}
      type="button"
      className={cn(
        'tap-target pressable relative flex min-h-[92px] flex-1 flex-col items-center justify-center gap-2 rounded-[var(--radius-xl)] border border-[var(--surface-border)] bg-[var(--surface-input)] px-3 py-4 text-center outline-none transition-[background-color,border-color,box-shadow,transform,opacity] [transition-duration:var(--motion-duration-base)] [transition-timing-function:var(--motion-ease-standard)] hover:border-[var(--surface-border-strong)] hover:bg-[var(--surface-hover)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0',
        muted && 'opacity-60',
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full border border-[var(--surface-border)] bg-[var(--surface-glass)] text-[var(--text-primary)] shadow-control [&_svg]:size-6">
        {icon}
      </span>
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-secondary)]">{label}</span>
      {badge > 0 && (
        <span className="absolute right-3 top-3 flex h-5 min-w-5 items-center justify-center rounded-full border border-white/50 bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground shadow-[0_5px_14px_rgba(0,0,0,0.35)]">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  ),
);
DiscoveryButton.displayName = 'DiscoveryButton';

const Trading = () => {
  const navigate = useNavigate();
  const { profile: myProfile } = useUserProfile();
  const { user } = useAuth();
  const { t } = useLanguage();

  const { sentRequests, receivedRequests, isLoading: tradeLoading, updateStatus, isUpdating } = useTradeRequests();
  const { friendsWithMatches, isLoading: friendsMatchesLoading, hasFriends } = useFriendMatches();
  const { usersWithMatches: uniUsersWithMatches, isLoading: uniMatchesLoading, universityId } = useUniversityMatches();

  const [friendsSheetOpen, setFriendsSheetOpen] = useState(false);
  const [uniSheetOpen, setUniSheetOpen] = useState(false);
  const [friendsSortMode, setFriendsSortMode] = useState<SortMode>('default');
  const [uniSortMode, setUniSortMode] = useState<SortMode>('default');

  const sortedFriendMatches = useMemo(() => sortMatches(friendsWithMatches, friendsSortMode), [friendsWithMatches, friendsSortMode]);
  const sortedUniMatches = useMemo(() => sortMatches(uniUsersWithMatches.map(m => ({ ...m, sameUniversity: true as const })), uniSortMode), [uniUsersWithMatches, uniSortMode]);

  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; type: 'reject' | 'cancel'; requestId: string; otherUserId: string; otherUsername?: string; } | null>(null);
  const [archiveDialog, setArchiveDialog] = useState<{ open: boolean; requestId: string } | null>(null);

  const archiveKey = user?.id ? `archived_active_trades_${user.id}` : null;
  const [archivedIds, setArchivedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!archiveKey) return;
    try {
      const raw = localStorage.getItem(archiveKey);
      if (raw) setArchivedIds(new Set(JSON.parse(raw)));
    } catch { /* ignore */ }
  }, [archiveKey]);

  const persistArchived = (next: Set<string>) => {
    setArchivedIds(next);
    if (archiveKey) {
      try { localStorage.setItem(archiveKey, JSON.stringify(Array.from(next))); } catch { /* ignore */ }
    }
  };

  const allActiveTrades = [...sentRequests.filter((r) => r.status === 'ACCEPTED'), ...receivedRequests.filter((r) => r.status === 'ACCEPTED')];
  const activeTrades = allActiveTrades.filter((trade) => !archivedIds.has(trade.id));
  const pendingReceived = receivedRequests.filter((r) => r.status === 'SENT');

  const confirmArchive = () => {
    if (!archiveDialog) return;
    const next = new Set(archivedIds);
    next.add(archiveDialog.requestId);
    persistArchived(next);
    setArchiveDialog(null);
    toast.success(t('trading.tradeArchived'));
  };

  const confirmAction = async () => {
    if (!confirmDialog) return;
    try { const newStatus = confirmDialog.type === 'reject' ? 'REJECTED' : 'CANCELLED'; await updateStatus({ requestId: confirmDialog.requestId, newStatus, otherUserId: confirmDialog.otherUserId, otherUsername: confirmDialog.otherUsername, myUsername: myProfile?.username ?? undefined }); toast.success(confirmDialog.type === 'reject' ? t('trading.requestRejected') : t('trade.statusCancelled')); }
    catch { toast.error(t('trading.error')); } finally { setConfirmDialog(null); }
  };

  const friendsBadgeCount = friendsWithMatches.length;
  const uniBadgeCount = uniUsersWithMatches.length;

  const handleViewFriend = (friendId: string) => { setFriendsSheetOpen(false); navigate(`/friend/${friendId}`); };
  const handleViewUniUser = (userId: string) => { setUniSheetOpen(false); navigate(`/friend/${userId}`); };
  const getInitials = (username?: string | null) => username?.slice(0, 2).toUpperCase() || undefined;

  const SortDropdown = ({ value, onChange }: { value: SortMode; onChange: (v: SortMode) => void }) => (
    <Select value={value} onValueChange={(v) => onChange(v as SortMode)}>
      <SelectTrigger className="w-auto min-h-11 gap-1 border-none bg-[var(--surface-input)] px-3 text-base text-[var(--text-secondary)]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="default">{t('home.sortDefault')}</SelectItem>
        <SelectItem value="most_active">{t('home.sortMostActive')}</SelectItem>
      </SelectContent>
    </Select>
  );

  const isLoading = tradeLoading;

  return (
    <div className="relative mx-auto max-w-lg space-y-5 px-4 safe-page">
      <div className="page-vignette" />

      <PageHeader
        title={t('nav.trading')}
        subtitle={t('trading.discoverySubtitle')}
        className="relative z-20 px-0 pb-0 pt-0"
      />

      <AppCard variant="hero" className="relative z-20 space-y-5 p-5">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[var(--text-primary)]">{t('trading.findCollectors')}</p>
          <p className="text-xs leading-5 text-[var(--text-secondary)]">{t('trading.discoverySubtitle')}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Sheet open={friendsSheetOpen} onOpenChange={setFriendsSheetOpen}>
            <SheetTrigger asChild>
              <DiscoveryButton
                badge={friendsBadgeCount}
                icon={<Users className="stroke-[2.2]" />}
                label={t('trading.friends')}
              />
            </SheetTrigger>
            <SheetContent side="right" className="w-full border-l border-[var(--surface-divider)] page-bg sm:max-w-md">
              <SheetHeader className="pr-14 text-left">
                <SheetTitle className="text-left text-xl leading-tight">{t('home.friendsWhoCanHelp')}</SheetTitle>
              </SheetHeader>
              <div className="sheet-scroll-area mt-4 space-y-3 overflow-y-auto">
                {friendsMatchesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-[var(--radius-lg)] bg-[var(--surface-skeleton)]" />)}
                  </div>
                ) : !hasFriends ? (
                  <EmptyState
                    className="py-8"
                    icon={<Users />}
                    title={t('home.addFriendsToDiscover')}
                    cta={
                      <Button type="button" onClick={() => { setFriendsSheetOpen(false); navigate('/friends'); }}>
                        {t('home.addFriends')}
                      </Button>
                    }
                  />
                ) : friendsBadgeCount === 0 ? (
                  <EmptyState className="py-8" icon={<Users />} title={t('home.noFriendDuplicates')} />
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
                      <span>{t('home.sortBy')}</span>
                      <SortDropdown value={friendsSortMode} onChange={setFriendsSortMode} />
                    </div>
                    {sortedFriendMatches.map((match) => (
                      <FriendMatchCard
                        key={match.friendId}
                        username={match.username}
                        matchCount={match.matchCount}
                        duplicateTotal={match.duplicateTotal}
                        lastActiveAt={match.lastActiveAt}
                        onView={() => handleViewFriend(match.friendId)}
                      />
                    ))}
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <Sheet open={uniSheetOpen} onOpenChange={setUniSheetOpen}>
            <SheetTrigger asChild>
              <DiscoveryButton
                badge={universityId ? uniBadgeCount : 0}
                icon={<GraduationCap className="stroke-[2.2]" />}
                label={t('trading.uniLabel')}
                muted={!universityId}
              />
            </SheetTrigger>
            <SheetContent side="right" className="w-full border-l border-[var(--surface-divider)] page-bg sm:max-w-md">
              <SheetHeader className="pr-14 text-left">
                <SheetTitle className="text-left text-xl leading-tight">{t('home.uniWhoCanHelp')}</SheetTitle>
              </SheetHeader>
              <div className="sheet-scroll-area mt-4 space-y-3 overflow-y-auto">
                {!universityId ? (
                  <EmptyState
                    className="py-8"
                    icon={<GraduationCap />}
                    title={t('home.setUniToFind')}
                    cta={
                      <Button type="button" onClick={() => { setUniSheetOpen(false); navigate('/profile'); }}>
                        {t('home.setUniversity')}
                      </Button>
                    }
                  />
                ) : uniMatchesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-[var(--radius-lg)] bg-[var(--surface-skeleton)]" />)}
                  </div>
                ) : uniBadgeCount === 0 ? (
                  <EmptyState className="py-8" icon={<GraduationCap />} title={t('home.noUniMatches')} />
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
                      <span>{t('home.sortBy')}</span>
                      <SortDropdown value={uniSortMode} onChange={setUniSortMode} />
                    </div>
                    {sortedUniMatches.map((match) => (
                      <FriendMatchCard
                        key={match.userId}
                        username={match.username}
                        matchCount={match.matchCount}
                        duplicateTotal={match.duplicateTotal}
                        lastActiveAt={match.lastActiveAt}
                        onView={() => handleViewUniUser(match.userId)}
                      />
                    ))}
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </AppCard>

      {!tradeLoading && pendingReceived.length > 0 && (
        <section className="relative z-20 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <Inbox className="h-4 w-4 shrink-0 text-[var(--icon-default)]" />
              <h2 className="truncate text-base font-semibold text-[var(--text-primary)]">{t('trading.receivedRequests')}</h2>
            </div>
            <Badge>{pendingReceived.length}</Badge>
          </div>
          <div className="space-y-2">
            {pendingReceived.map((request) => {
              const relativeTime = formatTimeAgoEs(request.created_at);
              const username = request.other_user?.username ?? t('common.unknown');

              return (
                <AppCard key={request.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-center gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
                      onClick={() => navigate(`/request/${request.id}`)}
                    >
                      <AvatarCircle initials={getInitials(request.other_user?.username)} icon={<Users className="h-4 w-4" />} size="sm" />
                      <div className="min-w-0 flex-1">
                        <span className="truncate text-sm font-semibold text-[var(--text-primary)]">{t('trade.from')}: @{username}</span>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                          <span>{t('trade.stickers', { count: request.item_count ?? 0, s: (request.item_count ?? 0) !== 1 ? 's' : '' })}</span>
                          <span className="text-[var(--text-hint)]">·</span>
                          <span className="text-[var(--text-hint)]">{relativeTime}</span>
                        </div>
                      </div>
                    </button>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={async (e) => {
                          e.stopPropagation();
                          try { await updateStatus({ requestId: request.id, newStatus: 'ACCEPTED', otherUserId: request.from_user_id, otherUsername: request.other_user?.username ?? undefined, myUsername: myProfile?.username ?? undefined }); toast.success(t('requestDetail.accepted')); } catch { toast.error(t('trading.error')); }
                        }}
                        disabled={isUpdating}
                        className="min-h-11 px-3"
                      >
                        <Check className="h-3.5 w-3.5" />{t('trade.accept')}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDialog({ open: true, type: 'reject', requestId: request.id, otherUserId: request.from_user_id, otherUsername: request.other_user?.username ?? undefined });
                        }}
                        disabled={isUpdating}
                        className="min-h-11 px-3"
                      >
                        <X className="h-3.5 w-3.5" />{t('trade.reject')}
                      </Button>
                    </div>
                  </div>
                </AppCard>
              );
            })}
          </div>
        </section>
      )}

      <section className="relative z-20 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">{t('trading.activeTrades')}</h2>
          {!isLoading && activeTrades.length > 0 && <Badge variant="secondary">{activeTrades.length}</Badge>}
        </div>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-[var(--radius-lg)] bg-[var(--surface-skeleton)]" />)}
          </div>
        ) : activeTrades.length === 0 ? (
          <EmptyState
            icon={<Inbox />}
            title={t('trading.noActiveTrades')}
            description={t('trading.findCollectors')}
            cta={
              <div className="grid w-full grid-cols-2 gap-2">
                <Button type="button" onClick={() => setFriendsSheetOpen(true)} className="text-xs">
                  {t('trading.exploreFriends')}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => universityId ? setUniSheetOpen(true) : navigate('/profile')}
                  className="text-xs"
                >
                  {t('trading.exploreUniversity')}
                </Button>
              </div>
            }
          />
        ) : (
          <div className="space-y-2">
            {activeTrades.map((trade) => {
              const username = trade.other_user?.username ?? t('common.unknown');

              return (
                <AppCard key={trade.id} className="p-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t('trading.removeActiveTrade')}
                    onClick={(e) => { e.stopPropagation(); setArchiveDialog({ open: true, requestId: trade.id }); }}
                    className="absolute right-2 top-2 z-10 size-11 rounded-full bg-[var(--surface-input)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                  <button
                    type="button"
                    className="w-full rounded-[var(--radius-xl)] p-4 pr-14 text-left outline-none transition-transform duration-150 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
                    onClick={() => navigate(`/request/${trade.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <AvatarCircle initials={getInitials(trade.other_user?.username)} icon={<Users className="h-4 w-4" />} size="sm" />
                      <div className="min-w-0 flex-1">
                        <span className="truncate text-sm font-semibold text-[var(--text-primary)]">@{username}</span>
                        <p className="mt-0.5 text-xs text-[var(--text-muted)]">{t('trading.chatAvailable')}</p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        {t('trading.open')}<ChevronRight className="ml-1 h-3 w-3" />
                      </Badge>
                    </div>
                  </button>
                </AppCard>
              );
            })}
          </div>
        )}
      </section>

      <AlertDialog open={confirmDialog?.open ?? false} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog?.type === 'reject' ? t('trading.rejectRequest') : t('trading.cancelRequest')}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDialog?.type === 'reject' ? t('trading.confirmReject') : t('trading.confirmCancel')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-11">{t('trading.noGoBack')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction} className="min-h-11">{confirmDialog?.type === 'reject' ? t('trading.yesReject') : t('trading.yesCancel')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={archiveDialog?.open ?? false} onOpenChange={(open) => !open && setArchiveDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('trading.archiveTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('trading.archiveMessage')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-11">{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmArchive} className="min-h-11">{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Trading;
