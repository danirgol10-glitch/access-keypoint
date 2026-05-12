import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { AppCard } from '@/components/ui/app-card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { LegalModal } from '@/components/LegalContent';

const authSchema = z.object({ email: z.string().email('Please enter a valid email address'), password: z.string().min(6, 'Password must be at least 6 characters') });

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | null>(null);
  const { user, loading, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  if (!loading && user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && !acceptedTerms) {
      toast({ variant: 'destructive', title: t('common.error'), description: t('auth.mustAcceptTerms') });
      return;
    }
    setIsSubmitting(true);
    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) { toast({ variant: 'destructive', title: t('auth.validationError'), description: validation.error.errors[0].message }); setIsSubmitting(false); return; }
    try {
      if (isLogin) { const { error } = await signIn(email, password); if (error) toast({ variant: 'destructive', title: t('auth.loginFailed'), description: error.message === 'Invalid login credentials' ? t('auth.invalidCredentials') : error.message }); }
      else { const { error } = await signUp(email, password); if (error) toast({ variant: 'destructive', title: error.message.includes('already registered') ? t('auth.accountExists') : t('auth.signUpFailed'), description: error.message.includes('already registered') ? t('auth.alreadyRegistered') : error.message }); else toast({ title: t('auth.checkEmail'), description: t('auth.confirmationSent') }); }
    } catch { toast({ variant: 'destructive', title: t('common.error'), description: t('auth.unexpectedError') }); }
    finally { setIsSubmitting(false); }
  };

  if (loading) return (
    <div className="app-screen page-bg safe-auth-screen relative flex items-center justify-center">
      <div className="page-vignette" />
      <AppCard variant="hero" className="relative z-20 w-full max-w-md space-y-4 p-6 text-center">
        <Skeleton className="mx-auto h-12 w-12 rounded-full bg-[var(--surface-skeleton)]" />
        <div className="animate-pulse text-sm font-medium text-[var(--text-secondary)]">{t('auth.loading')}</div>
      </AppCard>
    </div>
  );

  return (
    <div className="app-screen page-bg safe-auth-screen relative flex items-center justify-center overflow-x-hidden overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
      <div className="page-vignette" />
      <div className="relative z-20 w-full max-w-md space-y-4">
        <AppCard variant="hero" className="p-5 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full border border-[var(--trade-green-border)] bg-[var(--trade-green-soft)] text-xl font-black text-primary shadow-glow">
            11
          </div>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)]">{isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}</h1>
          <p className="mt-2 text-sm leading-5 text-[var(--text-secondary)]">{isLogin ? t('auth.loginSubtitle') : t('auth.signupSubtitle')}</p>
        </AppCard>

        <AppCard className="space-y-6 p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">{t('auth.email')}</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">{t('auth.password')}</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
            </div>

            {!isLogin && (
              <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--surface-border)] bg-[var(--surface-input)] p-3">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                  className="mt-0.5"
                />
                <label htmlFor="terms" className="cursor-pointer text-[12px] leading-relaxed text-[var(--text-secondary)]">
                  {t('auth.acceptTermsPrefix')}{' '}
                  <button type="button" onClick={() => setLegalModal('terms')} className="font-semibold text-primary underline-offset-4 hover:underline">
                    {t('auth.termsLink')}
                  </button>{' '}
                  {t('auth.and')}{' '}
                  <button type="button" onClick={() => setLegalModal('privacy')} className="font-semibold text-primary underline-offset-4 hover:underline">
                    {t('auth.privacyLink')}
                  </button>
                </label>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting || (!isLogin && !acceptedTerms)}>
              {isSubmitting ? t('auth.pleaseWait') : isLogin ? t('auth.signIn') : t('auth.signUp')}
            </Button>
          </form>

          <div className="text-center">
            <Button type="button" variant="ghost" onClick={() => setIsLogin(!isLogin)} className="w-full">
              {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
            </Button>
          </div>
        </AppCard>
      </div>

      {legalModal && <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />}
    </div>
  );
};

export default Auth;
