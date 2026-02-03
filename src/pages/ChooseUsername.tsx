import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be at most 20 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed');

const ChooseUsername = () => {
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugValue, setDebugValue] = useState<string | null>(null);
  const { user } = useAuth();
  const { profile, refetchProfile } = useUserProfile();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate username
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
      // Upsert user record with username
      const { error } = await supabase
        .from('users')
        .upsert(
          {
            id: user.id,
            email: user.email!,
            username: trimmedUsername,
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

      // Re-fetch the user profile from database
      const { data: refetchedData } = await refetchProfile();
      
      // Set debug value to show current DB state
      setDebugValue(refetchedData?.username ?? 'null');

      toast({
        title: 'Welcome!',
        description: `Your username @${trimmedUsername} is set.`,
      });

      // Small delay to show debug value, then navigate
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
            Choose your username
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Pick a unique username to get started
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
            <Button
              type="submit"
              className="w-full h-11 font-medium"
              disabled={isSubmitting || username.length < 3}
            >
              {isSubmitting ? 'Saving...' : 'Continue'}
            </Button>
          </form>

          {/* Debug: Show current DB username value */}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs font-mono">
            <p className="text-muted-foreground">
              <strong>Debug:</strong> DB users.username = {' '}
              <span className="text-foreground">
                {debugValue !== null ? `"${debugValue}"` : profile?.username !== undefined ? `"${profile.username}"` : 'loading...'}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChooseUsername;
