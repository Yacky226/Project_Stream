import { ChangeEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarClock,
  CheckCircle2,
  GraduationCap,
  ImagePlus,
  Info,
  MessageSquare,
  Monitor,
  Radio,
  Rocket,
  Save,
  Search,
  Shield,
  Users,
  Video,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCreateCourseMutation, useCreateSessionMutation, useGetCoursesQuery } from '../../store/api/liveApi';
import { useGetProfileQuery, useGetUnreadNotificationCountQuery } from '../../store/api/userApi';
import type { LiveCourse } from '../../types/live';
import { toLocalDateTimeInput } from '../live/liveSession.utils';

interface LiveSessionBuilderPageProps {
  onNavigate: (path: string) => void;
}

type BuilderStep = 1 | 2 | 3;
type SessionMode = 'new' | 'existing';
type StreamType = 'rtmp' | 'browser' | 'zoom';
type VisibilityMode = 'public' | 'private';
type AudienceLevel = 'all' | 'beginner' | 'intermediate' | 'advanced';
type PricingMode = 'free' | 'paid';

interface LiveBuilderDraft {
  step: BuilderStep;
  sessionMode: SessionMode;
  selectedCourseId: string;
  title: string;
  description: string;
  category: string;
  scheduledAt: string;
  thumbnailName: string;
  streamType: StreamType;
  enableLiveChat: boolean;
  enableQnaModeration: boolean;
  allowReactions: boolean;
  recordingEnabled: boolean;
  cloudBackup: boolean;
  visibility: VisibilityMode;
  resolution: string;
  targetLevel: AudienceLevel;
  maxParticipants: string;
  unlimitedParticipants: boolean;
  prerequisites: string[];
  pricingMode: PricingMode;
  currency: string;
  basePrice: string;
  earlyBirdEnabled: boolean;
  earlyBirdDiscount: string;
}

interface LocalSessionMetadata {
  savedAt: string;
  mode: SessionMode;
  title: string;
  description: string;
  category: string;
  thumbnailName: string;
  streamType: StreamType;
  enableLiveChat: boolean;
  enableQnaModeration: boolean;
  allowReactions: boolean;
  cloudBackup: boolean;
  visibility: VisibilityMode;
  targetLevel: AudienceLevel;
  maxParticipants: string;
  unlimitedParticipants: boolean;
  prerequisites: string[];
  pricingMode: PricingMode;
  currency: string;
  basePrice: string;
  earlyBirdEnabled: boolean;
  earlyBirdDiscount: string;
  linkedCourseId: string;
  linkedCourseTitle: string | null;
}

const LIVE_BUILDER_STORAGE_KEY = 'teacher-live-builder-draft-v1';
const LIVE_BUILDER_METADATA_KEY = 'teacher-live-session-metadata-v1';
const CATEGORY_OPTIONS = [
  'Science & Technology',
  'Mathematics',
  'Humanities',
  'Business & Economics',
  'Arts & Design',
  'Development',
  'Design',
  'Marketing',
];
const RESOLUTION_OPTIONS = ['720p', '1080p', '1440p'];
const CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP'];
const TARGET_LEVEL_OPTIONS: Array<{ value: AudienceLevel; label: string }> = [
  { value: 'all', label: 'All levels' },
  { value: 'beginner', label: 'Beginner only' },
  { value: 'intermediate', label: 'Intermediate only' },
  { value: 'advanced', label: 'Advanced only' },
];

function getInitials(firstName?: string | null, lastName?: string | null) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.trim().toUpperCase() || 'TE';
}

function createDefaultDraft(): LiveBuilderDraft {
  const targetDate = new Date(Date.now() + 48 * 60 * 60 * 1000);

  return {
    step: 1,
    sessionMode: 'new',
    selectedCourseId: '',
    title: '',
    description: '',
    category: 'Science & Technology',
    scheduledAt: toLocalDateTimeInput(targetDate.toISOString()),
    thumbnailName: '',
    streamType: 'rtmp',
    enableLiveChat: true,
    enableQnaModeration: false,
    allowReactions: true,
    recordingEnabled: true,
    cloudBackup: true,
    visibility: 'public',
    resolution: '1080p',
    targetLevel: 'all',
    maxParticipants: '50',
    unlimitedParticipants: false,
    prerequisites: ['Basic communication', 'Stable internet connection'],
    pricingMode: 'free',
    currency: 'USD',
    basePrice: '',
    earlyBirdEnabled: true,
    earlyBirdDiscount: '20',
  };
}

