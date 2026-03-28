import type { UserPreferences } from '../../../types/user';

export type AccountTab = 'personal' | 'security' | 'billing' | 'notifications';

export interface AccountHubPageProps {
  onNavigate: (path: string | number) => void;
  initialTab?: AccountTab;
}

export interface LocalProfileExtras {
  bio: string;
  location: string;
  twitter: string;
  linkedIn: string;
  website: string;
}

export interface ProfileFormState {
  firstName: string;
  lastName: string;
  dateNaissance: string;
  avatar: string;
}

export type AccountTabOption = {
  key: AccountTab;
  label: string;
};

export interface AccountExportPayload {
  profile: unknown;
  preferences: UserPreferences;
  extras: LocalProfileExtras;
}
