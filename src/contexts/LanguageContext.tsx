
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, isRTL } from '@/lib/i18n';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const { userProfile } = useAuth();

  useEffect(() => {
    // Load language from user profile or localStorage
    if (userProfile?.language) {
      setLanguageState(userProfile.language as Language);
    } else {
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ar')) {
        setLanguageState(savedLanguage);
      }
    }
  }, [userProfile]);

  useEffect(() => {
    // Update document direction and font
    document.documentElement.dir = isRTL(language) ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    
    // Add RTL class to body for styling
    if (isRTL(language)) {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [language]);

  const setLanguage = async (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
    
    // Update user preference in database if logged in
    if (userProfile?.id) {
      try {
        await supabase
          .from('users')
          .update({ language: newLanguage })
          .eq('id', userProfile.id);
      } catch (error) {
        console.error('Failed to update language preference:', error);
      }
    }
  };

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      isRTL: isRTL(language)
    }}>
      {children}
    </LanguageContext.Provider>
  );
};
