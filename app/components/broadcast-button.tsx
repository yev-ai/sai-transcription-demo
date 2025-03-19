import { Button } from '@/components/ui/button';
import { useLanguagePair } from '@/hooks/use-language';

interface BroadcastButtonProps {
  isSessionActive: boolean;
  onClick: () => void;
}

const ISO639Native: { [code: string]: string } = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  zh: '中文',
  ru: 'Русский',
  ja: '日本語',
  ko: '한국어',
  ar: 'العربية',
  hi: 'हिन्दी',
  pt: 'Português',
  it: 'Italiano',
  nl: 'Nederlands',
  sv: 'Svenska',
  no: 'Norsk',
  fi: 'Suomi',
  da: 'Dansk',
  pl: 'Polski',
  cs: 'Čeština',
  el: 'Ελληνικά',
  tr: 'Türkçe',
  he: 'עברית',
  id: 'Bahasa Indonesia',
  vi: 'Tiếng Việt',
  th: 'ไทย',
  fa: 'فارسی',
  ur: 'اردو',
  bn: 'বাংলা',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  ml: 'മലയാളം',
  gu: 'ગુજરાતી',
  kn: 'ಕನ್ನಡ',
  mr: 'मराठी',
  ro: 'Română',
  hu: 'Magyar',
  sk: 'Slovenčina',
  sl: 'Slovenščina',
  hr: 'Hrvatski',
  sr: 'Српски',
  bg: 'Български',
  uk: 'Українська',
};

function getLanguageDisplay(code: string): string {
  if (code && ISO639Native[code]) {
    return `${ISO639Native[code]}`;
  }

  return 'Unknown';
}

export function BroadcastButton({ isSessionActive, onClick }: BroadcastButtonProps) {
  const { languagePair } = useLanguagePair();

  return (
    <Button variant={isSessionActive ? 'destructive' : 'default'} onClick={onClick}>
      {isSessionActive && (
        <div>
          {languagePair?.userALanguage ? getLanguageDisplay(languagePair.userALanguage) : ''}
          {' \u221E '}
          {languagePair?.userBLanguage ? getLanguageDisplay(languagePair.userBLanguage) : ''}
        </div>
      )}
      {isSessionActive ? 'Stop' : 'Start'}
    </Button>
  );
}
