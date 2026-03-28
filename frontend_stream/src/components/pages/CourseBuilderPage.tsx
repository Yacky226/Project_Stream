import { TeacherSpaceShell, TeacherSpaceStatus } from "../teacher/TeacherSpaceShared";
import {
  CourseBuilderBanner,
  CourseBuilderHeader,
} from "../teacher/course-builder/CourseBuilderChrome";
import { useCourseBuilderData } from "./course-builder/useCourseBuilderData";
import {
  CourseBuilderStepFour,
  CourseBuilderStepOne,
  CourseBuilderStepThree,
  CourseBuilderStepTwo,
} from "./course-builder/CourseBuilderStepPanels";

interface CourseBuilderPageProps {
  onNavigate: (path: string) => void;
  currentPath?: string;
}

export function CourseBuilderPage({ onNavigate, currentPath }: CourseBuilderPageProps) {
  const {
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
  } = useCourseBuilderData({
    onNavigate,
    currentPath,
  });

  if (teacherShared.status !== "ready") {
    return <TeacherSpaceStatus shared={teacherShared} />;
  }

  return (
    <TeacherSpaceShell
      currentPath={currentPath}
      onNavigate={(path) => onNavigate(typeof path === "number" ? String(path) : path)}
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
          <CourseBuilderStepOne
            draft={draft}
            thumbnailPreview={thumbnailPreview}
            fileInputRef={fileInputRef}
            updateDraft={updateDraft}
            handleThumbnailChange={handleThumbnailChange}
            discardDraft={discardDraft}
            saveDraft={saveDraft}
            goNext={goNext}
          />
        ) : null}

        {draft.step === 2 ? (
          <CourseBuilderStepTwo
            draft={draft}
            totalLessons={totalLessons}
            totalVideoMinutes={totalVideoMinutes}
            updateSection={updateSection}
            addLesson={addLesson}
            removeSection={removeSection}
            removeLesson={removeLesson}
            updateLesson={updateLesson}
            addSection={addSection}
            goBack={goBack}
            saveDraft={saveDraft}
            goNext={goNext}
          />
        ) : null}

        {draft.step === 3 ? (
          <CourseBuilderStepThree
            draft={draft}
            updateDraft={updateDraft}
            goBack={goBack}
            saveDraft={saveDraft}
            goNext={goNext}
          />
        ) : null}

        {draft.step === 4 ? (
          <CourseBuilderStepFour
            draft={draft}
            thumbnailPreview={thumbnailPreview}
            totalLessons={totalLessons}
            totalVideoMinutes={totalVideoMinutes}
            totalQuizzes={totalQuizzes}
            checklist={checklist}
            moveToStep={moveToStep}
            publishedCourseId={publishedCourseId}
            onNavigate={onNavigate}
            setStatusMessage={(value) => setStatusMessage(value)}
            saveDraft={saveDraft}
            publishCourse={publishCourse}
            isPublishing={isPublishing}
            discardDraft={discardDraft}
            goBack={goBack}
          />
        ) : null}
      </div>
    </TeacherSpaceShell>
  );
}
