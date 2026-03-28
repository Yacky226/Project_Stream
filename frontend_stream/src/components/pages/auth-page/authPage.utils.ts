import type { AuthFormState, SignupRole } from './authPage.types';

export const initialForm: AuthFormState = {
  acceptTerms: false,
  confirmPassword: '',
  dateNaissance: '',
  email: '',
  firstName: '',
  lastName: '',
  niveau: 'DEBUTANT',
  password: '',
  rememberMe: false,
  specialite: '',
};

export function getDashboardPath(role?: string): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'teacher':
      return '/teacher/dashboard';
    case 'student':
    default:
      return '/dashboard';
  }
}

export function getRedirectUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('redirect');
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

interface ValidateAuthFormParams {
  mode: 'signin' | 'signup' | 'forgot';
  signupRole: SignupRole;
  formData: AuthFormState;
}

export function validateAuthForm({
  mode,
  signupRole,
  formData,
}: ValidateAuthFormParams): Record<string, string> {
  const errors: Record<string, string> = {};
  const isSignup = mode === 'signup';
  const isForgot = mode === 'forgot';

  if (!formData.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!isValidEmail(formData.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!isForgot) {
    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }
  }

  if (isSignup) {
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required.';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required.';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (!formData.acceptTerms) {
      errors.acceptTerms = 'You must accept terms and privacy policy.';
    }

    if (signupRole === 'teacher') {
      if (!formData.specialite.trim()) {
        errors.specialite = 'Speciality is required for teachers.';
      }
    } else if (!formData.niveau.trim()) {
      errors.niveau = 'Learning level is required.';
    }
  }

  return errors;
}
