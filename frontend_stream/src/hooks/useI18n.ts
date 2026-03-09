import { useTranslation as useReactI18next, Trans } from 'react-i18next';
import { useCallback, useMemo } from 'react';
import type { SupportedLanguage } from '../config/i18n';

/**
 * Date formatting options
 */
export type DateFormatStyle = 'full' | 'long' | 'medium' | 'short';

export interface DateFormatOptions {
  dateStyle?: DateFormatStyle;
  timeStyle?: DateFormatStyle;
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
 * Enhanced i18n hook with date/time and number formatting
 */
export function useI18n() {
  // Get all namespaces by default
  const { t: i18nT, i18n } = useReactI18next(['common', 'auth', 'course', 'navigation', 'home', 'video', 'dashboard', 'chat', 'footer']);
  
  const currentLanguage = i18n.language as SupportedLanguage;
  
  /**
   * Wrapper for t function that supports both syntaxes:
   * - t('home.hero.title') -> looks in 'home' namespace
   * - t('home:hero.title') -> explicit namespace syntax
   * - t('common:loading') -> explicit namespace
   */
  const t = useCallback((key: string, options?: any): string => {
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
          return i18nT(`${possibleNs}:${restOfKey}`, options);
        }
      }
      
      // Use default i18next behavior
      return i18nT(key, options);
    } catch (error) {
      console.warn(`Translation error for key "${key}":`, error);
      return key;
    }
  }, [i18nT]);
  
  /**
   * Change language
   */
  const changeLanguage = useCallback((language: SupportedLanguage) => {
    i18n.changeLanguage(language);
  }, [i18n]);

  /**
   * Format date with current locale
   */
  const formatDate = useCallback((
    date: Date | string | number,
    options: DateFormatOptions = {}
  ): string => {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    
    try {
      return new Intl.DateTimeFormat(currentLanguage, {
        dateStyle: options.dateStyle || 'medium',
        timeStyle: options.timeStyle,
        timeZone: options.timeZone,
        hour12: options.hour12,
      }).format(dateObj);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateObj.toLocaleDateString();
    }
  }, [currentLanguage]);

  /**
   * Format time with current locale
   */
  const formatTime = useCallback((
    date: Date | string | number,
    options: Omit<DateFormatOptions, 'dateStyle'> = {}
  ): string => {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    
    try {
      return new Intl.DateTimeFormat(currentLanguage, {
        timeStyle: options.timeStyle || 'short',
        timeZone: options.timeZone,
        hour12: options.hour12 ?? (currentLanguage === 'en'),
      }).format(dateObj);
    } catch (error) {
      console.error('Error formatting time:', error);
      return dateObj.toLocaleTimeString();
    }
  }, [currentLanguage]);

  /**
   * Format date and time with current locale
   */
  const formatDateTime = useCallback((
    date: Date | string | number,
    options: DateFormatOptions = {}
  ): string => {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    
    try {
      return new Intl.DateTimeFormat(currentLanguage, {
        dateStyle: options.dateStyle || 'medium',
        timeStyle: options.timeStyle || 'short',
        timeZone: options.timeZone,
        hour12: options.hour12 ?? (currentLanguage === 'en'),
      }).format(dateObj);
    } catch (error) {
      console.error('Error formatting datetime:', error);
      return dateObj.toLocaleString();
    }
  }, [currentLanguage]);

  /**
   * Format relative time (e.g., "2 hours ago", "in 3 days")
   */
  const formatRelativeTime = useCallback((
    date: Date | string | number,
    baseDate: Date = new Date()
  ): string => {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    const diffMs = dateObj.getTime() - baseDate.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    try {
      const rtf = new Intl.RelativeTimeFormat(currentLanguage, { numeric: 'auto' });
      
      if (Math.abs(diffSeconds) < 60) {
        return rtf.format(diffSeconds, 'second');
      } else if (Math.abs(diffMinutes) < 60) {
        return rtf.format(diffMinutes, 'minute');
      } else if (Math.abs(diffHours) < 24) {
        return rtf.format(diffHours, 'hour');
      } else if (Math.abs(diffDays) < 7) {
        return rtf.format(diffDays, 'day');
      } else if (Math.abs(diffWeeks) < 4) {
        return rtf.format(diffWeeks, 'week');
      } else if (Math.abs(diffMonths) < 12) {
        return rtf.format(diffMonths, 'month');
      } else {
        return rtf.format(diffYears, 'year');
      }
    } catch (error) {
      console.error('Error formatting relative time:', error);
      return dateObj.toLocaleString();
    }
  }, [currentLanguage]);

  /**
   * Format number with current locale
   */
  const formatNumber = useCallback((
    value: number,
    options: NumberFormatOptions = {}
  ): string => {
    try {
      return new Intl.NumberFormat(currentLanguage, {
        style: options.style || 'decimal',
        currency: options.currency,
        minimumFractionDigits: options.minimumFractionDigits,
        maximumFractionDigits: options.maximumFractionDigits,
      }).format(value);
    } catch (error) {
      console.error('Error formatting number:', error);
      return value.toString();
    }
  }, [currentLanguage]);

  /**
   * Format currency with current locale
   */
  const formatCurrency = useCallback((
    value: number,
    currency: string = 'EUR'
  ): string => {
    return formatNumber(value, { style: 'currency', currency });
  }, [formatNumber]);

  /**
   * Format percentage with current locale
   */
  const formatPercent = useCallback((
    value: number,
    decimals: number = 0
  ): string => {
    return formatNumber(value / 100, { 
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }, [formatNumber]);

  /**
   * Format duration (in minutes) to human-readable format
   */
  const formatDuration = useCallback((
    minutes: number
  ): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return t('common:duration.minutes', { count: mins, defaultValue: '{{count}}m' });
    }
    
    if (mins === 0) {
      return t('common:duration.hours', { count: hours, defaultValue: '{{count}}h' });
    }
    
    return t('common:duration.hoursMinutes', { 
      hours, 
      minutes: mins,
      defaultValue: '{{hours}}h {{minutes}}m'
    });
  }, [t]);

  /**
   * Get user's timezone
   */
  const userTimezone = useMemo(() => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }, []);

  /**
   * Check if current language is RTL
   */
  const isRTL = useMemo(() => {
    return i18n.dir() === 'rtl';
  }, [i18n]);

  return {
    // Core i18n
    t,
    Trans,
    i18n,
    currentLanguage,
    changeLanguage,
    isRTL,
    
    // Date/Time formatting
    formatDate,
    formatTime,
    formatDateTime,
    formatRelativeTime,
    userTimezone,
    
    // Number formatting
    formatNumber,
    formatCurrency,
    formatPercent,
    formatDuration,
  };
}

// Export type for use in components
export type UseI18nReturn = ReturnType<typeof useI18n>;