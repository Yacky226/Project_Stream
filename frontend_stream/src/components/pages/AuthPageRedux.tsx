import { AuthAside } from './auth-page/components/AuthAside';
import { AuthCard } from './auth-page/components/AuthCard';
import type { AuthPageReduxProps } from './auth-page/authPage.types';
import { useAuthPageModel } from './auth-page/useAuthPageModel';
import './AuthPageRedux.css';

export function AuthPageRedux({
  mode,
  onNavigate,
  defaultSignupRole = 'student',
}: AuthPageReduxProps) {
  const model = useAuthPageModel({
    mode,
    onNavigate,
    defaultSignupRole,
  });

  return (
    <div className="authx-page">
      <div className="authx-split-container">
        <AuthAside currentYear={model.currentYear} onNavigate={onNavigate} />
        <AuthCard model={model} onNavigate={onNavigate} />
      </div>
    </div>
  );
}
