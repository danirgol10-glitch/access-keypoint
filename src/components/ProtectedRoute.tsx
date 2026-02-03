import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [checkingUsername, setCheckingUsername] = useState(true);
  const [hasUsername, setHasUsername] = useState<boolean | null>(null);

  useEffect(() => {
    const checkUsername = async () => {
      if (!user) {
        setCheckingUsername(false);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error checking username:', error);
        setHasUsername(false);
      } else {
        setHasUsername(data?.username !== null);
      }
      setCheckingUsername(false);
    };

    if (user) {
      checkUsername();
    } else {
      setCheckingUsername(false);
    }
  }, [user]);

  if (loading || checkingUsername) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If user doesn't have a username and isn't on the onboarding page, redirect
  if (hasUsername === false && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
