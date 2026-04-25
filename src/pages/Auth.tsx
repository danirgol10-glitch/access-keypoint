import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Checkbox } from '@/components/ui/checkbox';
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

  if (loading) return <div className="app-screen flex items-center justify-center page-bg"><div className="animate-pulse" style={{ color: 'var(--text-secondary)' }}>{t('auth.loading')}</div></div>;

  return (
    <div className="app-screen flex items-center justify-center page-bg p-4">
      <div className="w-full max-w-md premium-panel premium-panel-gold p-6 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-[22px] font-bold" style={{ color: 'var(--text-primary)' }}>{isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}</h1>
          <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{isLogin ? t('auth.loginSubtitle') : t('auth.signupSubtitle')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>{t('auth.email')}</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
              className="w-full h-11 px-4 text-base rounded-xl outline-none transition-all duration-200"
              style={{ background: 'var(--surface-input)', border: '1px solid var(--surface-input-border)', color: 'var(--text-primary)' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--input-focus-color)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--surface-input-border)'; }} />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>{t('auth.password')}</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete={isLogin ? 'current-password' : 'new-password'}
              className="w-full h-11 px-4 text-base rounded-xl outline-none transition-all duration-200"
              style={{ background: 'var(--surface-input)', border: '1px solid var(--surface-input-border)', color: 'var(--text-primary)' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--input-focus-color)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--surface-input-border)'; }} />
          </div>

          {!isLogin && (
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                className="mt-0.5"
              />
              <label htmlFor="terms" className="text-[12px] leading-relaxed cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                {t('auth.acceptTermsPrefix')}{' '}
                <button type="button" onClick={() => setLegalModal('terms')} className="underline font-medium" style={{ color: 'hsl(var(--primary))' }}>
                  {t('auth.termsLink')}
                </button>{' '}
                {t('auth.and')}{' '}
                <button type="button" onClick={() => setLegalModal('privacy')} className="underline font-medium" style={{ color: 'hsl(var(--primary))' }}>
                  {t('auth.privacyLink')}
                </button>
              </label>
            </div>
          )}

          <button type="submit" className="w-full h-11 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-50 btn-themed" disabled={isSubmitting || (!isLogin && !acceptedTerms)}>
            {isSubmitting ? t('auth.pleaseWait') : isLogin ? t('auth.signIn') : t('auth.signUp')}
          </button>
        </form>
        <div className="text-center">
          <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}>
            {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
          </button>
        </div>
      </div>

      {legalModal && <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />}
    </div>
  );
};

export default Auth;