function persistSessionMetadata(sessionId: string, metadata: LocalSessionMetadata) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const raw = window.localStorage.getItem(LIVE_BUILDER_METADATA_KEY);
    const existing = raw ? (JSON.parse(raw) as Record<string, LocalSessionMetadata>) : {};
    const nextEntries = Object.entries({ [sessionId]: metadata, ...existing }).slice(0, 20);
    window.localStorage.setItem(
      LIVE_BUILDER_METADATA_KEY,
      JSON.stringify(Object.fromEntries(nextEntries)),
    );
  } catch {
    // Best effort local persistence only.
  }
}

function formatSchedule(value: string) {
  if (!value) return 'Not scheduled yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not scheduled yet';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function broadcastLabel(streamType: StreamType) {
  if (streamType === 'rtmp') return 'RTMP';
  if (streamType === 'zoom') return 'Zoom';
  return 'WebRTC';
}

function stepLabel(step: BuilderStep) {
  if (step === 1) return 'Basic Information';
  if (step === 2) return 'Technical Setup';
  return 'Audience & Pricing';
}

function stepDescription(step: BuilderStep) {
  if (step === 1) return 'Define the public-facing basics of your session.';
  if (step === 2) return 'Choose how you will broadcast and manage interactivity.';
  return 'Set audience rules before publishing the live session.';
}

function progressForStep(step: BuilderStep) {
  if (step === 1) return 33;
  if (step === 2) return 66;
  return 100;
}

function validateStepOne(draft: LiveBuilderDraft) {
  if (draft.sessionMode === 'existing' && !draft.selectedCourseId) {
    return 'Select an existing course before moving to technical setup.';
  }
  if (!draft.title.trim()) {
    return draft.sessionMode === 'new'
      ? 'Add a title for the course and first live session.'
      : 'Add a session title for your audience.';
  }
  if (!draft.description.trim()) return 'Add a short description so learners know what to expect.';
  if (!draft.category) return 'Choose a category for this session.';
  if (!draft.scheduledAt) return 'Choose the date and time of the live session.';
  return null;
}

function validateStepThree(draft: LiveBuilderDraft) {
  if (!draft.unlimitedParticipants) {
    const limit = Number(draft.maxParticipants);
    if (!Number.isFinite(limit) || limit <= 0) {
      return 'Set a valid participant limit or enable unlimited capacity.';
    }
  }
  if (draft.pricingMode === 'paid') {
    const price = Number(draft.basePrice);
    if (!Number.isFinite(price) || price <= 0) {
      return 'Set a valid price before publishing a paid session.';
    }
  }
  if (draft.earlyBirdEnabled) {
    const discount = Number(draft.earlyBirdDiscount);
    if (!Number.isFinite(discount) || discount <= 0 || discount >= 100) {
      return 'Early bird discount must stay between 1% and 99%.';
    }
  }
  return null;
}

export function LiveSessionBuilderPage({ onNavigate }: LiveSessionBuilderPageProps) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const shouldLoad = Boolean(isAuthenticated && user?.role === 'teacher');
  const { data: profile } = useGetProfileQuery(undefined, { skip: !shouldLoad });
  const { data: unreadCount = 0 } = useGetUnreadNotificationCountQuery(undefined, {
    skip: !shouldLoad,
  });
  const { data: allCourses = [], isLoading: isLoadingCourses, error: coursesError } = useGetCoursesQuery(
    undefined,
    { skip: !shouldLoad },
  );
  const [createCourse, { isLoading: isCreatingCourse }] = useCreateCourseMutation();
  const [createSession, { isLoading: isCreatingSession }] = useCreateSessionMutation();
  const [draft, setDraft] = useState<LiveBuilderDraft>(() => createDefaultDraft());
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [headerSearch, setHeaderSearch] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [prerequisiteInput, setPrerequisiteInput] = useState('');
  const thumbnailUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hasHydratedDraft = useRef(false);

  const displayName = `${profile?.firstName || user?.firstName || 'Instructor'} ${profile?.lastName || user?.lastName || ''}`.trim();
  const avatarUrl = profile?.avatar || user?.avatar || null;
  const teacherId = String(profile?.id || user?.id || '');
  const teacherCourses = useMemo(
    () => allCourses.filter((course) => course.teacherId === teacherId),
    [allCourses, teacherId],
  );
  const selectedCourse = useMemo(
    () => teacherCourses.find((course) => course.id === draft.selectedCourseId) || null,
    [teacherCourses, draft.selectedCourseId],
  );
  const progress = progressForStep(draft.step);
  const isPublishing = isCreatingCourse || isCreatingSession;

  const updateDraft = (updates: Partial<LiveBuilderDraft>) => {
    setDraft((current) => ({ ...current, ...updates }));
  };

  const handleSaveDraft = () => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(LIVE_BUILDER_STORAGE_KEY, JSON.stringify(draft));
    setStatusMessage('Draft saved locally on this device.');
    setErrorMessage(null);
  };

  const handleAddPrerequisite = () => {
    const normalized = prerequisiteInput.trim();
    if (!normalized || draft.prerequisites.includes(normalized)) {
      setPrerequisiteInput('');
      return;
    }
    updateDraft({ prerequisites: [...draft.prerequisites, normalized] });
    setPrerequisiteInput('');
  };

  const handlePrerequisiteKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      handleAddPrerequisite();
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const rawDraft = window.localStorage.getItem(LIVE_BUILDER_STORAGE_KEY);
    if (rawDraft) {
      try {
        const parsed = JSON.parse(rawDraft) as Partial<LiveBuilderDraft>;
        setDraft((current) => ({
          ...current,
          ...parsed,
          prerequisites:
            parsed.prerequisites?.filter((entry) => entry.trim().length > 0) || current.prerequisites,
        }));
        setStatusMessage('A local wizard draft has been restored.');
      } catch {
        window.localStorage.removeItem(LIVE_BUILDER_STORAGE_KEY);
      }
    }

    hasHydratedDraft.current = true;
  }, []);

  useEffect(() => {
    if (!hasHydratedDraft.current || typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(LIVE_BUILDER_STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  useEffect(() => {
    return () => {
      if (thumbnailUrlRef.current) {
        URL.revokeObjectURL(thumbnailUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isLoadingCourses && !teacherCourses.length && draft.sessionMode === 'existing') {
      setDraft((current) => ({
        ...current,
        sessionMode: 'new',
        selectedCourseId: '',
      }));
    }
  }, [draft.sessionMode, isLoadingCourses, teacherCourses.length]);

  const handleThumbnailChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (thumbnailUrlRef.current) {
      URL.revokeObjectURL(thumbnailUrlRef.current);
    }

    const localUrl = URL.createObjectURL(file);
    thumbnailUrlRef.current = localUrl;
    setThumbnailPreview(localUrl);
    updateDraft({ thumbnailName: file.name });
    setStatusMessage('Thumbnail preview updated. The image stays local until dedicated upload support is added.');
  };

  const applySelectedCourse = (course: LiveCourse) => {
    setDraft((current) => ({
      ...current,
      selectedCourseId: course.id,
      category: course.category || current.category,
      title: current.title.trim() ? current.title : `${course.title} Live Session`,
      description: current.description.trim() ? current.description : course.description,
    }));
  };

  const handleNext = () => {
    setErrorMessage(null);

    if (draft.step === 1) {
      const validation = validateStepOne(draft);
      if (validation) {
        setErrorMessage(validation);
        return;
      }
      updateDraft({ step: 2 });
      return;
    }

    if (draft.step === 2) {
      updateDraft({ step: 3 });
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    if (draft.step === 1) {
      onNavigate('/teacher/live-sessions');
      return;
    }
    updateDraft({ step: (draft.step - 1) as BuilderStep });
  };

  const handlePublish = async () => {
    const finalValidation = validateStepThree(draft);
    if (finalValidation) {
      setErrorMessage(finalValidation);
      return;
    }

    if (!teacherId) {
      setErrorMessage('Unable to resolve the current teacher profile.');
      return;
    }

    setErrorMessage(null);
    setStatusMessage(null);

    try {
      let courseId = draft.selectedCourseId;
      let linkedCourseTitle = selectedCourse?.title || null;

      if (draft.sessionMode === 'new') {
        const createdCourse = await createCourse({
          title: draft.title.trim(),
          description: draft.description.trim(),
          category: draft.category,
          scheduledAt: draft.scheduledAt,
          teacherId,
        }).unwrap();

        courseId = createdCourse.id;
        linkedCourseTitle = createdCourse.title;
      }

      const createdSession = await createSession({
        courseId,
        teacherId,
        scheduledAt: draft.scheduledAt,
        recordingEnabled: draft.recordingEnabled,
        resolution: draft.resolution,
        broadcastType: broadcastLabel(draft.streamType),
      }).unwrap();

      persistSessionMetadata(createdSession.id, {
        savedAt: new Date().toISOString(),
        mode: draft.sessionMode,
        title: draft.title.trim(),
        description: draft.description.trim(),
        category: draft.category,
        thumbnailName: draft.thumbnailName,
        streamType: draft.streamType,
        enableLiveChat: draft.enableLiveChat,
        enableQnaModeration: draft.enableQnaModeration,
        allowReactions: draft.allowReactions,
        cloudBackup: draft.cloudBackup,
        visibility: draft.visibility,
        targetLevel: draft.targetLevel,
        maxParticipants: draft.maxParticipants,
        unlimitedParticipants: draft.unlimitedParticipants,
        prerequisites: draft.prerequisites,
        pricingMode: draft.pricingMode,
        currency: draft.currency,
        basePrice: draft.basePrice,
        earlyBirdEnabled: draft.earlyBirdEnabled,
        earlyBirdDiscount: draft.earlyBirdDiscount,
        linkedCourseId: String(courseId),
        linkedCourseTitle,
      });

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(LIVE_BUILDER_STORAGE_KEY);
      }

      setStatusMessage('Live session published. Redirecting to the studio...');
      onNavigate(`/teacher/live/${courseId}/${createdSession.id}`);
    } catch (error) {
      const payload = error as {
        data?: { message?: string; error?: string };
        error?: string;
        message?: string;
      };
      setErrorMessage(
        payload.data?.message ||
          payload.data?.error ||
          payload.error ||
          payload.message ||
          'The live session could not be created.',
      );
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f6f8] dark:bg-[#101622]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1152d4]/20 border-t-[#1152d4]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f6f8] px-6 dark:bg-[#101622]">
        <div className="w-full max-w-xl rounded-[28px] border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900/30 dark:bg-slate-900">
          <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
          <h1 className="mt-4 text-2xl font-bold text-slate-950 dark:text-white">Sign in required</h1>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">
            Connect to your instructor account to create a live session.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('/auth/signin')}
            className="mt-6 rounded-2xl bg-[#1152d4] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0f47b9]"
          >
            Go to sign in
          </button>
        </div>
      </div>
    );
  }

  if (user?.role !== 'teacher') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f6f8] px-6 dark:bg-[#101622]">
        <div className="w-full max-w-xl rounded-[28px] border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900/30 dark:bg-slate-900">
          <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
          <h1 className="mt-4 text-2xl font-bold text-slate-950 dark:text-white">Teacher access only</h1>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">
            Only instructors can open the live session creation wizard.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="mt-6 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Return home
          </button>
        </div>
      </div>
    );
  }

  const stepOneContent = (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-10 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#1152d4]">Step 1 of 3</span>
            <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{stepLabel(draft.step)}</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{stepDescription(draft.step)}</p>
          </div>
          <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            {progress}% Complete
          </span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="absolute inset-y-0 left-0 rounded-full bg-[#1152d4]" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-4 grid grid-cols-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em]">
          <div className="text-[#1152d4]">Info</div>
          <div className="text-slate-400">Technical</div>
          <div className="text-slate-400">Audience</div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <div className="space-y-8 p-8 md:p-10">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => updateDraft({ sessionMode: 'new', selectedCourseId: '' })}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                draft.sessionMode === 'new'
                  ? 'bg-[#1152d4] text-white shadow-lg shadow-[#1152d4]/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Create with a new course
            </button>
            <button
              type="button"
              disabled={!teacherCourses.length}
              onClick={() => updateDraft({ sessionMode: 'existing' })}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                draft.sessionMode === 'existing'
                  ? 'bg-[#1152d4]/10 text-[#1152d4]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              } ${!teacherCourses.length ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              Attach to an existing course
            </button>
          </div>

          {draft.sessionMode === 'existing' ? (
            <div className="space-y-3">
              <label className="ml-1 text-sm font-semibold text-slate-700 dark:text-slate-300">Choose course</label>
              <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                <div className="relative">
                  <select
                    value={draft.selectedCourseId}
                    onChange={(event) => {
                      const course = teacherCourses.find((entry) => entry.id === event.target.value);
                      if (course) {
                        applySelectedCourse(course);
                      } else {
                        updateDraft({ selectedCourseId: event.target.value });
                      }
                    }}
                    className="h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 focus:border-[#1152d4] focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100"
                  >
                    <option value="">Select one of your courses</option>
                    {teacherCourses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title} - {course.category}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('/teacher/course-builder')}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  New course
                </button>
              </div>
              {selectedCourse ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-800/40">
                  <p className="font-bold text-slate-900 dark:text-white">{selectedCourse.title}</p>
                  <p className="mt-1 text-slate-500 dark:text-slate-300">{selectedCourse.description}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Category: {selectedCourse.category}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-4">
            <label className="block">
              <span className="ml-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                {draft.sessionMode === 'new' ? 'Course and session title' : 'Session title'}
              </span>
              <input
                value={draft.title}
                onChange={(event) => updateDraft({ title: event.target.value })}
                className="mt-2 block h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 transition-all focus:border-[#1152d4] focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100"
                placeholder={
                  draft.sessionMode === 'new'
                    ? 'e.g. Advanced Quantum Mechanics - Week 1'
                    : 'e.g. Portfolio critique office hours'
                }
                type="text"
              />
            </label>

            <label className="block">
              <span className="ml-1 text-sm font-semibold text-slate-700 dark:text-slate-300">Description</span>
              <textarea
                value={draft.description}
                onChange={(event) => updateDraft({ description: event.target.value })}
                className="mt-2 block min-h-[150px] w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-900 transition-all focus:border-[#1152d4] focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100"
                placeholder="Briefly describe what students will learn in this session..."
              />
            </label>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="block">
              <span className="ml-1 text-sm font-semibold text-slate-700 dark:text-slate-300">Category</span>
              <div className="relative mt-2">
                <select
                  value={draft.category}
                  onChange={(event) => updateDraft({ category: event.target.value })}
                  className="h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 focus:border-[#1152d4] focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100"
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <label className="block">
              <span className="ml-1 text-sm font-semibold text-slate-700 dark:text-slate-300">Date & time</span>
              <div className="relative mt-2">
                <input
                  value={draft.scheduledAt}
                  onChange={(event) => updateDraft({ scheduledAt: event.target.value })}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 focus:border-[#1152d4] focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100"
                  type="datetime-local"
                />
                <CalendarClock className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              </div>
            </label>
          </div>

          <div className="space-y-3">
            <span className="ml-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Session thumbnail</span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-52 w-full flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-slate-200 bg-slate-50 transition-all hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/30 dark:hover:bg-slate-800/50"
            >
              {thumbnailPreview ? (
                <div className="flex h-full w-full flex-col overflow-hidden rounded-[26px]">
                  <img src={thumbnailPreview} alt="Thumbnail preview" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#1152d4]/10">
                    <ImagePlus className="h-6 w-6 text-[#1152d4]" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Click to upload or drag and drop
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    PNG, JPG, GIF or WEBP preview only
                  </p>
                </div>
              )}
            </button>
            {draft.thumbnailName ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Local asset selected: <span className="font-semibold">{draft.thumbnailName}</span>
              </p>
            ) : null}
          </div>

          <div className="flex gap-4 rounded-2xl border border-[#1152d4]/10 bg-[#1152d4]/5 p-4">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#1152d4]" />
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              This information will power the course creation flow and the live session publishing call. Thumbnail, audience and pricing details are saved locally for now because the backend does not expose dedicated live metadata fields yet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const stepTwoContent = (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-10">
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-950 dark:text-slate-50">{stepLabel(draft.step)}</h2>
            <p className="mt-1 text-slate-500 dark:text-slate-400">{stepDescription(draft.step)}</p>
          </div>
          <span className="w-fit rounded-full bg-[#1152d4]/10 px-3 py-1 text-sm font-semibold text-[#1152d4]">
            Step 2 of 3
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div className="h-full rounded-full bg-[#1152d4]" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          <span>Basic info</span>
          <span className="text-[#1152d4]">Technical setup</span>
          <span>Audience</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center gap-2">
              <Radio className="h-5 w-5 text-[#1152d4]" />
              <h3 className="text-lg font-bold">Stream configuration</h3>
            </div>
            <div className="space-y-4">
              {[
                {
                  value: 'rtmp' as const,
                  title: 'Live streaming software (RTMP)',
                  description: 'Best for professional setups using OBS, vMix, or Wirecast.',
                  icon: Monitor,
                },
                {
                  value: 'browser' as const,
                  title: 'Webcam / browser-based',
                  description: 'Quick start directly from your browser with no extra software.',
                  icon: Video,
                },
                {
                  value: 'zoom' as const,
                  title: 'Zoom integration',
                  description: 'Reserve the session for an external Zoom room or webinar link.',
                  icon: Users,
                },
              ].map((option) => {
                const Icon = option.icon;
                const isActive = draft.streamType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateDraft({ streamType: option.value })}
                    className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition ${
                      isActive
                        ? 'border-[#1152d4] bg-[#1152d4]/5'
                        : 'border-slate-100 hover:border-[#1152d4]/30 dark:border-slate-800'
                    }`}
                  >
                    <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
                      <Icon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 dark:text-white">{option.title}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{option.description}</p>
                    </div>
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${isActive ? 'border-[#1152d4]' : 'border-slate-300 dark:border-slate-700'}`}>
                      {isActive ? <div className="h-3 w-3 rounded-full bg-[#1152d4]" /> : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#1152d4]" />
              <h3 className="text-lg font-bold">Interactivity settings</h3>
            </div>
            <div className="space-y-6">
              {[
                {
                  label: 'Enable live chat',
                  description: 'Allow students to message during the session.',
                  value: draft.enableLiveChat,
                  onToggle: () => updateDraft({ enableLiveChat: !draft.enableLiveChat }),
                },
                {
                  label: 'Enable Q&A moderation',
                  description: 'Review questions before they become visible to everyone.',
                  value: draft.enableQnaModeration,
                  onToggle: () => updateDraft({ enableQnaModeration: !draft.enableQnaModeration }),
                },
                {
                  label: 'Allow student reactions',
                  description: 'Let students react with lightweight emoji signals during the live.',
                  value: draft.allowReactions,
                  onToggle: () => updateDraft({ allowReactions: !draft.allowReactions }),
                },
              ].map((setting) => (
                <div key={setting.label} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">{setting.label}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{setting.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={setting.onToggle}
                    className={`relative h-7 w-12 rounded-full transition ${
                      setting.value ? 'bg-[#1152d4]' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                        setting.value ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#1152d4]" />
              <h3 className="text-lg font-bold">Recording & privacy</h3>
            </div>
            <div className="space-y-6">
              {[
                {
                  label: 'Auto-record session',
                  value: draft.recordingEnabled,
                  onToggle: () => updateDraft({ recordingEnabled: !draft.recordingEnabled }),
                },
                {
                  label: 'Cloud storage backup',
                  value: draft.cloudBackup,
                  onToggle: () => updateDraft({ cloudBackup: !draft.cloudBackup }),
                },
              ].map((setting) => (
                <div key={setting.label} className="flex items-center justify-between gap-4">
                  <p className="max-w-[160px] text-sm font-semibold">{setting.label}</p>
                  <button
                    type="button"
                    onClick={setting.onToggle}
                    className={`relative h-7 w-12 rounded-full transition ${
                      setting.value ? 'bg-[#1152d4]' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                        setting.value ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              ))}

              <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                <p className="mb-3 text-sm font-semibold">Stream visibility</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => updateDraft({ visibility: 'public' })}
                    className={`flex-1 rounded-xl border-2 px-3 py-2 text-sm font-bold transition ${
                      draft.visibility === 'public'
                        ? 'border-[#1152d4] bg-[#1152d4]/10 text-[#1152d4]'
                        : 'border-slate-100 text-slate-500 dark:border-slate-800 dark:text-slate-400'
                    }`}
                  >
                    Public
                  </button>
                  <button
                    type="button"
                    onClick={() => updateDraft({ visibility: 'private' })}
                    className={`flex-1 rounded-xl border-2 px-3 py-2 text-sm font-bold transition ${
                      draft.visibility === 'private'
                        ? 'border-[#1152d4] bg-[#1152d4]/10 text-[#1152d4]'
                        : 'border-slate-100 text-slate-500 dark:border-slate-800 dark:text-slate-400'
                    }`}
                  >
                    Private
                  </button>
                </div>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Resolution</span>
                <select
                  value={draft.resolution}
                  onChange={(event) => updateDraft({ resolution: event.target.value })}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 focus:border-[#1152d4] focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  {RESOLUTION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <div className="rounded-2xl border border-[#1152d4]/20 bg-[#1152d4]/5 p-5">
            <div className="flex gap-3">
              <Info className="h-5 w-5 shrink-0 text-[#1152d4]" />
              <div>
                <p className="text-sm font-semibold text-[#1152d4]">Pro tip</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  RTMP is best when you want lower latency with overlays from OBS. For stable e-learning sessions, 1080p at 30fps is the safest starting point.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Draft summary</p>
            <h3 className="mt-2 text-lg font-bold text-slate-950 dark:text-white">{draft.title || 'Untitled live session'}</h3>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">{formatSchedule(draft.scheduledAt)}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {broadcastLabel(draft.streamType)}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {draft.visibility === 'public' ? 'Public access' : 'Private access'}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {draft.resolution}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  const stepThreeContent = (
    <div className="mx-auto w-full max-w-5xl">
      <div className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-6 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1152d4]/10 text-[#1152d4]">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-950 dark:text-white">{stepLabel(draft.step)}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{stepDescription(draft.step)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-[#1152d4] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white">
            <CheckCircle2 className="h-4 w-4" />
            Step 3 of 3
          </div>
        </div>

        <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800 md:px-10">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Wizard progress</p>
            <p className="text-sm font-bold text-[#1152d4]">{progress}% completed</p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full rounded-full bg-[#1152d4]" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="space-y-8 p-6 md:px-10">
          <section className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
              <Users className="h-5 w-5 text-[#1152d4]" />
              <h3 className="text-lg font-bold">Audience targeting</h3>
            </div>
            <div className="grid gap-6 p-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Target levels</label>
                <select
                  value={draft.targetLevel}
                  onChange={(event) => updateDraft({ targetLevel: event.target.value as AudienceLevel })}
                  className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 focus:border-[#1152d4] focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  {TARGET_LEVEL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 dark:text-slate-400">Who is this live session designed for?</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Max participants</label>
                <div className="flex items-center gap-3">
                  <input
                    value={draft.maxParticipants}
                    onChange={(event) => updateDraft({ maxParticipants: event.target.value })}
                    disabled={draft.unlimitedParticipants}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 focus:border-[#1152d4] focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    placeholder="50"
                    type="number"
                    min="1"
                  />
                  <label className="flex min-w-max items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <input
                      checked={draft.unlimitedParticipants}
                      onChange={(event) => updateDraft({ unlimitedParticipants: event.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-[#1152d4] focus:ring-[#1152d4]"
                      type="checkbox"
                    />
                    Unlimited
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Prerequisites & skills required</label>
                <div className="min-h-[60px] rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                  <div className="flex flex-wrap gap-2">
                    {draft.prerequisites.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#1152d4]/10 px-2 py-1 text-xs font-medium text-[#1152d4]"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() =>
                            updateDraft({
                              prerequisites: draft.prerequisites.filter((entry) => entry !== item),
                            })
                          }
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      value={prerequisiteInput}
                      onChange={(event) => setPrerequisiteInput(event.target.value)}
                      onKeyDown={handlePrerequisiteKeyDown}
                      onBlur={handleAddPrerequisite}
                      className="min-w-[180px] flex-1 border-none bg-transparent p-0 text-sm focus:outline-none focus:ring-0"
                      placeholder="Add more..."
                      type="text"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
              <Zap className="h-5 w-5 text-[#1152d4]" />
              <h3 className="text-lg font-bold">Pricing & enrollment</h3>
            </div>
            <div className="space-y-8 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  {
                    value: 'free' as const,
                    title: 'Free session',
                    description: 'Accessible to all registered users without charge.',
                  },
                  {
                    value: 'paid' as const,
                    title: 'Paid session',
                    description: 'Learners must pay a fee before joining the event.',
                  },
                ].map((option) => {
                  const active = draft.pricingMode === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateDraft({ pricingMode: option.value })}
                      className={`rounded-2xl border-2 p-4 text-left transition ${
                        active
                          ? 'border-[#1152d4] bg-[#1152d4]/5'
                          : 'border-slate-100 bg-slate-50 hover:border-[#1152d4]/20 dark:border-slate-800 dark:bg-slate-800'
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-bold">{option.title}</span>
                        <div className={`flex h-4 w-4 items-center justify-center rounded-full border ${active ? 'border-[#1152d4]' : 'border-slate-300 dark:border-slate-700'}`}>
                          {active ? <div className="h-2 w-2 rounded-full bg-[#1152d4]" /> : null}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{option.description}</p>
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/50 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Base price</label>
                  <div className="flex h-12">
                    <select
                      value={draft.currency}
                      onChange={(event) => updateDraft({ currency: event.target.value })}
                      disabled={draft.pricingMode === 'free'}
                      className="h-full w-24 rounded-l-xl border border-r-0 border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      {CURRENCY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <input
                      value={draft.basePrice}
                      onChange={(event) => updateDraft({ basePrice: event.target.value })}
                      disabled={draft.pricingMode === 'free'}
                      className="h-full flex-1 rounded-r-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 focus:border-[#1152d4] focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      placeholder="0.00"
                      type="number"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Early bird discount</label>
                    <button
                      type="button"
                      onClick={() => updateDraft({ earlyBirdEnabled: !draft.earlyBirdEnabled })}
                      className={`relative h-7 w-12 rounded-full transition ${
                        draft.earlyBirdEnabled ? 'bg-[#1152d4]' : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                          draft.earlyBirdEnabled ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      value={draft.earlyBirdDiscount}
                      onChange={(event) => updateDraft({ earlyBirdDiscount: event.target.value })}
                      disabled={!draft.earlyBirdEnabled || draft.pricingMode === 'free'}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-900 focus:border-[#1152d4] focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      placeholder="20"
                      type="number"
                      min="0"
                      max="99"
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">%</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/40">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Publishing into</p>
              <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                {draft.sessionMode === 'new' ? 'A new course will be created' : selectedCourse?.title || 'Selected course pending'}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/40">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Broadcast mode</p>
              <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">{broadcastLabel(draft.streamType)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/40">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Go-live date</p>
              <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">{formatSchedule(draft.scheduledAt)}</p>
            </div>
          </section>

          <div className="rounded-2xl border border-[#1152d4]/20 bg-[#1152d4]/5 p-5">
            <div className="flex gap-3">
              <Info className="h-5 w-5 shrink-0 text-[#1152d4]" />
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Audience, pricing, thumbnail and moderation preferences are stored locally alongside the created session. The live itself is published for real through the existing backend create course / create session endpoints.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen bg-[#f6f6f8] text-slate-900 dark:bg-[#101622] dark:text-slate-100"
      style={{ fontFamily: 'Lexend, system-ui, sans-serif' }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
        className="hidden"
        onChange={handleThumbnailChange}
      />

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 px-6 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-[#101622]/90 md:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-[#1152d4]">
            <button
              type="button"
              onClick={() => onNavigate('/teacher/live-sessions')}
              className="flex items-center gap-3 transition hover:opacity-80"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1152d4]/10">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1152d4]/70">EduLive</p>
                <h1 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">Live Session Builder</h1>
              </div>
            </button>
            <nav className="hidden items-center gap-8 pl-4 md:flex">
              <button type="button" onClick={() => onNavigate('/teacher/dashboard')} className="text-sm font-medium text-slate-500 transition hover:text-[#1152d4] dark:text-slate-400">
                Dashboard
              </button>
              <button type="button" onClick={() => onNavigate('/teacher/course-builder')} className="text-sm font-medium text-slate-500 transition hover:text-[#1152d4] dark:text-slate-400">
                Courses
              </button>
              <button type="button" onClick={() => onNavigate('/teacher/live-sessions')} className="border-b-2 border-[#1152d4] pb-1 text-sm font-semibold text-[#1152d4]">
                Sessions
              </button>
            </nav>
          </div>

          <div className="flex flex-1 items-center justify-end gap-4">
            <label className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={headerSearch}
                onChange={(event) => setHeaderSearch(event.target.value)}
                placeholder="Search your courses..."
                className="h-10 w-64 rounded-xl border-none bg-slate-100 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#1152d4]/20 dark:bg-slate-800"
                type="text"
              />
            </label>
            <button
              type="button"
              onClick={() => onNavigate('/notifications')}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" /> : null}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/teacher/live-sessions')}
              className="overflow-hidden rounded-full border border-slate-200 bg-slate-200 dark:border-slate-700 dark:bg-slate-700"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="h-10 w-10 object-cover" />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center bg-[#1152d4]/10 text-sm font-bold text-[#1152d4]">
                  {getInitials(profile?.firstName || user?.firstName, profile?.lastName || user?.lastName)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col px-4 pb-36 pt-8 md:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => onNavigate('/teacher/live-sessions')}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to live manager
          </button>
          <span className="rounded-full bg-[#1152d4]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#1152d4]">
            Step {draft.step} of 3
          </span>
        </div>

        {statusMessage ? (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-900/20 dark:text-emerald-200">
            {statusMessage}
          </div>
        ) : null}
        {errorMessage ? (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-200">
            {errorMessage}
          </div>
        ) : null}

        {draft.step === 1 ? stepOneContent : null}
        {draft.step === 2 ? stepTwoContent : null}
        {draft.step === 3 ? stepThreeContent : null}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/90 px-6 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-[#101622]/90 md:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-2 rounded-xl px-1 py-2 text-sm font-semibold text-slate-600 transition hover:text-[#1152d4] dark:text-slate-300"
            >
              <Save className="h-4 w-4" />
              Save as draft
            </button>
            <p className="hidden text-xs text-slate-500 dark:text-slate-400 lg:block">
              Unsupported live metadata is saved locally until dedicated backend fields are available.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <button
              type="button"
              onClick={handleBack}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                draft.step === 1
                  ? 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                  : 'border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              {draft.step === 1 ? 'Cancel' : 'Back'}
            </button>

            {draft.step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1152d4] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#1152d4]/20 transition hover:bg-[#0f47b9]"
              >
                Next step
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1152d4] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#1152d4]/20 transition hover:bg-[#0f47b9] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isPublishing ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Publishing...
                  </>
                ) : (
                  <>
                    Publish live session
                    <Rocket className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </footer>

      {coursesError ? (
        <div className="fixed bottom-28 right-4 z-50 max-w-sm rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-700 shadow-lg dark:border-amber-900/30 dark:bg-amber-900/20 dark:text-amber-200">
          We could not refresh your course inventory. You can still create a new course and live session from this wizard.
        </div>
      ) : null}
    </div>
  );
}
