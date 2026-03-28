import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '../../../ui/alert';
import type { PublicStudentProfileDataModel } from '../publicStudentProfile.types';

interface PublicStudentProfileStatusProps {
  status: PublicStudentProfileDataModel['status'];
  errorMessage: string | null;
}

export function PublicStudentProfileStatus({
  status,
  errorMessage,
}: PublicStudentProfileStatusProps) {
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f6f8] dark:bg-[#101622]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1152d4]" />
      </div>
    );
  }

  if (status === 'auth-required') {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Connectez-vous pour previsualiser votre profil public etudiant.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (status === 'wrong-role') {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Ce profil public est reserve aux comptes etudiants.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{errorMessage || 'Impossible de charger votre profil public.'}</AlertDescription>
      </Alert>
    </div>
  );
}
