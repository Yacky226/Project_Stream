export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'teacher' | 'admin';
  avatar?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  timezone?: string;
  lastLoginAt?: Date;
  isActive?: boolean;
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
  role?: 'student' | 'teacher';
  timezone?: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  marketingOptIn?: boolean;
}

export interface AuthResponse {
  user?: User;
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
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface EmailVerification {
  token: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export type UserRole = 'student' | 'teacher' | 'admin';