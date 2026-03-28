import { Alert, AlertDescription } from '../../../ui/alert';

export function NotificationsPageAuthRequired() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Alert variant="destructive">
        <AlertDescription>Connectez-vous pour consulter vos notifications.</AlertDescription>
      </Alert>
    </div>
  );
}
