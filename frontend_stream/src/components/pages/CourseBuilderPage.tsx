import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CopyPlus,
  GraduationCap,
  ImagePlus,
  Layers3,
  LayoutTemplate,
  Rocket,
  Save,
  Search,
  Settings2,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useAuth } from '../../hooks/useAuth';
import { useCreateCourseMutation } from '../../store/api/liveApi';
import { getInitials } from '../../lib/utils';

interface CourseBuilderPageProps {
  onNavigate: (path: string) => void;
}

type BuilderStep = 1 | 2 | 3 | 4;
type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
type VisibilityMode = 'public' | 'private' | 'protected';
type PricingMode = 'free' | 'paid';
type LessonType = 'VIDEO' | 'PDF' | 'QUIZ' | 'ARTICLE';

interface LessonDraft {
  id: string;
  title: string;
  type: LessonType;
  duration: string;
  meta: string;
}

interface SectionDraft {
  id: string;
  title: string;
  description: string;
  lessons: LessonDraft[];
}

interface CourseBuilderDraft {
  step: BuilderStep;
  title: string;
  subtitle: string;
  category: string;
  level: CourseLevel;
  launchDate: string;
  sections: SectionDraft[];
  visibility: VisibilityMode;
  pricingMode: PricingMode;
  regularPrice: string;
  currency: string;
  discountedPrice: string;
  seoTitle: string;
  metaDescription: string;
  issueCertificate: boolean;
  password: string;
}

const COURSE_BUILDER_STORAGE_KEY = 'teacher-course-builder-draft-v1';
const CATEGORY_OPTIONS = ['Development', 'Design', 'Business', 'Marketing'];
const LEVEL_OPTIONS: Array<{ value: CourseLevel; label: string }> = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];
const LESSON_TYPE_OPTIONS: LessonType[] = ['VIDEO', 'PDF', 'QUIZ', 'ARTICLE'];

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function createEmptyLesson(index = 1): LessonDraft {
  return {
    id: createId('lesson'),
    title: `Nouvelle lecon ${index}`,
    type: 'VIDEO',
    duration: '',
    meta: '',
  };
}

function createEmptySection(index = 1): SectionDraft {
  return {
    id: createId('section'),
    title: `Section ${index}`,
    description: '',
    lessons: [createEmptyLesson(1)],
  };
}

function createDefaultDraft(): CourseBuilderDraft {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  const hours = String(tomorrow.getHours()).padStart(2, '0');
  const minutes = String(tomorrow.getMinutes()).padStart(2, '0');

  return {
    step: 1,
    title: '',
    subtitle: '',
    category: 'Development',
    level: 'beginner',
    launchDate: `${year}-${month}-${day}T${hours}:${minutes}`,
    sections: [createEmptySection(1)],
    visibility: 'public',
    pricingMode: 'paid',
    regularPrice: '',
    currency: 'USD',
    discountedPrice: '',
    seoTitle: '',
    metaDescription: '',
    issueCertificate: true,
    password: '',
  };
}

function getDashboardPath(role?: string) {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'teacher':
      return '/teacher/dashboard';
    case 'student':
    default:
      return '/dashboard';
  }
}

