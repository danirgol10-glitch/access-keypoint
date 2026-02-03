import { useAuth } from '@/contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] p-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Welcome</h1>
        <p className="text-muted-foreground">
          You're logged in{user?.email ? ` as ${user.email}` : ''}.
        </p>
      </div>
    </div>
  );
};

export default Home;
