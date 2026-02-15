import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAlbumStats } from '@/hooks/useAlbumStats';
import { useCityMatches } from '@/hooks/useCityMatches';
import { FriendMatchCard } from '@/components/FriendMatchCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Users, Check, Copy, Search, MapPin } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const Home = () => {
  const navigate = useNavigate();
  const { profile, isLoading: profileLoading } = useUserProfile();
  const { stats, isLoading: statsLoading } = useAlbumStats();
  const { usersWithMatches, isLoading: matchesLoading, city, hasCityUsers } = useCityMatches();
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleViewUser = (userId: string) => {
    setSheetOpen(false);
    navigate(`/friend/${userId}`);
  };

  const badgeCount = usersWithMatches.length;

  // Pie chart data
  const pieData = stats ? [
    { name: 'Owned', value: stats.ownedCount, color: 'hsl(var(--primary))' },
    { name: 'Missing', value: stats.missingCount, color: 'hsl(var(--muted))' },
  ] : [];

  return (
    <div className="flex flex-col items-center p-6 space-y-6 relative">
      {/* City Matches Button - Top Right */}
      <div className="absolute top-4 right-4">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-12 w-12 relative"
            >
              <MapPin className="h-5 w-5" />
              {badgeCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                  {badgeCount > 99 ? '99+' : badgeCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>
                {city ? `People in ${city} Who Can Help` : 'Local Matches'}
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-3 overflow-y-auto max-h-[calc(100vh-120px)]">
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
                  <p className="text-muted-foreground mb-4">
                    Set your city in your profile to find local collectors!
                  </p>
                  <Button onClick={() => { setSheetOpen(false); navigate('/profile'); }}>
                    Set City
                  </Button>
                </div>
              ) : !hasCityUsers ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    No other collectors in {city} yet. Spread the word!
                  </p>
                </div>
              ) : usersWithMatches.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-2">
                    No matches yet in {city}.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Collectors in your city haven't marked duplicates that match what you need.
                  </p>
                </div>
              ) : (
                usersWithMatches.map((match) => (
                  <FriendMatchCard
                    key={match.userId}
                    username={match.username}
                    matchCount={match.matchCount}
                    lastActiveAt={match.lastActiveAt}
                    onView={() => handleViewUser(match.userId)}
                  />
                ))
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Welcome Header */}
      <div className="text-center space-y-2 pt-8">
        <h1 className="text-2xl font-bold text-foreground">
          {profileLoading ? (
            <Skeleton className="h-8 w-40 mx-auto" />
          ) : profile?.username ? (
            `@${profile.username}`
          ) : (
            'Your Progress'
          )}
        </h1>
      </div>

      {/* Pie Chart */}
      <div className="w-full max-w-xs">
        {statsLoading ? (
          <div className="flex items-center justify-center h-48">
            <Skeleton className="h-40 w-40 rounded-full" />
          </div>
        ) : stats ? (
          <div className="relative">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-foreground">
                {stats.completionPercent.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">Complete</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Stats Row */}
      <div className="w-full max-w-md">
        {statsLoading ? (
          <Card className="w-full">
            <CardContent className="py-4">
              <div className="grid grid-cols-3 gap-3">
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
          <Card className="w-full">
            <CardContent className="py-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center p-3 rounded-lg bg-secondary/50">
                  <Check className="w-5 h-5 text-green-600 mb-1" />
                  <span className="text-2xl font-bold text-foreground">{stats.ownedCount}</span>
                  <span className="text-xs text-muted-foreground">Have</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-lg bg-secondary/50">
                  <Search className="w-5 h-5 text-orange-600 mb-1" />
                  <span className="text-2xl font-bold text-foreground">{stats.missingCount}</span>
                  <span className="text-xs text-muted-foreground">Missing</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-lg bg-secondary/50">
                  <Copy className="w-5 h-5 text-blue-600 mb-1" />
                  <span className="text-2xl font-bold text-foreground">{stats.duplicateCount}</span>
                  <span className="text-xs text-muted-foreground">Duplicates</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>

      {/* Legend */}
      {stats && (
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span>Owned ({stats.ownedCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-muted" />
            <span>Missing ({stats.missingCount})</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
