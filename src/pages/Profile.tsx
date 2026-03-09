import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUniversities } from '@/hooks/useUniversities';
import { useLanguage, type Language } from '@/contexts/LanguageContext';
import { useTheme, THEMES, type AppTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { COLOMBIAN_CITIES } from '@/constants/cities';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Check } from 'lucide-react';

const Profile = () => {
  const { user, signOut } = useAuth();
  const { profile, isLoading: profileLoading, refetchProfile } = useUserProfile();
  const { universities, isLoading: uniLoading } = useUniversities(profile?.city ?? null);
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [savingCity, setSavingCity] = useState(false);
  const [savingUni, setSavingUni] = useState(false);

  const handleSignOut = async () => { await signOut(); };

  const handleCityChange = async (value: string) => {
    if (!user) return;
    setSavingCity(true);
    const needsUniReset = profile?.city !== value && profile?.university_id;
    const updateData: Record<string, unknown> = { city: value };
    if (needsUniReset) updateData.university_id = null;
    const { error } = await supabase.from('users').update(updateData).eq('id', user.id);
    if (error) toast({ variant: 'destructive', title: 'Error', description: error.message });
    else await refetchProfile();
    setSavingCity(false);
  };

  const handleUniversityChange = async (value: string) => {
    if (!user) return;
    setSavingUni(true);
    const uniId = value === 'none' ? null : value;
    const { error } = await supabase.from('users').update({ university_id: uniId }).eq('id', user.id);
    if (error) toast({ variant: 'destructive', title: 'Error', description: error.message });
    else await refetchProfile();
    setSavingUni(false);
  };

  return (
    <div className="relative px-4 pt-14 pb-28 max-w-md mx-auto">
      <div className="page-vignette" />
      <div className="relative z-20 space-y-6">
        <div className="text-center mb-2">
          <h1 className="text-[22px] font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>{t('nav.progress')}</h1>
          {profileLoading ? (
            <Skeleton className="h-5 w-36 mx-auto mt-2" style={{ background: 'var(--surface-skeleton)' }} />
          ) : (
            <p className="text-[15px] font-semibold mt-2" style={{ color: 'var(--text-primary)' }}>@{profile?.username ?? 'unknown'}</p>
          )}
        </div>

        <div className="premium-panel premium-panel-gold p-4 space-y-3">
          <label className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>{t('profile.city')}</label>
          <Select value={profile?.city ?? ''} onValueChange={handleCityChange} disabled={savingCity || profileLoading}>
            <SelectTrigger className="w-full h-12 text-sm rounded-xl" style={{ background: 'var(--surface-input)', border: '1px solid var(--surface-input-border)', color: 'var(--text-primary)' }}>
              <SelectValue placeholder={t('profile.addCity')} />
            </SelectTrigger>
            <SelectContent>{COLOMBIAN_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="premium-panel p-4 space-y-3">
          <label className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>{t('profile.university')}</label>
          <Select value={profile?.university_id ?? 'none'} onValueChange={handleUniversityChange} disabled={savingUni || uniLoading || !profile?.city}>
            <SelectTrigger className="w-full h-12 text-sm rounded-xl" style={{ background: 'var(--surface-input)', border: '1px solid var(--surface-input-border)', color: 'var(--text-primary)' }}>
              <SelectValue placeholder={!profile?.city ? t('profile.setCityFirst') : t('profile.addUniversity')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t('profile.noneStudent')}</SelectItem>
              {universities.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {!profile?.city && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('profile.setCityFirst')}</p>}
        </div>

        <div className="premium-panel p-4 space-y-3">
          <label className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>{t('profile.theme')}</label>
          <div className="grid grid-cols-2 gap-3">
            {THEMES.map((t_item) => {
              const isActive = theme === t_item.id;
              return (
                <button key={t_item.id} onClick={() => setTheme(t_item.id)}
                  className="relative rounded-2xl p-3 text-left transition-all duration-200 active:scale-[0.97]"
                  style={{ background: t_item.preview.bg, border: isActive ? `2px solid ${t_item.preview.accent}` : '2px solid var(--surface-card-border)' }}>
                  {isActive && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: t_item.preview.accent }}>
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className="flex gap-1.5 mb-2">
                    <div className="w-4 h-4 rounded-md" style={{ background: t_item.preview.card }} />
                    <div className="w-4 h-4 rounded-md" style={{ background: t_item.preview.accent }} />
                  </div>
                  <span className="text-[11px] font-bold" style={{ color: t_item.id === 'world-cup-2026' ? '#1A1A1A' : 'rgba(255,255,255,0.9)' }}>
                    {language === 'es' ? t_item.labelEs : t_item.labelEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="premium-panel p-4 space-y-3">
          <label className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>{t('profile.language')}</label>
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--surface-input-border)' }}>
            <button onClick={() => setLanguage('en')} className="flex-1 py-3 text-sm font-medium transition-colors"
              style={language === 'en' ? { background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-hover)))', color: '#FFFFFF' } : { background: 'var(--surface-card)', color: 'var(--text-secondary)' }}>
              English
            </button>
            <button onClick={() => setLanguage('es')} className="flex-1 py-3 text-sm font-medium transition-colors"
              style={language === 'es' ? { background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-hover)))', color: '#FFFFFF' } : { background: 'var(--surface-card)', color: 'var(--text-secondary)' }}>
              Español
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button onClick={handleSignOut}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all duration-150 active:scale-[0.98]"
            style={{ background: 'var(--surface-card)', border: '1px solid rgba(239,68,68,0.3)', color: 'hsl(0, 84%, 60%)' }}>
            <LogOut className="w-4 h-4" />
            {t('profile.logout')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
