import { useUserProfile } from '@/hooks/useUserProfile';
import { useAlbumStats } from '@/hooks/useAlbumStats';
import { AlbumStatsCard } from '@/components/AlbumStatsCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const Home = () => {
  const { profile, isLoading: profileLoading } = useUserProfile();
  const { stats, isLoading: statsLoading } = useAlbumStats();

  return (
    <div className="flex flex-col items-center p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          {profileLoading ? (
            <Skeleton className="h-9 w-48 mx-auto" />
          ) : profile?.username ? (
            `Welcome, @${profile.username}`
          ) : (
            'Welcome'
          )}
        </h1>
      </div>

      {/* Compact stats card */}
      <div className="w-full max-w-md">
        {statsLoading ? (
          <Card className="w-full">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-12" />
              </div>
              <Skeleton className="h-2 w-full" />
              <div className="flex justify-between mt-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
              </div>
            </CardContent>
          </Card>
        ) : stats ? (
          <AlbumStatsCard stats={stats} compact />
        ) : null}
      </div>
    </div>
  );
};

export default Home;
