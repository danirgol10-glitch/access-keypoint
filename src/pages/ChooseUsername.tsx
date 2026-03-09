import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUniversities } from '@/hooks/useUniversities';
import { COLOMBIAN_CITIES } from '@/constants/cities';
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
    <div className="flex min-h-screen items-center justify-center page-bg p-4">
      <div className="w-full max-w-md premium-panel premium-panel-gold p-6 space-y-6">
        <div className="relative text-center space-y-1">
          <button type="button" onClick={async () => { await signOut(); navigate('/auth', { replace: true }); }}
            className="absolute left-0 top-0 flex items-center gap-1 text-xs transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
            <ArrowLeft className="h-3.5 w-3.5" />{t('setup.back')}
          </button>
          <h1 className="text-[22px] font-bold" style={{ color: 'var(--text-primary)' }}>{t('setup.title')}</h1>
          <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{t('setup.subtitle')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>{t('setup.username')}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>@</span>
              <input type="text" placeholder={t('setup.usernamePlaceholder')} value={username} onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                className="w-full h-11 pl-8 pr-4 text-[14px] rounded-xl outline-none"
                style={{ background: 'var(--surface-input)', border: '1px solid var(--surface-input-border)', color: 'var(--text-primary)' }} maxLength={20} />
            </div>
            <p className="text-[11px]" style={{ color: 'var(--text-hint)' }}>{t('setup.usernameHint')}</p>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>{t('setup.city')}</label>
            <Select value={city} onValueChange={handleCityChange}>
              <SelectTrigger className="h-11 rounded-xl" style={{ background: 'var(--surface-input)', border: '1px solid var(--surface-input-border)', color: 'var(--text-primary)' }}>
                <SelectValue placeholder={t('setup.cityPlaceholder')} />
              </SelectTrigger>
              <SelectContent>{COLOMBIAN_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>{t('setup.university')}</label>
            <Select value={universityId} onValueChange={setUniversityId} disabled={!city || uniLoading}>
              <SelectTrigger className="h-11 rounded-xl" style={{ background: 'var(--surface-input)', border: '1px solid var(--surface-input-border)', color: 'var(--text-primary)' }}>
                <SelectValue placeholder={!city ? t('setup.uniCityFirst') : t('setup.uniPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('setup.noneStudent')}</SelectItem>
                {universities.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <button type="submit" className="w-full h-11 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-50 btn-themed"
            disabled={isSubmitting || username.length < 3 || !city}>
            {isSubmitting ? t('setup.saving') : t('setup.continue')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChooseUsername;
