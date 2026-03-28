import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../../../ui/alert';
import { Button } from '../../../ui/button';

interface LiveSessionsAuthPromptProps {
  onNavigate: (path: string) => void;
}

export function LiveSessionsAuthPrompt({ onNavigate }: LiveSessionsAuthPromptProps) {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="space-y-3">
          <p>Connectez-vous pour voir les sessions live disponibles.</p>
          <Button size="sm" onClick={() => onNavigate('/auth/signin')}>
            Aller a la connexion
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
