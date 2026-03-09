/**
 * i18n Type Definitions
 * 
 * Type-safe definitions for internationalization
 */

import type { SupportedLanguage } from '../config/i18n';

/**
 * Translation namespaces available in the application
 */
export type TranslationNamespace = 
  | 'common'
  | 'auth'
  | 'course'
  | 'navigation'
  | 'home'
  | 'video'
  | 'dashboard'
  | 'chat'
  | 'footer';

/**
 * Translation key format
 * Format: namespace:key.nestedKey
 */
export type TranslationKey = string;

/**
 * Date/Time formatting styles
 */
export type DateTimeStyle = 'full' | 'long' | 'medium' | 'short';

/**
 * Date formatting options
 */
export interface DateFormatOptions {
  dateStyle?: DateTimeStyle;
  timeStyle?: DateTimeStyle;
  timeZone?: string;
  hour12?: boolean;
}

/**
 * Number formatting options
 */
export interface NumberFormatOptions {
  style?: 'decimal' | 'currency' | 'percent';
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Currency codes supported
 */
export type CurrencyCode = 'EUR' | 'USD' | 'GBP' | 'CAD' | 'CHF';

/**
 * Interpolation parameters for translations
 */
export type InterpolationParams = Record<string, string | number | boolean | Date>;

/**
 * Language configuration
 */
export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
}

/**
 * Language switcher props
 */
export interface LanguageSwitcherProps {
  variant?: 'default' | 'ghost' | 'outline' | 'secondary' | 'destructive' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
  align?: 'start' | 'center' | 'end';
  className?: string;
}

/**
 * i18n Context type
 */
export interface I18nContextType {
  language: SupportedLanguage;
  changeLanguage: (lang: SupportedLanguage) => void;
  isRTL: boolean;
  timezone: string;
}

/**
 * Translation function type
 */
export type TranslationFunction = (
  key: TranslationKey,
  params?: InterpolationParams
) => string;

/**
 * Date formatter type
 */
export type DateFormatter = (
  date: Date | string | number,
  options?: DateFormatOptions
) => string;

/**
 * Number formatter type
 */
export type NumberFormatter = (
  value: number,
  options?: NumberFormatOptions
) => string;

/**
 * Currency formatter type
 */
export type CurrencyFormatter = (
  value: number,
  currency?: CurrencyCode
) => string;

/**
 * Percent formatter type
 */
export type PercentFormatter = (
  value: number,
  decimals?: number
) => string;

/**
 * Duration formatter type (minutes to readable format)
 */
export type DurationFormatter = (
  minutes: number
) => string;

/**
 * Relative time formatter type
 */
export type RelativeTimeFormatter = (
  date: Date | string | number,
  baseDate?: Date
) => string;

/**
 * Complete i18n hook return type
 */
export interface UseI18nReturn {
  // Core translation
  t: TranslationFunction;
  Trans: React.ComponentType<any>;
  i18n: any;
  currentLanguage: SupportedLanguage;
  changeLanguage: (lang: SupportedLanguage) => void;
  isRTL: boolean;
  
  // Date/Time formatting
  formatDate: DateFormatter;
  formatTime: DateFormatter;
  formatDateTime: DateFormatter;
  formatRelativeTime: RelativeTimeFormatter;
  userTimezone: string;
  
  // Number formatting
  formatNumber: NumberFormatter;
  formatCurrency: CurrencyFormatter;
  formatPercent: PercentFormatter;
  formatDuration: DurationFormatter;
}

/**
 * Supported locales for Intl API
 */
export const LOCALE_MAP: Record<SupportedLanguage, string> = {
  en: 'en-US',
  fr: 'fr-FR',
};

/**
 * Default currency by locale
 */
export const DEFAULT_CURRENCY: Record<SupportedLanguage, CurrencyCode> = {
  en: 'USD',
  fr: 'EUR',
};

/**
 * Translation metadata
 */
export interface TranslationMetadata {
  namespace: TranslationNamespace;
  key: string;
  defaultValue?: string;
  description?: string;
  context?: string;
}

/**
 * Translation status for a key
 */
export interface TranslationStatus {
  key: string;
  en: boolean;
  fr: boolean;
  complete: boolean;
}

/**
 * Namespace info
 */
export interface NamespaceInfo {
  name: TranslationNamespace;
  keysCount: number;
  translatedKeys: {
    en: number;
    fr: number;
  };
  completionRate: number;
}
