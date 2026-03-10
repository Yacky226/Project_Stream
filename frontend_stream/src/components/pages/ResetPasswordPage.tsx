import { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '../../hooks/useAuth';

interface ResetPasswordPageProps {
  onNavigate: (path: string) => void;
}

interface ResetPasswordFormState {
  newPassword: string;
  confirmPassword: string;
}

const initialForm: ResetPasswordFormState = {
  newPassword: '',
  confirmPassword: '',
};

export function ResetPasswordPage({ onNavigate }: ResetPasswordPageProps) {
  const { resetPassword, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState<ResetPasswordFormState>(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

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

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    field: keyof ResetPasswordFormState,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    clearError();

    if (!validateForm()) {
      return;
    }

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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Nouveau mot de passe</CardTitle>
          <CardDescription className="text-center">
            Definissez un nouveau mot de passe pour votre compte
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!hasToken && (
            <Alert className="mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Lien de reinitialisation invalide. Veuillez demander un nouveau lien.
              </AlertDescription>
            </Alert>
          )}

          {validationErrors.token && (
            <Alert className="mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationErrors.token}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="mb-4">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  disabled={isLoading || !hasToken}
                  className={validationErrors.newPassword ? 'border-destructive' : ''}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isLoading || !hasToken}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {validationErrors.newPassword && (
                <p className="text-sm text-destructive">{validationErrors.newPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  disabled={isLoading || !hasToken}
                  className={validationErrors.confirmPassword ? 'border-destructive' : ''}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  disabled={isLoading || !hasToken}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-sm text-destructive">{validationErrors.confirmPassword}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !hasToken}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mettre a jour le mot de passe
            </Button>
          </form>

          <div className="mt-4 text-center">
            {hasToken ? (
              <button
                onClick={() => onNavigate('/auth/signin')}
                className="text-sm text-primary hover:underline"
              >
                Retour a la connexion
              </button>
            ) : (
              <button
                onClick={() => onNavigate('/auth/forgot')}
                className="text-sm text-primary hover:underline"
              >
                Demander un nouveau lien
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
