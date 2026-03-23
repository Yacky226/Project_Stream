import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { resources } from './i18n-resources';

// Define available languages
export const SUPPORTED_LANGUAGES = ['en', 'fr'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Language display names
export const LANGUAGE_NAMES: Record<SupportedLanguage, { native: string; english: string }> = {
  en: { native: 'English', english: 'English' },
  fr: { native: 'Francais', english: 'French' },
};

// Configure i18next WITHOUT calling init() - we'll do that in the provider
const i18nInstance = i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next); // Pass i18n instance to react-i18next

// Export configuration object
export const i18nConfig = {
  // Use bundled resources instead of HTTP backend
  resources,

  fallbackLng: 'en', // Fallback language
  defaultNS: 'common', // Default namespace
  ns: ['common', 'auth', 'course', 'navigation', 'home', 'video', 'dashboard', 'chat', 'footer'],
  
  // Language detection configuration
  detection: {
    order: ['localStorage', 'navigator', 'htmlTag'],
    caches: ['localStorage'],
    lookupLocalStorage: 'i18nextLng',
  },

  interpolation: {
    escapeValue: false, // React already escapes by default
  },

  react: {
    useSuspense: false, // Disable suspense - we handle loading manually
  },

  // Development mode settings
  debug: false, // Disable debug to reduce console noise
  
  // Plural handling (ICU compatible)
  pluralSeparator: '_',
  contextSeparator: '_',
  
  // Performance optimizations
  load: 'languageOnly', // Only load 'en' not 'en-US'
  
  // Return key for missing translations to help debugging
  returnEmptyString: false,
  
  // All resources are bundled, no need to preload
  preload: ['en', 'fr'],
};

// Event listeners for language changes
i18nInstance.on('languageChanged', (lng) => {
  // Update HTML lang attribute
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
    
    // Update text direction if needed (for RTL languages)
    document.documentElement.dir = i18nInstance.dir(lng);
  }
  
  // Dispatch custom event for other components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lng } }));
  }
});

export default i18nInstance;