import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'profile.title': 'Profile',
    'profile.university': 'UNIVERSITY',
    'profile.city': 'CITY',
    'profile.language': 'LANGUAGE',
    'profile.logout': 'Log Out',
    'profile.addUniversity': 'Add University',
    'profile.addCity': 'Add City',
    'profile.noneStudent': 'None / Not a student',
    'profile.setCityFirst': 'Set your city first to see universities.',
    'nav.progress': 'Progress',
    'nav.album': 'Album',
    'nav.trading': 'Trading',
    'nav.friends': 'Friends',
    'nav.profile': 'Profile',
  },
  es: {
    'profile.title': 'Perfil',
    'profile.university': 'UNIVERSIDAD',
    'profile.city': 'CIUDAD',
    'profile.language': 'IDIOMA',
    'profile.logout': 'Cerrar Sesión',
    'profile.addUniversity': 'Agregar Universidad',
    'profile.addCity': 'Agregar Ciudad',
    'profile.noneStudent': 'Ninguna / No soy estudiante',
    'profile.setCityFirst': 'Establece tu ciudad primero para ver universidades.',
    'nav.progress': 'Progreso',
    'nav.album': 'Álbum',
    'nav.trading': 'Intercambio',
    'nav.friends': 'Amigos',
    'nav.profile': 'Perfil',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved === 'es' ? 'es' : 'en') as Language;
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  }, []);

  const t = useCallback((key: string): string => {
    return translations[language][key] ?? key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
