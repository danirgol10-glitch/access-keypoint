import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useTradeRequests } from '@/hooks/useTradeRequests';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useCityMatches, sortMatches, type SortMode } from '@/hooks/useCityMatches';
import { useFriendMatches } from '@/hooks/useFriendMatches';
import { useUniversityMatches } from '@/hooks/useUniversityMatches';
import { useLanguage } from '@/contexts/LanguageContext';
import { FriendMatchCard } from '@/components/FriendMatchCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Users, MapPin, GraduationCap, ChevronRight, Check, X, Inbox } from 'lucide-react';
import { toast } from 'sonner';

const Trading = () => {
  const navigate = useNavigate();
  const { profile: myProfile } = useUserProfile();
  const { t } = useLanguage();

  const { sentRequests, receivedRequests, isLoading: tradeLoading, updateStatus, isUpdating } = useTradeRequests();
  const { usersWithMatches, isLoading: matchesLoading, city, hasCityUsers } = useCityMatches();
  const { friendsWithMatches, isLoading: friendsMatchesLoading, hasFriends } = useFriendMatches();
  const { usersWithMatches: uniUsersWithMatches, isLoading: uniMatchesLoading, universityId } = useUniversityMatches();

  const [citySheetOpen, setCitySheetOpen] = useState(false);
  const [friendsSheetOpen, setFriendsSheetOpen] = useState(false);
  const [uniSheetOpen, setUniSheetOpen] = useState(false);
  const [citySortMode, setCitySortMode] = useState<SortMode>('default');
  const [friendsSortMode, setFriendsSortMode] = useState<SortMode>('default');
  const [uniSortMode, setUniSortMode] = useState<SortMode>('default');

  const sortedCityMatches = useMemo(() => sortMatches(usersWithMatches, citySortMode), [usersWithMatches, citySortMode]);
  const sortedFriendMatches = useMemo(() => sortMatches(friendsWithMatches, friendsSortMode), [friendsWithMatches, friendsSortMode]);
  const sortedUniMatches = useMemo(() => sortMatches(uniUsersWithMatches.map(m => ({ ...m, sameUniversity: true as const })), uniSortMode), [uniUsersWithMatches, uniSortMode]);

  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; type: 'reject' | 'cancel'; requestId: string; otherUserId: string; otherUsername?: string; } | null>(null);

  const activeTrades = [...sentRequests.filter((r) => r.status === 'ACCEPTED'), ...receivedRequests.filter((r) => r.status === 'ACCEPTED')];

  const confirmAction = async () => {
    if (!confirmDialog) return;
    try { const newStatus = confirmDialog.type === 'reject' ? 'REJECTED' : 'CANCELLED'; await updateStatus({ requestId: confirmDialog.requestId, newStatus, otherUserId: confirmDialog.otherUserId, otherUsername: confirmDialog.otherUsername, myUsername: myProfile?.username ?? undefined }); toast.success(confirmDialog.type === 'reject' ? t('trading.requestRejected') : t('trade.statusCancelled')); }
    catch { toast.error(t('trading.error')); } finally { setConfirmDialog(null); }
  };

  const cityBadgeCount = usersWithMatches.length;
  const friendsBadgeCount = friendsWithMatches.length;
  const uniBadgeCount = uniUsersWithMatches.length;

  const handleViewCityUser = (userId: string) => { setCitySheetOpen(false); navigate(`/friend/${userId}`); };
  const handleViewFriend = (friendId: string) => { setFriendsSheetOpen(false); navigate(`/friend/${friendId}`); };
  const handleViewUniUser = (userId: string) => { setUniSheetOpen(false); navigate(`/friend/${userId}`); };

  const SortDropdown = ({ value, onChange }: { value: SortMode; onChange: (v: SortMode) => void }) => (
    <Select value={value} onValueChange={(v) => onChange(v as SortMode)}>
      <SelectTrigger className="w-auto h-7 text-xs px-2.5 gap-1 border-none" style={{ background: 'var(--surface-input)', color: 'var(--text-secondary)' }}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="default">{t('home.sortDefault')}</SelectItem>
        <SelectItem value="most_active">{t('home.sortMostActive')}</SelectItem>
      </SelectContent>
    </Select>
  );

  const DiscoveryButton = ({ children, badge, ...props }: any) => (
    <button {...props}
      className="rounded-full h-14 w-14 relative flex items-center justify-center transition-all duration-150 active:scale-95"
      style={{ border: '1px solid var(--surface-input-border)', background: 'var(--surface-card)' }}>
      {children}
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 text-[10px] font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1" style={{ background: 'hsl(var(--badge-bg))', color: '#FFFFFF' }}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );

  const isLoading = tradeLoading;

  return (
    <div className="relative px-4 pt-14 pb-28 space-y-6 max-w-md mx-auto">
      <div className="page-vignette" />

      <div className="relative z-20 text-center mb-2">
        <h1 className="text-[22px] font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>{t('nav.trading')}</h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>Discover collectors and trade stickers</p>
      </div>

      <div className="relative z-20 flex items-center justify-center gap-4">
        <Sheet open={friendsSheetOpen} onOpenChange={setFriendsSheetOpen}>
          <SheetTrigger asChild>
            <DiscoveryButton badge={friendsBadgeCount}>
              <Users className="h-6 w-6 stroke-[2.2]" style={{ color: 'var(--icon-default)' }} />
            </DiscoveryButton>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md page-bg border-l" style={{ borderColor: 'var(--surface-divider)' }}>
            <SheetHeader><SheetTitle style={{ color: 'var(--text-primary)' }}>{t('home.friendsWhoCanHelp')}</SheetTitle></SheetHeader>
            <div className="mt-4 space-y-3 overflow-y-auto max-h-[calc(100vh-120px)]">
              {friendsMatchesLoading ? (
                <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" style={{ background: 'var(--surface-skeleton)' }} />)}</div>
              ) : !hasFriends ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <Users className="h-12 w-12 mb-3" style={{ color: 'var(--icon-faint)' }} />
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>{t('home.addFriendsToDiscover')}</p>
                  <button onClick={() => { setFriendsSheetOpen(false); navigate('/friends'); }} className="px-4 py-2 rounded-xl text-sm font-semibold btn-themed">{t('home.addFriends')}</button>
                </div>
              ) : friendsBadgeCount === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <Users className="h-12 w-12 mb-3" style={{ color: 'var(--icon-faint)' }} />
                  <p style={{ color: 'var(--text-secondary)' }}>{t('home.noFriendDuplicates')}</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}><span>{t('home.sortBy')}</span><SortDropdown value={friendsSortMode} onChange={setFriendsSortMode} /></div>
                  {sortedFriendMatches.map((match) => <FriendMatchCard key={match.friendId} username={match.username} matchCount={match.matchCount} duplicateTotal={match.duplicateTotal} lastActiveAt={match.lastActiveAt} onView={() => handleViewFriend(match.friendId)} />)}
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>

        <Sheet open={citySheetOpen} onOpenChange={setCitySheetOpen}>
          <SheetTrigger asChild>
            <DiscoveryButton badge={cityBadgeCount}>
              <MapPin className="h-6 w-6 stroke-[2.2]" style={{ color: 'var(--icon-default)' }} />
            </DiscoveryButton>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md page-bg border-l" style={{ borderColor: 'var(--surface-divider)' }}>
            <SheetHeader><SheetTitle style={{ color: 'var(--text-primary)' }}>{city ? t('home.peopleInCityWhoCanHelp', { city }) : t('home.localMatches')}</SheetTitle></SheetHeader>
            <div className="mt-4 space-y-3 overflow-y-auto max-h-[calc(100vh-120px)]">
              {matchesLoading ? (
                <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" style={{ background: 'var(--surface-skeleton)' }} />)}</div>
              ) : !city ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <MapPin className="h-12 w-12 mb-3" style={{ color: 'var(--icon-faint)' }} />
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>{t('home.setCityToFind')}</p>
                  <button onClick={() => { setCitySheetOpen(false); navigate('/profile'); }} className="px-4 py-2 rounded-xl text-sm font-semibold btn-themed">{t('home.setCity')}</button>
                </div>
              ) : !hasCityUsers ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <MapPin className="h-12 w-12 mb-3" style={{ color: 'var(--icon-faint)' }} />
                  <p style={{ color: 'var(--text-secondary)' }}>{t('home.noCollectorsInCity', { city })}</p>
                </div>
              ) : usersWithMatches.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <Users className="h-12 w-12 mb-3" style={{ color: 'var(--icon-faint)' }} />
                  <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>{t('home.noMatchesInCity', { city })}</p>
                  <p className="text-sm" style={{ color: 'var(--text-hint)' }}>{t('home.noMatchesInCityDetail')}</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}><span>{t('home.sortBy')}</span><SortDropdown value={citySortMode} onChange={setCitySortMode} /></div>
                  {sortedCityMatches.map((match) => <FriendMatchCard key={match.userId} username={match.username} matchCount={match.matchCount} duplicateTotal={match.duplicateTotal} lastActiveAt={match.lastActiveAt} onView={() => handleViewCityUser(match.userId)} />)}
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>

        <Sheet open={uniSheetOpen} onOpenChange={setUniSheetOpen}>
          <SheetTrigger asChild>
            {universityId ? (
              <DiscoveryButton badge={uniBadgeCount}><GraduationCap className="h-6 w-6 stroke-[2.2]" style={{ color: 'var(--icon-default)' }} /></DiscoveryButton>
            ) : (
              <DiscoveryButton badge={0} style={{ opacity: 0.5 }}><GraduationCap className="h-6 w-6 stroke-[2.2]" style={{ color: 'var(--icon-default)' }} /></DiscoveryButton>
            )}
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md page-bg border-l" style={{ borderColor: 'var(--surface-divider)' }}>
            <SheetHeader><SheetTitle style={{ color: 'var(--text-primary)' }}>{t('home.uniWhoCanHelp')}</SheetTitle></SheetHeader>
            <div className="mt-4 space-y-3 overflow-y-auto max-h-[calc(100vh-120px)]">
              {!universityId ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <GraduationCap className="h-12 w-12 mb-3" style={{ color: 'var(--icon-faint)' }} />
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>{t('home.setUniToFind')}</p>
                  <button onClick={() => { setUniSheetOpen(false); navigate('/profile'); }} className="px-4 py-2 rounded-xl text-sm font-semibold btn-themed">{t('home.setUniversity')}</button>
                </div>
              ) : uniMatchesLoading ? (
                <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" style={{ background: 'var(--surface-skeleton)' }} />)}</div>
              ) : uniBadgeCount === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <GraduationCap className="h-12 w-12 mb-3" style={{ color: 'var(--icon-faint)' }} />
                  <p style={{ color: 'var(--text-secondary)' }}>{t('home.noUniMatches')}</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}><span>{t('home.sortBy')}</span><SortDropdown value={uniSortMode} onChange={setUniSortMode} /></div>
                  {sortedUniMatches.map((match) => <FriendMatchCard key={match.userId} username={match.username} matchCount={match.matchCount} duplicateTotal={match.duplicateTotal} lastActiveAt={match.lastActiveAt} onView={() => handleViewUniUser(match.userId)} />)}
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="relative z-20 flex items-center justify-center gap-4 -mt-4">
        <span className="w-14 text-center text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>{t('trading.friends')}</span>
        <span className="w-14 text-center text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>{t('trading.cityLabel')}</span>
        <span className="w-14 text-center text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>{t('trading.uniLabel')}</span>
      </div>

      {(() => {
        const pendingReceived = receivedRequests.filter((r) => r.status === 'SENT');
        if (tradeLoading || pendingReceived.length === 0) return null;
        return (
          <section className="relative z-20 space-y-3">
            <div className="flex items-center gap-2">
              <Inbox className="h-4 w-4" style={{ color: 'var(--icon-default)' }} />
              <h2 className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>{t('trading.receivedRequests')}</h2>
              <span className="text-[11px] font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1.5" style={{ background: 'hsl(var(--badge-bg))', color: '#FFFFFF' }}>{pendingReceived.length}</span>
            </div>
            <div className="space-y-2">
              {pendingReceived.map((request) => {
                const relativeTime = formatDistanceToNow(new Date(request.created_at), { addSuffix: true });
                return (
                  <div key={request.id} className="flex items-center justify-between p-4 rounded-[16px] transition-all duration-150"
                    style={{ background: 'var(--surface-card)', border: '1px solid var(--surface-card-border)' }}>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/request/${request.id}`)}>
                      <span className="font-medium text-[14px]" style={{ color: 'var(--text-primary)' }}>{t('trade.from')}: @{request.other_user?.username ?? t('common.unknown')}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{t('trade.stickers', { count: request.item_count ?? 0, s: (request.item_count ?? 0) !== 1 ? 's' : '' })}</span>
                        <span className="text-[12px]" style={{ color: 'var(--text-hint)' }}>•</span>
                        <span className="text-[12px]" style={{ color: 'var(--text-hint)' }}>{relativeTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={async () => { try { await updateStatus({ requestId: request.id, newStatus: 'ACCEPTED', otherUserId: request.from_user_id, otherUsername: request.other_user?.username ?? undefined, myUsername: myProfile?.username ?? undefined }); toast.success(t('requestDetail.accepted')); } catch { toast.error(t('trading.error')); } }}
                        disabled={isUpdating} className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all duration-150 active:scale-95 disabled:opacity-50 btn-themed">
                        <Check className="h-3.5 w-3.5" />{t('trade.accept')}
                      </button>
                      <button onClick={() => setConfirmDialog({ open: true, type: 'reject', requestId: request.id, otherUserId: request.from_user_id, otherUsername: request.other_user?.username ?? undefined })}
                        disabled={isUpdating} className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all duration-150 active:scale-95 disabled:opacity-50"
                        style={{ background: 'var(--surface-input)', border: '1px solid var(--surface-input-border)', color: 'var(--text-secondary)' }}>
                        <X className="h-3.5 w-3.5" />{t('trade.reject')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })()}

      <section className="relative z-20 space-y-3">
        <h2 className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>{t('trading.activeTrades')}</h2>
        {isLoading ? (
          <div className="space-y-2">{[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" style={{ background: 'var(--surface-skeleton)' }} />)}</div>
        ) : activeTrades.length === 0 ? (
          <div className="premium-panel p-6 flex flex-col items-center text-center">
            <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>{t('trading.noActiveTrades')}</p>
            <p className="text-[12px] mt-2" style={{ color: 'var(--text-hint)' }}>{t('trading.findCollectors')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeTrades.map((trade) => (
              <button key={trade.id} className="w-full flex items-center justify-between p-4 rounded-[16px] text-left transition-all duration-150 active:scale-[0.98]"
                style={{ background: 'var(--surface-card)', border: '1px solid var(--surface-card-border)' }} onClick={() => navigate(`/request/${trade.id}`)}>
                <div>
                  <span className="font-medium text-[14px]" style={{ color: 'var(--text-primary)' }}>@{trade.other_user?.username ?? t('common.unknown')}</span>
                  <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{t('trading.chatAvailable')}</p>
                </div>
                <div className="flex items-center gap-1 text-[12px] font-medium px-3 py-1.5 rounded-xl"
                  style={{ background: 'var(--surface-input)', border: '1px solid var(--surface-input-border)', color: 'var(--text-primary)' }}>
                  {t('trading.open')}<ChevronRight className="h-3 w-3" />
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <AlertDialog open={confirmDialog?.open ?? false} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <AlertDialogContent style={{ background: 'var(--dialog-bg)', border: '1px solid var(--surface-input-border)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: 'var(--text-primary)' }}>{confirmDialog?.type === 'reject' ? t('trading.rejectRequest') : t('trading.cancelRequest')}</AlertDialogTitle>
            <AlertDialogDescription style={{ color: 'var(--text-secondary)' }}>{confirmDialog?.type === 'reject' ? t('trading.confirmReject') : t('trading.confirmCancel')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel style={{ background: 'var(--surface-input)', border: '1px solid var(--surface-input-border)', color: 'var(--text-primary)' }}>{t('trading.noGoBack')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction} className="btn-themed">{confirmDialog?.type === 'reject' ? t('trading.yesReject') : t('trading.yesCancel')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Trading;
