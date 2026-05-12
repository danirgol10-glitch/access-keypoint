import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type AppTheme = 'classic' | 'world-cup-2026';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ENABLED_THEMES: AppTheme[] = ['classic'];

const normalizeRuntimeTheme = (value: string | null | undefined): AppTheme =>
  ENABLED_THEMES.includes(value as AppTheme) ? (value as AppTheme) : 'classic';

const THEME_DEFINITIONS: { id: AppTheme; labelEs: string; preview: { bg: string; card: string; accent: string } }[] = [
  { id: 'classic', labelEs: 'Clásico', preview: { bg: '#071C47', card: '#123E8C', accent: '#FFD23F' } },
  { id: 'world-cup-2026', labelEs: 'Mundial 2026', preview: { bg: '#F7F7F7', card: '#FFFFFF', accent: '#00B5E2' } },
];

export const THEMES = THEME_DEFINITIONS.filter((theme) => ENABLED_THEMES.includes(theme.id));

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const stored = localStorage.getItem('app-theme');
    const normalizedTheme = normalizeRuntimeTheme(stored);
    if (stored !== normalizedTheme) {
      localStorage.setItem('app-theme', normalizedTheme);
    }
    return normalizedTheme;
  });

  useEffect(() => {
    if (!user) return;
    supabase.from('users').select('theme').eq('id', user.id).maybeSingle().then(({ data }) => {
      if (data?.theme) {
        const dbTheme = normalizeRuntimeTheme(data.theme as string);
        setThemeState((currentTheme) => {
          if (dbTheme !== currentTheme) {
            localStorage.setItem('app-theme', dbTheme);
            return dbTheme;
          }
          return currentTheme;
        });
      }
    });
  }, [user]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = useCallback(async (newTheme: AppTheme) => {
    const runtimeTheme = normalizeRuntimeTheme(newTheme);
    setThemeState(runtimeTheme);
    localStorage.setItem('app-theme', runtimeTheme);
    if (user && runtimeTheme === newTheme) {
      await supabase.from('users').update({ theme: runtimeTheme } as any).eq('id', user.id);
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
