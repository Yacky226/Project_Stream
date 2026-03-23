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
  ImagePlus,
  Layers3,
  LayoutTemplate,
  Rocket,
  Search,
  Save,
  Settings2,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import {
  useCreateCourseMutation,
  useCreateLessonMutation,
  useCreateSectionMutation,
  useUploadCourseThumbnailMutation,
} from '../../store/api/liveApi';
import {
  TeacherSpaceShell,
  TeacherSpaceStatus,
  useTeacherSpaceData,
} from '../teacher/TeacherSpaceShared';
import {
  CourseBuilderBanner,
  CourseBuilderHeader,
} from '../teacher/course-builder/CourseBuilderChrome';
import {
  CATEGORY_OPTIONS,
  COURSE_BUILDER_STORAGE_KEY,
  LESSON_TYPE_OPTIONS,
  LEVEL_OPTIONS,
  VISIBILITY_OPTIONS,
  addLessonToSection,
  addSectionToDraft,
  buildChecklist,
  countQuizLessons,
  countTotalLessons,
  countTotalVideoMinutes,
  createDefaultDraft,
  formatDurationFromMinutes,
  getStepValidationError,
  handleThumbnailSelection,
  parseLessonDurationMinutes,
  removeLessonFromSection,
  removeSectionFromDraft,
  stepFromPath,
  stepToPath,
  toBackendLessonType,
  updateLessonInSection,
  updateSectionInDraft,
  type BuilderStep,
  type CourseBuilderDraft,
  type LessonDraft,
  type LessonType,
  type PricingMode,
  type SectionDraft,
} from '../teacher/course-builder/courseBuilder.utils';

interface CourseBuilderPageProps {
  onNavigate: (path: string) => void;
  currentPath?: string;
}

