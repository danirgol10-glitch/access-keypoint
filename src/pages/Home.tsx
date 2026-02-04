import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAlbumStats } from '@/hooks/useAlbumStats';
import { useFriendMatches } from '@/hooks/useFriendMatches';
import { AlbumStatsCard } from '@/components/AlbumStatsCard';
import { FriendMatchCard } from '@/components/FriendMatchCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Users, AlertCircle } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { profile, isLoading: profileLoading } = useUserProfile();
  const { stats, isLoading: statsLoading } = useAlbumStats();
  const { friendMatches, isLoading: matchesLoading, hasFriends, anyFriendHasDuplicates } = useFriendMatches();

  const handleViewFriend = (friendId: string) => {
    navigate(`/friend/${friendId}`);
  };

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

      {/* Friend Matches Section */}
      <div className="w-full max-w-md space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Friends Who Can Help</h2>
        
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
        ) : !hasFriends ? (
          // No friends - show CTA to add friends
          <Card className="w-full">
            <CardContent className="flex flex-col items-center py-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">
                Add friends to see who can help complete your album!
              </p>
              <Button asChild>
                <Link to="/profile">Add Friends</Link>
              </Button>
            </CardContent>
          </Card>
        ) : !anyFriendHasDuplicates ? (
          // Friends exist but no duplicates marked
          <Card className="w-full">
            <CardContent className="flex flex-col items-center py-8 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                No friend duplicates yet. Tell your friends to mark their duplicate stickers!
              </p>
            </CardContent>
          </Card>
        ) : (
          // Show ranked friend list
          <div className="space-y-3">
            {friendMatches.map((friend) => (
              <FriendMatchCard
                key={friend.friendId}
                username={friend.username}
                matchCount={friend.matchCount}
                onView={() => handleViewFriend(friend.friendId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
