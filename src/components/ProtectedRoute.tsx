import { useEffect, useRef, useState } from 'react';
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
  const [creatingRow, setCreatingRow] = useState(false);
  const attemptedRef = useRef(false);

  // Auto-create user row if auth exists but profile row is missing
  useEffect(() => {
    if (!user || profileLoading || profile || attemptedRef.current) return;
    attemptedRef.current = true;
    setCreatingRow(true);
    supabase
      .from('users')
      .upsert({ id: user.id, email: user.email! }, { onConflict: 'id' })
      .then(({ error }) => {
        if (error) console.error('Auto-create user row failed:', error);
        refetchProfile().finally(() => setCreatingRow(false));
      });
  }, [user, profileLoading, profile, refetchProfile]);

  // Reset ref if user changes (logout → login as different user)
  useEffect(() => {
    attemptedRef.current = false;
  }, [user?.id]);

  // Still loading
  if (authLoading || (user && profileLoading) || creatingRow) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

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
