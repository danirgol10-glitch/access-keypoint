import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut } from 'lucide-react';

const Profile = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium text-foreground">{user?.email}</p>
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
    </div>
  );
};

export default Profile;
