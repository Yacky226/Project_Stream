import { useMemo, useState } from 'react';
import {
  AlertCircle,
  CalendarClock,
  CircleOff,
  Radio,
  Search,
  Settings2,
  Users,
  Video,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { useAppSelector } from '../../hooks/redux';
import { useGetAllSessionsQuery } from '../../store/api/liveApi';
import { formatSessionDate, getSessionStatusLabel, getSessionStatusVariant } from '../live/liveSession.utils';
import type { LiveSession } from '../../types/live';

interface LiveSessionsPageProps {
  onNavigate: (path: string) => void;
}

type StatusFilter = 'all' | 'live' | 'scheduled' | 'ended';

function filterSessions(
  sessions: LiveSession[],
  query: string,
  statusFilter: StatusFilter,
): LiveSession[] {
  const normalizedQuery = query.trim().toLowerCase();

  return sessions
    .filter((session) => {
      const matchesSearch =
        !normalizedQuery ||
        session.id.toLowerCase().includes(normalizedQuery) ||
        session.courseId.toLowerCase().includes(normalizedQuery) ||
        session.teacherId.toLowerCase().includes(normalizedQuery);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'live' && (session.isLive || session.status === 'LIVE')) ||
        (statusFilter === 'scheduled' && !session.isLive && session.status !== 'ENDED') ||
        (statusFilter === 'ended' && session.status === 'ENDED');

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (a.isLive && !b.isLive) {
        return -1;
      }
      if (!a.isLive && b.isLive) {
        return 1;
      }
      return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime();
    });
}

function SessionCard({
  session,
  canManage,
  onNavigate,
}: {
  session: LiveSession;
  canManage: boolean;
  onNavigate: (path: string) => void;
}) {
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
          <p>Broadcast: {session.broadcastType || 'WebRTC'}</p>
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

export function LiveSessionsPage({ onNavigate }: LiveSessionsPageProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const canManage = user?.role === 'teacher' || user?.role === 'admin';
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const {
    data: sessions = [],
    isLoading,
    error,
    refetch,
  } = useGetAllSessionsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const filteredSessions = useMemo(
    () => filterSessions(sessions, searchQuery, statusFilter),
    [sessions, searchQuery, statusFilter],
  );

  const liveCount = sessions.filter((session) => session.isLive || session.status === 'LIVE').length;
  const upcomingCount = sessions.filter(
    (session) => !session.isLive && session.status !== 'ENDED',
  ).length;

  if (!isAuthenticated) {
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

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Sessions live</h1>
          <p className="mt-2 text-muted-foreground">
            Catalogue branche au backend. Rejoignez ou gerez les sessions en direct.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="destructive" className="px-3 py-1">
            <Radio className="mr-1 h-3 w-3 animate-pulse" />
            {liveCount} en direct
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            <Users className="mr-1 h-3 w-3" />
            {upcomingCount} a venir
          </Badge>
          {canManage ? (
            <Button size="sm" variant="outline" onClick={() => onNavigate('/teacher/live-sessions')}>
              <Settings2 className="mr-2 h-4 w-4" />
              Gerer mes lives
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-[1fr_220px_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Rechercher par session, cours ou enseignant..."
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="live">En direct</SelectItem>
            <SelectItem value="scheduled">Planifiees</SelectItem>
            <SelectItem value="ended">Terminees</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => refetch()}>
          Actualiser
        </Button>
      </div>

      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Impossible de charger les sessions live.</AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={String(index)}>
              <CardHeader>
                <CardTitle className="h-5 w-2/3 animate-pulse rounded bg-muted" />
                <CardDescription className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredSessions.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              canManage={canManage}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <CircleOff className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">Aucune session ne correspond aux filtres.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
            >
              Reinitialiser
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
