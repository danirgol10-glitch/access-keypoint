import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { NotificationsSection } from '@/components/NotificationsSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LogOut } from 'lucide-react';

const Profile = () => {
  const { signOut } = useAuth();
  const { profile, isLoading: profileLoading } = useUserProfile();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex flex-col items-center p-6 space-y-6 pb-24">
      {/* User info card */}
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-1">
            {profileLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-32 mx-auto" />
                <Skeleton className="h-4 w-48 mx-auto" />
              </div>
            ) : (
              <>
                <p className="text-xl font-semibold text-foreground">
                  @{profile?.username ?? 'unknown'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {profile?.email}
                </p>
              </>
            )}
          </div>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* Notifications section */}
      <div className="w-full max-w-md">
        <NotificationsSection />
      </div>
    </div>
  );
};

export default Profile;
