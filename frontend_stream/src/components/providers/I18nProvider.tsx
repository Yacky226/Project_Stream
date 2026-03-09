import { ReactNode, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n, { i18nConfig } from '../../config/i18n';
import { LoadingSpinner } from '../ui/loading-spinner';

interface I18nProviderProps {
  children: ReactNode;
}

// Track initialization state globally
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

/**
 * I18n Provider Component
 * Wraps the application with i18next context and ensures i18n is fully initialized
 * All translations are bundled directly, no HTTP loading required
 */
export function I18nProvider({ children }: I18nProviderProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Only initialize once
    if (!initializationPromise) {
      initializationPromise = (async () => {
        try {
          // Check if already initialized
          if (i18n.isInitialized) {
            console.log('[i18n] Already initialized');
            return;
          }

          console.log('[i18n] Initializing with bundled resources...');
          
          // Initialize i18next with bundled resources
          await i18n.init(i18nConfig);
          
          isInitialized = true;
          console.log('[i18n] Initialization complete');
          console.log('[i18n] Current language:', i18n.language);
          console.log('[i18n] Available languages:', i18n.languages);
          console.log('[i18n] Loaded namespaces:', i18n.options.ns);
        } catch (err) {
          console.error('[i18n] Initialization failed:', err);
          throw err;
        }
      })();
    }

    // Wait for initialization to complete
    initializationPromise
      .then(() => {
        setIsReady(true);
      })
      .catch((err) => {
        console.error('[i18n] Error during initialization:', err);
        // Set ready anyway to prevent infinite loading
        setIsReady(true);
      });
  }, []);

  // Show loading spinner while i18n is initializing
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-muted-foreground">Loading translations...</p>
        </div>
      </div>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}