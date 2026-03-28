import type {
  ResetPasswordFormState,
  ResetPasswordValidationErrors,
} from './resetPassword.types';

export const RESET_PASSWORD_INITIAL_FORM: ResetPasswordFormState = {
  newPassword: '',
  confirmPassword: '',
};

interface ValidateResetPasswordFormParams {
  hasToken: boolean;
  formData: ResetPasswordFormState;
}

export function validateResetPasswordForm({
  hasToken,
  formData,
}: ValidateResetPasswordFormParams): ResetPasswordValidationErrors {
  const errors: ResetPasswordValidationErrors = {};

  if (!hasToken) {
    errors.token = 'Lien invalide: token manquant.';
  }

  if (!formData.newPassword) {
    errors.newPassword = 'Le mot de passe est requis.';
  } else if (formData.newPassword.length < 8) {
    errors.newPassword = 'Le mot de passe doit contenir au moins 8 caracteres.';
  }

  if (!formData.confirmPassword) {
    errors.confirmPassword = 'La confirmation du mot de passe est requise.';
  } else if (formData.newPassword !== formData.confirmPassword) {
    errors.confirmPassword = 'Les mots de passe ne correspondent pas.';
  }

  return errors;
}
