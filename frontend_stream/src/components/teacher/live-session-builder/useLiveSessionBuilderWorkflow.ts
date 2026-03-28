import { ChangeEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  useCreateCourseMutation,
  useCreateSessionMutation,
  useGetTeacherCoursesQuery,
} from "../../../store/api/liveApi";
import type { LiveCourse } from "../../../types/live";
import { useTeacherSpaceData } from "../TeacherSpaceShared";
import {
  LIVE_BUILDER_STORAGE_KEY,
  broadcastLabel,
  createDefaultDraft,
  persistSessionMetadata,
  progressForStep,
  stepFromPath,
  stepToPath,
  validateStepOne,
  validateStepThree,
  type BuilderStep,
  type LiveBuilderDraft,
} from "./liveSessionBuilder.utils";

interface UseLiveSessionBuilderWorkflowParams {
  onNavigate: (path: string) => void;
  currentPath?: string;
}

export function useLiveSessionBuilderWorkflow({
  onNavigate,
  currentPath,
}: UseLiveSessionBuilderWorkflowParams) {
  const teacherShared = useTeacherSpaceData({ includeDashboard: true });
  const shouldLoad = teacherShared.status === "ready";
  const {
    data: teacherCourses = [],
    isLoading: isLoadingCourses,
    error: coursesError,
  } = useGetTeacherCoursesQuery(undefined, { skip: !shouldLoad });
  const [createCourse, { isLoading: isCreatingCourse }] =
    useCreateCourseMutation();
  const [createSession, { isLoading: isCreatingSession }] =
    useCreateSessionMutation();
  const [draft, setDraft] = useState<LiveBuilderDraft>(() =>
    createDefaultDraft(),
  );
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [prerequisiteInput, setPrerequisiteInput] = useState("");
  const thumbnailUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hasHydratedDraft = useRef(false);

  const teacherId = teacherShared.user?.id ? String(teacherShared.user.id) : "";
  const selectedCourse = useMemo(
    () =>
      teacherCourses.find((course) => course.id === draft.selectedCourseId) ||
      null,
    [teacherCourses, draft.selectedCourseId],
  );
  const progress = progressForStep(draft.step);
  const isPublishing = isCreatingCourse || isCreatingSession;

  const updateDraft = (updates: Partial<LiveBuilderDraft>) => {
    setDraft((current) => ({ ...current, ...updates }));
  };

  const handleEarlyBirdToggle = (checked: boolean) => {
    updateDraft({ earlyBirdEnabled: checked === true });
  };

  const handleSaveDraft = () => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      LIVE_BUILDER_STORAGE_KEY,
      JSON.stringify(draft),
    );
    setStatusMessage("Draft saved locally on this device.");
    setErrorMessage(null);
  };

  const handleAddPrerequisite = () => {
    const normalized = prerequisiteInput.trim();
    if (!normalized || draft.prerequisites.includes(normalized)) {
      setPrerequisiteInput("");
      return;
    }
    updateDraft({ prerequisites: [...draft.prerequisites, normalized] });
    setPrerequisiteInput("");
  };

  const handlePrerequisiteKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      handleAddPrerequisite();
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") {
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
            parsed.prerequisites?.filter((entry) => entry.trim().length > 0) ||
            current.prerequisites,
        }));
        setStatusMessage("A local wizard draft has been restored.");
      } catch {
        window.localStorage.removeItem(LIVE_BUILDER_STORAGE_KEY);
      }
    }

    hasHydratedDraft.current = true;
  }, []);

  useEffect(() => {
    if (!currentPath) {
      return;
    }

    const routeStep = stepFromPath(currentPath);
    setDraft((current) =>
      current.step === routeStep ? current : { ...current, step: routeStep },
    );
  }, [currentPath]);

  useEffect(() => {
    if (!hasHydratedDraft.current || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      LIVE_BUILDER_STORAGE_KEY,
      JSON.stringify(draft),
    );
  }, [draft]);

  useEffect(() => {
    return () => {
      if (thumbnailUrlRef.current) {
        URL.revokeObjectURL(thumbnailUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (
      !isLoadingCourses &&
      !teacherCourses.length &&
      draft.sessionMode === "existing"
    ) {
      setDraft((current) => ({
        ...current,
        sessionMode: "new",
        selectedCourseId: "",
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
    setStatusMessage(
      "Thumbnail preview updated. The image stays local until dedicated upload support is added.",
    );
    event.target.value = "";
  };

  const clearThumbnail = () => {
    if (thumbnailUrlRef.current) {
      URL.revokeObjectURL(thumbnailUrlRef.current);
      thumbnailUrlRef.current = null;
    }
    setThumbnailPreview(null);
    updateDraft({ thumbnailName: "" });
  };

  const applySelectedCourse = (course: LiveCourse) => {
    setDraft((current) => ({
      ...current,
      selectedCourseId: course.id,
      category: course.category || current.category,
      title: current.title.trim()
        ? current.title
        : `${course.title} Live Session`,
      description: current.description.trim()
        ? current.description
        : course.description,
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
      onNavigate(stepToPath(2));
      return;
    }

    if (draft.step === 2) {
      onNavigate(stepToPath(3));
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    if (draft.step === 1) {
      onNavigate("/teacher/live-sessions");
      return;
    }
    onNavigate(stepToPath((draft.step - 1) as BuilderStep));
  };

  const handlePublish = async () => {
    const finalValidation = validateStepThree(draft);
    if (finalValidation) {
      setErrorMessage(finalValidation);
      return;
    }

    if (!teacherId) {
      setErrorMessage("Unable to resolve the current teacher profile.");
      return;
    }

    setErrorMessage(null);
    setStatusMessage(null);
    let createdCourseId = "";
    let createdCourseTitle: string | null = null;

    try {
      let courseId = draft.selectedCourseId;
      let linkedCourseTitle = selectedCourse?.title || null;

      if (draft.sessionMode === "new") {
        const createdCourse = await createCourse({
          title: draft.title.trim(),
          description: draft.description.trim(),
          category: draft.category,
          scheduledAt: draft.scheduledAt,
          teacherId,
        }).unwrap();

        courseId = createdCourse.id;
        linkedCourseTitle = createdCourse.title;
        createdCourseId = createdCourse.id;
        createdCourseTitle = createdCourse.title;
      }

      const createdSession = await createSession({
        courseId,
        teacherId,
        scheduledAt: draft.scheduledAt,
        recordingEnabled: draft.recordingEnabled,
        resolution: draft.resolution,
        broadcastType: broadcastLabel(draft.streamType),
        metadata: {
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
        },
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

      if (typeof window !== "undefined") {
        window.localStorage.removeItem(LIVE_BUILDER_STORAGE_KEY);
      }

      setStatusMessage(
        "Live session published. Core settings and advanced metadata are saved in the backend. Redirecting to the studio...",
      );
      onNavigate(`/teacher/live/${courseId}/${createdSession.id}`);
    } catch (error) {
      const payload = error as {
        data?: { message?: string; error?: string };
        error?: string;
        message?: string;
      };
      if (createdCourseId) {
        updateDraft({
          sessionMode: "existing",
          selectedCourseId: createdCourseId,
        });
        setStatusMessage(
          `The course "${createdCourseTitle || createdCourseId}" was created, but the live session still needs to be published.`,
        );
      }
      setErrorMessage(
        payload.data?.message ||
          payload.data?.error ||
          payload.error ||
          payload.message ||
          "The live session could not be created.",
      );
    }
  };

  return {
    teacherShared,
    teacherCourses,
    isLoadingCourses,
    coursesError,
    draft,
    thumbnailPreview,
    statusMessage,
    errorMessage,
    prerequisiteInput,
    fileInputRef,
    selectedCourse,
    progress,
    isPublishing,
    updateDraft,
    setPrerequisiteInput,
    handleEarlyBirdToggle,
    handleSaveDraft,
    handleAddPrerequisite,
    handlePrerequisiteKeyDown,
    handleThumbnailChange,
    clearThumbnail,
    applySelectedCourse,
    handleNext,
    handleBack,
    handlePublish,
  };
}
