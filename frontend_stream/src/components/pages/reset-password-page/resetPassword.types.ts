export interface ResetPasswordPageProps {
  onNavigate: (path: string) => void;
}

export interface ResetPasswordFormState {
  newPassword: string;
  confirmPassword: string;
}

export type ResetPasswordValidationErrors = Record<string, string>;

export interface ResetPasswordPageData {
  hasToken: boolean;
  tokenError: string | null;
  authError: string | null;
  successMessage: string | null;
  isLoading: boolean;
  formData: ResetPasswordFormState;
  validationErrors: ResetPasswordValidationErrors;
  showPassword: boolean;
  showConfirmPassword: boolean;
  setShowPassword: (value: boolean) => void;
  setShowConfirmPassword: (value: boolean) => void;
  handleInputChange: (field: keyof ResetPasswordFormState, value: string) => void;
  handleSubmit: (event: FormEvent) => Promise<void>;
}
import type { FormEvent } from 'react';
