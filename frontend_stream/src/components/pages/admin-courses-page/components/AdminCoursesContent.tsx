import { Archive, BookOpen, Download, Loader2, Sparkles, Star } from 'lucide-react';
import { AdminKpiCard, AdminPageIntro } from '../../../admin/AdminPageSections';
import { compact } from '../adminCourses.utils';
import type { AdminCoursesDataModel } from '../useAdminCoursesData';
import { AdminCoursesSidebar } from './AdminCoursesSidebar';
import { AdminCoursesTable } from './AdminCoursesTable';

interface AdminCoursesContentProps {
  model: AdminCoursesDataModel;
  onNavigate: (path: string) => void;
}

export function AdminCoursesContent({ model, onNavigate }: AdminCoursesContentProps) {
  return (
    <div className="space-y-8">
      <AdminPageIntro
        eyebrow="Catalog governance"
        title="Course Management"
        description="Review the platform inventory, navigate to course details, and monitor archived or low-signal offers. Status and category are derived from the existing course APIs when the backend does not expose dedicated moderation fields."
        actions={
          <>
            <button
              type="button"
              onClick={model.exportCurrentView}
              disabled={!model.filteredItems.length}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Download className="h-4 w-4" />
              Export current view
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/teacher/course-builder')}
              className="rounded-2xl bg-[#1152d4] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0f47b9]"
            >
              Open course builder
            </button>
          </>
        }
      />

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: 'Total Courses',
            value: compact(model.totalCourses),
            meta: `${compact(model.coursesPage?.totalElements ?? model.totalCourses)} indexed`,
            icon: BookOpen,
            accent: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
          },
          {
            title: 'Active Courses',
            value: compact(model.activeCourses),
            meta: 'available to learners',
            icon: Sparkles,
            accent: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
          },
          {
            title: 'Archived Courses',
            value: compact(model.archivedCourses),
            meta: 'hidden from catalogue',
            icon: Archive,
            accent: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
          },
          {
            title: 'Average Rating',
            value: model.averageRating ? model.averageRating.toFixed(2) : '0.00',
            meta: 'derived from course reviews',
            icon: Star,
            accent: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300',
          },
        ].map((card) => (
          <AdminKpiCard
            key={card.title}
            title={card.title}
            value={card.value}
            meta={card.meta}
            icon={card.icon}
            iconToneClass={card.accent}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-12">
        <AdminCoursesTable model={model} onNavigate={onNavigate} />
        <AdminCoursesSidebar model={model} onNavigate={onNavigate} />
      </section>

      {model.isFetching && model.hasData ? (
        <div className="flex items-center justify-end gap-2 text-xs font-medium text-slate-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-[#1152d4]" />
          Refreshing page data...
        </div>
      ) : null}
    </div>
  );
}
