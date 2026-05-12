import { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { AppCard } from '@/components/ui/app-card';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
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
      <div className="app-screen page-bg safe-auth-screen relative flex items-center justify-center overflow-hidden px-4">
        <div className="page-vignette" />
        <AppCard variant="hero" className="relative z-20 w-full max-w-md space-y-4 p-6 text-center">
          <Skeleton className="mx-auto h-12 w-12 rounded-full bg-[var(--surface-skeleton)]" />
          <div className="animate-pulse text-sm font-medium text-[var(--text-secondary)]">{t('auth.loading')}</div>
        </AppCard>
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
