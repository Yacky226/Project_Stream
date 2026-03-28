import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import type {
  ResetPasswordFormState,
  ResetPasswordPageData,
  ResetPasswordPageProps,
  ResetPasswordValidationErrors,
} from './resetPassword.types';
import {
  RESET_PASSWORD_INITIAL_FORM,
  validateResetPasswordForm,
} from './resetPassword.utils';

interface UseResetPasswordPageDataParams {
  onNavigate: ResetPasswordPageProps['onNavigate'];
}

export function useResetPasswordPageData({
  onNavigate,
}: UseResetPasswordPageDataParams): ResetPasswordPageData {
  const { resetPassword, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState<ResetPasswordFormState>(RESET_PASSWORD_INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ResetPasswordValidationErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const redirectTimerRef = useRef<number | null>(null);

  const token = new URLSearchParams(window.location.search).get('token')?.trim() || '';
  const hasToken = token.length > 0;

  useEffect(() => {
    clearError();
    setValidationErrors({});

    return () => {
      if (redirectTimerRef.current) {
        window.clearTimeout(redirectTimerRef.current);
      }
    };
  }, [clearError]);

  const handleInputChange = (field: keyof ResetPasswordFormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSuccessMessage(null);
    clearError();

    const nextErrors = validateResetPasswordForm({ hasToken, formData });
    setValidationErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await resetPassword(token, formData.newPassword);
      setSuccessMessage('Mot de passe mis a jour. Redirection vers la connexion...');
      redirectTimerRef.current = window.setTimeout(() => {
        onNavigate('/auth/signin');
      }, 1500);
    } catch (submitError) {
      console.error('Reset password failed:', submitError);
    }
  };

  return {
    hasToken,
    tokenError: validationErrors.token || null,
    authError: error || null,
    successMessage,
    isLoading,
    formData,
    validationErrors,
    showPassword,
    showConfirmPassword,
    setShowPassword,
    setShowConfirmPassword,
    handleInputChange,
    handleSubmit,
  };
}
