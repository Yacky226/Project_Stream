import { useMemo, useState } from 'react';
import { AlertCircle, BookOpen, Calendar, CheckCircle2, Clock, Loader2, RefreshCcw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGetStudentDashboardQuery } from '../../store/api/dashboardApi';
import { useGetCoursesQuery } from '../../store/api/liveApi';
import { useEnrollCourseMutation } from '../../store/api/userApi';
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

interface StudentDashboardProps {
  onNavigate: (path: string) => void;
}

function extractErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'Impossible de charger le dashboard etudiant.';
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
    'Impossible de charger le dashboard etudiant.'
  );
}

function extractActionErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const payload = error as {
    data?: string | { message?: string; error?: string };
    error?: string;
    message?: string;
  };

  if (typeof payload.data === 'string' && payload.data.trim()) {
    return payload.data;
  }

  if (payload.data && typeof payload.data === 'object') {
    if (payload.data.message) {
      return payload.data.message;
    }
    if (payload.data.error) {
      return payload.data.error;
    }
  }

  return payload.error || payload.message || fallback;
}

function formatDate(value: string | null): string {
  if (!value) {
    return 'Date non disponible';
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function enrollmentStatusLabel(status: string): string {
  if (status === 'TERMINE') {
    return 'Termine';
  }
  if (status === 'ABANDONNE') {
    return 'Abandonne';
  }
  return 'Actif';
}

function enrollmentStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'TERMINE') {
    return 'default';
  }
  if (status === 'ABANDONNE') {
    return 'destructive';
  }
  return 'secondary';
}

export function StudentDashboard({ onNavigate }: StudentDashboardProps) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const shouldLoad = Boolean(isAuthenticated && user?.role === 'student' && user?.id);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetStudentDashboardQuery(undefined, { skip: !shouldLoad });
  const {
    data: catalogCourses = [],
    isLoading: isLoadingCatalog,
    refetch: refetchCatalog,
  } = useGetCoursesQuery(undefined, { skip: !shouldLoad });
  const [enrollCourse, { isLoading: isEnrollingCourse }] = useEnrollCourseMutation();

  const enrolledCourseIds = useMemo(
    () => new Set((data?.courses || []).map((course) => String(course.id))),
    [data?.courses],
  );

  const availableCourses = useMemo(
    () => catalogCourses.filter((course) => !enrolledCourseIds.has(String(course.id))),
    [catalogCourses, enrolledCourseIds],
  );

  const handleEnrollCourse = async (courseId: string) => {
    if (!user) {
      onNavigate('/auth/signin');
      return;
    }

    setEnrollError(null);
    setEnrollingCourseId(courseId);
    try {
      await enrollCourse({
        coursId: courseId,
      }).unwrap();
      await refetch();
      await refetchCatalog();
    } catch (error) {
      setEnrollError(extractActionErrorMessage(error, 'Inscription impossible pour le moment.'));
    } finally {
      setEnrollingCourseId(null);
    }
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <PageContainer>
        <EmptyState
          icon={BookOpen}
          title="Connexion requise"
          description="Connectez-vous pour afficher votre dashboard etudiant."
          action={{
            label: 'Se connecter',
            onClick: () => onNavigate('/auth/signin'),
          }}
        />
      </PageContainer>
    );
  }

  if (!authLoading && isAuthenticated && user?.role !== 'student') {
    return (
      <PageContainer>
        <EmptyState
          icon={AlertCircle}
          title="Acces non autorise"
          description="Ce dashboard est reserve aux comptes etudiants."
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
        title={`Bienvenue, ${user?.firstName || 'Etudiant'}`}
        description="Suivi en temps reel de vos inscriptions, sessions et progression."
        actions={
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="mr-2 h-4 w-4" />
            )}
            Actualiser
          </Button>
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

      {enrollError ? (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{enrollError}</AlertDescription>
        </Alert>
      ) : null}

      {!isLoading && data && (
        <div className="space-y-8">
          <StatsGrid columns={4}>
            <StatCard
              title="Cours inscrits"
              value={data.stats.enrolledCourses}
              icon={BookOpen}
              description={`${data.stats.activeCourses} actifs`}
            />
            <StatCard
              title="Cours termines"
              value={data.stats.completedCourses}
              icon={CheckCircle2}
            />
            <StatCard
              title="Progression moyenne"
              value={`${data.stats.averageProgress}%`}
              icon={Clock}
            />
            <StatCard
              title="Sessions a venir"
              value={data.stats.upcomingSessions}
              icon={Calendar}
            />
          </StatsGrid>

          <section>
            <SectionHeader
              title="Mes cours"
              description="Inscriptions connectees au backend"
            />

            {data.courses.length === 0 ? (
              <Card>
                <CardContent className="p-8">
                  <EmptyState
                    icon={BookOpen}
                    title="Aucun cours inscrit"
                    description="Explorez le catalogue pour commencer votre apprentissage."
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
                  <Card
                    key={course.id}
                    className="cursor-pointer transition-colors hover:bg-muted/40"
                    onClick={() => onNavigate(`/courses/${course.id}`)}
                  >
                    <CardHeader className="space-y-2 pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-lg">{course.title}</CardTitle>
                          <CardDescription>{course.category}</CardDescription>
                        </div>
                        <Badge variant={enrollmentStatusVariant(course.status)}>
                          {enrollmentStatusLabel(course.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progression</span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} />
                      <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                        <p>Inscrit le: {formatDate(course.enrolledAt)}</p>
                        <p>Prochaine session: {formatDate(course.scheduledAt)}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section>
            <SectionHeader
              title="Cours disponibles"
              description="Inscription directe depuis votre dashboard"
              action={
                <Button variant="outline" size="sm" onClick={() => onNavigate('/catalog')}>
                  Voir le catalogue complet
                </Button>
              }
            />

            {isLoadingCatalog ? (
              <div className="flex min-h-[160px] items-center justify-center rounded-lg border bg-muted/20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : availableCourses.length === 0 ? (
              <Card>
                <CardContent className="p-8">
                  <EmptyState
                    icon={BookOpen}
                    title="Aucun nouveau cours disponible"
                    description="Vous etes deja inscrit aux cours actuellement visibles."
                    action={{
                      label: 'Parcourir le catalogue',
                      onClick: () => onNavigate('/catalog'),
                    }}
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {availableCourses.slice(0, 6).map((course) => (
                  <Card key={course.id}>
                    <CardHeader className="space-y-2 pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-lg">{course.title}</CardTitle>
                          <CardDescription>{course.category}</CardDescription>
                        </div>
                        <Badge variant="outline">Nouveau</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {course.description || 'Description non disponible.'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Prochaine date: {formatDate(course.scheduledAt || null)}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => onNavigate(`/courses/${course.id}`)}>
                          Voir details
                        </Button>
                        <Button
                          size="sm"
                          disabled={isEnrollingCourse && enrollingCourseId === course.id}
                          onClick={() => handleEnrollCourse(course.id)}
                        >
                          {isEnrollingCourse && enrollingCourseId === course.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          S inscrire
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sessions a venir</CardTitle>
                <CardDescription>Sessions live de vos cours</CardDescription>
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

            <Card>
              <CardHeader>
                <CardTitle>Activite recente</CardTitle>
                <CardDescription>Resume automatique de votre progression</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.recentActivity.length === 0 && (
                  <p className="text-sm text-muted-foreground">Aucune activite recente.</p>
                )}
                {data.recentActivity.map((activity) => (
                  <div key={activity.id} className="rounded-lg border p-3">
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(activity.occurredAt)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
