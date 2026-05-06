import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { COLOMBIAN_CITIES } from '@/constants/cities';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const CityGateModal = () => {
  const { user } = useAuth();
  const { profile, isLoading, refetchProfile } = useUserProfile();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [city, setCity] = useState('');
  const [saving, setSaving] = useState(false);

  const shouldShow = !isLoading && !!user && !!profile && !!profile.username && !profile.city;

  const handleSave = async () => {
    if (!city || !user) return;
    setSaving(true);
    const { error } = await supabase.from('users').update({ city }).eq('id', user.id);
    if (error) { toast({ variant: 'destructive', title: t('common.error'), description: error.message }); setSaving(false); return; }
    await refetchProfile();
    toast({ title: t('cityGate.saved') });
    setSaving(false);
  };

  if (!shouldShow) return null;

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{t('cityGate.title')}</DialogTitle>
          <DialogDescription>{t('cityGate.desc')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="min-h-11"><SelectValue placeholder={t('cityGate.placeholder')} /></SelectTrigger>
            <SelectContent>{COLOMBIAN_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Button className="min-h-11 w-full" disabled={!city || saving} onClick={handleSave}>
            {saving ? t('cityGate.saving') : t('cityGate.continue')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CityGateModal;
