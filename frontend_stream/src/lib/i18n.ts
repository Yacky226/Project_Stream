import { useTranslation as useReactI18next } from 'react-i18next';
import { useCallback } from 'react';

export type Language = 'en' | 'fr';

/**
 * Legacy hook wrapper for backward compatibility
 * Uses the new i18next system internally with auto-namespace detection
 */
export const useTranslation = () => {
  // Get all namespaces by default
  const { t: i18nT, i18n } = useReactI18next(['common', 'auth', 'course', 'navigation', 'home', 'video', 'dashboard', 'chat', 'footer']);

  const getCurrentLanguage = useCallback((): Language => {
    return i18n.language.split('-')[0] as Language;
  }, [i18n.language]);

  const setLanguage = useCallback((lang: Language) => {
    i18n.changeLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
      document.documentElement.lang = lang;
      // Trigger a custom event to notify components of language change
      window.dispatchEvent(new CustomEvent('languageChange', { detail: lang }));
    }
  }, [i18n]);

  /**
   * Wrapper for t function that supports both syntaxes:
   * - t('home.hero.title') -> looks in 'home' namespace
   * - t('home:hero.title') -> explicit namespace syntax
   * - t('common:loading') -> explicit namespace
   */
  const t = useCallback((key: string, params?: any): string => {
    try {
      // If key contains a dot without colon, auto-detect namespace
      if (key.includes('.') && !key.includes(':')) {
        const parts = key.split('.');
        const possibleNs = parts[0];
        
        // Check if first part is a known namespace
        const knownNamespaces = ['common', 'auth', 'course', 'navigation', 'home', 'video', 'dashboard', 'chat', 'footer'];
        if (knownNamespaces.includes(possibleNs)) {
          // Convert to explicit namespace syntax
          const restOfKey = parts.slice(1).join('.');
          return i18nT(`${possibleNs}:${restOfKey}`, params);
        }
      }
      
      // Use default i18next behavior
      return i18nT(key, params);
    } catch (error) {
      console.warn(`Translation error for key "${key}":`, error);
      return key;
    }
  }, [i18nT]);

  return { t, getCurrentLanguage, setLanguage };
};

// Legacy export - kept for compatibility but not used
export const translations = {};