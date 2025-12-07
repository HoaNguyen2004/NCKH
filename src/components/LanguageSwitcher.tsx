import { Globe } from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from '../contexts/LanguageContext';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-2 w-full justify-start"
      onClick={toggleLanguage}
    >
      <Globe className="w-4 h-4" />
      <span>{language === 'vi' ? 'VN Tiếng Việt' : 'EN English'}</span>
    </Button>
  );
}
