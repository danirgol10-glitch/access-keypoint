import { useUserProfile } from '@/hooks/useUserProfile';

const Home = () => {
  const { profile, isLoading } = useUserProfile();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] p-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">
          {isLoading ? (
            'Loading...'
          ) : profile?.username ? (
            `Welcome, @${profile.username}`
          ) : (
            'Welcome'
          )}
        </h1>
      </div>
    </div>
  );
};

export default Home;
