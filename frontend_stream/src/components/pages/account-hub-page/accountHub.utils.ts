import type {
  AccountExportPayload,
  AccountTabOption,
  LocalProfileExtras,
} from './accountHub.types';

export const DEFAULT_EXTRAS: LocalProfileExtras = {
  bio: '',
  location: '',
  twitter: '',
  linkedIn: '',
  website: '',
};

export const ACCOUNT_TABS: AccountTabOption[] = [
  { key: 'personal', label: 'Personal Info' },
  { key: 'security', label: 'Security' },
  { key: 'billing', label: 'Billing' },
  { key: 'notifications', label: 'Notifications' },
];

export function toInputDate(value?: string | null): string {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parts = value.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return '';
}

export function toDisplayDate(value?: string | null): string {
  if (!value) return 'Member since recently';
  try {
    return new Intl.DateTimeFormat('fr-FR', { month: 'short', year: 'numeric' }).format(
      new Date(value),
    );
  } catch {
    return 'Member';
  }
}

export function getInitials(firstName?: string, lastName?: string): string {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.trim().toUpperCase() || 'U';
}

export function getDashboardPath(role?: string): string {
  if (role === 'teacher') return '/teacher/dashboard';
  if (role === 'admin') return '/admin';
  return '/dashboard';
}

export function getExtrasStorageKey(userId?: string) {
  return `account-hub-extras-${userId || 'guest'}`;
}

export function exportAccountData(payload: AccountExportPayload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8;',
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `account-hub-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}
