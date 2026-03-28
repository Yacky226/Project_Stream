import { ArrowLeft, ArrowRight, Rocket, Save } from "lucide-react";
import {
  TeacherSpaceShell,
  TeacherSpaceStatus,
} from "../TeacherSpaceShared";
import {
  LiveSessionBuilderStepOne,
  LiveSessionBuilderStepThree,
  LiveSessionBuilderStepTwo,
} from "./LiveSessionBuilderStepPanels";
import { useLiveSessionBuilderWorkflow } from "./useLiveSessionBuilderWorkflow";

interface LiveSessionBuilderWorkflowProps {
  onNavigate: (path: string) => void;
  currentPath?: string;
}

export function LiveSessionBuilderWorkflow({
  onNavigate,
  currentPath,
}: LiveSessionBuilderWorkflowProps) {
  const {
    teacherShared,
    teacherCourses,
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
  } = useLiveSessionBuilderWorkflow({
    onNavigate,
    currentPath,
  });

  if (teacherShared.status !== "ready") {
    return <TeacherSpaceStatus shared={teacherShared} />;
  }

  return (
    <TeacherSpaceShell
      currentPath={currentPath}
      onNavigate={(path) =>
        onNavigate(typeof path === "number" ? String(path) : path)
      }
      showSearch={false}
      showHeader={false}
      headerTitle="Live Session Builder"
      headerDescription="Planifiez et publiez vos sessions live depuis le meme cadre visuel que votre dashboard enseignant."
      displayName={teacherShared.displayName}
      displayRole={teacherShared.displayRole}
      initials={teacherShared.initials}
      avatarUrl={teacherShared.avatarUrl}
      activeCourseCount={teacherShared.activeCourseCount}
      liveSessions={teacherShared.liveSessions}
      unreadCount={teacherShared.unreadCount}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
        className="hidden"
        onChange={handleThumbnailChange}
      />

      <div className="mx-auto flex w-full max-w-6xl flex-col px-2 pb-32 pt-6 md:px-4 md:pb-36">
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => onNavigate("/teacher/live-sessions")}
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

        {draft.step === 1 ? (
          <LiveSessionBuilderStepOne
            draft={draft}
            progress={progress}
            teacherCourses={teacherCourses}
            selectedCourse={selectedCourse}
            thumbnailPreview={thumbnailPreview}
            fileInputRef={fileInputRef}
            updateDraft={updateDraft}
            clearThumbnail={clearThumbnail}
            applySelectedCourse={applySelectedCourse}
            onNavigate={onNavigate}
          />
        ) : null}
        {draft.step === 2 ? (
          <LiveSessionBuilderStepTwo
            draft={draft}
            progress={progress}
            updateDraft={updateDraft}
          />
        ) : null}
        {draft.step === 3 ? (
          <LiveSessionBuilderStepThree
            draft={draft}
            progress={progress}
            selectedCourse={selectedCourse}
            prerequisiteInput={prerequisiteInput}
            updateDraft={updateDraft}
            setPrerequisiteInput={setPrerequisiteInput}
            handlePrerequisiteKeyDown={handlePrerequisiteKeyDown}
            handleAddPrerequisite={handleAddPrerequisite}
            handleEarlyBirdToggle={handleEarlyBirdToggle}
          />
        ) : null}
      </div>

      <footer className="sticky bottom-2 z-30 px-3 pb-2 md:bottom-4 md:px-4 md:pb-4">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-md dark:border-slate-700 dark:bg-[#101622]/95 md:flex-row md:items-center md:justify-between md:px-6 md:py-4">
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
              A local backup is kept, but advanced live metadata is now
              synchronized to the backend.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <button
              type="button"
              onClick={handleBack}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                draft.step === 1
                  ? "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  : "border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              {draft.step === 1 ? "Cancel" : "Back"}
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
        <div className="fixed bottom-36 right-4 z-50 max-w-sm rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-700 shadow-lg dark:border-amber-900/30 dark:bg-amber-900/20 dark:text-amber-200 md:bottom-28">
          We could not refresh your course inventory. You can still create a new
          course and live session from this wizard.
        </div>
      ) : null}
    </TeacherSpaceShell>
  );
}
