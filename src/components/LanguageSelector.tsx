
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { Languages, Globe } from 'lucide-react';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <div className="flex items-center space-x-3 rtl:space-x-reverse">
      <div className="p-2 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg">
        <Globe className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1">
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-full bg-gradient-to-r from-background to-muted/30 border-primary/20 hover:border-primary/40 transition-all duration-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card/95 backdrop-blur-xl border-primary/20">
            <SelectItem value="en" className="hover:bg-primary/10 focus:bg-primary/10">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="text-lg">🇺🇸</span>
                <span>{t('english')}</span>
              </div>
            </SelectItem>
            <SelectItem value="ar" className="hover:bg-primary/10 focus:bg-primary/10">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="text-lg">🇸🇦</span>
                <span>{t('arabic')}</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default LanguageSelector;
