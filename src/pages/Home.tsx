import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAlbumStats } from '@/hooks/useAlbumStats';
import { useCityMatches, sortMatches, type SortMode } from '@/hooks/useCityMatches';
import { useFriendMatches } from '@/hooks/useFriendMatches';
import { useUniversityMatches } from '@/hooks/useUniversityMatches';
import { FriendMatchCard } from '@/components/FriendMatchCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Check, Copy, Search, MapPin, GraduationCap, User } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const Home = () => {
  const navigate = useNavigate();
  const { profile, isLoading: profileLoading } = useUserProfile();
  const { stats, isLoading: statsLoading } = useAlbumStats();
  const { usersWithMatches, isLoading: matchesLoading, city, hasCityUsers } = useCityMatches();
  const { friendsWithMatches, isLoading: friendsMatchesLoading, hasFriends } = useFriendMatches();
  const { usersWithMatches: uniUsersWithMatches, isLoading: uniMatchesLoading, universityId } = useUniversityMatches();
  const [citySheetOpen, setCitySheetOpen] = useState(false);
  const [friendsSheetOpen, setFriendsSheetOpen] = useState(false);
  const [uniSheetOpen, setUniSheetOpen] = useState(false);
  const [citySortMode, setCitySortMode] = useState<SortMode>('default');
  const [friendsSortMode, setFriendsSortMode] = useState<SortMode>('default');
  const [uniSortMode, setUniSortMode] = useState<SortMode>('default');

  const sortedCityMatches = useMemo(
    () => sortMatches(usersWithMatches, citySortMode),
    [usersWithMatches, citySortMode]
  );

  const sortedFriendMatches = useMemo(
    () => sortMatches(friendsWithMatches, friendsSortMode),
    [friendsWithMatches, friendsSortMode]
  );

  const sortedUniMatches = useMemo(
    () => sortMatches(uniUsersWithMatches.map(m => ({ ...m, sameUniversity: true as const })), uniSortMode),
    [uniUsersWithMatches, uniSortMode]
  );

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

  const cityBadgeCount = usersWithMatches.length;
  const friendsBadgeCount = friendsWithMatches.length;
  const uniBadgeCount = uniUsersWithMatches.length;
  const pieData = stats ? [
    { name: 'Owned', value: stats.ownedCount, color: 'hsl(var(--primary))' },
    { name: 'Missing', value: stats.missingCount, color: 'hsl(var(--muted))' },
  ] : [];

  const SortDropdown = ({ value, onChange }: { value: SortMode; onChange: (v: SortMode) => void }) => (
    <Select value={value} onValueChange={(v) => onChange(v as SortMode)}>
      <SelectTrigger className="w-auto h-7 text-xs px-2.5 gap-1 border-none bg-muted/50">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="default">Default</SelectItem>
        <SelectItem value="most_active">Most active</SelectItem>
      </SelectContent>
    </Select>
  );

  return (
    <div className="flex flex-col p-4 space-y-4 relative">
      {/* Header Row */}
      <div className="w-full flex items-center justify-between">
        {/* Profile Button - Top Left */}
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-12 w-12"
          onClick={() => navigate('/profile')}
        >
          <User className="h-5 w-5" />
        </Button>

        {/* Center Title */}
        <h1 className="text-lg font-semibold text-foreground">Progress</h1>

        {/* Right Helper Buttons */}
        <div className="flex items-center gap-2">
        {/* Friends Helpers Button */}
        <Sheet open={friendsSheetOpen} onOpenChange={setFriendsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full h-12 w-12 relative">
              <Users className="h-5 w-5" />
              {friendsBadgeCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                  {friendsBadgeCount > 99 ? '99+' : friendsBadgeCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Friends Who Can Help</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-3 overflow-y-auto max-h-[calc(100vh-120px)]">
              {friendsMatchesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="w-full">
                      <CardContent className="flex items-center gap-3 py-4 px-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : !hasFriends ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-4">Add friends to discover who can help!</p>
                  <Button onClick={() => { setFriendsSheetOpen(false); navigate('/friends'); }}>Add Friends</Button>
                </div>
              ) : friendsBadgeCount === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No friend duplicates match your needs yet.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>Sort by:</span>
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

        {/* City Helpers Button */}
        <Sheet open={citySheetOpen} onOpenChange={setCitySheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full h-12 w-12 relative">
              <MapPin className="h-5 w-5" />
              {cityBadgeCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                  {cityBadgeCount > 99 ? '99+' : cityBadgeCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>{city ? `People in ${city} Who Can Help` : 'Local Matches'}</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-3 overflow-y-auto max-h-[calc(100vh-120px)]">
              {matchesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="w-full">
                      <CardContent className="flex items-center gap-3 py-4 px-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : !city ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-4">Set your city in your profile to find local collectors!</p>
                  <Button onClick={() => { setCitySheetOpen(false); navigate('/profile'); }}>Set City</Button>
                </div>
              ) : !hasCityUsers ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No other collectors in {city} yet. Spread the word!</p>
                </div>
              ) : usersWithMatches.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-2">No matches yet in {city}.</p>
                  <p className="text-sm text-muted-foreground">Collectors in your city haven't marked duplicates that match what you need.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>Sort by:</span>
                    <SortDropdown value={citySortMode} onChange={setCitySortMode} />
                  </div>
                  {sortedCityMatches.map((match) => (
                    <FriendMatchCard
                      key={match.userId}
                      username={match.username}
                      matchCount={match.matchCount}
                      duplicateTotal={match.duplicateTotal}
                      lastActiveAt={match.lastActiveAt}
                      onView={() => handleViewCityUser(match.userId)}
                    />
                  ))}
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
        {/* University Helpers Button */}
        <Sheet open={uniSheetOpen} onOpenChange={setUniSheetOpen}>
          <SheetTrigger asChild>
            {universityId ? (
              <Button variant="outline" size="icon" className="rounded-full h-12 w-12 relative">
                <GraduationCap className="h-5 w-5" />
                {uniBadgeCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                    {uniBadgeCount > 99 ? '99+' : uniBadgeCount}
                  </span>
                )}
              </Button>
            ) : (
              <Button variant="outline" size="icon" className="rounded-full h-12 w-12 opacity-50">
                <GraduationCap className="h-5 w-5" />
              </Button>
            )}
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>People at Your University Who Can Help</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-3 overflow-y-auto max-h-[calc(100vh-120px)]">
              {!universityId ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-4">Set your university in your profile to find classmates!</p>
                  <Button onClick={() => { setUniSheetOpen(false); navigate('/profile'); }}>Set University</Button>
                </div>
              ) : uniMatchesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="w-full">
                      <CardContent className="flex items-center gap-3 py-4 px-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : uniBadgeCount === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No university matches yet. Spread the word!</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>Sort by:</span>
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
      </div>

      {/* Hero Card with Pie Chart */}
      <div className="w-full">
        {statsLoading ? (
          <Card className="w-full hero-gradient border-0">
            <CardContent className="py-8 relative z-10">
              <div className="flex flex-col items-center">
                <Skeleton className="h-48 w-48 rounded-full bg-white/10" />
              </div>
            </CardContent>
          </Card>
        ) : stats ? (
          <Card className="w-full hero-gradient border-0 rounded-2xl">
            <CardContent className="pt-7 pb-6 relative z-10">
              {profileLoading ? (
                <Skeleton className="h-4 w-24 mx-auto mb-3 bg-white/20" />
              ) : profile?.username ? (
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50 text-center mb-3">@{profile.username}</p>
              ) : null}
              <div className="relative">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={72} outerRadius={110} paddingAngle={3} dataKey="value" strokeWidth={2} stroke="hsl(45 80% 55% / 0.15)" animationBegin={0} animationDuration={900} animationEasing="ease-out">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#B794F4' : 'rgba(255,255,255,0.06)'} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[3.25rem] font-black text-white tracking-tight leading-none">{stats.completionPercent.toFixed(1)}%</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/45 mt-1.5">Complete</span>
                </div>
              </div>
              <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35 mt-2">
                {stats.ownedCount} of {stats.totalStickers} stickers
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>

      {/* Stats Row Card */}
      <div className="w-full">
        {statsLoading ? (
          <Card className="w-full">
            <CardContent className="py-5">
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col items-center">
                    <Skeleton className="h-6 w-12 mb-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : stats ? (
          <Card className="w-full border-0 bg-secondary/80 rounded-2xl">
            <CardContent className="py-5">
              <div className="grid grid-cols-3 divide-x divide-border/40">
                <div className="flex flex-col items-center gap-1 px-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-2xl font-black text-emerald-400">{stats.ownedCount}</span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Owned</span>
                </div>
                <div className="flex flex-col items-center gap-1 px-2">
                  <Search className="w-4 h-4 text-orange-400" />
                  <span className="text-2xl font-black text-foreground">{stats.missingCount}</span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Missing</span>
                </div>
                <div className="flex flex-col items-center gap-1 px-2">
                  <Copy className="w-4 h-4 text-primary" />
                  <span className="text-2xl font-black text-primary">{stats.duplicateCount}</span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Dupes</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
};

export default Home;
