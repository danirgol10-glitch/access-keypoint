import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const ChooseUsername = () => {
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast({
        variant: 'destructive',
        title: 'Username required',
        description: 'Please enter a username to continue.',
      });
      return;
    }

    if (username.length < 3) {
      toast({
        variant: 'destructive',
        title: 'Username too short',
        description: 'Username must be at least 3 characters.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('users')
        .update({ username: username.trim().toLowerCase() })
        .eq('id', user?.id);

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
        return;
      }

      toast({
        title: 'Welcome!',
        description: `Your username @${username.trim().toLowerCase()} is set.`,
      });
      
      navigate('/', { replace: true });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ChooseUsername;
