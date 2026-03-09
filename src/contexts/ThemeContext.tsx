import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type AppTheme = 'classic' | 'world-cup-2026';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const VALID_THEMES: AppTheme[] = ['classic', 'world-cup-2026'];

export const THEMES: { id: AppTheme; labelEn: string; labelEs: string; preview: { bg: string; card: string; accent: string } }[] = [
  { id: 'classic', labelEn: 'Classic', labelEs: 'Clásico', preview: { bg: '#071C47', card: '#123E8C', accent: '#FFD23F' } },
  { id: 'world-cup-2026', labelEn: 'World Cup 2026', labelEs: 'Mundial 2026', preview: { bg: '#F7F7F7', card: '#FFFFFF', accent: '#00B5E2' } },
];

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const stored = localStorage.getItem('app-theme') as string;
    return VALID_THEMES.includes(stored as AppTheme) ? (stored as AppTheme) : 'classic';
  });

  useEffect(() => {
    if (!user) return;
    supabase.from('users').select('theme').eq('id', user.id).maybeSingle().then(({ data }) => {
      if (data?.theme) {
        const dbTheme = VALID_THEMES.includes(data.theme as AppTheme) ? (data.theme as AppTheme) : 'classic';
        if (dbTheme !== theme) {
          setThemeState(dbTheme);
          localStorage.setItem('app-theme', dbTheme);
        }
      }
    });
  }, [user]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = useCallback(async (newTheme: AppTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('app-theme', newTheme);
    if (user) {
      await supabase.from('users').update({ theme: newTheme } as any).eq('id', user.id);
    }
  }, [user]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
