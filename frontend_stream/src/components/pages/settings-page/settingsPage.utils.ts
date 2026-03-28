import { uiStorage } from '../../../lib/localStorage';
import type { UserPreferences } from '../../../types/user';

export function applyTheme(theme: UserPreferences['theme']) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    uiStorage.saveTheme('dark');
    return;
  }

  if (theme === 'light') {
    document.documentElement.classList.remove('dark');
    uiStorage.saveTheme('light');
    return;
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (prefersDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  uiStorage.saveTheme('system');
}

export function createPreferencesExport(preferences: UserPreferences): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      preferences,
    },
    null,
    2,
  );
}
