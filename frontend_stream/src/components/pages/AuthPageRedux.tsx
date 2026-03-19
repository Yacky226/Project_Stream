import { useEffect, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  Bolt,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  ShieldCheck,
  UserRoundPlus,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import type {
  LoginCredentials,
  RegisterData,
  RegisterTeacherData,
} from '../../types/auth';
import './AuthPageRedux.css';

type SignupRole = 'student' | 'teacher';

interface AuthPageReduxProps {
  mode: 'signin' | 'signup' | 'forgot';
  onNavigate: (path: string) => void;
  defaultSignupRole?: SignupRole;
}

interface AuthFormState {
  acceptTerms: boolean;
  confirmPassword: string;
  dateNaissance: string;
  email: string;
  firstName: string;
  lastName: string;
  niveau: string;
  password: string;
  rememberMe: boolean;
  specialite: string;
}

const initialForm: AuthFormState = {
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

function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function AuthPageRedux({
  mode,
  onNavigate,
  defaultSignupRole = 'student',
}: AuthPageReduxProps) {
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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

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

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage(null);

    if (!validateForm() || (isSignin && !canAttemptLogin)) {
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

  const title = isForgot ? 'Reset password' : isSignup ? 'Create account' : 'Welcome back';
  const subtitle = isForgot
    ? 'Enter your email to receive a secure reset link.'
    : 'Please enter your details to continue.';

  return (
    <div className="authx-page">
      <div className="authx-split-container">
        <aside className="authx-aside">
          <div className="authx-aside-overlay"></div>

          <div className="authx-aside-brand">
            <span className="authx-brand-icon-square" aria-hidden="true"></span>
            <span className="authx-brand-name">Platform</span>
          </div>

          <div className="authx-aside-content">
            <h1>Elevate your professional workflow.</h1>
            <p>
              Join thousands of professionals who use our platform to manage complex
              projects and scale their business.
            </p>

            <div className="authx-aside-benefits">
              <div className="authx-benefit-item">
                <div className="authx-benefit-icon">
                  <Bolt size={18} />
                </div>
                <div>
                  <h3>Real-time analytics</h3>
                  <p>Track every metric as it happens with zero latency.</p>
                </div>
              </div>

              <div className="authx-benefit-item">
                <div className="authx-benefit-icon">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3>Enterprise security</h3>
                  <p>Your data is protected by strong security controls.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="authx-aside-footer">
            <span>Copyright {currentYear} Platform Inc.</span>
            <div className="authx-aside-links">
              <button onClick={() => onNavigate('/privacy')} type="button">Privacy</button>
              <button onClick={() => onNavigate('/terms')} type="button">Terms</button>
            </div>
          </div>
        </aside>

        <section className="authx-main">
          <div className="authx-card">
            <div className="authx-mobile-brand">
              <GraduationCap size={18} />
              <span>Platform</span>
            </div>

            <div className="authx-header">
              <h2>{title}</h2>
              <p>{subtitle}</p>
            </div>

            {!isForgot && (
              <div className="authx-mode-toggle" role="tablist" aria-label="Authentication mode">
                <button
                  className={isSignin ? 'is-active' : ''}
                  onClick={() => onNavigate('/auth/signin')}
                  type="button"
                >
                  Login
                </button>
                <button
                  className={isSignup ? 'is-active' : ''}
                  onClick={() => onNavigate('/auth/signup')}
                  type="button"
                >
                  Sign up
                </button>
              </div>
            )}

            {!isForgot && (
              <div className="authx-social-grid">
                <button type="button">
                  <span className="authx-social-mark">G</span>
                  Google
                </button>
                <button type="button">
                  <span className="authx-social-mark">A</span>
                  Apple
                </button>
              </div>
            )}

            {!isForgot && (
              <div className="authx-divider">
                <span>Or continue with email</span>
              </div>
            )}

            {isSignin && !canAttemptLogin && timeUntilUnblock > 0 && (
              <div className="authx-alert authx-alert-error">
                <AlertCircle size={18} />
                <span>
                  Too many attempts. Please retry in {formatTime(timeUntilUnblock)}.
                </span>
              </div>
            )}

            {error && (
              <div className="authx-alert authx-alert-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {successMessage && <div className="authx-alert authx-alert-success">{successMessage}</div>}

            {isSignup && (
              <div className="authx-role-toggle" role="group" aria-label="Signup role">
                <button
                  className={signupRole === 'student' ? 'is-active' : ''}
                  onClick={() => setSignupRole('student')}
                  type="button"
                >
                  <GraduationCap size={16} /> Student
                </button>
                <button
                  className={signupRole === 'teacher' ? 'is-active' : ''}
                  onClick={() => setSignupRole('teacher')}
                  type="button"
                >
                  <UserRoundPlus size={16} /> Teacher
                </button>
              </div>
            )}

            <form className="authx-form" onSubmit={handleSubmit}>
              {isSignup && (
                <div className="authx-grid-2">
                  <div className="authx-field">
                    <label htmlFor="firstName">First name</label>
                    <input
                      className={`authx-input${validationErrors.firstName ? ' is-error' : ''}`}
                      disabled={isLoading}
                      id="firstName"
                      onChange={(event) => handleInputChange('firstName', event.target.value)}
                      type="text"
                      value={formData.firstName}
                    />
                    {validationErrors.firstName && (
                      <p className="authx-field-error">{validationErrors.firstName}</p>
                    )}
                  </div>

                  <div className="authx-field">
                    <label htmlFor="lastName">Last name</label>
                    <input
                      className={`authx-input${validationErrors.lastName ? ' is-error' : ''}`}
                      disabled={isLoading}
                      id="lastName"
                      onChange={(event) => handleInputChange('lastName', event.target.value)}
                      type="text"
                      value={formData.lastName}
                    />
                    {validationErrors.lastName && (
                      <p className="authx-field-error">{validationErrors.lastName}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="authx-field">
                <label htmlFor="email">Email address</label>
                <input
                  className={`authx-input${validationErrors.email ? ' is-error' : ''}`}
                  disabled={isLoading}
                  id="email"
                  onChange={(event) => handleInputChange('email', event.target.value)}
                  placeholder="name@company.com"
                  type="email"
                  value={formData.email}
                />
                {validationErrors.email && (
                  <p className="authx-field-error">{validationErrors.email}</p>
                )}
              </div>

              {!isForgot && (
                <div className="authx-field">
                  <div className="authx-field-row">
                    <label htmlFor="password">Password</label>
                    {isSignin && (
                      <button
                        className="authx-link"
                        onClick={() => onNavigate('/auth/forgot')}
                        type="button"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>

                  <div className="authx-password-wrap">
                    <input
                      className={`authx-input${validationErrors.password ? ' is-error' : ''}`}
                      disabled={isLoading}
                      id="password"
                      onChange={(event) => handleInputChange('password', event.target.value)}
                      placeholder="••••••••"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                    />
                    <button
                      className="authx-password-toggle"
                      onClick={() => setShowPassword((prev) => !prev)}
                      type="button"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {validationErrors.password && (
                    <p className="authx-field-error">{validationErrors.password}</p>
                  )}
                </div>
              )}

              {isSignup && (
                <div className="authx-field">
                  <label htmlFor="confirmPassword">Confirm password</label>
                  <input
                    className={`authx-input${validationErrors.confirmPassword ? ' is-error' : ''}`}
                    disabled={isLoading}
                    id="confirmPassword"
                    onChange={(event) => handleInputChange('confirmPassword', event.target.value)}
                    type="password"
                    value={formData.confirmPassword}
                  />
                  {validationErrors.confirmPassword && (
                    <p className="authx-field-error">{validationErrors.confirmPassword}</p>
                  )}
                </div>
              )}

              {isSignup && (
                <div className="authx-field">
                  <label htmlFor="dateNaissance">Birth date (optional)</label>
                  <input
                    className="authx-input"
                    disabled={isLoading}
                    id="dateNaissance"
                    onChange={(event) => handleInputChange('dateNaissance', event.target.value)}
                    type="date"
                    value={formData.dateNaissance}
                  />
                </div>
              )}

              {isSignup && signupRole === 'student' && (
                <div className="authx-field">
                  <label htmlFor="niveau">Learning level</label>
                  <select
                    className={`authx-select${validationErrors.niveau ? ' is-error' : ''}`}
                    disabled={isLoading}
                    id="niveau"
                    onChange={(event) => handleInputChange('niveau', event.target.value)}
                    value={formData.niveau}
                  >
                    <option value="DEBUTANT">Beginner</option>
                    <option value="INTERMEDIAIRE">Intermediate</option>
                    <option value="AVANCE">Advanced</option>
                  </select>
                  {validationErrors.niveau && (
                    <p className="authx-field-error">{validationErrors.niveau}</p>
                  )}
                </div>
              )}

              {isSignup && signupRole === 'teacher' && (
                <div className="authx-field">
                  <label htmlFor="specialite">Speciality</label>
                  <input
                    className={`authx-input${validationErrors.specialite ? ' is-error' : ''}`}
                    disabled={isLoading}
                    id="specialite"
                    onChange={(event) => handleInputChange('specialite', event.target.value)}
                    placeholder="Ex: Web development, Data science"
                    type="text"
                    value={formData.specialite}
                  />
                  {validationErrors.specialite && (
                    <p className="authx-field-error">{validationErrors.specialite}</p>
                  )}
                </div>
              )}

              {isSignin && (
                <label className="authx-check-row" htmlFor="rememberMe">
                  <input
                    checked={formData.rememberMe}
                    disabled={isLoading}
                    id="rememberMe"
                    onChange={(event) => handleInputChange('rememberMe', event.target.checked)}
                    type="checkbox"
                  />
                  <span>Remember me for 30 days</span>
                </label>
              )}

              {isSignup && (
                <>
                  <label className="authx-check-row" htmlFor="acceptTerms">
                    <input
                      checked={formData.acceptTerms}
                      disabled={isLoading}
                      id="acceptTerms"
                      onChange={(event) => handleInputChange('acceptTerms', event.target.checked)}
                      type="checkbox"
                    />
                    <span>
                      I accept
                      <button className="authx-inline-link" onClick={() => onNavigate('/terms')} type="button">
                        Terms
                      </button>
                      and
                      <button className="authx-inline-link" onClick={() => onNavigate('/privacy')} type="button">
                        Privacy policy
                      </button>
                    </span>
                  </label>
                  {validationErrors.acceptTerms && (
                    <p className="authx-field-error">{validationErrors.acceptTerms}</p>
                  )}
                </>
              )}

              <button
                className="authx-submit"
                disabled={isLoading || (isSignin && !canAttemptLogin)}
                type="submit"
              >
                {isLoading && <Loader2 className="authx-spin" size={16} />}
                {isSignin && 'Sign In'}
                {isSignup && 'Create account'}
                {isForgot && 'Send reset link'}
              </button>
            </form>

            <div className="authx-bottom-links">
              {isSignin && (
                <p>
                  Don&apos;t have an account?
                  <button onClick={() => onNavigate('/auth/signup')} type="button">Create one</button>
                </p>
              )}

              {isSignup && (
                <p>
                  Already have an account?
                  <button onClick={() => onNavigate('/auth/signin')} type="button">Sign in</button>
                </p>
              )}

              {isForgot && (
                <p>
                  Back to
                  <button onClick={() => onNavigate('/auth/signin')} type="button">sign in</button>
                </p>
              )}
            </div>
          </div>

          <div className="authx-mobile-footer">Copyright {currentYear} Platform Inc.</div>
        </section>
      </div>
    </div>
  );
}
