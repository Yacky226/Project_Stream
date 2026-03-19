import { useEffect, useState } from 'react';
import { useAppSelector } from './redux';

function getSystemPrefersDark(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function useResolvedTheme() {
  const theme = useAppSelector((state) => state.ui.theme);
  const [systemPrefersDark, setSystemPrefersDark] = useState(getSystemPrefersDark);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemPrefersDark(event.matches);
    };

    setSystemPrefersDark(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  const isDark = theme === 'dark' || (theme === 'system' && systemPrefersDark);

  return {
    theme,
    isDark,
    resolvedTheme: isDark ? 'dark' : 'light',
  } as const;
}
