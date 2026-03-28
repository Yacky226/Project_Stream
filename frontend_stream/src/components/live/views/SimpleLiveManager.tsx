import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  Copy,
  GraduationCap,
  Loader2,
  Play,
  Radio,
  Square,
  Tv,
  Video,
} from 'lucide-react';
import { useAppSelector } from '../../../hooks/redux';
import { normalizeUserRole } from '../../../lib/roleUtils';
import {
  useCreateCourseMutation,
  useCreateSessionMutation,
  useFetchSessionVodMutation,
  useGetTeacherCoursesQuery,
  useGetTeacherSessionsQuery,
  useStartSessionMutation,
  useStopSessionMutation,
} from '../../../store/api/liveApi';
import type { LiveCourse } from '../../../types/live';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Switch } from '../../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Textarea } from '../../ui/textarea';
import { Alert, AlertDescription } from '../../ui/alert';
import type { SimpleLiveManagerProps } from '../live.types';
import { copyToClipboard, getErrorMessage, sortSessions } from '../liveModule.utils';
import { formatSessionDate, parseNumericId, toLocalDateTimeInput } from '../liveSession.utils';
import { SessionStatusPill } from '../components/SessionStatusPill';
import { UserGuard } from '../components/UserGuard';
export function SimpleLiveManager({
  courseId,
  onNavigate,
  embedded = false,
}: SimpleLiveManagerProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const isTeacher = normalizeUserRole(user?.role) === 'teacher';
  const teacherId = parseNumericId(user?.id);
  const fixedCourseId = courseId === 'all' ? null : parseNumericId(courseId);

  const {
    data: teacherSessions = [],
    isLoading: isLoadingSessions,
    refetch: refetchSessions,
    error: sessionsError,
  } = useGetTeacherSessionsQuery(undefined, {
    skip: !isAuthenticated || !isTeacher,
  });

  const {
    data: teacherCourses = [],
    isLoading: isLoadingCourses,
    refetch: refetchCourses,
    error: coursesError,
  } = useGetTeacherCoursesQuery(undefined, {
    skip: !isAuthenticated || !isTeacher,
  });

  const [createCourse, { isLoading: isCreatingCourse }] = useCreateCourseMutation();
  const [createSession, { isLoading: isCreating }] = useCreateSessionMutation();
  const [startSession, { isLoading: isStarting }] = useStartSessionMutation();
  const [stopSession, { isLoading: isStopping }] = useStopSessionMutation();
  const [fetchVod, { isLoading: isFetchingVod }] = useFetchSessionVodMutation();

  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseCategory, setCourseCategory] = useState('Programmation');
  const [courseStartAt, setCourseStartAt] = useState<string>(
    toLocalDateTimeInput(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()),
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [courseSelection, setCourseSelection] = useState<string>('');
  const [scheduledAt, setScheduledAt] = useState<string>(
    toLocalDateTimeInput(new Date(Date.now() + 15 * 60 * 1000).toISOString()),
  );
  const [recordingEnabled, setRecordingEnabled] = useState(true);
  const [resolution, setResolution] = useState('720p');
  const [creationTab, setCreationTab] = useState<'session' | 'course'>('session');

  useEffect(() => {
    if (fixedCourseId) {
      setCourseSelection(String(fixedCourseId));
      return;
    }
    if (!courseSelection && teacherCourses.length) {
      setCourseSelection(teacherCourses[0].id);
      return;
    }
    if (
      courseSelection &&
      teacherCourses.length &&
      !teacherCourses.some((course) => course.id === courseSelection)
    ) {
      setCourseSelection(teacherCourses[0].id);
    }
  }, [teacherCourses, courseSelection, fixedCourseId]);

  const sessions = useMemo(() => {
    const filtered = fixedCourseId
      ? teacherSessions.filter((session) => Number(session.courseId) === fixedCourseId)
      : teacherSessions;
    return sortSessions(filtered);
  }, [teacherSessions, fixedCourseId]);

  const selectedCourse = useMemo(
    () => teacherCourses.find((course) => course.id === courseSelection) || null,
    [teacherCourses, courseSelection],
  );

  const courseSummaries = useMemo(() => {
    const summaries = teacherCourses.map((course) => {
      const courseSessions = teacherSessions.filter(
        (session) => String(session.courseId) === String(course.id),
      );
      const liveCount = courseSessions.filter(
        (session) => session.isLive || session.status === 'LIVE',
      ).length;
      const replayCount = courseSessions.filter((session) => Boolean(session.recordingUrl)).length;
      const latestSession = [...courseSessions].sort(
        (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
      )[0] || null;

      return {
        course,
        courseSessions,
        sessionCount: courseSessions.length,
        liveCount,
        replayCount,
        latestSession,
      };
    });

    return summaries.sort((a, b) => b.sessionCount - a.sessionCount);
  }, [teacherCourses, teacherSessions]);

  const visibleCourseSummaries = useMemo(() => {
    if (!fixedCourseId) {
      return courseSummaries;
    }
    return courseSummaries.filter(
      (summary) => Number(summary.course.id) === Number(fixedCourseId),
    );
  }, [courseSummaries, fixedCourseId]);

  const liveCount = teacherSessions.filter(
    (session) => session.isLive || session.status === 'LIVE',
  ).length;
  const replayCount = teacherSessions.filter((session) => Boolean(session.recordingUrl)).length;
  const plannedCount = teacherSessions.filter(
    (session) => !session.isLive && session.status !== 'LIVE',
  ).length;
  const activeSession =
    sessions.find((session) => session.isLive || session.status === 'LIVE') || null;
  const nextSession =
    sessions.find((session) => !session.isLive && session.status !== 'LIVE') || null;

  const handleCreateCourse = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!teacherId) {
      setErrorMessage('ID enseignant invalide. Reconnectez-vous.');
      return;
    }
    if (!courseTitle.trim() || !courseDescription.trim()) {
      setErrorMessage('Remplissez le titre et la description du cours.');
      return;
    }
    if (!courseStartAt) {
      setErrorMessage('Selectionnez une date de lancement du cours.');
      return;
    }

    setErrorMessage(null);
    try {
      const createdCourse = await createCourse({
        title: courseTitle,
        description: courseDescription,
        category: courseCategory,
        scheduledAt: courseStartAt,
        teacherId,
      }).unwrap();

      await refetchCourses();
      setCourseSelection(createdCourse.id);
      setCreationTab('session');
      setCourseTitle('');
      setCourseDescription('');
      setCourseCategory('Programmation');
      setCourseStartAt(
        toLocalDateTimeInput(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()),
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Creation du cours impossible'));
    }
  };

  const handleCreateSession = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!teacherId) {
      setErrorMessage('ID enseignant invalide. Reconnectez-vous.');
      return;
    }
    if (!courseSelection) {
      setErrorMessage('Selectionnez un cours.');
      return;
    }

    setErrorMessage(null);
    try {
      const created = await createSession({
        courseId: courseSelection,
        teacherId,
        scheduledAt,
        recordingEnabled,
        resolution,
      }).unwrap();
      onNavigate(`/teacher/live/${created.courseId}/${created.id}`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Creation de session impossible'));
    }
  };

  const handleStart = async (sessionId: string) => {
    setErrorMessage(null);
    try {
      await startSession(sessionId).unwrap();
      await refetchSessions();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Demarrage impossible'));
    }
  };

  const handleStop = async (sessionId: string) => {
    setErrorMessage(null);
    try {
      await stopSession(sessionId).unwrap();
      await refetchSessions();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Arret impossible'));
    }
  };

  const handleFetchVod = async (sessionId: string) => {
    setErrorMessage(null);
    try {
      await fetchVod(sessionId).unwrap();
      await refetchSessions();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Recuperation VOD impossible'));
    }
  };

  const focusSessionFormForCourse = (targetCourseId: string) => {
    setCourseSelection(targetCourseId);
    setCreationTab('session');
    if (typeof window !== 'undefined') {
      const sessionForm = window.document.getElementById('session-create-form');
      sessionForm?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const focusSessionForm = () => {
    setCreationTab('session');
    if (typeof window !== 'undefined') {
      const sessionForm = window.document.getElementById('session-create-form');
      sessionForm?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!isAuthenticated || !isTeacher) {
    return (
      <UserGuard
        allowed={false}
        message="Cette page est reservee aux enseignants connectes."
        onNavigate={onNavigate}
      />
    );
  }

  const surfaceClass = embedded
    ? 'overflow-hidden rounded-[32px] border border-[#dbe6ff] bg-gradient-to-b from-slate-100 via-slate-50 to-white pb-8 pt-5 shadow-sm dark:border-slate-800 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900'
    : 'min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-100 via-slate-50 to-white pb-10 pt-5 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900';
  const containerClass = embedded
    ? 'space-y-6 px-4 md:px-6'
    : 'container mx-auto max-w-[1440px] space-y-6 px-4';

  return (
    <div className={surfaceClass}>
      <div className={containerClass}>
        <Card className="overflow-hidden border-slate-800 bg-slate-950 text-slate-100 shadow-2xl">
          <CardContent className="grid gap-6 p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs uppercase tracking-[0.14em] text-slate-300">
                Live Control Room
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                  Creez et lancez vos lives comme une salle de reunion moderne
                </h2>
                <p className="max-w-2xl text-sm text-slate-300">
                  Planifiez vos sessions, ouvrez le studio en un clic, puis conservez les replays pour le
                  visionnage a froid.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge className="border-0 bg-slate-800 text-slate-100">
                  <BookOpen className="mr-1 h-3 w-3" />
                  {teacherCourses.length} cours
                </Badge>
                <Badge className="border-0 bg-emerald-500/20 text-emerald-200">
                  <Radio className="mr-1 h-3 w-3" />
                  {liveCount} en direct
                </Badge>
                <Badge className="border-0 bg-sky-500/20 text-sky-200">{plannedCount} planifiees</Badge>
                <Badge className="border-0 bg-violet-500/20 text-violet-200">
                  <Tv className="mr-1 h-3 w-3" />
                  {replayCount} replay(s)
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button className="rounded-full bg-sky-500 px-5 text-slate-950 hover:bg-sky-400" onClick={focusSessionForm}>
                  <Video className="mr-2 h-4 w-4" />
                  Nouvelle session
                </Button>
                {activeSession ? (
                  <Button
                    variant="outline"
                    className="rounded-full border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800"
                    onClick={() => onNavigate(`/teacher/live/${activeSession.courseId}/${activeSession.id}`)}
                  >
                    Reprendre le live en cours
                  </Button>
                ) : null}
                {!activeSession && nextSession ? (
                  <Button
                    variant="outline"
                    className="rounded-full border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800"
                    onClick={() => onNavigate(`/teacher/live/${nextSession.courseId}/${nextSession.id}`)}
                  >
                    Ouvrir la prochaine session
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="grid gap-3">
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Sessions</p>
                  <p className="mt-2 text-2xl font-semibold">{teacherSessions.length}</p>
                </div>
                <div className="rounded-2xl border border-emerald-600/50 bg-emerald-500/10 p-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-emerald-200">Live actif</p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-100">{liveCount}</p>
                </div>
                <div className="rounded-2xl border border-sky-600/50 bg-sky-500/10 p-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-sky-200">Replays</p>
                  <p className="mt-2 text-2xl font-semibold text-sky-100">{replayCount}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 text-sm text-slate-200">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Lancement rapide</p>
                <p className="mt-3">
                  En cours:{' '}
                  <span className="font-medium text-emerald-300">
                    {activeSession ? `Session #${activeSession.id}` : 'Aucun live actif'}
                  </span>
                </p>
                <p className="mt-1">
                  Prochaine:{' '}
                  <span className="font-medium text-sky-300">
                    {nextSession ? formatSessionDate(nextSession.scheduledAt) : 'Aucune session planifiee'}
                  </span>
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  Ouvrez le studio, cliquez sur Demarrer puis lancez la publication video.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="overflow-hidden border-slate-800 bg-slate-950 text-slate-100 shadow-xl">
            <CardHeader className="border-b border-slate-800 bg-slate-900/70">
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-sky-300" />
                Creation de live
              </CardTitle>
              <CardDescription className="text-slate-300">
                Workflow en 2 etapes: cours puis session live
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <Tabs
                value={creationTab}
                onValueChange={(value) => setCreationTab(value === 'course' ? 'course' : 'session')}
                className="space-y-4"
              >
                <TabsList className="grid h-auto w-full grid-cols-2 rounded-xl border border-slate-700 bg-slate-900 p-1">
                  <TabsTrigger
                    value="session"
                    className="rounded-lg text-slate-200 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900"
                  >
                    Session live
                  </TabsTrigger>
                  <TabsTrigger
                    value="course"
                    className="rounded-lg text-slate-200 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900"
                  >
                    Nouveau cours
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="session" id="session-create-form" className="space-y-4">
                  {isLoadingCourses ? (
                    <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900 p-3 text-sm text-slate-300">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Chargement des cours...
                    </div>
                  ) : null}

                  {!isLoadingCourses && !teacherCourses.length && !fixedCourseId ? (
                    <div className="rounded-xl border border-amber-700/50 bg-amber-500/10 p-3 text-sm text-amber-200">
                      Aucun cours trouve. Creez d abord un cours dans l onglet "Nouveau cours".
                    </div>
                  ) : null}

                  <form className="space-y-4" onSubmit={handleCreateSession}>
                    {!fixedCourseId ? (
                      <div className="space-y-2">
                        <Label htmlFor="course-selection" className="text-slate-200">
                          Cours
                        </Label>
                        <Select value={courseSelection} onValueChange={setCourseSelection}>
                          <SelectTrigger
                            id="course-selection"
                            className="border-slate-700 bg-slate-900 text-slate-100 focus:ring-slate-600"
                          >
                            <SelectValue placeholder="Selectionnez un cours" />
                          </SelectTrigger>
                          <SelectContent>
                            {teacherCourses.map((course: LiveCourse) => (
                              <SelectItem key={course.id} value={course.id}>
                                {course.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : null}

                    {selectedCourse ? (
                      <div className="rounded-xl border border-emerald-700/60 bg-emerald-600/10 p-3 text-xs text-emerald-200">
                        Session rattachee a: <span className="font-medium">{selectedCourse.title}</span>
                      </div>
                    ) : null}

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="scheduled-at" className="text-slate-200">
                          Date et heure
                        </Label>
                        <Input
                          id="scheduled-at"
                          type="datetime-local"
                          value={scheduledAt}
                          onChange={(event) => setScheduledAt(event.target.value)}
                          required
                          className="border-slate-700 bg-slate-900 text-slate-100"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="resolution" className="text-slate-200">
                          Resolution
                        </Label>
                        <Select value={resolution} onValueChange={setResolution}>
                          <SelectTrigger
                            id="resolution"
                            className="border-slate-700 bg-slate-900 text-slate-100 focus:ring-slate-600"
                          >
                            <SelectValue placeholder="Resolution" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="480p">480p</SelectItem>
                            <SelectItem value="720p">720p</SelectItem>
                            <SelectItem value="1080p">1080p</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900/70 p-3">
                      <div>
                        <p className="text-sm font-medium text-slate-100">Enregistrement</p>
                        <p className="text-xs text-slate-400">Activer le replay VOD apres la session</p>
                      </div>
                      <Switch checked={recordingEnabled} onCheckedChange={setRecordingEnabled} />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        className="h-11 w-full rounded-xl bg-sky-500 px-5 text-base font-semibold text-slate-950 hover:bg-sky-400 sm:w-auto"
                        disabled={isCreating || (!courseSelection && !fixedCourseId)}
                      >
                        {isCreating ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="mr-2 h-4 w-4" />
                        )}
                        Creer et ouvrir le studio
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="course">
                  <form className="space-y-4" onSubmit={handleCreateCourse}>
                    <div className="space-y-2">
                      <Label htmlFor="course-title" className="text-slate-200">
                        Titre du cours
                      </Label>
                      <Input
                        id="course-title"
                        value={courseTitle}
                        onChange={(event) => setCourseTitle(event.target.value)}
                        placeholder="Ex: React avance pour projets reels"
                        required
                        className="border-slate-700 bg-slate-900 text-slate-100"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="course-category" className="text-slate-200">
                        Categorie
                      </Label>
                      <Select value={courseCategory} onValueChange={setCourseCategory}>
                        <SelectTrigger
                          id="course-category"
                          className="border-slate-700 bg-slate-900 text-slate-100 focus:ring-slate-600"
                        >
                          <SelectValue placeholder="Choisir une categorie" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Programmation">Programmation</SelectItem>
                          <SelectItem value="Design">Design</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Business">Business</SelectItem>
                          <SelectItem value="Data">Data</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="course-start-at" className="text-slate-200">
                        Date de lancement
                      </Label>
                      <Input
                        id="course-start-at"
                        type="datetime-local"
                        value={courseStartAt}
                        onChange={(event) => setCourseStartAt(event.target.value)}
                        required
                        className="border-slate-700 bg-slate-900 text-slate-100"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="course-description" className="text-slate-200">
                        Description
                      </Label>
                      <Textarea
                        id="course-description"
                        value={courseDescription}
                        onChange={(event) => setCourseDescription(event.target.value)}
                        placeholder="Objectifs, prerequis, plan du cours..."
                        rows={4}
                        required
                        className="border-slate-700 bg-slate-900 text-slate-100"
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        variant="outline"
                        className="rounded-xl border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800"
                        disabled={isCreatingCourse}
                      >
                        {isCreatingCourse ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Creer le cours
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-slate-200 bg-white/95 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <CardHeader className="border-b border-slate-200 dark:border-slate-800">
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Workflow enseignant
              </CardTitle>
              <CardDescription>Parcours rapide pour demarrer un live proprement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-5">
              <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950/40">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Etape 1</p>
                <p className="mt-1 text-sm font-medium">Creer un cours</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950/40">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Etape 2</p>
                <p className="mt-1 text-sm font-medium">Planifier une session live</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950/40">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Etape 3</p>
                <p className="mt-1 text-sm font-medium">Ouvrir le studio et lancer la publication</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-950/40">
                <p>
                  Session active:{' '}
                  <span className="font-semibold">
                    {activeSession ? `#${activeSession.id}` : 'Aucune'}
                  </span>
                </p>
                <p className="mt-1 text-muted-foreground">
                  Prochaine session:{' '}
                  {nextSession ? formatSessionDate(nextSession.scheduledAt) : 'Non planifiee'}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="rounded-full bg-sky-500 text-slate-950 hover:bg-sky-400"
                  onClick={focusSessionForm}
                >
                  Nouvelle session
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setCreationTab('course')}
                >
                  Nouveau cours
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {sessionsError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {getErrorMessage(sessionsError, 'Impossible de charger les sessions')}
          </AlertDescription>
        </Alert>
      ) : null}

      {coursesError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {getErrorMessage(coursesError, 'Impossible de charger les cours')}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Card className="order-2 overflow-hidden border-slate-200 bg-white/95 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 xl:order-2">
        <CardHeader className="border-b border-slate-200 dark:border-slate-800">
          <CardTitle>Mes cours</CardTitle>
          <CardDescription>Un cours peut contenir autant de sessions live que necessaire</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-5">
          {isLoadingCourses ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Chargement des cours...
            </div>
          ) : visibleCourseSummaries.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {visibleCourseSummaries.map((summary) => (
                <div
                  key={summary.course.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-950/50"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{summary.course.title}</p>
                      <p className="text-xs text-muted-foreground">{summary.course.category}</p>
                    </div>
                    <Badge variant="outline">#{summary.course.id}</Badge>
                  </div>

                  <div className="mb-3 flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {summary.sessionCount} session{summary.sessionCount > 1 ? 's' : ''}
                    </Badge>
                    <Badge variant={summary.liveCount > 0 ? 'destructive' : 'outline'}>
                      {summary.liveCount} en direct
                    </Badge>
                    <Badge variant="outline">{summary.replayCount} replay(s)</Badge>
                  </div>

                  <p className="mb-3 text-xs text-muted-foreground">
                    {summary.latestSession
                      ? `Derniere session: ${formatSessionDate(summary.latestSession.scheduledAt)}`
                      : 'Aucune session pour ce cours'}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => focusSessionFormForCourse(summary.course.id)}
                    >
                      Programmer une session
                    </Button>
                    {summary.latestSession ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          onNavigate(`/teacher/live/${summary.course.id}/${summary.latestSession.id}`)
                        }
                      >
                        Ouvrir studio
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Aucun cours enseignant disponible. Creez votre premier cours ci-dessus.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="order-1 overflow-hidden border-slate-800 bg-slate-950 text-slate-100 shadow-xl xl:order-1">
        <CardHeader className="border-b border-slate-800 bg-slate-900/70">
          <CardTitle>Mes sessions</CardTitle>
          <CardDescription className="text-slate-300">
            {fixedCourseId
              ? `Filtrees sur le cours #${fixedCourseId}`
              : 'Toutes les sessions de l enseignant connecte'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-5">
          {isLoadingSessions ? (
            <div className="flex items-center justify-center py-8 text-slate-300">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Chargement des sessions...
            </div>
          ) : sessions.length ? (
            sessions.map((session) => {
              const viewerUrl = `/courses/${session.courseId}/live/${session.id}`;
              return (
                <div
                  key={session.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <SessionStatusPill session={session} />
                      <Badge variant="outline" className="border-slate-600 text-slate-200">
                        Cours #{session.courseId}
                      </Badge>
                      <Badge variant="outline" className="border-slate-600 text-slate-200">
                        Session #{session.id}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-300">
                      Planifiee: {formatSessionDate(session.scheduledAt)}
                    </p>
                    {session.recordingUrl ? (
                      <a
                        href={session.recordingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-sky-300 underline underline-offset-4"
                      >
                        Replay disponible
                      </a>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      className="rounded-full bg-sky-500 px-4 text-slate-950 hover:bg-sky-400"
                      onClick={() => onNavigate(`/teacher/live/${session.courseId}/${session.id}`)}
                    >
                      Ouvrir studio
                    </Button>
                    {!session.isLive ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full border-emerald-600 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20"
                        onClick={() => handleStart(session.id)}
                        disabled={isStarting}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Demarrer
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="rounded-full px-4"
                        onClick={() => handleStop(session.id)}
                        disabled={isStopping}
                      >
                        <Square className="mr-2 h-4 w-4" />
                        Arreter
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      className="rounded-full"
                      onClick={() => handleFetchVod(session.id)}
                      disabled={isFetchingVod}
                    >
                      VOD
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-full text-slate-200 hover:bg-slate-800 hover:text-white"
                      onClick={() => {
                        copyToClipboard(`${window.location.origin}${viewerUrl}`);
                      }}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copier lien
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="py-6 text-center text-sm text-slate-300">
              Aucune session pour le moment.
            </p>
          )}
        </CardContent>
      </Card>
      </div>
      </div>
    </div>
  );
}
