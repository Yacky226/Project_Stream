import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '../../hooks/useAuth';
import { useAppSelector } from '../../hooks/redux';
import { AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { LoginCredentials, RegisterData } from '../../types/auth';

interface AuthPageReduxProps {
  mode: 'signin' | 'signup' | 'forgot';
  onNavigate: (path: string) => void;
}

export function AuthPageRedux({ mode, onNavigate }: AuthPageReduxProps) {
  const { login, register, isLoading, error, clearError, canAttemptLogin, timeUntilUnblock, user, isAuthenticated } = useAuth();
  const { theme } = useAppSelector(state => state.ui);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Helper functions
  const getDashboardPath = (role?: string): string => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'teacher':
        return '/teacher/dashboard';
      case 'student':
      default:
        return '/dashboard';
    }
  };

  const getRedirectUrl = (): string | null => {
    const params = new URLSearchParams(window.location.search);
    return params.get('redirect');
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectUrl = getRedirectUrl();
      if (redirectUrl) {
        onNavigate(redirectUrl);
      } else {
        const dashboardPath = getDashboardPath(user.role);
        onNavigate(dashboardPath);
      }
    }
  }, [isAuthenticated, user, onNavigate]);

  useEffect(() => {
    // Clear errors when mode changes
    clearError();
    setValidationErrors({});
  }, [mode, clearError]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Format d\'email invalide';
    }

    if (!formData.password) {
      errors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    if (mode === 'signup') {
      if (!formData.firstName) {
        errors.firstName = 'Le prénom est requis';
      }
      if (!formData.lastName) {
        errors.lastName = 'Le nom est requis';
      }
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
      if (!formData.acceptTerms) {
        errors.acceptTerms = 'Vous devez accepter les conditions d\'utilisation';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !canAttemptLogin) {
      return;
    }

    try {
      if (mode === 'signin') {
        const credentials: LoginCredentials = {
          email: formData.email,
          password: formData.password,
        };
        const result = await login(credentials);
        // Navigate to the appropriate dashboard based on user role
        // The result contains { user, token, refreshToken, expiresAt }
        const redirectUrl = getRedirectUrl();
        if (redirectUrl) {
          onNavigate(redirectUrl);
        } else {
          const dashboardPath = getDashboardPath(result?.user?.role);
          onNavigate(dashboardPath);
        }
      } else if (mode === 'signup') {
        const userData: RegisterData = {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          acceptTerms: formData.acceptTerms,
          acceptPrivacy: formData.acceptTerms,
        };
        const result = await register(userData);
        // Navigate to the appropriate dashboard based on user role
        // The result contains { user, token, refreshToken, expiresAt }
        const redirectUrl = getRedirectUrl();
        if (redirectUrl) {
          onNavigate(redirectUrl);
        } else {
          const dashboardPath = getDashboardPath(result?.user?.role);
          onNavigate(dashboardPath);
        }
      }
    } catch (err) {
      // Error is handled by Redux and will show in the error state
      console.error('Authentication error:', err);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'signin': return 'Connexion';
      case 'signup': return 'Créer un compte';
      case 'forgot': return 'Mot de passe oublié';
      default: return '';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'signin': return 'Connectez-vous à votre compte Stream Éducatif';
      case 'signup': return 'Créez votre compte pour commencer à apprendre';
      case 'forgot': return 'Entrez votre email pour réinitialiser votre mot de passe';
      default: return '';
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">{getTitle()}</CardTitle>
          <CardDescription className="text-center">
            {getDescription()}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Block Warning */}
          {!canAttemptLogin && timeUntilUnblock > 0 && (
            <Alert className="mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Trop de tentatives de connexion. Réessayez dans {formatTime(timeUntilUnblock)}.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name (Signup only) */}
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  disabled={isLoading}
                  className={validationErrors.firstName ? 'border-destructive' : ''}
                />
                {validationErrors.firstName && (
                  <p className="text-sm text-destructive">{validationErrors.firstName}</p>
                )}
              </div>
            )}

            {/* Last Name (Signup only) */}
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  disabled={isLoading}
                  className={validationErrors.lastName ? 'border-destructive' : ''}
                />
                {validationErrors.lastName && (
                  <p className="text-sm text-destructive">{validationErrors.lastName}</p>
                )}
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={isLoading}
                className={validationErrors.email ? 'border-destructive' : ''}
              />
              {validationErrors.email && (
                <p className="text-sm text-destructive">{validationErrors.email}</p>
              )}
            </div>

            {/* Password */}
            {mode !== 'forgot' && (
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    disabled={isLoading}
                    className={validationErrors.password ? 'border-destructive' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {validationErrors.password && (
                  <p className="text-sm text-destructive">{validationErrors.password}</p>
                )}
              </div>
            )}

            {/* Confirm Password (Signup only) */}
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  disabled={isLoading}
                  className={validationErrors.confirmPassword ? 'border-destructive' : ''}
                />
                {validationErrors.confirmPassword && (
                  <p className="text-sm text-destructive">{validationErrors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Terms Checkbox (Signup only) */}
            {mode === 'signup' && (
              <div className="flex items-center space-x-2">
                <input
                  id="acceptTerms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                  disabled={isLoading}
                  className="h-4 w-4"
                />
                <Label htmlFor="acceptTerms" className="text-sm">
                  J'accepte les{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate('/terms')}
                    className="text-primary hover:underline"
                  >
                    conditions d'utilisation
                  </button>
                  {' '}et la{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate('/privacy')}
                    className="text-primary hover:underline"
                  >
                    politique de confidentialité
                  </button>
                </Label>
              </div>
            )}
            {validationErrors.acceptTerms && (
              <p className="text-sm text-destructive">{validationErrors.acceptTerms}</p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !canAttemptLogin}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'signin' && 'Se connecter'}
              {mode === 'signup' && 'Créer le compte'}
              {mode === 'forgot' && 'Envoyer le lien'}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-4 text-center space-y-2">
            {mode === 'signin' && (
              <>
                <button
                  onClick={() => onNavigate('/auth/forgot')}
                  className="text-sm text-primary hover:underline"
                >
                  Mot de passe oublié ?
                </button>
                <div className="text-sm text-muted-foreground">
                  Pas encore de compte ?{' '}
                  <button
                    onClick={() => onNavigate('/auth/signup')}
                    className="text-primary hover:underline"
                  >
                    S'inscrire
                  </button>
                </div>
              </>
            )}
            
            {mode === 'signup' && (
              <div className="text-sm text-muted-foreground">
                Déjà un compte ?{' '}
                <button
                  onClick={() => onNavigate('/auth/signin')}
                  className="text-primary hover:underline"
                >
                  Se connecter
                </button>
              </div>
            )}
            
            {mode === 'forgot' && (
              <button
                onClick={() => onNavigate('/auth/signin')}
                className="text-sm text-primary hover:underline"
              >
                Retour à la connexion
              </button>
            )}
          </div>

          {/* Demo accounts info */}
          {process.env.NODE_ENV === 'development' && mode === 'signin' && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-semibold mb-2">Comptes de démonstration :</h4>
              <div className="text-xs space-y-1">
                <div>Étudiant : student@test.com / password123</div>
                <div>Enseignant : teacher@test.com / password123</div>
                <div>Admin : admin@test.com / password123</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}