export function CourseBuilderPage({ onNavigate, currentPath }: CourseBuilderPageProps) {
  const teacherShared = useTeacherSpaceData({ includeDashboard: true });
  const [createCourse, { isLoading: isPublishingCourse }] = useCreateCourseMutation();
  const [createSection, { isLoading: isPublishingSections }] = useCreateSectionMutation();
  const [createLesson, { isLoading: isPublishingLessons }] = useCreateLessonMutation();
  const [uploadCourseThumbnail, { isLoading: isUploadingThumbnail }] = useUploadCourseThumbnailMutation();
  const [draft, setDraft] = useState<CourseBuilderDraft>(() => createDefaultDraft());
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [publishedCourseId, setPublishedCourseId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isPublishing =
    isPublishingCourse || isPublishingSections || isPublishingLessons || isUploadingThumbnail;
  const teacherId = teacherShared.user?.id ? String(teacherShared.user.id) : '';

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

  useEffect(() => {
    const routeStep = stepFromPath(currentPath);
    setDraft((current) => (current.step === routeStep ? current : { ...current, step: routeStep }));
  }, [currentPath]);

  const totalLessons = useMemo(() => countTotalLessons(draft.sections), [draft.sections]);
  const totalVideoMinutes = useMemo(() => countTotalVideoMinutes(draft.sections), [draft.sections]);
  const totalQuizzes = useMemo(() => countQuizLessons(draft.sections), [draft.sections]);
  const checklist = useMemo(() => buildChecklist(draft, totalLessons), [draft, totalLessons]);

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
    setThumbnailFile(null);
    setPublishedCourseId(null);
    setErrorMessage(null);
    setStatusMessage('Brouillon efface.');
  };

  const moveToStep = (step: BuilderStep) => {
    setDraft((current) => ({ ...current, step }));
    setErrorMessage(null);
    const targetPath = stepToPath(step);
    if (!currentPath || currentPath !== targetPath) {
      onNavigate(targetPath);
    }
  };

  const validateCurrentStep = () => {
    if (draft.step === 1 && !draft.launchDate) {
      updateDraft({ launchDate: createDefaultDraft().launchDate });
    }

    const error = getStepValidationError(draft, totalLessons);
    if (error) {
      setErrorMessage(error);
      return false;
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
      sections: addSectionToDraft(draft.sections),
    });
  };

  const updateSection = (sectionId: string, updates: Partial<SectionDraft>) => {
    updateDraft({
      sections: updateSectionInDraft(draft.sections, sectionId, updates),
    });
  };

  const removeSection = (sectionId: string) => {
    updateDraft({
      sections: removeSectionFromDraft(draft.sections, sectionId),
    });
  };

  const addLesson = (sectionId: string) => {
    updateDraft({
      sections: addLessonToSection(draft.sections, sectionId),
    });
  };

  const updateLesson = (sectionId: string, lessonId: string, updates: Partial<LessonDraft>) => {
    updateDraft({
      sections: updateLessonInSection(draft.sections, sectionId, lessonId, updates),
    });
  };

  const removeLesson = (sectionId: string, lessonId: string) => {
    updateDraft({
      sections: removeLessonFromSection(draft.sections, sectionId, lessonId),
    });
  };

  const handleThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setThumbnailFile(selectedFile);
    handleThumbnailSelection(event, (preview, fileName) => {
      setThumbnailPreview(preview);
      updateDraft({ thumbnailName: fileName });
      setStatusMessage(`Miniature chargee: ${fileName}`);
    });
  };

  const publishCourse = async () => {
    if (!teacherId) {
      setErrorMessage('Impossible d identifier l enseignant. Reconnectez-vous.');
      return;
    }

    if (!validateCurrentStep()) {
      return;
    }

    let createdCourseId: string | null = null;

    try {
      setErrorMessage(null);
      const scheduledAt = draft.launchDate || createDefaultDraft().launchDate;
      let uploadedImageUrl: string | undefined;

      if (thumbnailFile) {
        const formData = new FormData();
        formData.append('file', thumbnailFile);
        const uploadResult = await uploadCourseThumbnail(formData).unwrap();
        uploadedImageUrl = uploadResult.imageUrl;
      }

      const createdCourse = await createCourse({
        title: draft.title,
        description: draft.subtitle,
        category: draft.category,
        scheduledAt,
        teacherId,
        imageUrl: uploadedImageUrl,
        metadata: {
          level: draft.level,
          visibility: draft.visibility,
          pricingMode: draft.pricingMode,
          regularPrice: draft.regularPrice,
          currency: draft.currency,
          discountedPrice: draft.discountedPrice,
          seoTitle: draft.seoTitle,
          metaDescription: draft.metaDescription,
          issueCertificate: draft.issueCertificate,
          password: draft.visibility === 'protected' ? draft.password : '',
          thumbnailName: draft.thumbnailName,
        },
      }).unwrap();

      createdCourseId = createdCourse.id;

      for (let sectionIndex = 0; sectionIndex < draft.sections.length; sectionIndex += 1) {
        const sectionDraft = draft.sections[sectionIndex];
        const createdSection = await createSection({
          courseId: createdCourse.id,
          title: sectionDraft.title.trim() || `Section ${sectionIndex + 1}`,
          description: sectionDraft.description.trim() || undefined,
          order: sectionIndex + 1,
        }).unwrap();

        for (let lessonIndex = 0; lessonIndex < sectionDraft.lessons.length; lessonIndex += 1) {
          const lessonDraft = sectionDraft.lessons[lessonIndex];
          const normalizedMeta = lessonDraft.meta.trim();

          await createLesson({
            courseId: createdCourse.id,
            sectionId: createdSection.id,
            title: lessonDraft.title.trim() || `Lecon ${lessonIndex + 1}`,
            description:
              lessonDraft.type === 'ARTICLE' || lessonDraft.type === 'QUIZ'
                ? normalizedMeta || undefined
                : undefined,
            type: toBackendLessonType(lessonDraft.type),
            durationMinutes: parseLessonDurationMinutes(lessonDraft.duration),
            contentUrl:
              lessonDraft.type === 'VIDEO' || lessonDraft.type === 'PDF'
                ? normalizedMeta || undefined
                : undefined,
            contentText:
              lessonDraft.type === 'ARTICLE' || lessonDraft.type === 'QUIZ'
                ? normalizedMeta || undefined
                : undefined,
            order: lessonIndex + 1,
          }).unwrap();
        }
      }

      setPublishedCourseId(createdCourse.id);
      setStatusMessage(
        'Cours publie avec succes. Le programme, les sections, les lecons et la metadata avancee sont enregistres dans le backend.',
      );
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
      if (createdCourseId) {
        setPublishedCourseId(createdCourseId);
        setStatusMessage(
          'Le cours principal existe deja dans le backend, mais la synchronisation complete du programme a rencontre une erreur.',
        );
      }
      setErrorMessage(message || 'Publication impossible pour le moment.');
    }
  };

  if (teacherShared.status !== 'ready') {
    return <TeacherSpaceStatus shared={teacherShared} />;
  }

  return (
    <TeacherSpaceShell
      currentPath={currentPath}
      onNavigate={(path) => onNavigate(typeof path === 'number' ? String(path) : path)}
      showSearch={false}
      headerTitle="Course Builder"
      headerDescription="Creez, structurez et publiez vos cours dans une interface unifiee avec le reste de votre espace enseignant."
      displayName={teacherShared.displayName}
      displayRole={teacherShared.displayRole}
      initials={teacherShared.initials}
      avatarUrl={teacherShared.avatarUrl}
      activeCourseCount={teacherShared.activeCourseCount}
      liveSessions={teacherShared.liveSessions}
      unreadCount={teacherShared.unreadCount}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center py-6">
        <CourseBuilderHeader step={draft.step} progress={progress} />

        {errorMessage ? <CourseBuilderBanner tone="error" message={errorMessage} /> : null}

        {statusMessage ? <CourseBuilderBanner tone="success" message={statusMessage} /> : null}

        {draft.step === 1 ? (
          <>
            <div className="w-full max-w-5xl rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm lg:p-10">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                <div className="space-y-7 lg:col-span-7">
                  <div>
                    <label className="mb-2 block text-sm font-semibold tracking-tight">Course Title</label>
                    <input
                      value={draft.title}
                      onChange={(event) => updateDraft({ title: event.target.value })}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                      placeholder="e.g. Masterclass in Modern Web Architecture"
                      type="text"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold tracking-tight">Sub-headline</label>
                    <textarea
                      value={draft.subtitle}
                      onChange={(event) => updateDraft({ subtitle: event.target.value })}
                      className="min-h-[112px] w-full rounded-xl border border-slate-200 bg-white p-4 text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
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
                        className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-4 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                      >
                        {CATEGORY_OPTIONS.map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold tracking-tight">Difficulty Level</label>
                      <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-1">
                        {LEVEL_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => updateDraft({ level: option.value })}
                            className={`flex-1 rounded-xl px-2 py-2 text-[11px] font-bold transition ${draft.level === option.value ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col lg:col-span-5">
                  <label className="mb-2 block text-sm font-semibold tracking-tight">Course Thumbnail</label>
                  <div className="flex flex-1 flex-col">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="group relative flex min-h-[360px] flex-1 cursor-pointer flex-col items-center justify-start rounded-[24px] border-2 border-dashed border-slate-300 bg-slate-50 p-6 transition-all hover:border-blue-300 hover:bg-blue-50"
                    >
                      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-md transition-transform group-hover:scale-110">
                        {thumbnailPreview ? <ImagePlus className="h-8 w-8 text-blue-600" /> : <Upload className="h-8 w-8 text-blue-600" />}
                      </div>
                      <p className="mb-1 text-sm font-semibold text-slate-900">
                        {thumbnailPreview ? 'Replace current image' : 'Drag and drop image'}
                      </p>
                      <p className="text-xs font-medium text-slate-400">PNG, JPG, or WEBP (max 5MB)</p>
                      <div className="mt-6 flex h-44 w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                        {thumbnailPreview ? (
                          <ImageWithFallback src={thumbnailPreview} alt="Course thumbnail preview" className="h-full w-full object-cover" />
                        ) : (
                          <div className="text-center p-4">
                            <LayoutTemplate className="mx-auto h-12 w-12 text-slate-300" />
                            <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-slate-400">Preview area</p>
                          </div>
                        )}
                      </div>
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleThumbnailChange} />
                    <p className="mt-3 text-xs text-slate-500">
                      Le fichier est previsualise localement puis televerse au backend au moment de la publication.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex w-full max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={discardDraft}
                className="w-full cursor-pointer rounded-full border border-slate-300 bg-white px-8 py-3 font-semibold text-slate-600 transition-all hover:bg-slate-50 sm:w-auto"
              >
                Discard Changes
              </button>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={saveDraft}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-blue-600 bg-white px-8 py-3 font-semibold text-blue-600 transition-all hover:bg-blue-50 sm:w-auto"
                >
                  <Save className="h-4 w-4" />
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex h-12 w-full cursor-pointer shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-blue-600 px-8 font-semibold text-white shadow-[0_10px_24px_rgba(17,82,212,0.35)] transition-all hover:bg-blue-700 sm:w-auto sm:min-w-[170px]"
                >
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
              <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm lg:p-10">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
                      <Layers3 className="h-4 w-4" />
                      Curriculum Builder
                    </div>
                    <h3 className="mt-2 text-2xl font-bold">Organisez sections et lecons</h3>
                    <p className="mt-2 text-sm text-slate-500">
                      Structurez votre programme maintenant. Cette partie du wizard sera publiee
                      elle aussi dans le backend avec le cours.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center">
                      <p className="text-2xl font-black text-blue-600">{draft.sections.length}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Sections</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center">
                      <p className="text-2xl font-black text-blue-600">{totalLessons}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Lessons</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center">
                      <p className="text-2xl font-black text-blue-600">{formatDurationFromMinutes(totalVideoMinutes)}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Video</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {draft.sections.map((section, sectionIndex) => (
                    <div key={section.id} className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
                      <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex-1">
                            <div className="mb-3 flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
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
                              className="min-h-[90px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                              placeholder="Ajoutez une courte description pour orienter les etudiants."
                              rows={3}
                            />
                          </div>

                          <div className="flex items-center gap-2 self-start">
                            <button
                              type="button"
                              onClick={() => addLesson(section.id)}
                              className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
                            >
                              <CopyPlus className="h-4 w-4" />
                              Add lesson
                            </button>
                            <button
                              type="button"
                              onClick={() => removeSection(section.id)}
                              disabled={draft.sections.length === 1}
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 text-rose-500 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
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
                            className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4"
                          >
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                                  <BookOpen className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                                    Lesson {sectionIndex + 1}.{lessonIndex + 1}
                                  </p>
                                  <p className="text-sm font-semibold text-slate-600">
                                    {lesson.type}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeLesson(section.id, lesson.id)}
                                disabled={section.lessons.length === 1}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-white hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-40"
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
                                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
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
                                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
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
                                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
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
                                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
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
                          className="flex w-full items-center justify-center gap-2 rounded-[22px] border-2 border-dashed border-slate-200 px-4 py-4 text-sm font-semibold text-slate-500 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
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
                    className="flex w-full flex-col items-center justify-center gap-2 rounded-[28px] border-2 border-dashed border-blue-200 bg-blue-50 px-6 py-8 text-blue-600 transition hover:bg-blue-100"
                  >
                    <Layers3 className="h-8 w-8" />
                    <span className="font-bold">Add new section</span>
                    <span className="text-xs uppercase tracking-[0.18em] text-blue-500">
                      Create a new learning block
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-10 flex w-full max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={goBack}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 px-8 py-3 font-semibold text-slate-600 transition-all hover:bg-slate-50 sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={saveDraft}
                  className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-blue-600 px-8 py-3 font-semibold text-blue-600 transition-all hover:bg-blue-50 sm:w-auto"
                >
                  <Save className="h-4 w-4" />
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-blue-600 px-8 font-semibold text-white shadow-md transition-all hover:bg-blue-700 sm:w-auto sm:min-w-[170px]"
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
                <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                      <Settings2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Course Visibility & Access</h3>
                      <p className="text-sm text-slate-500">
                        Choisissez qui peut voir et rejoindre ce cours.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {VISIBILITY_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateDraft({ visibility: option.value })}
                        className={`rounded-[24px] border-2 p-4 text-left transition ${
                          draft.visibility === option.value
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border ${
                              draft.visibility === option.value
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-slate-300 text-transparent'
                            }`}
                          >
                            <Check className="h-3 w-3" />
                          </div>
                          <div>
                            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-900">
                              {option.title}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
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
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                        placeholder="Definissez un mot de passe d acces"
                        type="text"
                      />
                    </div>
                  ) : null}
                </section>

                <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Pricing Model</h3>
                        <p className="text-sm text-slate-500">
                          Definissez comment monetiser ce cours.
                        </p>
                      </div>
                    </div>
                    <div className="flex rounded-2xl border border-slate-200 bg-slate-100 p-1">
                      {(['free', 'paid'] as PricingMode[]).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => updateDraft({ pricingMode: mode })}
                          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                            draft.pricingMode === mode
                              ? 'bg-white text-blue-600 shadow-sm'
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
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-4 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
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
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
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
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-4 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                            placeholder="49.00"
                            type="number"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          Laissez vide pour ne pas activer de promotion.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                      Le cours sera publie comme gratuit avec metadata pricing synchronisee.
                    </div>
                  )}
                </section>

                <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                      <Search className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">SEO & Metadata</h3>
                      <p className="text-sm text-slate-500">
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
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
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
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
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
                <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-bold">Completion</h3>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4">
                    <div>
                      <p className="text-sm font-semibold">Issue Certificate</p>
                      <p className="text-xs text-slate-500">
                        Auto-generate after completion
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateDraft({ issueCertificate: !draft.issueCertificate })
                      }
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
                        draft.issueCertificate ? 'bg-blue-600' : 'bg-slate-300'
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

                <section className="rounded-[28px] border border-blue-200 bg-blue-50 p-6">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
                    Pro tip
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Les cours entre 49 et 199 USD performent souvent mieux sur les competences
                    professionnelles. Pensez aussi a aligner le SEO sur le titre reel du cours.
                  </p>
                  <div className="mt-5 rounded-[24px] border border-dashed border-blue-200 bg-white p-5 text-center">
                    <Sparkles className="mx-auto h-8 w-8 text-blue-600" />
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

            <div className="mt-10 flex w-full max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={goBack}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 px-8 py-3 font-semibold text-slate-600 transition-all hover:bg-slate-50 sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={saveDraft}
                  className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-blue-600 px-8 py-3 font-semibold text-blue-600 transition-all hover:bg-blue-50 sm:w-auto"
                >
                  <Save className="h-4 w-4" />
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-blue-600 px-8 font-semibold text-white shadow-md transition-all hover:bg-blue-700 sm:w-auto sm:min-w-[170px]"
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
                <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                        <LayoutTemplate className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Basic Information</h3>
                        <p className="text-sm text-slate-500">
                          Verifiez le positionnement global du cours.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => moveToStep(1)}
                      className="text-sm font-semibold text-blue-600 transition hover:underline"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="flex flex-col gap-6 md:flex-row">
                    <div className="h-36 w-full overflow-hidden rounded-[24px] bg-slate-100 md:w-52">
                      {thumbnailPreview ? (
                        <ImageWithFallback
                          src={thumbnailPreview}
                          alt="Course preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-300">
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
                        <p className="mt-1 text-sm leading-7 text-slate-600">
                          {draft.subtitle || 'Sous-titre non renseigne'}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                            Category
                          </p>
                          <span className="mt-2 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-600">
                            {draft.category}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                            Level
                          </p>
                          <span className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-600">
                            {draft.level}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                        <Layers3 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Curriculum Overview</h3>
                        <p className="text-sm text-slate-500">
                          Resume quantitatif du contenu prepare.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => moveToStep(2)}
                      className="text-sm font-semibold text-blue-600 transition hover:underline"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="rounded-[22px] bg-slate-50 p-4 text-center">
                      <p className="text-3xl font-black text-blue-600">{draft.sections.length}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Sections
                      </p>
                    </div>
                    <div className="rounded-[22px] bg-slate-50 p-4 text-center">
                      <p className="text-3xl font-black text-blue-600">{totalLessons}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Lessons
                      </p>
                    </div>
                    <div className="rounded-[22px] bg-slate-50 p-4 text-center">
                      <p className="text-3xl font-black text-blue-600">
                        {formatDurationFromMinutes(totalVideoMinutes)}
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Video
                      </p>
                    </div>
                    <div className="rounded-[22px] bg-slate-50 p-4 text-center">
                      <p className="text-3xl font-black text-blue-600">{totalQuizzes}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Quizzes
                      </p>
                    </div>
                  </div>
                </section>

                <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                        <Settings2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Settings & Pricing</h3>
                        <p className="text-sm text-slate-500">
                          Etat final avant publication.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => moveToStep(3)}
                      className="text-sm font-semibold text-blue-600 transition hover:underline"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 py-3">
                      <span className="text-sm font-medium">Visibility</span>
                      <span className="text-sm font-bold capitalize text-emerald-600">
                        {draft.visibility}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-100 py-3">
                      <span className="text-sm font-medium">Price</span>
                      <span className="text-sm font-bold">
                        {draft.pricingMode === 'free'
                          ? 'Free'
                          : `${draft.discountedPrice || draft.regularPrice || '0'} ${draft.currency}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-100 py-3">
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
                <section className="rounded-[28px] border border-blue-200 bg-blue-50 p-6">
                  <h3 className="flex items-center gap-2 text-lg font-bold">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    Pre-publish checklist
                  </h3>
                  <div className="mt-5 space-y-4">
                    {checklist.map((item) => (
                      <div key={item.label} className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded ${
                            item.done
                              ? 'bg-blue-600 text-white'
                              : 'border border-slate-300 text-transparent'
                          }`}
                        >
                          <Check className="h-3 w-3" />
                        </div>
                        <span className="text-sm text-slate-700">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={publishCourse}
                      disabled={isPublishing}
                      className="flex w-full items-center justify-center gap-2 rounded-[22px] bg-blue-600 px-6 py-4 font-bold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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
                      className="flex w-full items-center justify-center gap-2 rounded-[22px] border border-slate-200 px-6 py-3 font-semibold transition hover:bg-slate-50"
                    >
                      <BookOpen className="h-4 w-4" />
                      Preview as Student
                    </button>
                    <button
                      type="button"
                      onClick={saveDraft}
                      className="flex w-full items-center justify-center gap-2 rounded-[22px] border border-transparent px-6 py-3 font-semibold text-slate-500 transition hover:border-slate-200 hover:bg-white"
                    >
                      <Save className="h-4 w-4" />
                      Save as Draft
                    </button>
                  </div>

                  {publishedCourseId ? (
                    <div className="mt-5 rounded-[24px] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                      Le cours backend est cree. Vous pouvez maintenant planifier une session live
                      ou ouvrir la page detail.
                    </div>
                  ) : (
                    <div className="mt-5 rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                      Publication actuelle: le cours, les sections, les lecons et les reglages
                      avances sont envoyes au backend.
                    </div>
                  )}

                  {publishedCourseId ? (
                    <button
                      type="button"
                      onClick={() => onNavigate('/teacher/live-sessions')}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-[22px] border border-blue-200 bg-blue-100 px-6 py-3 font-semibold text-blue-600 transition hover:bg-blue-100"
                    >
                      <CalendarDays className="h-4 w-4" />
                      Plan live sessions
                    </button>
                  ) : null}
                </section>
              </div>
            </div>

            <div className="mt-10 flex w-full max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={goBack}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 px-8 py-3 font-semibold text-slate-600 transition-all hover:bg-slate-50 sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={discardDraft}
                  className="w-full rounded-full border border-slate-200 px-8 py-3 font-semibold text-slate-600 transition hover:bg-slate-50 sm:w-auto"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={publishCourse}
                  disabled={isPublishing}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-10 py-3 font-semibold text-white shadow-md transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  <Rocket className="h-4 w-4" />
                  {isPublishing ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </TeacherSpaceShell>
  );
}

