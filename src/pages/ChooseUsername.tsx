import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUniversities } from '@/hooks/useUniversities';
import { COLOMBIAN_CITIES } from '@/constants/cities';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be at most 20 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed');

const ChooseUsername = () => {
  const [username, setUsername] = useState('');
  const [city, setCity] = useState('');
  const [universityId, setUniversityId] = useState<string>('none');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { profile, refetchProfile } = useUserProfile();
  const { universities, isLoading: uniLoading } = useUniversities(city || null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCityChange = (newCity: string) => { setCity(newCity); setUniversityId('none'); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUsername = username.trim().toLowerCase();
    const validation = usernameSchema.safeParse(trimmedUsername);
    if (!validation.success) { toast({ variant: 'destructive', title: 'Invalid username', description: validation.error.errors[0].message }); return; }
    if (!city) { toast({ variant: 'destructive', title: 'City required', description: 'Please select your city.' }); return; }
    if (!user) { toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' }); return; }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('users').upsert({ id: user.id, email: user.email!, username: trimmedUsername, city, university_id: universityId === 'none' ? null : universityId }, { onConflict: 'id' });
      if (error) {
        if (error.code === '23505') toast({ variant: 'destructive', title: 'Username taken', description: 'This username is already in use.' });
        else toast({ variant: 'destructive', title: 'Error', description: error.message });
        setIsSubmitting(false);
        return;
      }
      await refetchProfile();
      toast({ title: 'Welcome!', description: `Your username @${trimmedUsername} is set.` });
      setTimeout(() => navigate('/', { replace: true }), 500);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center page-bg p-4">
      <div className="w-full max-w-md premium-panel premium-panel-gold p-6 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-[22px] font-bold" style={{ color: '#FFFFFF' }}>Set up your profile</h1>
          <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.55)' }}>Pick a username, city, and university to get started</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'rgba(255,255,255,0.45)' }}>Username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.4)' }}>@</span>
              <input
                type="text"
                placeholder="yourname"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                className="w-full h-11 pl-8 pr-4 text-[14px] rounded-xl outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: '#FFFFFF' }}
                maxLength={20}
              />
            </div>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Letters, numbers, and underscores. 3-20 characters.</p>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'rgba(255,255,255,0.45)' }}>City</label>
            <Select value={city} onValueChange={handleCityChange}>
              <SelectTrigger className="h-11 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: '#FFFFFF' }}>
                <SelectValue placeholder="Select your city" />
              </SelectTrigger>
              <SelectContent>{COLOMBIAN_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'rgba(255,255,255,0.45)' }}>University</label>
            <Select value={universityId} onValueChange={setUniversityId} disabled={!city || uniLoading}>
              <SelectTrigger className="h-11 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: '#FFFFFF' }}>
                <SelectValue placeholder={!city ? 'Select a city first' : 'Select your university'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None / Not a student</SelectItem>
                {universities.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <button
            type="submit"
            className="w-full h-11 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #0A2B73, #1E5AA6)', border: '1px solid rgba(255,255,255,0.12)', color: '#FFFFFF' }}
            disabled={isSubmitting || username.length < 3 || !city}
          >
            {isSubmitting ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChooseUsername;
