import { LiveSessionsAuthPrompt } from './live-sessions-page/components/LiveSessionsAuthPrompt';
import { LiveSessionsContent } from './live-sessions-page/components/LiveSessionsContent';
import type { LiveSessionsPageProps } from './live-sessions-page/liveSessions.types';
import { useLiveSessionsData } from './live-sessions-page/useLiveSessionsData';

export function LiveSessionsPage({ onNavigate }: LiveSessionsPageProps) {
  const model = useLiveSessionsData();

  if (!model.isAuthenticated) {
    return <LiveSessionsAuthPrompt onNavigate={onNavigate} />;
  }

  return <LiveSessionsContent model={model} onNavigate={onNavigate} />;
}
