import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUniversities } from '@/hooks/useUniversities';
import { useLanguage, type Language } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { COLOMBIAN_CITIES } from '@/constants/cities';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { LogOut } from 'lucide-react';

const Profile = () => {
  const { user, signOut } = useAuth();
  const { profile, isLoading: profileLoading, refetchProfile } = useUserProfile();
  const { universities, isLoading: uniLoading } = useUniversities(profile?.city ?? null);
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();
  const [savingCity, setSavingCity] = useState(false);
  const [savingUni, setSavingUni] = useState(false);

  const handleSignOut = async () => { await signOut(); };

  const handleCityChange = async (value: string) => {
    if (!user) return;
    setSavingCity(true);
    const oldCity = profile?.city;
    const needsUniReset = oldCity !== value && profile?.university_id;
    const updateData: Record<string, unknown> = { city: value };
    if (needsUniReset) updateData.university_id = null;
    const { error } = await supabase.from('users').update(updateData).eq('id', user.id);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      await refetchProfile();
    }
    setSavingCity(false);
  };

  const handleUniversityChange = async (value: string) => {
    if (!user) return;
    setSavingUni(true);
    const uniId = value === 'none' ? null : value;
    const { error } = await supabase.from('users').update({ university_id: uniId }).eq('id', user.id);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      await refetchProfile();
    }
    setSavingUni(false);
  };

  return (
    <div className="relative px-4 pt-14 pb-28 max-w-md mx-auto">
      <div className="page-vignette" />

      <div className="relative z-20 space-y-6">
        {/* Header */}
        <div className="text-center mb-2">
          <h1 className="text-[22px] font-bold tracking-wide" style={{ color: '#FFFFFF' }}>{t('nav.progress')}</h1>
          {profileLoading ? (
            <Skeleton className="h-5 w-36 mx-auto mt-2" style={{ background: 'rgba(255,255,255,0.06)' }} />
          ) : (
            <p className="text-[15px] font-semibold mt-2" style={{ color: 'rgba(255,255,255,0.85)' }}>@{profile?.username ?? 'unknown'}</p>
          )}
        </div>

        {/* City */}
        <div className="premium-panel premium-panel-gold p-4 space-y-3">
          <label className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {t('profile.city')}
          </label>
          <Select value={profile?.city ?? ''} onValueChange={handleCityChange} disabled={savingCity || profileLoading}>
            <SelectTrigger className="w-full h-12 text-sm rounded-xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: '#FFFFFF' }}>
              <SelectValue placeholder={t('profile.addCity')} />
            </SelectTrigger>
            <SelectContent>
              {COLOMBIAN_CITIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* University */}
        <div className="premium-panel p-4 space-y-3">
          <label className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {t('profile.university')}
          </label>
          <Select value={profile?.university_id ?? 'none'} onValueChange={handleUniversityChange} disabled={savingUni || uniLoading || !profile?.city}>
            <SelectTrigger className="w-full h-12 text-sm rounded-xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: '#FFFFFF' }}>
              <SelectValue placeholder={!profile?.city ? t('profile.setCityFirst') : t('profile.addUniversity')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t('profile.noneStudent')}</SelectItem>
              {universities.map((u) => (
                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!profile?.city && (
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('profile.setCityFirst')}</p>
          )}
        </div>

        {/* Language */}
        <div className="premium-panel p-4 space-y-3">
          <label className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {t('profile.language')}
          </label>
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.10)' }}>
            <button
              onClick={() => setLanguage('en')}
              className="flex-1 py-3 text-sm font-medium transition-colors"
              style={language === 'en' ? { background: 'linear-gradient(135deg, #0A2B73, #1E5AA6)', color: '#FFFFFF' } : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)' }}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('es')}
              className="flex-1 py-3 text-sm font-medium transition-colors"
              style={language === 'es' ? { background: 'linear-gradient(135deg, #0A2B73, #1E5AA6)', color: '#FFFFFF' } : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)' }}
            >
              Español
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="pt-2">
          <button
            onClick={handleSignOut}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all duration-150 active:scale-[0.98]"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(239,68,68,0.3)', color: 'hsl(0, 84%, 60%)' }}
          >
            <LogOut className="w-4 h-4" />
            {t('profile.logout')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
