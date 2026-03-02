import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUniversities } from '@/hooks/useUniversities';
import { useLanguage, type Language } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { COLOMBIAN_CITIES } from '@/constants/cities';
import { Button } from '@/components/ui/button';
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

  const handleSignOut = async () => {
    await signOut();
  };

  const handleCityChange = async (value: string) => {
    if (!user) return;
    setSavingCity(true);

    const oldCity = profile?.city;
    const needsUniReset = oldCity !== value && profile?.university_id;

    const updateData: Record<string, unknown> = { city: value };
    if (needsUniReset) {
      updateData.university_id = null;
    }

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id);

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
    const { error } = await supabase
      .from('users')
      .update({ university_id: uniId })
      .eq('id', user.id);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      await refetchProfile();
    }
    setSavingUni(false);
  };

  const selectedUniName = universities.find(u => u.id === profile?.university_id)?.name ?? null;

  return (
    <div className="flex flex-col items-center px-6 pt-10 pb-28 min-h-screen">
      <div className="w-full max-w-sm space-y-8">

        {/* Username */}
        <div className="text-center">
          {profileLoading ? (
            <Skeleton className="h-7 w-36 mx-auto bg-white/10" />
          ) : (
            <h1 className="text-xl font-bold tracking-[0.08em] uppercase text-foreground">
              @{profile?.username ?? 'unknown'}
            </h1>
          )}
        </div>

        {/* City */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {t('profile.city')}
          </label>
          <Select
            value={profile?.city ?? ''}
            onValueChange={handleCityChange}
            disabled={savingCity || profileLoading}
          >
            <SelectTrigger className="w-full h-12 text-sm bg-secondary/50 border-border">
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
        <div className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {t('profile.university')}
          </label>
          <Select
            value={profile?.university_id ?? 'none'}
            onValueChange={handleUniversityChange}
            disabled={savingUni || uniLoading || !profile?.city}
          >
            <SelectTrigger className="w-full h-12 text-sm bg-secondary/50 border-border">
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
            <p className="text-xs text-muted-foreground">{t('profile.setCityFirst')}</p>
          )}
        </div>

        {/* Language */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {t('profile.language')}
          </label>
          <div className="flex rounded-lg overflow-hidden border border-border">
            <button
              onClick={() => setLanguage('en')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                language === 'en'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('es')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                language === 'es'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              Español
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="pt-4">
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="w-full h-12 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t('profile.logout')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
