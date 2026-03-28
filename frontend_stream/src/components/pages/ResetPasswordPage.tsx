import { ResetPasswordPageContent } from './reset-password-page/components/ResetPasswordPageContent';
import type { ResetPasswordPageProps } from './reset-password-page/resetPassword.types';
import { useResetPasswordPageData } from './reset-password-page/useResetPasswordPageData';

export function ResetPasswordPage({ onNavigate }: ResetPasswordPageProps) {
  const pageData = useResetPasswordPageData({ onNavigate });

  return <ResetPasswordPageContent data={pageData} onNavigate={onNavigate} />;
}
