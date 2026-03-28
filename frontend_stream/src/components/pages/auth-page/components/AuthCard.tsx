import { AlertCircle, Eye, EyeOff, GraduationCap, Loader2, UserRoundPlus } from 'lucide-react';
import type { AuthPageModel } from '../useAuthPageModel';

interface AuthCardProps {
  model: AuthPageModel;
  onNavigate: (path: string) => void;
}

export function AuthCard({ model, onNavigate }: AuthCardProps) {
  return (
    <section className="authx-main">
      <div className="authx-card">
        <div className="authx-mobile-brand">
          <GraduationCap size={18} />
          <span>Platform</span>
        </div>

        <div className="authx-header">
          <h2>{model.title}</h2>
          <p>{model.subtitle}</p>
        </div>

        {!model.isForgot && (
          <div className="authx-mode-toggle" role="tablist" aria-label="Authentication mode">
            <button
              className={model.isSignin ? 'is-active' : ''}
              onClick={() => onNavigate('/auth/signin')}
              type="button"
            >
              Login
            </button>
            <button
              className={model.isSignup ? 'is-active' : ''}
              onClick={() => onNavigate('/auth/signup')}
              type="button"
            >
              Sign up
            </button>
          </div>
        )}

        {!model.isForgot && (
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

        {!model.isForgot && (
          <div className="authx-divider">
            <span>Or continue with email</span>
          </div>
        )}

        {model.isSignin && !model.canAttemptLogin && model.timeUntilUnblock > 0 && (
          <div className="authx-alert authx-alert-error">
            <AlertCircle size={18} />
            <span>
              Too many attempts. Please retry in {model.timeUntilUnblockText}.
            </span>
          </div>
        )}

        {model.authError && (
          <div className="authx-alert authx-alert-error">
            <AlertCircle size={18} />
            <span>{model.authError}</span>
          </div>
        )}

        {model.successMessage && <div className="authx-alert authx-alert-success">{model.successMessage}</div>}

        {model.isSignup && (
          <div className="authx-role-toggle" role="group" aria-label="Signup role">
            <button
              className={model.signupRole === 'student' ? 'is-active' : ''}
              onClick={() => model.setSignupRole('student')}
              type="button"
            >
              <GraduationCap size={16} /> Student
            </button>
            <button
              className={model.signupRole === 'teacher' ? 'is-active' : ''}
              onClick={() => model.setSignupRole('teacher')}
              type="button"
            >
              <UserRoundPlus size={16} /> Teacher
            </button>
          </div>
        )}

        <form className="authx-form" onSubmit={(event) => void model.handleSubmit(event)}>
          {model.isSignup && (
            <div className="authx-grid-2">
              <div className="authx-field">
                <label htmlFor="firstName">First name</label>
                <input
                  className={`authx-input${model.validationErrors.firstName ? ' is-error' : ''}`}
                  disabled={model.isLoading}
                  id="firstName"
                  onChange={(event) => model.handleInputChange('firstName', event.target.value)}
                  type="text"
                  value={model.formData.firstName}
                />
                {model.validationErrors.firstName && (
                  <p className="authx-field-error">{model.validationErrors.firstName}</p>
                )}
              </div>

              <div className="authx-field">
                <label htmlFor="lastName">Last name</label>
                <input
                  className={`authx-input${model.validationErrors.lastName ? ' is-error' : ''}`}
                  disabled={model.isLoading}
                  id="lastName"
                  onChange={(event) => model.handleInputChange('lastName', event.target.value)}
                  type="text"
                  value={model.formData.lastName}
                />
                {model.validationErrors.lastName && (
                  <p className="authx-field-error">{model.validationErrors.lastName}</p>
                )}
              </div>
            </div>
          )}

          <div className="authx-field">
            <label htmlFor="email">Email address</label>
            <input
              className={`authx-input${model.validationErrors.email ? ' is-error' : ''}`}
              disabled={model.isLoading}
              id="email"
              onChange={(event) => model.handleInputChange('email', event.target.value)}
              placeholder="name@company.com"
              type="email"
              value={model.formData.email}
            />
            {model.validationErrors.email && (
              <p className="authx-field-error">{model.validationErrors.email}</p>
            )}
          </div>

          {!model.isForgot && (
            <div className="authx-field">
              <div className="authx-field-row">
                <label htmlFor="password">Password</label>
                {model.isSignin && (
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
                  className={`authx-input${model.validationErrors.password ? ' is-error' : ''}`}
                  disabled={model.isLoading}
                  id="password"
                  onChange={(event) => model.handleInputChange('password', event.target.value)}
                  placeholder="••••••••"
                  type={model.showPassword ? 'text' : 'password'}
                  value={model.formData.password}
                />
                <button
                  className="authx-password-toggle"
                  onClick={model.togglePasswordVisibility}
                  type="button"
                >
                  {model.showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {model.validationErrors.password && (
                <p className="authx-field-error">{model.validationErrors.password}</p>
              )}
            </div>
          )}

          {model.isSignup && (
            <div className="authx-field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                className={`authx-input${model.validationErrors.confirmPassword ? ' is-error' : ''}`}
                disabled={model.isLoading}
                id="confirmPassword"
                onChange={(event) => model.handleInputChange('confirmPassword', event.target.value)}
                type="password"
                value={model.formData.confirmPassword}
              />
              {model.validationErrors.confirmPassword && (
                <p className="authx-field-error">{model.validationErrors.confirmPassword}</p>
              )}
            </div>
          )}

          {model.isSignup && (
            <div className="authx-field">
              <label htmlFor="dateNaissance">Birth date (optional)</label>
              <input
                className="authx-input"
                disabled={model.isLoading}
                id="dateNaissance"
                onChange={(event) => model.handleInputChange('dateNaissance', event.target.value)}
                type="date"
                value={model.formData.dateNaissance}
              />
            </div>
          )}

          {model.isSignup && model.signupRole === 'student' && (
            <div className="authx-field">
              <label htmlFor="niveau">Learning level</label>
              <select
                className={`authx-select${model.validationErrors.niveau ? ' is-error' : ''}`}
                disabled={model.isLoading}
                id="niveau"
                onChange={(event) => model.handleInputChange('niveau', event.target.value)}
                value={model.formData.niveau}
              >
                <option value="DEBUTANT">Beginner</option>
                <option value="INTERMEDIAIRE">Intermediate</option>
                <option value="AVANCE">Advanced</option>
              </select>
              {model.validationErrors.niveau && (
                <p className="authx-field-error">{model.validationErrors.niveau}</p>
              )}
            </div>
          )}

          {model.isSignup && model.signupRole === 'teacher' && (
            <div className="authx-field">
              <label htmlFor="specialite">Speciality</label>
              <input
                className={`authx-input${model.validationErrors.specialite ? ' is-error' : ''}`}
                disabled={model.isLoading}
                id="specialite"
                onChange={(event) => model.handleInputChange('specialite', event.target.value)}
                placeholder="Ex: Web development, Data science"
                type="text"
                value={model.formData.specialite}
              />
              {model.validationErrors.specialite && (
                <p className="authx-field-error">{model.validationErrors.specialite}</p>
              )}
            </div>
          )}

          {model.isSignin && (
            <label className="authx-check-row" htmlFor="rememberMe">
              <input
                checked={model.formData.rememberMe}
                disabled={model.isLoading}
                id="rememberMe"
                onChange={(event) => model.handleInputChange('rememberMe', event.target.checked)}
                type="checkbox"
              />
              <span>Remember me for 30 days</span>
            </label>
          )}

          {model.isSignup && (
            <>
              <label className="authx-check-row" htmlFor="acceptTerms">
                <input
                  checked={model.formData.acceptTerms}
                  disabled={model.isLoading}
                  id="acceptTerms"
                  onChange={(event) => model.handleInputChange('acceptTerms', event.target.checked)}
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
              {model.validationErrors.acceptTerms && (
                <p className="authx-field-error">{model.validationErrors.acceptTerms}</p>
              )}
            </>
          )}

          <button
            className="authx-submit"
            disabled={model.isLoading || (model.isSignin && !model.canAttemptLogin)}
            type="submit"
          >
            {model.isLoading && <Loader2 className="authx-spin" size={16} />}
            {model.isSignin && 'Sign In'}
            {model.isSignup && 'Create account'}
            {model.isForgot && 'Send reset link'}
          </button>
        </form>

        <div className="authx-bottom-links">
          {model.isSignin && (
            <p>
              Don&apos;t have an account?
              <button onClick={() => onNavigate('/auth/signup')} type="button">Create one</button>
            </p>
          )}

          {model.isSignup && (
            <p>
              Already have an account?
              <button onClick={() => onNavigate('/auth/signin')} type="button">Sign in</button>
            </p>
          )}

          {model.isForgot && (
            <p>
              Back to
              <button onClick={() => onNavigate('/auth/signin')} type="button">sign in</button>
            </p>
          )}
        </div>
      </div>

      <div className="authx-mobile-footer">Copyright {model.currentYear} Platform Inc.</div>
    </section>
  );
}
