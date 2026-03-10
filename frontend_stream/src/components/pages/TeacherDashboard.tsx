import { AlertCircle, BookOpen, Calendar, Loader2, Radio, RefreshCcw, Users } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGetTeacherDashboardQuery } from '../../store/api/dashboardApi';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { EmptyState } from '../layout/EmptyState';
import { PageContainer } from '../layout/PageContainer';
import { PageHeader } from '../layout/PageHeader';
import { SectionHeader } from '../layout/SectionHeader';
import { StatCard, StatsGrid } from '../layout/StatsGrid';

interface TeacherDashboardProps {
  onNavigate: (path: string) => void;
}

function extractErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'Impossible de charger le dashboard enseignant.';
  }

  const payload = error as {
    data?: { message?: string; error?: string };
    error?: string;
    message?: string;
  };

  return (
    payload.data?.message ||
    payload.data?.error ||
    payload.error ||
    payload.message ||
    'Impossible de charger le dashboard enseignant.'
  );
}

function formatDate(value: string | null): string {
  if (!value) {
    return 'Date non planifiee';
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function TeacherDashboard({ onNavigate }: TeacherDashboardProps) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const shouldLoad = Boolean(isAuthenticated && user?.role === 'teacher');

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetTeacherDashboardQuery(undefined, { skip: !shouldLoad });

  if (!authLoading && !isAuthenticated) {
    return (
      <PageContainer>
        <EmptyState
          icon={BookOpen}
          title="Connexion requise"
          description="Connectez-vous pour afficher votre dashboard enseignant."
          action={{
            label: 'Se connecter',
            onClick: () => onNavigate('/auth/signin'),
          }}
        />
      </PageContainer>
    );
  }

  if (!authLoading && isAuthenticated && user?.role !== 'teacher') {
    return (
      <PageContainer>
        <EmptyState
          icon={AlertCircle}
          title="Acces non autorise"
          description="Ce dashboard est reserve aux comptes enseignants."
          action={{
            label: 'Retour',
            onClick: () => onNavigate('/'),
          }}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={`Dashboard enseignant${user?.firstName ? ` - ${user.firstName}` : ''}`}
        description="Suivi des cours, inscriptions et sessions live en temps reel."
        actions={
          <>
            <Button variant="outline" onClick={() => onNavigate('/teacher/live-sessions')}>
              <Radio className="mr-2 h-4 w-4" />
              Sessions live
            </Button>
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="mr-2 h-4 w-4" />
              )}
              Actualiser
            </Button>
          </>
        }
      />

      {(isLoading || authLoading) && (
        <div className="flex min-h-[320px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {!isLoading && error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{extractErrorMessage(error)}</AlertDescription>
        </Alert>
      )}

      {!isLoading && data && (
        <div className="space-y-8">
          <StatsGrid columns={4}>
            <StatCard title="Cours" value={data.stats.totalCourses} icon={BookOpen} />
            <StatCard title="Etudiants inscrits" value={data.stats.totalStudents} icon={Users} />
            <StatCard
              title="Inscriptions actives"
              value={data.stats.activeEnrollments}
              icon={Users}
              description={`${data.stats.averageCompletionRate}% completion moyenne`}
            />
            <StatCard
              title="Sessions"
              value={data.stats.upcomingSessions}
              icon={Calendar}
              description={`${data.stats.liveSessions} en direct`}
            />
          </StatsGrid>

          <section>
            <SectionHeader
              title="Mes cours"
              description="Synthese des performances par cours"
            />

            {data.courses.length === 0 ? (
              <Card>
                <CardContent className="p-8">
                  <EmptyState
                    icon={BookOpen}
                    title="Aucun cours"
                    description="Creez votre premier cours pour commencer."
                    action={{
                      label: 'Voir le catalogue',
                      onClick: () => onNavigate('/catalog'),
                    }}
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {data.courses.map((course) => (
                  <Card key={course.id}>
                    <CardHeader className="space-y-2 pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-lg">{course.title}</CardTitle>
                          <CardDescription>{course.category}</CardDescription>
                        </div>
                        <Badge variant={course.liveSessions > 0 ? 'destructive' : 'outline'}>
                          {course.liveSessions > 0 ? 'Live' : 'Planifie'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-lg border p-2">
                          <p className="text-muted-foreground">Inscriptions</p>
                          <p className="font-medium">{course.enrollments}</p>
                        </div>
                        <div className="rounded-lg border p-2">
                          <p className="text-muted-foreground">Sessions</p>
                          <p className="font-medium">{course.sessions}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Completion moyenne</span>
                          <span className="font-medium">{course.completionRate}%</span>
                        </div>
                        <Progress value={course.completionRate} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Prochaine session: {formatDate(course.nextSessionAt)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Sessions a venir</CardTitle>
              <CardDescription>Planning consolide de vos cours</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.upcomingSessions.length === 0 && (
                <p className="text-sm text-muted-foreground">Aucune session planifiee.</p>
              )}
              {data.upcomingSessions.map((session) => (
                <div key={session.id} className="rounded-lg border p-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="font-medium">{session.courseTitle}</p>
                    <Badge variant={session.isLive ? 'destructive' : 'outline'}>
                      {session.isLive ? 'En direct' : 'Planifiee'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatDate(session.startAt)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
