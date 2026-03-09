import { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import { useI18n } from '../../hooks/useI18n';
import { SUPPORTED_LANGUAGES, LANGUAGE_NAMES, type SupportedLanguage } from '../../config/i18n';

interface LanguageSwitcherProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
  align?: 'start' | 'center' | 'end';
}

export function LanguageSwitcher({
  variant = 'ghost',
  size = 'sm',
  showLabel = false,
  align = 'end',
}: LanguageSwitcherProps) {
  const { currentLanguage, changeLanguage, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (language: SupportedLanguage) => {
    changeLanguage(language);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className="gap-2"
          aria-label={t('common:changeLanguage', { defaultValue: 'Change language' })}
        >
          <Globe className="h-4 w-4" />
          {showLabel && (
            <span className="hidden sm:inline-block">
              {LANGUAGE_NAMES[currentLanguage as SupportedLanguage].native}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48">
        <DropdownMenuLabel>
          {t('common:selectLanguage', { defaultValue: 'Select Language' })}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isActive = currentLanguage === lang;
          return (
            <DropdownMenuItem
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col">
                  <span className={isActive ? 'font-semibold' : ''}>
                    {LANGUAGE_NAMES[lang].native}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {LANGUAGE_NAMES[lang].english}
                  </span>
                </div>
                {isActive && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Compact language switcher for mobile or tight spaces
 */
export function CompactLanguageSwitcher() {
  const { currentLanguage, changeLanguage } = useI18n();

  const toggleLanguage = () => {
    const currentIndex = SUPPORTED_LANGUAGES.indexOf(currentLanguage as SupportedLanguage);
    const nextIndex = (currentIndex + 1) % SUPPORTED_LANGUAGES.length;
    changeLanguage(SUPPORTED_LANGUAGES[nextIndex]);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="gap-2"
      aria-label="Toggle language"
    >
      <Globe className="h-4 w-4" />
      <span className="uppercase text-xs font-semibold">
        {currentLanguage}
      </span>
    </Button>
  );
}

/**
 * Language switcher with flags (requires flag icons)
 */
export function FlagLanguageSwitcher() {
  const { currentLanguage, changeLanguage, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const languageFlags: Record<SupportedLanguage, string> = {
    en: '🇬🇧',
    fr: '🇫🇷',
  };

  const handleLanguageChange = (language: SupportedLanguage) => {
    changeLanguage(language);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="gap-2"
          aria-label={t('common:changeLanguage', { defaultValue: 'Change language' })}
        >
          <span className="text-lg">
            {languageFlags[currentLanguage as SupportedLanguage]}
          </span>
          <span className="hidden sm:inline-block uppercase text-xs font-semibold">
            {currentLanguage}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isActive = currentLanguage === lang;
          return (
            <DropdownMenuItem
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{languageFlags[lang]}</span>
                  <span className={isActive ? 'font-semibold' : ''}>
                    {LANGUAGE_NAMES[lang].native}
                  </span>
                </div>
                {isActive && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
