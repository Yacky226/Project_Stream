import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Sparkles,
  UserRoundPlus,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useAuth } from '../../hooks/useAuth';
import type {
  LoginCredentials,
  RegisterData,
  RegisterTeacherData,
} from '../../types/auth';

type SignupRole = 'student' | 'teacher';

interface AuthPageReduxProps {
  mode: 'signin' | 'signup' | 'forgot';
  onNavigate: (path: string) => void;
  defaultSignupRole?: SignupRole;
}

interface AuthFormState {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  confirmPassword: string;
  acceptTerms: boolean;
  dateNaissance: string;
  niveau: string;
  specialite: string;
}

const initialForm: AuthFormState = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  confirmPassword: '',
  acceptTerms: false,
  dateNaissance: '',
  niveau: 'DEBUTANT',
  specialite: '',
};

function getDashboardPath(role?: string): string {
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

function getRedirectUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('redirect');
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function AuthPageRedux({
  mode,
  onNavigate,
  defaultSignupRole = 'student',
}: AuthPageReduxProps) {
  const {
    login,
    register,
    registerTeacher,
    forgotPassword,
    isLoading,
    error,
    clearError,
    canAttemptLogin,
    timeUntilUnblock,
    user,
    isAuthenticated,
  } = useAuth();

  const [formData, setFormData] = useState<AuthFormState>(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [signupRole, setSignupRole] = useState<SignupRole>(defaultSignupRole);

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
    if (mode !== 'signup') {
      return;
    }

    setSignupRole(defaultSignupRole);
  }, [defaultSignupRole, mode]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email.trim()) {
      errors.email = "L'email est requis";
    } else if (!isValidEmail(formData.email.trim())) {
      errors.email = "Format d'email invalide";
    }

    if (mode !== 'forgot') {
      if (!formData.password) {
        errors.password = 'Le mot de passe est requis';
      } else if (formData.password.length < 8) {
        errors.password = 'Le mot de passe doit contenir au moins 8 caracteres';
      }
    }

    if (mode === 'signup') {
      if (!formData.firstName.trim()) {
        errors.firstName = 'Le prenom est requis';
      }

      if (!formData.lastName.trim()) {
        errors.lastName = 'Le nom est requis';
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }

      if (!formData.acceptTerms) {
        errors.acceptTerms = "Vous devez accepter les conditions d'utilisation";
      }

      if (signupRole === 'teacher') {
        if (!formData.specialite.trim()) {
          errors.specialite = 'La specialite est requise';
        }
      } else if (!formData.niveau.trim()) {
        errors.niveau = 'Le niveau est requis';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

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

  const handleRoleChange = (role: SignupRole) => {
    setSignupRole(role);
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next.specialite;
      delete next.niveau;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    if (!validateForm() || (mode === 'signin' && !canAttemptLogin)) {
      return;
    }

    try {
      if (mode === 'signin') {
        const credentials: LoginCredentials = {
          email: formData.email.trim(),
          password: formData.password,
        };

        const result = await login(credentials);
        const redirectUrl = getRedirectUrl();
        onNavigate(redirectUrl || getDashboardPath(result?.user?.role));
        return;
      }

      if (mode === 'signup') {
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

        const userData: RegisterData = {
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

        const result = await register(userData);
        const redirectUrl = getRedirectUrl();
        onNavigate(redirectUrl || getDashboardPath(result?.user?.role));
        return;
      }

      await forgotPassword(formData.email.trim());
      setSuccessMessage(
        'Si ce compte existe, un email de reinitialisation a ete envoye.',
      );
    } catch (err) {
      console.error('Authentication error:', err);
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60_000);
    const seconds = Math.floor((ms % 60_000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTitle = () => {
    if (mode === 'signin') return 'Connexion';
    if (mode === 'signup') return 'Inscription';
    return 'Mot de passe oublie';
  };

  const getDescription = () => {
    if (mode === 'signin') return 'Connectez-vous a votre compte Stream Educatif';
    if (mode === 'signup') return 'Une seule page pour creer un compte etudiant ou enseignant';
    return 'Entrez votre email pour reinitialiser votre mot de passe';
  };

  const isSignup = mode === 'signup';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto w-full max-w-2xl">
        <Card className="border-0 bg-background/95 shadow-2xl backdrop-blur">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Stream Educatif</span>
            </div>
            <CardTitle className="text-3xl">{getTitle()}</CardTitle>
            <CardDescription>{getDescription()}</CardDescription>
          </CardHeader>

          <CardContent>
            {mode === 'signin' && !canAttemptLogin && timeUntilUnblock > 0 && (
              <Alert className="mb-4" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Trop de tentatives de connexion. Reessayez dans {formatTime(timeUntilUnblock)}.
                </AlertDescription>
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
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            {isSignup && (
              <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleRoleChange('student')}
                  className={[
                    'rounded-xl border p-4 text-left transition-all',
                    signupRole === 'student'
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/40',
                  ].join(' ')}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <span className="font-medium">Etudiant</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Acces aux cours, live sessions et progression.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange('teacher')}
                  className={[
                    'rounded-xl border p-4 text-left transition-all',
                    signupRole === 'teacher'
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/40',
                  ].join(' ')}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <UserRoundPlus className="h-5 w-5 text-primary" />
                    <span className="font-medium">Enseignant</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Creation de cours et animation de sessions live.
                  </p>
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prenom</Label>
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
                </div>
              )}

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
                      onClick={() => setShowPassword((prev) => !prev)}
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

              {isSignup && (
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
                    <p className="text-sm text-destructive">
                      {validationErrors.confirmPassword}
                    </p>
                  )}
                </div>
              )}

              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="dateNaissance">Date de naissance (optionnel)</Label>
                  <Input
                    id="dateNaissance"
                    type="date"
                    value={formData.dateNaissance}
                    onChange={(e) => handleInputChange('dateNaissance', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              )}

              {isSignup && signupRole === 'student' && (
                <div className="space-y-2">
                  <Label>Niveau</Label>
                  <Select
                    value={formData.niveau}
                    onValueChange={(value) => handleInputChange('niveau', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className={validationErrors.niveau ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Choisir un niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DEBUTANT">Debutant</SelectItem>
                      <SelectItem value="INTERMEDIAIRE">Intermediaire</SelectItem>
                      <SelectItem value="AVANCE">Avance</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.niveau && (
                    <p className="text-sm text-destructive">{validationErrors.niveau}</p>
                  )}
                </div>
              )}

              {isSignup && signupRole === 'teacher' && (
                <div className="space-y-2">
                  <Label htmlFor="specialite">Specialite</Label>
                  <Input
                    id="specialite"
                    type="text"
                    value={formData.specialite}
                    onChange={(e) => handleInputChange('specialite', e.target.value)}
                    disabled={isLoading}
                    placeholder="Ex: Developpement web, Data, Design UX"
                    className={validationErrors.specialite ? 'border-destructive' : ''}
                  />
                  {validationErrors.specialite && (
                    <p className="text-sm text-destructive">{validationErrors.specialite}</p>
                  )}
                </div>
              )}

              {isSignup && (
                <>
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
                      </button>{' '}
                      et la{' '}
                      <button
                        type="button"
                        onClick={() => onNavigate('/privacy')}
                        className="text-primary hover:underline"
                      >
                        politique de confidentialite
                      </button>
                    </Label>
                  </div>

                  {validationErrors.acceptTerms && (
                    <p className="text-sm text-destructive">{validationErrors.acceptTerms}</p>
                  )}
                </>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || (mode === 'signin' && !canAttemptLogin)}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'signin' && 'Se connecter'}
                {mode === 'signup' && 'Creer le compte'}
                {mode === 'forgot' && 'Envoyer le lien'}
              </Button>
            </form>

            <div className="mt-5 space-y-2 text-center">
              {mode === 'signin' && (
                <>
                  <button
                    onClick={() => onNavigate('/auth/forgot')}
                    className="text-sm text-primary hover:underline"
                  >
                    Mot de passe oublie ?
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
                  Deja un compte ?{' '}
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
                  Retour a la connexion
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
