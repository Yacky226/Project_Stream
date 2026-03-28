import { Archive, ArrowRight, Users } from 'lucide-react';
import type { AdminCoursesDataModel } from '../useAdminCoursesData';

interface AdminCoursesSidebarProps {
  model: AdminCoursesDataModel;
  onNavigate: (path: string) => void;
}

export function AdminCoursesSidebar({ model, onNavigate }: AdminCoursesSidebarProps) {
  return (
    <div className="space-y-6 xl:col-span-3">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">Review Watchlist</h2>
          <span className="rounded-full bg-[#1152d4]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#1152d4]">
            Derived
          </span>
        </div>
        <div className="space-y-4">
          {model.watchlist.length ? (
            model.watchlist.map((course) => (
              <button
                key={course.id}
                type="button"
                onClick={() => onNavigate(`/courses/${course.id}`)}
                className="w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:border-[#1152d4]/30 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
              >
                <p className="text-sm font-bold text-slate-900 dark:text-white">{course.title}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">{course.teacherName}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold">
                  {course.isArchived ? (
                    <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                      archived
                    </span>
                  ) : null}
                  {course.enrollmentCount === 0 ? (
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      no students yet
                    </span>
                  ) : null}
                  {course.reviewCount > 0 &&
                  course.averageRating > 0 &&
                  course.averageRating < 3.5 ? (
                    <span className="rounded-full bg-red-50 px-2 py-1 text-red-600 dark:bg-red-900/20 dark:text-red-300">
                      low rating
                    </span>
                  ) : null}
                </div>
              </button>
            ))
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-300">
              No watchlist item is currently derived from this page.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-[28px] border border-[#1152d4]/20 bg-[#1152d4]/5 p-6 shadow-sm dark:bg-[#1152d4]/10">
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">Inventory Notes</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Category enrichment comes from the public course inventory, while the admin endpoint
          currently drives enrollment, rating, sessions, and archive state.
        </p>
        <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <div className="flex items-start gap-3">
            <Users className="mt-0.5 h-4 w-4 text-[#1152d4]" />
            <span>Enrollment and review signals are real admin metrics.</span>
          </div>
          <div className="flex items-start gap-3">
            <Archive className="mt-0.5 h-4 w-4 text-[#1152d4]" />
            <span>Moderation flags are not exposed yet, so the watchlist is heuristic only.</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('/help')}
          className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#1152d4] transition hover:text-[#0f47b9]"
        >
          Open admin guidance
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
