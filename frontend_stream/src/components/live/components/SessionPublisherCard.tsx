import { useMemo } from 'react';
import { AlertCircle, Video } from 'lucide-react';
import type { LiveSession } from '../../../types/live';
import { buildPlayerUrl, parseLiveKitAccessUrl } from '../liveSession.utils';
import { LiveKitRoomView } from '../LiveKitRoomView';
import { Alert, AlertDescription } from '../../ui/alert';
import { Badge } from '../../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';

interface SessionPublisherCardProps {
  session: LiveSession | null;
  streamUrl?: string;
  onRefreshAccessUrl?: () => Promise<unknown> | void;
  compactLayout?: boolean;
  className?: string;
}

export function SessionPublisherCard({
  session,
  streamUrl,
  onRefreshAccessUrl,
  compactLayout = false,
  className,
}: SessionPublisherCardProps) {
  const effectiveVideoUrl = streamUrl || session?.videoUrl || null;
  const sessionIsLive = Boolean(session && (session.isLive || session.status === 'LIVE'));
  const liveKitAccessUrl = useMemo(() => {
    if (!session) {
      return null;
    }

    return buildPlayerUrl({
      videoUrl: effectiveVideoUrl,
    });
  }, [effectiveVideoUrl, session]);

  const liveKitAccess = useMemo(
    () => parseLiveKitAccessUrl(liveKitAccessUrl || effectiveVideoUrl),
    [effectiveVideoUrl, liveKitAccessUrl],
  );

  if (!session) {
    return null;
  }

  return (
    <Card className={`overflow-hidden border-slate-200 bg-white text-slate-900 shadow-sm ${className || ''}`}>
      <CardHeader className={compactLayout ? 'space-y-2 pb-2' : undefined}>
        <CardTitle className="flex items-center gap-2 text-base font-semibold md:text-lg">
          <Video className="h-4 w-4 text-blue-600" />
          Studio LiveKit
        </CardTitle>
        <CardDescription>
          Controlez la camera, le micro et le partage ecran directement depuis LiveKit.
        </CardDescription>
      </CardHeader>
      <CardContent className={compactLayout ? 'space-y-3 p-4 md:p-5' : 'space-y-4 p-4 md:p-5'}>
        {liveKitAccessUrl || effectiveVideoUrl ? (
          <LiveKitRoomView
            accessUrl={liveKitAccessUrl || effectiveVideoUrl}
            mode="host"
            autoPublish={sessionIsLive}
            onRequestFreshAccess={onRefreshAccessUrl}
          />
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Lien LiveKit indisponible. Demarrez la session pour generer un acces valide.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-3 text-sm md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Statut</p>
            <div className="mt-2">
              <Badge variant={sessionIsLive ? 'destructive' : 'secondary'}>
                {sessionIsLive ? 'En direct' : 'Session non demarree'}
              </Badge>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Salle</p>
            <p className="mt-2 truncate font-medium">{liveKitAccess?.roomName || session.streamKey || 'N/A'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
