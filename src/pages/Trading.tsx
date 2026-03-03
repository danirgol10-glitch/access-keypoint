import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTradeRequests } from '@/hooks/useTradeRequests';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useCityMatches, sortMatches, type SortMode } from '@/hooks/useCityMatches';
import { useFriendMatches } from '@/hooks/useFriendMatches';
import { useUniversityMatches } from '@/hooks/useUniversityMatches';
import { useLanguage } from '@/contexts/LanguageContext';
import { FriendMatchCard } from '@/components/FriendMatchCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Users,
  MapPin,
  GraduationCap,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

const Trading = () => {
  const navigate = useNavigate();
  const { profile: myProfile } = useUserProfile();
  const { t } = useLanguage();

  const { sentRequests, receivedRequests, isLoading: tradeLoading, updateStatus } = useTradeRequests();

  // Discovery data
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
  const sortedUniMatches = useMemo(
    () => sortMatches(uniUsersWithMatches.map(m => ({ ...m, sameUniversity: true as const })), uniSortMode),
    [uniUsersWithMatches, uniSortMode]
  );

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'reject' | 'cancel';
    requestId: string;
    otherUserId: string;
    otherUsername?: string;
  } | null>(null);

  const activeTrades = [
    ...sentRequests.filter((r) => r.status === 'ACCEPTED'),
    ...receivedRequests.filter((r) => r.status === 'ACCEPTED'),
  ];

  const confirmAction = async () => {
    if (!confirmDialog) return;
    try {
      const newStatus = confirmDialog.type === 'reject' ? 'REJECTED' : 'CANCELLED';
      await updateStatus({
        requestId: confirmDialog.requestId,
        newStatus,
        otherUserId: confirmDialog.otherUserId,
        otherUsername: confirmDialog.otherUsername,
        myUsername: myProfile?.username ?? undefined,
      });
      toast.success(confirmDialog.type === 'reject' ? t('trading.requestRejected') : t('trade.statusCancelled'));
    } catch {
      toast.error(t('trading.error'));
    } finally {
      setConfirmDialog(null);
    }
  };

  const cityBadgeCount = usersWithMatches.length;
  const friendsBadgeCount = friendsWithMatches.length;
  const uniBadgeCount = uniUsersWithMatches.length;

  const handleViewCityUser = (userId: string) => {
    setCitySheetOpen(false);
    navigate(`/friend/${userId}`);
  };
  const handleViewFriend = (friendId: string) => {
    setFriendsSheetOpen(false);
    navigate(`/friend/${friendId}`);
  };
  const handleViewUniUser = (userId: string) => {
    setUniSheetOpen(false);
    navigate(`/friend/${userId}`);
  };

  const SortDropdown = ({ value, onChange }: { value: SortMode; onChange: (v: SortMode) => void }) => (
    <Select value={value} onValueChange={(v) => onChange(v as SortMode)}>
      <SelectTrigger className="w-auto h-7 text-xs px-2.5 gap-1 border-none bg-muted/50">
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
    <div className="flex flex-col p-4 space-y-6 pb-24">
      {/* Discovery Icons - centered */}
      <div className="flex items-center justify-center gap-4 pt-2">
        {/* Friends Who Can Help (sticker matching) */}
        <Sheet open={friendsSheetOpen} onOpenChange={setFriendsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-14 w-14 relative border border-white/20 bg-transparent hover:bg-white/[0.08] text-[#CFE3FF]">
              <Users className="h-6 w-6 stroke-[2.2]" />
              {friendsBadgeCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                  {friendsBadgeCount > 99 ? '99+' : friendsBadgeCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>{t('home.friendsWhoCanHelp')}</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-3 overflow-y-auto max-h-[calc(100vh-120px)]">
              {friendsMatchesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
                </div>
              ) : !hasFriends ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-4">{t('home.addFriendsToDiscover')}</p>
                  <Button onClick={() => { setFriendsSheetOpen(false); navigate('/friends'); }}>{t('home.addFriends')}</Button>
                </div>
              ) : friendsBadgeCount === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">{t('home.noFriendDuplicates')}</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>{t('home.sortBy')}</span>
                    <SortDropdown value={friendsSortMode} onChange={setFriendsSortMode} />
                  </div>
                  {sortedFriendMatches.map((match) => (
                    <FriendMatchCard key={match.friendId} username={match.username} matchCount={match.matchCount} duplicateTotal={match.duplicateTotal} lastActiveAt={match.lastActiveAt} onView={() => handleViewFriend(match.friendId)} />
                  ))}
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* City */}
        <Sheet open={citySheetOpen} onOpenChange={setCitySheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-14 w-14 relative border border-white/20 bg-transparent hover:bg-white/[0.08] text-[#CFE3FF]">
              <MapPin className="h-6 w-6 stroke-[2.2]" />
              {cityBadgeCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                  {cityBadgeCount > 99 ? '99+' : cityBadgeCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>{city ? t('home.peopleInCityWhoCanHelp', { city }) : t('home.localMatches')}</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-3 overflow-y-auto max-h-[calc(100vh-120px)]">
              {matchesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
                </div>
              ) : !city ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-4">{t('home.setCityToFind')}</p>
                  <Button onClick={() => { setCitySheetOpen(false); navigate('/profile'); }}>{t('home.setCity')}</Button>
                </div>
              ) : !hasCityUsers ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">{t('home.noCollectorsInCity', { city })}</p>
                </div>
              ) : usersWithMatches.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-2">{t('home.noMatchesInCity', { city })}</p>
                  <p className="text-sm text-muted-foreground">{t('home.noMatchesInCityDetail')}</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>{t('home.sortBy')}</span>
                    <SortDropdown value={citySortMode} onChange={setCitySortMode} />
                  </div>
                  {sortedCityMatches.map((match) => (
                    <FriendMatchCard key={match.userId} username={match.username} matchCount={match.matchCount} duplicateTotal={match.duplicateTotal} lastActiveAt={match.lastActiveAt} onView={() => handleViewCityUser(match.userId)} />
                  ))}
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* University */}
        <Sheet open={uniSheetOpen} onOpenChange={setUniSheetOpen}>
          <SheetTrigger asChild>
            {universityId ? (
              <Button variant="ghost" size="icon" className="rounded-full h-14 w-14 relative border border-white/20 bg-transparent hover:bg-white/[0.08] text-[#CFE3FF]">
                <GraduationCap className="h-6 w-6 stroke-[2.2]" />
                {uniBadgeCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                    {uniBadgeCount > 99 ? '99+' : uniBadgeCount}
                  </span>
                )}
              </Button>
            ) : (
              <Button variant="ghost" size="icon" className="rounded-full h-14 w-14 opacity-50 border border-white/20 bg-transparent text-[#CFE3FF]">
                <GraduationCap className="h-6 w-6 stroke-[2.2]" />
              </Button>
            )}
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>{t('home.uniWhoCanHelp')}</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-3 overflow-y-auto max-h-[calc(100vh-120px)]">
              {!universityId ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-4">{t('home.setUniToFind')}</p>
                  <Button onClick={() => { setUniSheetOpen(false); navigate('/profile'); }}>{t('home.setUniversity')}</Button>
                </div>
              ) : uniMatchesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
                </div>
              ) : uniBadgeCount === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">{t('home.noUniMatches')}</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>{t('home.sortBy')}</span>
                    <SortDropdown value={uniSortMode} onChange={setUniSortMode} />
                  </div>
                  {sortedUniMatches.map((match) => (
                    <FriendMatchCard key={match.userId} username={match.username} matchCount={match.matchCount} duplicateTotal={match.duplicateTotal} lastActiveAt={match.lastActiveAt} onView={() => handleViewUniUser(match.userId)} />
                  ))}
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Labels under icons */}
      <div className="flex items-center justify-center gap-4 -mt-4">
        <span className="w-14 text-center text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">{t('trading.friends')}</span>
        <span className="w-14 text-center text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">{t('trading.cityLabel')}</span>
        <span className="w-14 text-center text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">{t('trading.uniLabel')}</span>
      </div>

      {/* Active Trades Section */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground">
          {t('trading.activeTrades')}
        </h2>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
          </div>
        ) : activeTrades.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <p className="text-sm text-muted-foreground">
              {t('trading.noActiveTrades')}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-2">
              {t('trading.findCollectors')}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeTrades.map((trade) => (
              <Card
                key={trade.id}
                className="cursor-pointer hover:bg-accent/50 border-white/10"
                onClick={() => navigate(`/request/${trade.id}`)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <span className="font-medium text-foreground">
                      @{trade.other_user?.username ?? t('common.unknown')}
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">{t('trading.chatAvailable')}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs border border-white/20 hover:bg-white/[0.08]">
                    {t('trading.open')}
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog?.open ?? false}
        onOpenChange={(open) => !open && setConfirmDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog?.type === 'reject' ? t('trading.rejectRequest') : t('trading.cancelRequest')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog?.type === 'reject' ? t('trading.confirmReject') : t('trading.confirmCancel')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('trading.noGoBack')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>
              {confirmDialog?.type === 'reject' ? t('trading.yesReject') : t('trading.yesCancel')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Trading;