function formatDurationFromMinutes(totalMinutes: number) {
  if (totalMinutes <= 0) {
    return '0h';
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

function stepLabel(step: BuilderStep) {
  switch (step) {
    case 1:
      return 'Basic Info';
    case 2:
      return 'Curriculum';
    case 3:
      return 'Settings';
    case 4:
      return 'Publish';
    default:
      return 'Builder';
  }
}

export function CourseBuilderPage({ onNavigate }: CourseBuilderPageProps) {
  const { user, isAuthenticated } = useAuth();
  const [createCourse, { isLoading: isPublishing }] = useCreateCourseMutation();
  const [draft, setDraft] = useState<CourseBuilderDraft>(() => createDefaultDraft());
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [publishedCourseId, setPublishedCourseId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const progress = draft.step * 25;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const stored = window.localStorage.getItem(COURSE_BUILDER_STORAGE_KEY);
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as Partial<CourseBuilderDraft>;
      setDraft((current) => ({
        ...current,
        ...parsed,
        sections: parsed.sections?.length ? parsed.sections : current.sections,
      }));
      setStatusMessage('Un brouillon local a ete recharge.');
    } catch {
      window.localStorage.removeItem(COURSE_BUILDER_STORAGE_KEY);
    }
  }, []);

  const totalLessons = useMemo(
    () => draft.sections.reduce((count, section) => count + section.lessons.length, 0),
    [draft.sections],
  );

  const totalVideoMinutes = useMemo(
    () =>
      draft.sections.reduce((total, section) => {
        return (
          total +
          section.lessons.reduce((sectionTotal, lesson) => {
            const parsed = Number(lesson.duration);
            return sectionTotal + (Number.isFinite(parsed) ? parsed : 0);
          }, 0)
        );
      }, 0),
    [draft.sections],
  );

  const checklist = useMemo(
    () => [
      {
        label: 'Informations de base completes',
        done: Boolean(draft.title.trim() && draft.subtitle.trim() && draft.launchDate),
      },
      {
        label: 'Programme structure avec sections et lecons',
        done: draft.sections.length > 0 && totalLessons > 0,
      },
      {
        label: 'Pricing coherent et visibilite definie',
        done:
          draft.pricingMode === 'free' ||
          (Boolean(draft.regularPrice) &&
            (!draft.discountedPrice || Number(draft.discountedPrice) <= Number(draft.regularPrice))),
      },
      {
        label: 'SEO renseigne',
        done: Boolean(draft.seoTitle.trim() && draft.metaDescription.trim()),
      },
    ],
    [draft, totalLessons],
  );

  const updateDraft = (updates: Partial<CourseBuilderDraft>) => {
    setDraft((current) => ({ ...current, ...updates }));
  };

  const saveDraft = () => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(COURSE_BUILDER_STORAGE_KEY, JSON.stringify(draft));
    setStatusMessage('Brouillon sauvegarde localement.');
    setErrorMessage(null);
  };

  const discardDraft = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(COURSE_BUILDER_STORAGE_KEY);
    }
    setDraft(createDefaultDraft());
    setThumbnailPreview(null);
    setPublishedCourseId(null);
    setErrorMessage(null);
    setStatusMessage('Brouillon efface.');
  };

  const moveToStep = (step: BuilderStep) => {
    setDraft((current) => ({ ...current, step }));
    setErrorMessage(null);
  };

  const validateCurrentStep = () => {
    if (draft.step === 1) {
      if (!draft.title.trim() || !draft.subtitle.trim() || !draft.launchDate) {
        setErrorMessage('Renseignez le titre, le sous-titre et la date de lancement.');
        return false;
      }
    }

    if (draft.step === 2) {
      if (!draft.sections.length || !totalLessons) {
        setErrorMessage('Ajoutez au moins une section et une lecon.');
        return false;
      }
    }

    if (draft.step === 3) {
      if (draft.visibility === 'protected' && !draft.password.trim()) {
        setErrorMessage('Ajoutez un mot de passe pour le mode protege.');
        return false;
      }
      if (draft.pricingMode === 'paid') {
        if (!draft.regularPrice) {
          setErrorMessage('Renseignez un prix standard pour continuer.');
          return false;
        }
        if (draft.discountedPrice && Number(draft.discountedPrice) > Number(draft.regularPrice)) {
          setErrorMessage('Le prix reduit doit etre inferieur ou egal au prix standard.');
          return false;
        }
      }
    }

    setErrorMessage(null);
    return true;
  };

  const goNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (draft.step < 4) {
      moveToStep((draft.step + 1) as BuilderStep);
    }
  };

  const goBack = () => {
    if (draft.step > 1) {
      moveToStep((draft.step - 1) as BuilderStep);
    }
  };

  const addSection = () => {
    updateDraft({
      sections: [...draft.sections, createEmptySection(draft.sections.length + 1)],
    });
  };

  const updateSection = (sectionId: string, updates: Partial<SectionDraft>) => {
    updateDraft({
      sections: draft.sections.map((section) =>
        section.id === sectionId ? { ...section, ...updates } : section,
      ),
    });
  };

  const removeSection = (sectionId: string) => {
    if (draft.sections.length === 1) {
      return;
    }

    updateDraft({
      sections: draft.sections.filter((section) => section.id !== sectionId),
    });
  };

  const addLesson = (sectionId: string) => {
    updateDraft({
      sections: draft.sections.map((section) =>
        section.id === sectionId
          ? { ...section, lessons: [...section.lessons, createEmptyLesson(section.lessons.length + 1)] }
          : section,
      ),
    });
  };

  const updateLesson = (sectionId: string, lessonId: string, updates: Partial<LessonDraft>) => {
    updateDraft({
      sections: draft.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              lessons: section.lessons.map((lesson) =>
                lesson.id === lessonId ? { ...lesson, ...updates } : lesson,
              ),
            }
          : section,
      ),
    });
  };

  const removeLesson = (sectionId: string, lessonId: string) => {
    updateDraft({
      sections: draft.sections.map((section) => {
        if (section.id !== sectionId) {
          return section;
        }

        if (section.lessons.length === 1) {
          return section;
        }

        return {
          ...section,
          lessons: section.lessons.filter((lesson) => lesson.id !== lessonId),
        };
      }),
    });
  };

  const handleThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setThumbnailPreview(typeof reader.result === 'string' ? reader.result : null);
    };
    reader.readAsDataURL(file);
    setStatusMessage(`Miniature chargee: ${file.name}`);
  };

  const publishCourse = async () => {
    if (!user?.id) {
      setErrorMessage('Impossible d identifier l enseignant. Reconnectez-vous.');
      return;
    }

    if (!validateCurrentStep()) {
      return;
    }

    try {
      setErrorMessage(null);
      const createdCourse = await createCourse({
        title: draft.title,
        description: draft.subtitle,
        category: draft.category,
        scheduledAt: draft.launchDate,
        teacherId: user.id,
      }).unwrap();

      setPublishedCourseId(createdCourse.id);
      setStatusMessage('Cours publie avec succes. Les contenus de curriculum et settings restent sauvegardes localement tant que les endpoints dedies ne sont pas exposes.');
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(COURSE_BUILDER_STORAGE_KEY, JSON.stringify(draft));
      }
    } catch (error) {
      const payload = error as {
        data?: string | { message?: string; error?: string };
      };
      const message =
        typeof payload?.data === 'string'
          ? payload.data
          : payload?.data?.message || payload?.data?.error;
      setErrorMessage(message || 'Publication impossible pour le moment.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center px-6 py-16">
        <div className="w-full rounded-[32px] border border-slate-200 bg-white p-10 shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/40">
          <Sparkles className="h-10 w-10 text-[#1152d4]" />
          <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
            Connexion requise
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500 dark:text-slate-300">
            Connectez-vous avec un compte enseignant pour acceder au course builder.
          </p>
          <Button onClick={() => onNavigate('/auth/signin')} className="mt-8 rounded-2xl bg-[#1152d4] text-white hover:bg-[#0f47b9]">
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

  if (user?.role !== 'teacher') {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center px-6 py-16">
        <div className="w-full rounded-[32px] border border-slate-200 bg-white p-10 shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/40">
          <Sparkles className="h-10 w-10 text-[#1152d4]" />
          <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
            Acces reserve aux enseignants
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500 dark:text-slate-300">
            Cette interface sert a construire un cours avant publication et n est disponible que pour les profils enseignant.
          </p>
          <Button variant="outline" onClick={() => onNavigate(getDashboardPath(user?.role))} className="mt-8 rounded-2xl">
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#f6f6f8] text-slate-900 dark:bg-[#101622] dark:text-slate-100"
      style={{ fontFamily: 'Lexend, system-ui, sans-serif' }}
    >
      <div className="fixed left-[-10%] top-[-10%] -z-10 h-[40%] w-[40%] rounded-full bg-[#1152d4]/5 blur-[100px]" />
      <div className="fixed bottom-[-10%] right-[-10%] -z-10 h-[40%] w-[40%] rounded-full bg-[#1152d4]/10 blur-[100px]" />

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-[#101622]/80 lg:px-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#1152d4] p-2 text-white">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                EduMaster <span className="text-[#1152d4]">Studio</span>
              </h1>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Course builder</p>
            </div>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <nav className="flex items-center gap-6">
              <button type="button" onClick={() => onNavigate('/teacher/dashboard')} className="text-sm font-medium transition-colors hover:text-[#1152d4]">
                Dashboard
              </button>
              <button type="button" className="border-b-2 border-[#1152d4] pb-1 text-sm font-medium text-[#1152d4]">
                Course Builder
              </button>
              <button type="button" onClick={() => onNavigate('/teacher/live-sessions')} className="text-sm font-medium transition-colors hover:text-[#1152d4]">
                Sessions
              </button>
            </nav>
            <button type="button" onClick={() => onNavigate('/profile')} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1152d4]/20 bg-[#1152d4]/10 text-sm font-bold text-[#1152d4]">
              {getInitials(user.firstName || user.email || 'TE')}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center px-4 py-12 lg:px-20">
        <div className="mb-12 w-full max-w-4xl">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-bold">Create New Course</h2>
              <p className="text-slate-500 dark:text-slate-400">
                Step {draft.step} of 4: {stepLabel(draft.step)}
              </p>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <span className="text-sm font-bold text-[#1152d4]">{progress}% Complete</span>
                <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900">
                  <div className="h-full rounded-full bg-[#1152d4]" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 top-1/2 -z-10 h-0.5 w-full -translate-y-1/2 bg-slate-200 dark:bg-slate-800" />
            {([1, 2, 3, 4] as BuilderStep[]).map((step) => (
              <div key={step} className="flex flex-col items-center gap-2">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${draft.step === step ? 'bg-[#1152d4] text-white ring-4 ring-[#1152d4]/20' : draft.step > step ? 'bg-[#1152d4]/10 text-[#1152d4] border border-[#1152d4]/20' : 'border-2 border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-800'}`}>
                  {draft.step > step ? <Check className="h-4 w-4" /> : step}
                </div>
                <span className={`text-xs ${draft.step === step ? 'font-bold text-slate-900 dark:text-slate-100' : 'font-medium text-slate-400'}`}>
                  {stepLabel(step)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {errorMessage ? (
          <div className="mb-6 w-full max-w-4xl rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
            {errorMessage}
          </div>
        ) : null}

        {statusMessage ? (
          <div className="mb-6 w-full max-w-4xl rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
            {statusMessage}
          </div>
        ) : null}

        {draft.step === 1 ? (
          <>
            <div className="w-full max-w-4xl rounded-[28px] border border-white/40 bg-white/70 p-8 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#101622]/70 lg:p-12">
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                <div className="space-y-8 lg:col-span-7">
                  <div>
                    <label className="mb-2 block text-sm font-semibold tracking-tight">Course Title</label>
                    <input
                      value={draft.title}
                      onChange={(event) => updateDraft({ title: event.target.value })}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition-all placeholder:text-slate-400 focus:border-[#1152d4] focus:ring-2 focus:ring-[#1152d4]/30 dark:border-slate-700 dark:bg-slate-900/50"
                      placeholder="e.g. Masterclass in Modern Web Architecture"
                      type="text"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold tracking-tight">Sub-headline</label>
                    <textarea
                      value={draft.subtitle}
                      onChange={(event) => updateDraft({ subtitle: event.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-white p-4 outline-none transition-all placeholder:text-slate-400 focus:border-[#1152d4] focus:ring-2 focus:ring-[#1152d4]/30 dark:border-slate-700 dark:bg-slate-900/50"
                      placeholder="A brief hook that captures your student's attention immediately..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold tracking-tight">Category</label>
                      <select
                        value={draft.category}
                        onChange={(event) => updateDraft({ category: event.target.value })}
                        className="h-12 w-full cursor-pointer appearance-none rounded-2xl border border-slate-200 bg-white px-4 outline-none transition-all focus:border-[#1152d4] focus:ring-2 focus:ring-[#1152d4]/30 dark:border-slate-700 dark:bg-slate-900/50"
                      >
                        {CATEGORY_OPTIONS.map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold tracking-tight">Difficulty Level</label>
                      <div className="flex rounded-2xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-900">
                        {LEVEL_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => updateDraft({ level: option.value })}
                            className={`flex-1 rounded-xl px-2 py-2 text-[11px] font-bold transition ${draft.level === option.value ? 'bg-white text-[#1152d4] shadow-sm dark:bg-slate-800' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-tight">
                      <CalendarDays className="h-4 w-4 text-[#1152d4]" />
                      Launch Date
                    </label>
                    <input
                      value={draft.launchDate}
                      onChange={(event) => updateDraft({ launchDate: event.target.value })}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition-all focus:border-[#1152d4] focus:ring-2 focus:ring-[#1152d4]/30 dark:border-slate-700 dark:bg-slate-900/50"
                      type="datetime-local"
                    />
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Ce champ est requis par le backend actuel pour la creation du cours.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col lg:col-span-5">
                  <label className="mb-2 block text-sm font-semibold tracking-tight">Course Thumbnail</label>
                  <div className="flex flex-1 flex-col">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="group relative flex flex-1 flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-slate-300 bg-slate-50 p-8 transition-all hover:border-[#1152d4]/40 hover:bg-[#1152d4]/5 dark:border-slate-700 dark:bg-slate-900/30"
                    >
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md transition-transform group-hover:scale-110 dark:bg-slate-800">
                        {thumbnailPreview ? <ImagePlus className="h-8 w-8 text-[#1152d4]" /> : <Upload className="h-8 w-8 text-[#1152d4]" />}
                      </div>
                      <p className="mb-1 text-sm font-medium">
                        {thumbnailPreview ? 'Replace current image' : 'Drag and drop image'}
                      </p>
                      <p className="text-xs text-slate-400">PNG, JPG, or WEBP (max 5MB)</p>
                      <div className="mt-6 flex w-full aspect-video items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
                        {thumbnailPreview ? (
                          <ImageWithFallback src={thumbnailPreview} alt="Course thumbnail preview" className="h-full w-full object-cover" />
                        ) : (
                          <div className="text-center p-4">
                            <LayoutTemplate className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700" />
                            <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-slate-400">Preview area</p>
                          </div>
                        )}
                      </div>
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleThumbnailChange} />
                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                      La miniature reste locale tant qu un endpoint upload n est pas expose.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 flex w-full max-w-4xl items-center justify-between gap-4">
              <button type="button" onClick={discardDraft} className="rounded-full border-2 border-slate-200 px-8 py-3 font-semibold text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800">
                Discard Changes
              </button>
              <div className="flex items-center gap-4">
                <button type="button" onClick={saveDraft} className="flex items-center gap-2 rounded-full border-2 border-[#1152d4] px-8 py-3 font-semibold text-[#1152d4] transition-all hover:bg-[#1152d4]/5">
                  <Save className="h-4 w-4" />
                  Save Draft
                </button>
                <button type="button" onClick={goNext} className="flex items-center gap-2 rounded-full bg-[#1152d4] px-10 py-3 font-semibold text-white shadow-lg shadow-[#1152d4]/30 transition-all hover:bg-[#1152d4]/90">
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : null}

        {draft.step === 2 ? (
          <>
            <div className="w-full max-w-4xl space-y-8">
              <div className="rounded-[28px] border border-white/40 bg-white/70 p-8 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#101622]/70 lg:p-10">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#1152d4]">
                      <Layers3 className="h-4 w-4" />
                      Curriculum Builder
                    </div>
                    <h3 className="mt-2 text-2xl font-bold">Organisez sections et lecons</h3>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      Structurez votre programme maintenant. Les elements restent en brouillon local
                      jusqu a l exposition d endpoints dedies cote backend.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center dark:border-slate-700 dark:bg-slate-900/70">
                      <p className="text-2xl font-black text-[#1152d4]">{draft.sections.length}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Sections</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center dark:border-slate-700 dark:bg-slate-900/70">
                      <p className="text-2xl font-black text-[#1152d4]">{totalLessons}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Lessons</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center dark:border-slate-700 dark:bg-slate-900/70">
                      <p className="text-2xl font-black text-[#1152d4]">{formatDurationFromMinutes(totalVideoMinutes)}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Video</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {draft.sections.map((section, sectionIndex) => (
                    <div key={section.id} className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                      <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/60">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex-1">
                            <div className="mb-3 flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1152d4]/10 text-[#1152d4]">
                                <ChevronDown className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                                  Section {sectionIndex + 1}
                                </p>
                                <input
                                  value={section.title}
                                  onChange={(event) =>
                                    updateSection(section.id, { title: event.target.value })
                                  }
                                  className="mt-1 w-full border-none bg-transparent p-0 text-lg font-bold outline-none focus:ring-0"
                                  placeholder="Titre de section"
                                  type="text"
                                />
                              </div>
                            </div>
                            <textarea
                              value={section.description}
                              onChange={(event) =>
                                updateSection(section.id, { description: event.target.value })
                              }
                              className="min-h-[90px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#1152d4] focus:ring-2 focus:ring-[#1152d4]/30 dark:border-slate-700 dark:bg-slate-900"
                              placeholder="Ajoutez une courte description pour orienter les etudiants."
                              rows={3}
                            />
                          </div>

                          <div className="flex items-center gap-2 self-start">
                            <button
                              type="button"
                              onClick={() => addLesson(section.id)}
                              className="flex items-center gap-2 rounded-full border border-[#1152d4]/20 bg-[#1152d4]/10 px-4 py-2 text-sm font-semibold text-[#1152d4] transition hover:bg-[#1152d4]/15"
                            >
                              <CopyPlus className="h-4 w-4" />
                              Add lesson
                            </button>
                            <button
                              type="button"
                              onClick={() => removeSection(section.id)}
                              disabled={draft.sections.length === 1}
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 text-rose-500 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-rose-900/40 dark:hover:bg-rose-950/30"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 p-4">
                        {section.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lesson.id}
                            className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/50"
                          >
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#1152d4] shadow-sm dark:bg-slate-900">
                                  <BookOpen className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                                    Lesson {sectionIndex + 1}.{lessonIndex + 1}
                                  </p>
                                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                                    {lesson.type}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeLesson(section.id, lesson.id)}
                                disabled={section.lessons.length === 1}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-white hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                              <div className="md:col-span-5">
                                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                                  Lesson title
                                </label>
                                <input
                                  value={lesson.title}
                                  onChange={(event) =>
                                    updateLesson(section.id, lesson.id, { title: event.target.value })
                                  }
                                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition-all focus:border-[#1152d4] focus:ring-2 focus:ring-[#1152d4]/30 dark:border-slate-700 dark:bg-slate-900"
                                  placeholder="Nom de la lecon"
                                  type="text"
                                />
                              </div>

                              <div className="md:col-span-3">
                                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                                  Format
                                </label>
                                <select
                                  value={lesson.type}
                                  onChange={(event) =>
                                    updateLesson(section.id, lesson.id, {
                                      type: event.target.value as LessonType,
                                    })
                                  }
                                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition-all focus:border-[#1152d4] focus:ring-2 focus:ring-[#1152d4]/30 dark:border-slate-700 dark:bg-slate-900"
                                >
                                  {LESSON_TYPE_OPTIONS.map((option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="md:col-span-2">
                                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                                  Duration
                                </label>
                                <input
                                  value={lesson.duration}
                                  onChange={(event) =>
                                    updateLesson(section.id, lesson.id, { duration: event.target.value })
                                  }
                                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition-all focus:border-[#1152d4] focus:ring-2 focus:ring-[#1152d4]/30 dark:border-slate-700 dark:bg-slate-900"
                                  min="0"
                                  placeholder="15"
                                  type="number"
                                />
                              </div>

                              <div className="md:col-span-2">
                                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                                  Extra
                                </label>
                                <input
                                  value={lesson.meta}
                                  onChange={(event) =>
                                    updateLesson(section.id, lesson.id, { meta: event.target.value })
                                  }
                                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition-all focus:border-[#1152d4] focus:ring-2 focus:ring-[#1152d4]/30 dark:border-slate-700 dark:bg-slate-900"
                                  placeholder="PDF, 10 Q..."
                                  type="text"
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => addLesson(section.id)}
                          className="flex w-full items-center justify-center gap-2 rounded-[22px] border-2 border-dashed border-slate-200 px-4 py-4 text-sm font-semibold text-slate-500 transition hover:border-[#1152d4]/40 hover:bg-[#1152d4]/5 hover:text-[#1152d4] dark:border-slate-700 dark:hover:border-[#1152d4]/40 dark:hover:bg-[#1152d4]/10"
                        >
                          <CopyPlus className="h-4 w-4" />
                          Add new lesson
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addSection}
                    className="flex w-full flex-col items-center justify-center gap-2 rounded-[28px] border-2 border-dashed border-[#1152d4]/20 bg-[#1152d4]/5 px-6 py-8 text-[#1152d4] transition hover:bg-[#1152d4]/10"
                  >
                    <Layers3 className="h-8 w-8" />
                    <span className="font-bold">Add new section</span>
                    <span className="text-xs uppercase tracking-[0.18em] text-[#1152d4]/60">
                      Create a new learning block
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-10 flex w-full max-w-4xl items-center justify-between gap-4">
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-2 rounded-full border border-slate-200 px-8 py-3 font-semibold text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={saveDraft}
                  className="flex items-center gap-2 rounded-full border-2 border-[#1152d4] px-8 py-3 font-semibold text-[#1152d4] transition-all hover:bg-[#1152d4]/5"
                >
                  <Save className="h-4 w-4" />
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="flex items-center gap-2 rounded-full bg-[#1152d4] px-10 py-3 font-semibold text-white shadow-lg shadow-[#1152d4]/30 transition-all hover:bg-[#1152d4]/90"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : null}

        {draft.step === 3 ? (
          <>
            <div className="grid w-full max-w-5xl grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-8 lg:col-span-2">
                <section className="rounded-[28px] border border-white/40 bg-white/70 p-8 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#101622]/70">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1152d4]/10 text-[#1152d4]">
                      <Settings2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Course Visibility & Access</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Choisissez qui peut voir et rejoindre ce cours.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {([
                      {
                        value: 'public',
                        title: 'Public',
                        description:
                          'Le cours peut etre decouvert, recherche et rejoint librement.',
                      },
                      {
                        value: 'private',
                        title: 'Private',
                        description:
                          'Le cours reste accessible via lien direct ou invitation uniquement.',
                      },
                      {
                        value: 'protected',
                        title: 'Password Protected',
                        description:
                          'Le cours necessite un mot de passe avant acces au contenu.',
                      },
                    ] as const).map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateDraft({ visibility: option.value })}
                        className={`rounded-[24px] border-2 p-4 text-left transition ${
                          draft.visibility === option.value
                            ? 'border-[#1152d4] bg-[#1152d4]/5'
                            : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border ${
                              draft.visibility === option.value
                                ? 'border-[#1152d4] bg-[#1152d4] text-white'
                                : 'border-slate-300 text-transparent dark:border-slate-700'
                            }`}
                          >
                            <Check className="h-3 w-3" />
                          </div>
                          <div>
                            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-900 dark:text-slate-100">
                              {option.title}
                            </p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                              {option.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {draft.visibility === 'protected' ? (
                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-semibold">Password</label>
                      <input
                        value={draft.password}
                        onChange={(event) => updateDraft({ password: event.target.value })}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition-all focus:border-[#1152d4] focus:ring-2 focus:ring-[#1152d4]/30 dark:border-slate-700 dark:bg-slate-900/60"
                        placeholder="Definissez un mot de passe d acces"
                        type="text"
                      />
                    </div>
                  ) : null}
                </section>

                <section className="rounded-[28px] border border-white/40 bg-white/70 p-8 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#101622]/70">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1152d4]/10 text-[#1152d4]">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Pricing Model</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Definissez comment monetiser ce cours.
                        </p>
                      </div>
                    </div>
                    <div className="flex rounded-2xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-900">
                      {(['free', 'paid'] as PricingMode[]).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => updateDraft({ pricingMode: mode })}
                          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                            draft.pricingMode === mode
                              ? 'bg-white text-[#1152d4] shadow-sm dark:bg-slate-800'
                              : 'text-slate-500'
                          }`}
                        >
                          {mode === 'free' ? 'Free' : 'Paid'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {draft.pricingMode === 'paid' ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold">Regular Price</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                          <input
                            value={draft.regularPrice}
                            onChange={(event) => updateDraft({ regularPrice: event.target.value })}
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-4 outline-none transition-all focus:border-[#1152d4] focus:ring-2 focus:ring-[#1152d4]/30 dark:border-slate-700 dark:bg-slate-900/60"
                            placeholder="99.00"
                            type="number"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold">Currency</label>
                        <select
                          value={draft.currency}
                          onChange={(event) => updateDraft({ currency: event.target.value })}
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition-all focus:border-[#1152d4] focus:ring-2 focus:ring-[#1152d4]/30 dark:border-slate-700 dark:bg-slate-900/60"
                        >
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold">Discounted Price</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                          <input
                            value={draft.discountedPrice}
                            onChange={(event) =>
                              updateDraft({ discountedPrice: event.target.value })
                            }
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-4 outline-none transition-all focus:border-[#1152d4] focus:ring-2 focus:ring-[#1152d4]/30 dark:border-slate-700 dark:bg-slate-900/60"
                            placeholder="49.00"
                            type="number"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          Laissez vide pour ne pas activer de promotion.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-300">
                      Le cours sera publie comme gratuit. Aucun prix ne sera envoye au backend actuel.
                    </div>
                  )}
                </section>

                <section className="rounded-[28px] border border-white/40 bg-white/70 p-8 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#101622]/70">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1152d4]/10 text-[#1152d4]">
                      <Search className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">SEO & Metadata</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Renseignez les informations qui serviront au referencement.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="mb-2 block text-sm font-semibold">Search Engine Title</label>
                      <input
                        value={draft.seoTitle}
                        onChange={(event) => updateDraft({ seoTitle: event.target.value })}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition-all focus:border-[#1152d4] focus:ring-2 focus:ring-[#1152d4]/30 dark:border-slate-700 dark:bg-slate-900/60"
                        placeholder="Titre SEO du cours"
                        type="text"
                      />
                      <div className="mt-2 flex justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        <span>Recommended: 50-60 chars</span>
                        <span>{draft.seoTitle.length}/60</span>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold">Meta Description</label>
                      <textarea
                        value={draft.metaDescription}
                        onChange={(event) =>
                          updateDraft({ metaDescription: event.target.value })
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition-all focus:border-[#1152d4] focus:ring-2 focus:ring-[#1152d4]/30 dark:border-slate-700 dark:bg-slate-900/60"
                        placeholder="Resume visible dans les moteurs de recherche"
                        rows={4}
                      />
                      <div className="mt-2 flex justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        <span>Recommended: 150-160 chars</span>
                        <span>{draft.metaDescription.length}/160</span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <section className="rounded-[28px] border border-white/40 bg-white/70 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#101622]/70">
                  <div className="mb-4 flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#1152d4]" />
                    <h3 className="text-lg font-bold">Completion</h3>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900/70">
                    <div>
                      <p className="text-sm font-semibold">Issue Certificate</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Auto-generate after completion
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateDraft({ issueCertificate: !draft.issueCertificate })
                      }
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
                        draft.issueCertificate ? 'bg-[#1152d4]' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                          draft.issueCertificate ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </section>

                <section className="rounded-[28px] border border-[#1152d4]/15 bg-[#1152d4]/5 p-6">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#1152d4]">
                    Pro tip
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    Les cours entre 49 et 199 USD performent souvent mieux sur les competences
                    professionnelles. Pensez aussi a aligner le SEO sur le titre reel du cours.
                  </p>
                  <div className="mt-5 rounded-[24px] border border-dashed border-[#1152d4]/25 bg-white/60 p-5 text-center dark:bg-slate-900/40">
                    <Sparkles className="mx-auto h-8 w-8 text-[#1152d4]" />
                    <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                      Live preview
                    </p>
                    <p className="mt-2 text-sm font-semibold">
                      {draft.title || 'Votre landing course apparaitra ici'}
                    </p>
                  </div>
                </section>
              </div>
            </div>

            <div className="mt-10 flex w-full max-w-5xl items-center justify-between gap-4">
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-2 rounded-full border border-slate-200 px-8 py-3 font-semibold text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={saveDraft}
                  className="flex items-center gap-2 rounded-full border-2 border-[#1152d4] px-8 py-3 font-semibold text-[#1152d4] transition-all hover:bg-[#1152d4]/5"
                >
                  <Save className="h-4 w-4" />
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="flex items-center gap-2 rounded-full bg-[#1152d4] px-10 py-3 font-semibold text-white shadow-lg shadow-[#1152d4]/30 transition-all hover:bg-[#1152d4]/90"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : null}

        {draft.step === 4 ? (
          <>
            <div className="grid w-full max-w-5xl grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <section className="rounded-[28px] border border-white/40 bg-white/70 p-8 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#101622]/70">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1152d4]/10 text-[#1152d4]">
                        <LayoutTemplate className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Basic Information</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Verifiez le positionnement global du cours.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => moveToStep(1)}
                      className="text-sm font-semibold text-[#1152d4] transition hover:underline"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="flex flex-col gap-6 md:flex-row">
                    <div className="h-36 w-full overflow-hidden rounded-[24px] bg-slate-100 md:w-52 dark:bg-slate-800">
                      {thumbnailPreview ? (
                        <ImageWithFallback
                          src={thumbnailPreview}
                          alt="Course preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-300 dark:text-slate-700">
                          <ImagePlus className="h-10 w-10" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                          Course title
                        </p>
                        <p className="mt-1 text-xl font-bold">{draft.title || 'Titre non renseigne'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                          Subtitle
                        </p>
                        <p className="mt-1 text-sm leading-7 text-slate-600 dark:text-slate-300">
                          {draft.subtitle || 'Sous-titre non renseigne'}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                            Category
                          </p>
                          <span className="mt-2 inline-flex rounded-full bg-[#1152d4]/10 px-3 py-1 text-xs font-bold text-[#1152d4]">
                            {draft.category}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                            Level
                          </p>
                          <span className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {draft.level}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-[28px] border border-white/40 bg-white/70 p-8 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#101622]/70">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1152d4]/10 text-[#1152d4]">
                        <Layers3 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Curriculum Overview</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Resume quantitatif du contenu prepare.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => moveToStep(2)}
                      className="text-sm font-semibold text-[#1152d4] transition hover:underline"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="rounded-[22px] bg-slate-50 p-4 text-center dark:bg-slate-800/50">
                      <p className="text-3xl font-black text-[#1152d4]">{draft.sections.length}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Sections
                      </p>
                    </div>
                    <div className="rounded-[22px] bg-slate-50 p-4 text-center dark:bg-slate-800/50">
                      <p className="text-3xl font-black text-[#1152d4]">{totalLessons}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Lessons
                      </p>
                    </div>
                    <div className="rounded-[22px] bg-slate-50 p-4 text-center dark:bg-slate-800/50">
                      <p className="text-3xl font-black text-[#1152d4]">
                        {formatDurationFromMinutes(totalVideoMinutes)}
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Video
                      </p>
                    </div>
                    <div className="rounded-[22px] bg-slate-50 p-4 text-center dark:bg-slate-800/50">
                      <p className="text-3xl font-black text-[#1152d4]">
                        {
                          draft.sections.reduce(
                            (count, section) =>
                              count +
                              section.lessons.filter((lesson) => lesson.type === 'QUIZ').length,
                            0,
                          )
                        }
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Quizzes
                      </p>
                    </div>
                  </div>
                </section>

                <section className="rounded-[28px] border border-white/40 bg-white/70 p-8 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#101622]/70">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1152d4]/10 text-[#1152d4]">
                        <Settings2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Settings & Pricing</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Etat final avant publication.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => moveToStep(3)}
                      className="text-sm font-semibold text-[#1152d4] transition hover:underline"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 py-3 dark:border-slate-800">
                      <span className="text-sm font-medium">Visibility</span>
                      <span className="text-sm font-bold capitalize text-emerald-600">
                        {draft.visibility}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-100 py-3 dark:border-slate-800">
                      <span className="text-sm font-medium">Price</span>
                      <span className="text-sm font-bold">
                        {draft.pricingMode === 'free'
                          ? 'Free'
                          : `${draft.discountedPrice || draft.regularPrice || '0'} ${draft.currency}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-100 py-3 dark:border-slate-800">
                      <span className="text-sm font-medium">SEO</span>
                      <span className="text-sm font-bold text-emerald-600">
                        {draft.seoTitle && draft.metaDescription ? 'Optimized' : 'Incomplete'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-sm font-medium">Certificate</span>
                      <span className="text-sm font-bold">
                        {draft.issueCertificate ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <section className="rounded-[28px] border border-[#1152d4]/15 bg-[#1152d4]/5 p-6">
                  <h3 className="flex items-center gap-2 text-lg font-bold">
                    <CheckCircle2 className="h-5 w-5 text-[#1152d4]" />
                    Pre-publish checklist
                  </h3>
                  <div className="mt-5 space-y-4">
                    {checklist.map((item) => (
                      <div key={item.label} className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded ${
                            item.done
                              ? 'bg-[#1152d4] text-white'
                              : 'border border-slate-300 text-transparent dark:border-slate-700'
                          }`}
                        >
                          <Check className="h-3 w-3" />
                        </div>
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-[28px] border border-white/40 bg-white/70 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#101622]/70">
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={publishCourse}
                      disabled={isPublishing}
                      className="flex w-full items-center justify-center gap-2 rounded-[22px] bg-[#1152d4] px-6 py-4 font-bold text-white shadow-lg shadow-[#1152d4]/25 transition hover:bg-[#1152d4]/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Rocket className="h-4 w-4" />
                      {isPublishing ? 'Publishing...' : 'Publish Course Now'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        publishedCourseId
                          ? onNavigate(`/courses/${publishedCourseId}`)
                          : setStatusMessage(
                              'Publiez d abord le cours pour ouvrir un apercu base sur les donnees backend.',
                            )
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-[22px] border border-slate-200 px-6 py-3 font-semibold transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      <BookOpen className="h-4 w-4" />
                      Preview as Student
                    </button>
                    <button
                      type="button"
                      onClick={saveDraft}
                      className="flex w-full items-center justify-center gap-2 rounded-[22px] border border-transparent px-6 py-3 font-semibold text-slate-500 transition hover:border-slate-200 hover:bg-white dark:hover:border-slate-700 dark:hover:bg-slate-900"
                    >
                      <Save className="h-4 w-4" />
                      Save as Draft
                    </button>
                  </div>

                  {publishedCourseId ? (
                    <div className="mt-5 rounded-[24px] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-300">
                      Le cours backend est cree. Vous pouvez maintenant planifier une session live
                      ou ouvrir la page detail.
                    </div>
                  ) : (
                    <div className="mt-5 rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-300">
                      Publication actuelle: seules les donnees supportees par `createCourse`
                      sont envoyees au backend. Le reste du wizard reste en brouillon local.
                    </div>
                  )}

                  {publishedCourseId ? (
                    <button
                      type="button"
                      onClick={() => onNavigate('/teacher/live-sessions')}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-[22px] border border-[#1152d4]/20 bg-[#1152d4]/10 px-6 py-3 font-semibold text-[#1152d4] transition hover:bg-[#1152d4]/15"
                    >
                      <CalendarDays className="h-4 w-4" />
                      Plan live sessions
                    </button>
                  ) : null}
                </section>
              </div>
            </div>

            <div className="mt-10 flex w-full max-w-5xl items-center justify-between gap-4">
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-2 rounded-full border border-slate-200 px-8 py-3 font-semibold text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={discardDraft}
                  className="rounded-full border border-slate-200 px-8 py-3 font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={publishCourse}
                  disabled={isPublishing}
                  className="flex items-center gap-2 rounded-full bg-[#1152d4] px-10 py-3 font-semibold text-white shadow-lg shadow-[#1152d4]/30 transition-all hover:bg-[#1152d4]/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Rocket className="h-4 w-4" />
                  {isPublishing ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
