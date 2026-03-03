import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, loading, signIn, signUp } = useAuth();
  const { toast } = useToast();

  if (!loading && user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      toast({ variant: 'destructive', title: 'Validation Error', description: validation.error.errors[0].message });
      setIsSubmitting(false);
      return;
    }
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) toast({ variant: 'destructive', title: 'Login Failed', description: error.message === 'Invalid login credentials' ? 'Invalid email or password.' : error.message });
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          toast({ variant: 'destructive', title: error.message.includes('already registered') ? 'Account Exists' : 'Sign Up Failed', description: error.message.includes('already registered') ? 'This email is already registered.' : error.message });
        } else {
          toast({ title: 'Check Your Email', description: 'We sent you a confirmation link.' });
        }
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
    } finally { setIsSubmitting(false); }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center page-bg">
        <div className="animate-pulse" style={{ color: 'rgba(255,255,255,0.5)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center page-bg p-4">
      <div className="w-full max-w-md premium-panel premium-panel-gold p-6 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-[22px] font-bold" style={{ color: '#FFFFFF' }}>
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
            {isLogin ? 'Enter your credentials to access your account' : 'Enter your email to get started'}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'rgba(255,255,255,0.45)' }}>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full h-11 px-4 text-[14px] rounded-xl outline-none transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: '#FFFFFF' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#4FA3FF'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'rgba(255,255,255,0.45)' }}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              className="w-full h-11 px-4 text-[14px] rounded-xl outline-none transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: '#FFFFFF' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#4FA3FF'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; }}
            />
          </div>
          <button
            type="submit"
            className="w-full h-11 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #0A2B73, #1E5AA6)', border: '1px solid rgba(255,255,255,0.12)', color: '#FFFFFF' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm transition-colors"
            style={{ color: 'rgba(255,255,255,0.55)' }}
          >
            {isLogin ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
