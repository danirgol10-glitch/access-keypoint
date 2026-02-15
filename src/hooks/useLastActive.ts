import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const THROTTLE_MS = 60_000; // 1 minute

export function useLastActive() {
  const { user } = useAuth();
  const lastUpdated = useRef(0);

  const touch = useCallback(async () => {
    if (!user?.id) return;
    const now = Date.now();
    if (now - lastUpdated.current < THROTTLE_MS) return;
    lastUpdated.current = now;

    await supabase
      .from('users')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', user.id);
  }, [user?.id]);

  return { touch };
}
