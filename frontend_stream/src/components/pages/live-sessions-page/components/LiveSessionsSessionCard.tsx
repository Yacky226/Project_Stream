import { CalendarClock, Radio, Video } from 'lucide-react';
import { formatSessionDate, getSessionStatusLabel, getSessionStatusVariant } from '../../../live/liveSession.utils';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import type { LiveSession } from '../../../../types/live';

interface LiveSessionsSessionCardProps {
  session: LiveSession;
  canManage: boolean;
  onNavigate: (path: string) => void;
}

export function LiveSessionsSessionCard({
  session,
  canManage,
  onNavigate,
}: LiveSessionsSessionCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Session #{session.id}
          </span>
          <Badge variant={getSessionStatusVariant(session.status, session.isLive)}>
            {session.isLive ? <Radio className="mr-1 h-3 w-3 animate-pulse" /> : null}
            {getSessionStatusLabel(session.status, session.isLive)}
          </Badge>
        </CardTitle>
        <CardDescription>
          Cours #{session.courseId} - Enseignant #{session.teacherId}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="space-y-1 text-muted-foreground">
          <p className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            {formatSessionDate(session.scheduledAt)}
          </p>
          <p>Resolution: {session.resolution || '720p'}</p>
          <p>Broadcast: {session.broadcastType || 'LIVEKIT'}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => onNavigate(`/courses/${session.courseId}/live/${session.id}`)}>
            Rejoindre
          </Button>
          {canManage ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onNavigate(`/teacher/live/${session.courseId}/${session.id}`)}
            >
              Studio
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
