export type UserRole = 'student' | 'teacher' | 'admin';

export type BackendUserRole =
  | 'ETUDIANT'
  | 'ENSEIGNANT'
  | 'ADMINISTRATEUR'
  | string;

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string | null;
  specialite?: string;
  niveau?: string;
  coursIds?: number[];
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  timezone?: string;
  lastLoginAt?: string;
  isActive?: boolean;
  nom?: string;
  dateNaissance?: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  niveau?: string;
  timezone?: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  marketingOptIn?: boolean;
  dateNaissance?: string;
}

export interface RegisterStudentData {
  prenom: string;
  nom: string;
  email: string;
  password: string;
  role: 'ETUDIANT';
  niveau: string;
  dateNaissance?: string;
}

export interface RegisterTeacherData {
  prenom?: string;
  nom: string;
  email: string;
  password: string;
  role: 'ENSEIGNANT';
  specialite: string;
  dateNaissance?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresAt: number;
  message?: string;
}

export interface AuthError {
  message: string;
  code?: string;
  field?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  password?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface BackendAuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  email: string;
  role: BackendUserRole;
  userId: number;
}

export interface BackendAuthRequest {
  email: string;
  password: string;
}

const BACKEND_ROLE_MAP: Record<string, UserRole> = {
  ETUDIANT: 'student',
  STUDENT: 'student',
  ENSEIGNANT: 'teacher',
  TEACHER: 'teacher',
  ADMINISTRATEUR: 'admin',
  ADMIN: 'admin',
};

const FRONTEND_ROLE_MAP: Record<UserRole, string> = {
  student: 'ETUDIANT',
  teacher: 'ENSEIGNANT',
  admin: 'ADMINISTRATEUR',
};

export function mapBackendRole(backendRole: BackendUserRole): UserRole {
  const raw = String(backendRole || '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const normalized = raw.startsWith('ROLE_') ? raw.slice(5) : raw;
  return BACKEND_ROLE_MAP[normalized] || 'student';
}

export function mapFrontendRole(frontendRole: UserRole): string {
  return FRONTEND_ROLE_MAP[frontendRole] || 'ETUDIANT';
}

export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const normalized = fullName.trim().replace(/\s+/g, ' ');
  if (!normalized) {
    return { firstName: '', lastName: '' };
  }

  const [firstName, ...rest] = normalized.split(' ');
  return {
    firstName,
    lastName: rest.join(' '),
  };
}

export function buildDisplayName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

export function normalizeAuthResponse(
  backend: BackendAuthResponse,
  profileOverride?: Partial<User>,
): AuthResponse {
  const emailPrefix = backend.email.split('@')[0] || '';
  const guessed = splitFullName(emailPrefix.replace(/[._-]/g, ' ').trim());
  const fallbackFirstName = guessed.firstName || 'Utilisateur';
  const fallbackLastName = guessed.lastName || '';

  const firstName = profileOverride?.firstName || fallbackFirstName;
  const lastName = profileOverride?.lastName || fallbackLastName;

  return {
    user: {
      id: String(backend.userId),
      email: backend.email,
      role: mapBackendRole(backend.role),
      firstName,
      lastName,
      nom: profileOverride?.nom || buildDisplayName(firstName, lastName),
      avatar: profileOverride?.avatar ?? null,
      emailVerified: profileOverride?.emailVerified ?? true,
      createdAt: profileOverride?.createdAt,
      updatedAt: profileOverride?.updatedAt,
      timezone: profileOverride?.timezone,
      lastLoginAt: profileOverride?.lastLoginAt,
      isActive: profileOverride?.isActive ?? true,
      dateNaissance: profileOverride?.dateNaissance,
    },
    token: backend.accessToken,
    refreshToken: backend.refreshToken,
    expiresAt: Date.now() + backend.expiresIn * 1000,
  };
}
