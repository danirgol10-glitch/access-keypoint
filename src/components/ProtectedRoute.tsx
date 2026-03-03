import { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const { profile, isLoading: profileLoading, refetchProfile } = useUserProfile();
  const ensuredRef = useRef(false);

  // Auto-create user row if auth exists but profile row is missing
  useEffect(() => {
    if (!user || profileLoading || profile || ensuredRef.current) return;
    ensuredRef.current = true;
    supabase
      .from('users')
      .upsert({ id: user.id, email: user.email! }, { onConflict: 'id' })
      .then(({ error }) => {
        if (error) console.error('Auto-create user row failed:', error);
        refetchProfile();
      });
  }, [user, profileLoading, profile, refetchProfile]);

  // Still loading auth or profile, or creating missing row
  if (authLoading || (user && profileLoading) || (user && !profile && !ensuredRef.current)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Profile row exists but no username → onboarding
  const hasUsername = !!profile?.username;

  if (!hasUsername && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (hasUsername && location.pathname === '/onboarding') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
