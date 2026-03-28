import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  useCreateCourseMutation,
  useCreateLessonMutation,
  useCreateSectionMutation,
  useUploadCourseThumbnailMutation,
} from "../../../store/api/liveApi";
import { useTeacherSpaceData } from "../../teacher/TeacherSpaceShared";
import {
  COURSE_BUILDER_STORAGE_KEY,
  addLessonToSection,
  addSectionToDraft,
  buildChecklist,
  countQuizLessons,
  countTotalLessons,
  countTotalVideoMinutes,
  createDefaultDraft,
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
  type SectionDraft,
} from "../../teacher/course-builder/courseBuilder.utils";

interface UseCourseBuilderDataParams {
  onNavigate: (path: string) => void;
  currentPath?: string;
}

export function useCourseBuilderData({
  onNavigate,
  currentPath,
}: UseCourseBuilderDataParams) {
  const teacherShared = useTeacherSpaceData({ includeDashboard: true });
  const [createCourse, { isLoading: isPublishingCourse }] = useCreateCourseMutation();
  const [createSection, { isLoading: isPublishingSections }] = useCreateSectionMutation();
  const [createLesson, { isLoading: isPublishingLessons }] = useCreateLessonMutation();
  const [uploadCourseThumbnail, { isLoading: isUploadingThumbnail }] =
    useUploadCourseThumbnailMutation();
  const [draft, setDraft] = useState<CourseBuilderDraft>(() => createDefaultDraft());
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [publishedCourseId, setPublishedCourseId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isPublishing =
    isPublishingCourse || isPublishingSections || isPublishingLessons || isUploadingThumbnail;
  const teacherId = teacherShared.user?.id ? String(teacherShared.user.id) : "";

  const progress = draft.step * 25;

  useEffect(() => {
    if (typeof window === "undefined") {
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
      setStatusMessage("Un brouillon local a ete recharge.");
    } catch {
      window.localStorage.removeItem(COURSE_BUILDER_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const routeStep = stepFromPath(currentPath);
    setDraft((current) =>
      current.step === routeStep ? current : { ...current, step: routeStep },
    );
  }, [currentPath]);

  const totalLessons = useMemo(() => countTotalLessons(draft.sections), [draft.sections]);
  const totalVideoMinutes = useMemo(() => countTotalVideoMinutes(draft.sections), [draft.sections]);
  const totalQuizzes = useMemo(() => countQuizLessons(draft.sections), [draft.sections]);
  const checklist = useMemo(() => buildChecklist(draft, totalLessons), [draft, totalLessons]);

  const updateDraft = (updates: Partial<CourseBuilderDraft>) => {
    setDraft((current) => ({ ...current, ...updates }));
  };

  const saveDraft = () => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(COURSE_BUILDER_STORAGE_KEY, JSON.stringify(draft));
    setStatusMessage("Brouillon sauvegarde localement.");
    setErrorMessage(null);
  };

  const discardDraft = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(COURSE_BUILDER_STORAGE_KEY);
    }
    setDraft(createDefaultDraft());
    setThumbnailPreview(null);
    setThumbnailFile(null);
    setPublishedCourseId(null);
    setErrorMessage(null);
    setStatusMessage("Brouillon efface.");
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

  const updateLesson = (
    sectionId: string,
    lessonId: string,
    updates: Partial<LessonDraft>,
  ) => {
    updateDraft({
      sections: updateLessonInSection(draft.sections, sectionId, lessonId, updates),
    });
  };

  const removeLesson = (sectionId: string, lessonId: string) => {
    updateDraft({
      sections: removeLessonFromSection(draft.sections, sectionId, lessonId),
    });
  };

  const handleThumbnailChange = (event: ChangeEvent<HTMLInputElement>) => {
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
      setErrorMessage("Impossible d identifier l enseignant. Reconnectez-vous.");
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
        formData.append("file", thumbnailFile);
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
          password: draft.visibility === "protected" ? draft.password : "",
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
              lessonDraft.type === "ARTICLE" || lessonDraft.type === "QUIZ"
                ? normalizedMeta || undefined
                : undefined,
            type: toBackendLessonType(lessonDraft.type),
            durationMinutes: parseLessonDurationMinutes(lessonDraft.duration),
            contentUrl:
              lessonDraft.type === "VIDEO" || lessonDraft.type === "PDF"
                ? normalizedMeta || undefined
                : undefined,
            contentText:
              lessonDraft.type === "ARTICLE" || lessonDraft.type === "QUIZ"
                ? normalizedMeta || undefined
                : undefined,
            order: lessonIndex + 1,
          }).unwrap();
        }
      }

      setPublishedCourseId(createdCourse.id);
      setStatusMessage(
        "Cours publie avec succes. Le programme, les sections, les lecons et la metadata avancee sont enregistres dans le backend.",
      );
      if (typeof window !== "undefined") {
        window.localStorage.setItem(COURSE_BUILDER_STORAGE_KEY, JSON.stringify(draft));
      }
    } catch (error) {
      const payload = error as {
        data?: string | { message?: string; error?: string };
      };
      const message =
        typeof payload?.data === "string"
          ? payload.data
          : payload?.data?.message || payload?.data?.error;
      if (createdCourseId) {
        setPublishedCourseId(createdCourseId);
        setStatusMessage(
          "Le cours principal existe deja dans le backend, mais la synchronisation complete du programme a rencontre une erreur.",
        );
      }
      setErrorMessage(message || "Publication impossible pour le moment.");
    }
  };

  return {
    teacherShared,
    draft,
    thumbnailPreview,
    statusMessage,
    errorMessage,
    publishedCourseId,
    fileInputRef,
    isPublishing,
    progress,
    totalLessons,
    totalVideoMinutes,
    totalQuizzes,
    checklist,
    updateDraft,
    saveDraft,
    discardDraft,
    moveToStep,
    goNext,
    goBack,
    addSection,
    updateSection,
    removeSection,
    addLesson,
    updateLesson,
    removeLesson,
    handleThumbnailChange,
    publishCourse,
    setStatusMessage,
  };
}

export type CourseBuilderData = ReturnType<typeof useCourseBuilderData>;
