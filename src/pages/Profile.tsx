import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUniversities } from '@/hooks/useUniversities';
import { supabase } from '@/integrations/supabase/client';
import { COLOMBIAN_CITIES } from '@/constants/cities';
import { NotificationsSection } from '@/components/NotificationsSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { LogOut, MapPin, GraduationCap } from 'lucide-react';

const Profile = () => {
  const { user, signOut } = useAuth();
  const { profile, isLoading: profileLoading, refetchProfile } = useUserProfile();
  const { universities, isLoading: uniLoading } = useUniversities();
  const { toast } = useToast();
  const [editingCity, setEditingCity] = useState(false);
  const [newCity, setNewCity] = useState('');
  const [savingCity, setSavingCity] = useState(false);
  const [savingUni, setSavingUni] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleEditCity = () => {
    setNewCity(profile?.city ?? '');
    setEditingCity(true);
  };

  const handleSaveCity = async () => {
    if (!newCity || !user) return;
    setSavingCity(true);
    const { error } = await supabase
      .from('users')
      .update({ city: newCity })
      .eq('id', user.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      await refetchProfile();
      toast({ title: 'City updated!' });
      setEditingCity(false);
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
      toast({ title: 'University updated!' });
    }
    setSavingUni(false);
  };

  const selectedUniName = universities.find(u => u.id === profile?.university_id)?.name ?? null;

  return (
    <div className="flex flex-col items-center p-6 space-y-6 pb-24">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-1">
            {profileLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-32 mx-auto" />
                <Skeleton className="h-4 w-48 mx-auto" />
              </div>
            ) : (
              <>
                <p className="text-xl font-semibold text-foreground">
                  @{profile?.username ?? 'unknown'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {profile?.email}
                </p>
                {/* City display / edit */}
                <div className="flex items-center justify-center gap-1 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  {editingCity ? (
                    <div className="flex items-center gap-2">
                      <Select value={newCity} onValueChange={setNewCity}>
                        <SelectTrigger className="h-8 w-40 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COLOMBIAN_CITIES.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handleSaveCity} disabled={savingCity || !newCity}>
                        {savingCity ? '...' : 'Save'}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setEditingCity(false)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={handleEditCity}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {profile?.city ?? 'No city set'}
                    </button>
                  )}
                </div>
                {/* University display */}
                {selectedUniName && (
                  <div className="flex items-center justify-center gap-1 pt-0.5">
                    <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{selectedUniName}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* University selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" /> University
            </label>
            <Select
              value={profile?.university_id ?? 'none'}
              onValueChange={handleUniversityChange}
              disabled={savingUni || uniLoading}
            >
              <SelectTrigger className="w-full text-sm">
                <SelectValue placeholder="Select university" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None / Prefer not to say</SelectItem>
                {universities.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            onClick={handleSignOut}
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      <div className="w-full max-w-md">
        <NotificationsSection />
      </div>
    </div>
  );
};

export default Profile;
