import React from 'react';
import { useLanguage } from './LanguageProvider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <div className="flex space-x-4">
      <div className={cn(
        'relative',
        language === 'en' && 'after:absolute after:inset-0 after:border-2 after:border-primary after:rounded-md after:-m-1'
      )}>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-8 w-10 font-semibold',
            language === 'en' && 'bg-accent'
          )}
          onClick={() => setLanguage('en')}
          aria-label={t('language.english')}
        >
          EN
        </Button>
      </div>
      
      <div className={cn(
        'relative',
        language === 'no' && 'after:absolute after:inset-0 after:border-2 after:border-primary after:rounded-md after:-m-1'
      )}>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-8 w-10 font-semibold',
            language === 'no' && 'bg-accent'
          )}
          onClick={() => setLanguage('no')}
          aria-label={t('language.norwegian')}
        >
          NO
        </Button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;