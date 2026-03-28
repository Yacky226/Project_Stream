import { Users } from 'lucide-react';
import type { LiveSession } from '../../../types/live';
import { formatSessionDate, getSessionStatusLabel } from '../liveSession.utils';
import { copyToClipboard } from '../liveModule.utils';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';

interface TeacherLiveOutputCardProps {
  session: LiveSession;
  onNavigate: (path: string) => void;
}

export function TeacherLiveOutputCard({ session, onNavigate }: TeacherLiveOutputCardProps) {
  const viewerPath = `/courses/${session.courseId}/live/${session.id}`;
  const sessionLabel = getSessionStatusLabel(session.status, session.isLive);

  return (
    <Card className="overflow-hidden border-slate-200 bg-white text-slate-900 shadow-sm">
      <CardHeader className="space-y-2 border-b border-slate-200 bg-slate-50 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-blue-600" />
          Salle de controle
        </CardTitle>
        <CardDescription className="text-slate-500">
          Pilotage rapide de la diffusion cote enseignant.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Statut</p>
            <div className="mt-2">
              <Badge variant={session.isLive ? 'destructive' : 'secondary'}>{sessionLabel}</Badge>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Session</p>
            <p className="mt-2 font-medium">#{session.id}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Cours</p>
            <p className="mt-2 font-medium">#{session.courseId}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Planifiee</p>
            <p className="mt-2 font-medium">{formatSessionDate(session.scheduledAt)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            className="rounded-full bg-sky-500 px-4 text-slate-950 hover:bg-sky-400"
            onClick={() => onNavigate(viewerPath)}
          >
            Ouvrir vue etudiant
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
            onClick={() => copyToClipboard(`${window.location.origin}${viewerPath}`)}
          >
            Copier lien live
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
