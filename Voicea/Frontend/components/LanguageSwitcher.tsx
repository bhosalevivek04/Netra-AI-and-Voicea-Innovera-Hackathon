'use client';


import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex gap-2 p-4">
      <Button
        variant={language === 'en' ? 'default' : 'outline'}
        onClick={() => setLanguage('en')}
      >
        English
      </Button>
      <Button
        variant={language === 'mr' ? 'default' : 'outline'}
        onClick={() => setLanguage('mr')}
      >
        मराठी
      </Button>
      <Button
        variant={language === 'hi' ? 'default' : 'outline'}
        onClick={() => setLanguage('hi')}
      >
        हिंदी
      </Button>
    </div>
  );
}