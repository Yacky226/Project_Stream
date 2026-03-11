import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { useAppSelector } from '../../hooks/redux';
import { useEnrollCourseMutation } from '../../store/api/userApi';
import {
  useGetCourseDetailsQuery,
  useGetCourseSessionsQuery,
  useGetCourseLiveSessionQuery,
} from '../../store/api/liveApi';
import { formatSessionDate, parseNumericId } from '../live/liveSession.utils';
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Play,
  Radio,
  Star,
  Users,
} from 'lucide-react';

interface CourseDetailProps {
  courseId: string;
  onNavigate: (path: string) => void;
}

function toHoursAndMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export function CourseDetail({ courseId, onNavigate }: CourseDetailProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const numericCourseId = parseNumericId(courseId);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const studentId = user?.role === 'student' ? user.id : undefined;

  const {
    data: courseDetails,
    isLoading: isLoadingCourse,
    error: courseError,
    refetch: refetchCourseDetails,
  } = useGetCourseDetailsQuery({
    courseId: numericCourseId || '',
    studentId,
  }, {
    skip: !numericCourseId,
  });

  const { data: sessions = [], isLoading: isLoadingSessions } = useGetCourseSessionsQuery(
    numericCourseId || '',
    { skip: !numericCourseId || !isAuthenticated },
  );

  const { data: liveSession } = useGetCourseLiveSessionQuery(numericCourseId || '', {
    skip: !numericCourseId || !isAuthenticated,
  });

  const [enrollCourse, { isLoading: isEnrolling }] = useEnrollCourseMutation();

  const allLessons = useMemo(
    () =>
      (courseDetails?.sections || [])
        .slice()
        .sort((a, b) => a.order - b.order)
        .flatMap((section) =>
          section.lessons
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((lesson) => ({ ...lesson, sectionTitle: section.title })),
        ),
    [courseDetails],
  );

  const totalDuration = useMemo(
    () =>
      allLessons.reduce(
        (total, lesson) => total + (typeof lesson.durationMinutes === 'number' ? lesson.durationMinutes : 0),
        0,
      ),
    [allLessons],
  );

  const completedLessons = allLessons.filter((lesson) => lesson.completed).length;
  const progress = allLessons.length ? Math.round((completedLessons / allLessons.length) * 100) : 0;

  const handleEnroll = async () => {
    if (!isAuthenticated || !user?.id) {
      onNavigate('/auth/signin');
      return;
    }
    if (user.role !== 'student' || !numericCourseId) {
      setErrorMessage('Seuls les etudiants peuvent s inscrire au cours.');
      return;
    }

    setErrorMessage(null);
    try {
      await enrollCourse({
        coursId: numericCourseId,
      }).unwrap();
      await refetchCourseDetails();
    } catch (error) {
      const payload = error as {
        data?: string | { message?: string; error?: string };
      };
      const backendMessage =
        typeof payload?.data === 'string'
          ? payload.data
          : payload?.data?.message || payload?.data?.error;
      setErrorMessage(backendMessage || 'Inscription impossible pour le moment.');
    }
  };

  if (!numericCourseId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Identifiant de cours invalide.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoadingCourse) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 h-80 animate-pulse bg-muted/30" />
          <Card className="h-80 animate-pulse bg-muted/30" />
        </div>
      </div>
    );
  }

  if (!courseDetails || courseError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Ce cours est introuvable ou indisponible.
          </AlertDescription>
        </Alert>
        <Button className="mt-4" variant="outline" onClick={() => onNavigate('/catalog')}>
          Retour au catalogue
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-muted/30 py-8">
        <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('/catalog')}>
              ← Retour au catalogue
            </Button>

            <h1 className="mt-3 text-3xl lg:text-4xl">{courseDetails.title}</h1>
            <p className="mt-3 text-lg text-muted-foreground">{courseDetails.description}</p>

            <div className="mt-5 flex flex-wrap items-center gap-4">
              <Badge variant="outline">{courseDetails.category}</Badge>
              <div className="flex items-center">
                <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{courseDetails.averageRating?.toFixed(1) || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <Users className="mr-1 h-4 w-4" />
                <span>{courseDetails.enrolledCount} inscrits</span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                <span>{toHoursAndMinutes(courseDetails.durationMinutes || totalDuration || 0)}</span>
              </div>
            </div>

            <p className="mt-3 text-sm text-muted-foreground">
              Enseignant: {courseDetails.teacherName || `#${courseDetails.teacherId}`}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Acces au cours</CardTitle>
              <CardDescription>{courseDetails.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">39€</div>
              {courseDetails.isEnrolled ? (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Progression: {completedLessons}/{allLessons.length} ({progress}%)
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <Button onClick={handleEnroll} disabled={isEnrolling} className="w-full">
                  S inscrire
                </Button>
              )}

              {liveSession && (liveSession.isLive || liveSession.status === 'LIVE') ? (
                <Button
                  className="w-full bg-red-500 hover:bg-red-600"
                  onClick={() => onNavigate(`/courses/${courseId}/live/${liveSession.id}`)}
                >
                  <Radio className="mr-2 h-4 w-4 animate-pulse" />
                  Rejoindre le live
                </Button>
              ) : null}

              {errorMessage ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Contenu</TabsTrigger>
            <TabsTrigger value="sessions">Sessions live</TabsTrigger>
            <TabsTrigger value="reviews">Avis</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Programme du cours</CardTitle>
                <CardDescription>
                  {allLessons.length} lecons reparties en {courseDetails.sections.length} sections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {allLessons.length ? (
                  allLessons.map((lesson, index) => (
                    <div key={lesson.id} className="rounded-md border p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {lesson.completed ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="font-medium">
                            {index + 1}. {lesson.title}
                          </span>
                        </div>
                        <Badge variant="outline">{lesson.type}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Section: {lesson.sectionTitle}
                        {typeof lesson.durationMinutes === 'number'
                          ? ` - ${toHoursAndMinutes(lesson.durationMinutes)}`
                          : ''}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Aucune lecon disponible.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sessions live associees</CardTitle>
                <CardDescription>
                  {isLoadingSessions ? 'Chargement...' : `${sessions.length} session(s)`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {sessions.length ? (
                  sessions.map((session) => {
                    const canWatch =
                      session.isLive || session.status === 'LIVE' || Boolean(session.recordingUrl);
                    const sessionLabel = session.isLive
                      ? 'En direct'
                      : session.recordingUrl
                        ? 'Replay'
                        : 'Planifiee';

                    return (
                      <div key={session.id} className="rounded-md border p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-medium">Session #{session.id}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatSessionDate(session.scheduledAt)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge
                              variant={
                                session.isLive ? 'destructive' : session.recordingUrl ? 'secondary' : 'outline'
                              }
                            >
                              {sessionLabel}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!canWatch}
                              onClick={() => onNavigate(`/courses/${courseId}/live/${session.id}`)}
                            >
                              <Play className="mr-2 h-4 w-4" />
                              {session.recordingUrl ? 'Replay' : 'Voir'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">Aucune session live pour ce cours.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Avis et retours</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Note moyenne: {courseDetails.averageRating?.toFixed(1) || 'N/A'} ({courseDetails.reviewCount} avis)
                </p>
                <Separator className="my-4" />
                <p className="text-sm text-muted-foreground">
                  Le module d avis detaille sera connecte avec les retours etudiants.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
