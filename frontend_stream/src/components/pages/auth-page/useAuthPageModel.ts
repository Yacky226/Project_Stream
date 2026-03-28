import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import type {
  LoginCredentials,
  RegisterData,
  RegisterTeacherData,
} from '../../../types/auth';
import type { AuthFormState, AuthPageReduxProps, SignupRole } from './authPage.types';
import {
  formatTime,
  getDashboardPath,
  getRedirectUrl,
  initialForm,
  validateAuthForm,
} from './authPage.utils';

export interface AuthPageModel {
  currentYear: number;
  isSignin: boolean;
  isSignup: boolean;
  isForgot: boolean;
  title: string;
  subtitle: string;
  isLoading: boolean;
  canAttemptLogin: boolean;
  timeUntilUnblock: number;
  timeUntilUnblockText: string;
  authError: string | null;
  formData: AuthFormState;
  showPassword: boolean;
  signupRole: SignupRole;
  validationErrors: Record<string, string>;
  successMessage: string | null;
  setSignupRole: (role: SignupRole) => void;
  togglePasswordVisibility: () => void;
  handleInputChange: (field: keyof AuthFormState, value: string | boolean) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

interface UseAuthPageModelParams extends AuthPageReduxProps {}

export function useAuthPageModel({
  mode,
  onNavigate,
  defaultSignupRole = 'student',
}: UseAuthPageModelParams): AuthPageModel {
  const {
    canAttemptLogin,
    clearError,
    error,
    forgotPassword,
    isAuthenticated,
    isLoading,
    login,
    register,
    registerTeacher,
    timeUntilUnblock,
    user,
  } = useAuth();

  const [formData, setFormData] = useState<AuthFormState>(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [signupRole, setSignupRole] = useState<SignupRole>(defaultSignupRole);

  const isSignin = mode === 'signin';
  const isSignup = mode === 'signup';
  const isForgot = mode === 'forgot';
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    const redirectUrl = getRedirectUrl();
    onNavigate(redirectUrl || getDashboardPath(user.role));
  }, [isAuthenticated, onNavigate, user]);

  useEffect(() => {
    clearError();
    setValidationErrors({});
    setSuccessMessage(null);
  }, [clearError, mode]);

  useEffect(() => {
    if (mode === 'signup') {
      setSignupRole(defaultSignupRole);
    }
  }, [defaultSignupRole, mode]);

  const handleInputChange = (field: keyof AuthFormState, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage(null);

    const nextErrors = validateAuthForm({ mode, signupRole, formData });
    setValidationErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || (isSignin && !canAttemptLogin)) {
      return;
    }

    try {
      if (isSignin) {
        const credentials: LoginCredentials = {
          email: formData.email.trim(),
          password: formData.password,
          rememberMe: formData.rememberMe,
        };

        const result = await login(credentials);
        const redirectUrl = getRedirectUrl();
        onNavigate(redirectUrl || getDashboardPath(result?.user?.role));
        return;
      }

      if (isSignup) {
        if (signupRole === 'teacher') {
          const teacherData: RegisterTeacherData = {
            prenom: formData.firstName.trim(),
            nom: formData.lastName.trim(),
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
            role: 'ENSEIGNANT',
            specialite: formData.specialite.trim(),
            dateNaissance: formData.dateNaissance || undefined,
          };

          await registerTeacher(teacherData);
          const loginResult = await login({
            email: teacherData.email,
            password: teacherData.password,
          });

          const redirectUrl = getRedirectUrl();
          onNavigate(redirectUrl || getDashboardPath(loginResult?.user?.role));
          return;
        }

        const studentData: RegisterData = {
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          role: 'student',
          niveau: formData.niveau,
          dateNaissance: formData.dateNaissance || undefined,
          acceptTerms: formData.acceptTerms,
          acceptPrivacy: formData.acceptTerms,
        };

        const result = await register(studentData);
        const redirectUrl = getRedirectUrl();
        onNavigate(redirectUrl || getDashboardPath(result?.user?.role));
        return;
      }

      await forgotPassword(formData.email.trim());
      setSuccessMessage('If this email exists, a reset link has been sent.');
    } catch {
      // Backend errors are handled through the auth slice and shown in UI.
    }
  };

  return {
    currentYear,
    isSignin,
    isSignup,
    isForgot,
    title: isForgot ? 'Reset password' : isSignup ? 'Create account' : 'Welcome back',
    subtitle: isForgot
      ? 'Enter your email to receive a secure reset link.'
      : 'Please enter your details to continue.',
    isLoading,
    canAttemptLogin,
    timeUntilUnblock,
    timeUntilUnblockText: formatTime(timeUntilUnblock),
    authError: error,
    formData,
    showPassword,
    signupRole,
    validationErrors,
    successMessage,
    setSignupRole,
    togglePasswordVisibility: () => setShowPassword((prev) => !prev),
    handleInputChange,
    handleSubmit,
  };
}
