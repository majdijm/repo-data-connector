
import React from 'react';
import { DirectionProvider as RadixDirectionProvider } from '@radix-ui/react-direction';
import { useLanguage } from '@/contexts/LanguageContext';

interface DirectionProviderProps {
  children: React.ReactNode;
}

const DirectionProvider: React.FC<DirectionProviderProps> = ({ children }) => {
  const { isRTL } = useLanguage();

  return (
    <RadixDirectionProvider dir={isRTL ? 'rtl' : 'ltr'}>
      {children}
    </RadixDirectionProvider>
  );
};

export default DirectionProvider;
