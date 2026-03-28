import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { AccountHubContent } from './account-hub-page/components/AccountHubContent';
import type { AccountHubPageProps } from './account-hub-page/accountHub.types';
import { useAccountHubData } from './account-hub-page/useAccountHubData';

export function AccountHubPage({ onNavigate, initialTab = 'personal' }: AccountHubPageProps) {
  const model = useAccountHubData({ onNavigate, initialTab });

  if (model.navigateToSigninIfNeeded) {
    return null;
  }

  if (
    model.authLoading ||
    model.profileLoading ||
    model.preferencesLoading ||
    !model.preferencesForm
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f6f8] dark:bg-[#101622]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1152d4]" />
      </div>
    );
  }

  if (!model.profile) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Impossible de charger votre profil.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return <AccountHubContent model={model} onNavigate={onNavigate} />;
}
