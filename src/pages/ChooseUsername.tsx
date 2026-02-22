import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUniversities } from '@/hooks/useUniversities';
import { COLOMBIAN_CITIES } from '@/constants/cities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

  // Reset university when city changes
  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    setUniversityId('none');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedUsername = username.trim().toLowerCase();
    const validation = usernameSchema.safeParse(trimmedUsername);

    if (!validation.success) {
      toast({
        variant: 'destructive',
        title: 'Invalid username',
        description: validation.error.errors[0].message,
      });
      return;
    }

    if (!city) {
      toast({
        variant: 'destructive',
        title: 'City required',
        description: 'Please select your city.',
      });
      return;
    }

    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('users')
        .upsert(
          {
            id: user.id,
            email: user.email!,
            username: trimmedUsername,
            city,
            university_id: universityId === 'none' ? null : universityId,
          },
          { onConflict: 'id' }
        );

      if (error) {
        if (error.code === '23505') {
          toast({
            variant: 'destructive',
            title: 'Username taken',
            description: 'This username is already in use. Please choose another.',
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message,
          });
        }
        setIsSubmitting(false);
        return;
      }

      await refetchProfile();

      toast({
        title: 'Welcome!',
        description: `Your username @${trimmedUsername} is set.`,
      });

      setTimeout(() => {
        navigate('/', { replace: true });
      }, 500);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center auth-gradient p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-1 text-center pb-2">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Set up your profile
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Pick a username, city, and university to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  @
                </span>
                <Input
                  id="username"
                  type="text"
                  placeholder="yourname"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  className="h-11 pl-8"
                  autoComplete="username"
                  maxLength={20}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Letters, numbers, and underscores only. 3-20 characters.
              </p>
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Select value={city} onValueChange={handleCityChange}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select your city" />
                </SelectTrigger>
                <SelectContent>
                  {COLOMBIAN_CITIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>University</Label>
              <Select
                value={universityId}
                onValueChange={setUniversityId}
                disabled={!city || uniLoading}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={!city ? 'Select a city first' : 'Select your university'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None / Not a student</SelectItem>
                  {universities.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!city && (
                <p className="text-xs text-muted-foreground">
                  Choose a city first to see available universities.
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full h-11 font-medium"
              disabled={isSubmitting || username.length < 3 || !city}
            >
              {isSubmitting ? 'Saving...' : 'Continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChooseUsername;
