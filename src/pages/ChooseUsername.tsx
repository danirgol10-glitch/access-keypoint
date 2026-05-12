import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUniversities } from '@/hooks/useUniversities';
import { COLOMBIAN_CITIES } from '@/constants/cities';
import { AppCard } from '@/components/ui/app-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const usernameSchema = z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be at most 20 characters').regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed');

const ChooseUsername = () => {
  const [username, setUsername] = useState('');
  const [city, setCity] = useState('');
  const [universityId, setUniversityId] = useState<string>('none');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const { profile, refetchProfile } = useUserProfile();
  const { universities, isLoading: uniLoading } = useUniversities(city || null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCityChange = (newCity: string) => { setCity(newCity); setUniversityId('none'); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUsername = username.trim().toLowerCase();
    const validation = usernameSchema.safeParse(trimmedUsername);
    if (!validation.success) { toast({ variant: 'destructive', title: t('setup.invalidUsername'), description: validation.error.errors[0].message }); return; }
    if (!city) { toast({ variant: 'destructive', title: t('setup.cityRequired'), description: t('setup.selectCity') }); return; }
    if (!user) { toast({ variant: 'destructive', title: t('common.error'), description: t('auth.unexpectedError') }); return; }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('users').upsert({ id: user.id, email: user.email!, username: trimmedUsername, city, university_id: universityId === 'none' ? null : universityId }, { onConflict: 'id' });
      if (error) { if (error.code === '23505') toast({ variant: 'destructive', title: t('setup.usernameTaken'), description: t('setup.usernameTakenDesc') }); else toast({ variant: 'destructive', title: t('common.error'), description: error.message }); setIsSubmitting(false); return; }
      await refetchProfile();
      toast({ title: t('setup.welcome'), description: t('setup.usernameSet', { username: trimmedUsername }) });
      setTimeout(() => navigate('/', { replace: true }), 500);
    } catch { toast({ variant: 'destructive', title: t('common.error'), description: t('auth.unexpectedError') }); setIsSubmitting(false); }
  };

  return (
    <div className="app-screen page-bg safe-auth-screen relative flex items-center justify-center overflow-x-hidden overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
      <div className="page-vignette" />
      <div className="relative z-20 w-full max-w-md space-y-4">
        <Button
          type="button"
          variant="ghost"
          onClick={async () => { await signOut(); navigate('/auth', { replace: true }); }}
          className="min-h-11 px-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />{t('setup.back')}
        </Button>

        <AppCard variant="hero" className="space-y-2 p-5 text-center">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full border border-[var(--trade-green-border)] bg-[var(--trade-green-soft)] text-xl font-black text-primary shadow-glow">
            @
          </div>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)]">{t('setup.title')}</h1>
          <p className="text-sm leading-5 text-[var(--text-secondary)]">{t('setup.subtitle')}</p>
        </AppCard>

        <AppCard className="space-y-6 p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">{t('setup.username')}</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-semibold text-[var(--text-muted)]">@</span>
                <Input
                  type="text"
                  placeholder={t('setup.usernamePlaceholder')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  className="pl-8"
                  maxLength={20}
                />
              </div>
              <p className="text-[11px] leading-5 text-[var(--text-hint)]">{t('setup.usernameHint')}</p>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">{t('setup.city')}</label>
              <Select value={city} onValueChange={handleCityChange}>
                <SelectTrigger className="min-h-11">
                  <SelectValue placeholder={t('setup.cityPlaceholder')} />
                </SelectTrigger>
                <SelectContent>{COLOMBIAN_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">{t('setup.university')}</label>
              <Select value={universityId} onValueChange={setUniversityId} disabled={!city || uniLoading}>
                <SelectTrigger className="min-h-11">
                  <SelectValue placeholder={!city ? t('setup.uniCityFirst') : t('setup.uniPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('setup.noneStudent')}</SelectItem>
                  {universities.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting || username.length < 3 || !city}>
              {isSubmitting ? t('setup.saving') : t('setup.continue')}
            </Button>
          </form>
        </AppCard>
      </div>
    </div>
  );
};

export default ChooseUsername;
