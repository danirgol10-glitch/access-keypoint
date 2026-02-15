import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { COLOMBIAN_CITIES } from '@/constants/cities';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const CityGateModal = () => {
  const { user } = useAuth();
  const { profile, isLoading, refetchProfile } = useUserProfile();
  const { toast } = useToast();
  const [city, setCity] = useState('');
  const [saving, setSaving] = useState(false);

  // Show only when profile is loaded, user exists, has username but no city
  const shouldShow =
    !isLoading && !!user && !!profile && !!profile.username && !profile.city;

  const handleSave = async () => {
    if (!city || !user) return;
    setSaving(true);
    const { error } = await supabase
      .from('users')
      .update({ city })
      .eq('id', user.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
      setSaving(false);
      return;
    }
    await refetchProfile();
    toast({ title: 'City saved!' });
    setSaving(false);
  };

  if (!shouldShow) return null;

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Select your city</DialogTitle>
          <DialogDescription>
            Choose your city to enable local exchange features.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a city" />
            </SelectTrigger>
            <SelectContent>
              {COLOMBIAN_CITIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="w-full"
            disabled={!city || saving}
            onClick={handleSave}
          >
            {saving ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CityGateModal;
