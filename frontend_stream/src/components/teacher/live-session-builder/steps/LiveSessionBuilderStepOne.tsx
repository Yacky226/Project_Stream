import type { RefObject } from "react";
import { CalendarClock, ImagePlus } from "lucide-react";
import type { LiveCourse } from "../../../../types/live";
import {
  CATEGORY_OPTIONS,
  stepDescription,
  stepLabel,
  type LiveBuilderDraft,
} from "../liveSessionBuilder.utils";
interface LiveSessionBuilderStepOneProps {
  draft: LiveBuilderDraft;
  progress: number;
  teacherCourses: LiveCourse[];
  selectedCourse: LiveCourse | null;
  thumbnailPreview: string | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  updateDraft: (updates: Partial<LiveBuilderDraft>) => void;
  clearThumbnail: () => void;
  applySelectedCourse: (course: LiveCourse) => void;
  onNavigate: (path: string) => void;
}

export function LiveSessionBuilderStepOne({
  draft,
  progress,
  teacherCourses,
  selectedCourse,
  thumbnailPreview,
  fileInputRef,
  updateDraft,
  clearThumbnail,
  applySelectedCourse,
  onNavigate,
}: LiveSessionBuilderStepOneProps) {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <div className="border-b border-slate-100 px-5 py-5 dark:border-slate-800 md:px-7 md:py-6">
          <div className="flex flex-col gap-4">
            <div className="max-w-2xl mx-auto">
              <h2 className="  mt-1.5 text-2xl font-bold text-slate-950 dark:text-white">
                {stepLabel(draft.step)}
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                {stepDescription(draft.step)}
              </p>
            </div>

            <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-slate-50 p-1.5 dark:border-slate-700 dark:bg-slate-800/70">
              <div className="grid gap-1 sm:grid-cols-2 mx-auto">
                <button
                  type="button"
                  onClick={() =>
                    updateDraft({ sessionMode: "new", selectedCourseId: "" })
                  }
                  className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                    draft.sessionMode === "new"
                      ? "bg-[#1152d4] text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  New course + live session
                </button>
                <button
                  type="button"
                  disabled={!teacherCourses.length}
                  onClick={() => updateDraft({ sessionMode: "existing" })}
                  className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                    draft.sessionMode === "existing"
                      ? "bg-[#1152d4] text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                  } ${!teacherCourses.length ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  Existing course
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex w-full rounded-xl border border-slate-200 bg-slate-50 p-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:border-slate-700 dark:bg-slate-800/70 sm:w-auto">
              <span className="flex-1 rounded-lg bg-white px-3 py-1.5 text-center text-[#1152d4] shadow-sm dark:bg-slate-900 sm:flex-none">
                Info
              </span>
              <span className="flex-1 px-3 py-1.5 text-center sm:flex-none">
                Technical
              </span>
              <span className="flex-1 px-3 py-1.5 text-center sm:flex-none">
                Audience
              </span>
            </div>
            <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              {progress}% complete
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-[#1152d4]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid gap-5 p-5 md:p-7 lg:grid-cols-[1.35fr_1fr]">
          <div className="space-y-4">
            <label className="block">
              <span className="ml-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                {draft.sessionMode === "new"
                  ? "Course and session title"
                  : "Session title"}
              </span>
              <input
                value={draft.title}
                onChange={(event) => updateDraft({ title: event.target.value })}
                className="mt-2 block h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 transition-all focus:border-[#1152d4] focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100"
                placeholder={
                  draft.sessionMode === "new"
                    ? "e.g. Advanced Quantum Mechanics - Week 1"
                    : "e.g. Portfolio critique office hours"
                }
                type="text"
              />
            </label>

            <label className="block">
              <span className="ml-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Description
              </span>
              <textarea
                value={draft.description}
                onChange={(event) =>
                  updateDraft({ description: event.target.value })
                }
                className="mt-2 block h-[110px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-900 transition-all focus:border-[#1152d4] focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100"
                placeholder="Briefly describe what students will learn in this session..."
              />
            </label>

            <div className="hidden rounded-xl border border-[#1152d4]/15 bg-[#1152d4]/5 p-3 text-xs text-slate-600 dark:text-slate-300 lg:block">
              Thumbnail, audience and pricing details will be persisted in
              backend metadata.
            </div>
          </div>

          <div className="space-y-4">
            {draft.sessionMode === "existing" ? (
              <div className="space-y-3">
                <label className="ml-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Choose course
                </label>
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <div className="relative">
                    <select
                      value={draft.selectedCourseId}
                      onChange={(event) => {
                        const course = teacherCourses.find(
                          (entry) => entry.id === event.target.value,
                        );
                        if (course) {
                          applySelectedCourse(course);
                        } else {
                          updateDraft({ selectedCourseId: event.target.value });
                        }
                      }}
                      className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 focus:border-[#1152d4] focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100"
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
                    onClick={() => onNavigate("/teacher/course-builder")}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    New course
                  </button>
                </div>
                {selectedCourse ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40">
                    <p className="line-clamp-1 font-bold text-slate-900 dark:text-white">
                      {selectedCourse.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-slate-500 dark:text-slate-300">
                      {selectedCourse.description}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="ml-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Category
                </span>
                <div className="relative mt-2">
                  <select
                    value={draft.category}
                    onChange={(event) =>
                      updateDraft({ category: event.target.value })
                    }
                    className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 focus:border-[#1152d4] focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100"
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
                <span className="ml-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Date & time
                </span>
                <div className="relative mt-2">
                  <input
                    value={draft.scheduledAt}
                    onChange={(event) =>
                      updateDraft({ scheduledAt: event.target.value })
                    }
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 focus:border-[#1152d4] focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100"
                    type="datetime-local"
                  />
                  <CalendarClock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </label>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="ml-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Session thumbnail
                </span>
                {draft.thumbnailName ? (
                  <button
                    type="button"
                    onClick={clearThumbnail}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex h-32 w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition-all hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/30 dark:hover:bg-slate-800/50"
              >
                {thumbnailPreview ? (
                  <>
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-3 py-2 text-left">
                      <p className="text-xs font-semibold text-white">
                        Click to replace image
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#1152d4]/10">
                      <ImagePlus className="h-4 w-4 text-[#1152d4]" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Upload thumbnail
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      PNG, JPG, GIF or WEBP
                    </p>
                  </div>
                )}
              </button>
              <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                {draft.thumbnailName ? (
                  <>
                    Selected:{" "}
                    <span className="font-semibold">{draft.thumbnailName}</span>
                  </>
                ) : (
                  "No thumbnail selected yet"
                )}
              </p>
            </div>

            <div className="rounded-xl border border-[#1152d4]/15 bg-[#1152d4]/5 p-3 text-xs text-slate-600 dark:text-slate-300 lg:hidden">
              Thumbnail, audience and pricing details will be persisted in
              backend metadata.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

