import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../ui/alert';
import { Button } from '../../ui/button';

interface UserGuardProps {
  allowed: boolean;
  message: string;
  onNavigate: (path: string) => void;
}

export function UserGuard({ allowed, message, onNavigate }: UserGuardProps) {
  if (allowed) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Acces restreint</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>{message}</p>
          <Button size="sm" onClick={() => onNavigate('/auth/signin')}>
            Aller a la connexion
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
