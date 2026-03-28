import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  CircleOff,
  Loader2,
  PlayCircle,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import {
  getStudentCategoryMeta,
  getStudentSpaceErrorMessage,
} from '../../../student/StudentSpaceShared';
import type { CourseSort } from '../studentCourses.types';
import type { StudentCoursesDataModel } from '../useStudentCoursesData';
import { StudentCourseCard } from './StudentCourseCard';
import { StudentCoursesEmptyState } from './StudentCoursesEmptyState';

interface StudentCoursesContentProps {
  model: StudentCoursesDataModel;
  onNavigate: (path: string | number) => void;
}

export function StudentCoursesContent({ model, onNavigate }: StudentCoursesContentProps) {
  return (
    <div className="student-courses-page space-y-8">
      <section className="student-courses-hero flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="student-courses-kicker">
            <Sparkles className="h-3.5 w-3.5" />
            Student Workspace
          </p>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">
            My Courses
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
            Track enrolled courses, check the next live touchpoint, and continue from where you
            left off.
          </p>
        </div>

        <div className="student-courses-stat-grid">
          <div className="student-courses-stat-card rounded-2xl border border-[#1152d4]/10 bg-white px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Enrolled
            </p>
            <p className="mt-1 text-2xl font-bold text-[#1152d4]">
              {model.shared.dashboard?.stats.enrolledCourses || 0}
            </p>
          </div>
          <div className="student-courses-stat-card rounded-2xl border border-[#1152d4]/10 bg-white px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Completed
            </p>
            <p className="mt-1 text-2xl font-bold text-[#1152d4]">
              {model.shared.dashboard?.stats.completedCourses || 0}
            </p>
          </div>
          <div className="student-courses-stat-card rounded-2xl border border-[#1152d4]/10 bg-white px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Upcoming live
            </p>
            <p className="mt-1 text-2xl font-bold text-[#1152d4]">
              {model.shared.dashboard?.stats.upcomingSessions || 0}
            </p>
          </div>
          <div className="student-courses-stat-card rounded-2xl border border-[#1152d4]/10 bg-white px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Avg. Progress
            </p>
            <p className="mt-1 text-2xl font-bold text-[#1152d4]">{model.averageProgress}%</p>
          </div>
        </div>
      </section>

      {model.focusCourse ? (
        <section className="student-courses-focus rounded-[28px] border border-[#1152d4]/15 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="student-courses-focus-kicker">
                <TrendingUp className="h-4 w-4" />
                Continue where you stopped
              </p>
              <h2 className="mt-2 text-xl font-black text-slate-950 dark:text-white">
                {model.focusCourse.title}
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                Progression actuelle:{' '}
                <span className="font-bold text-[#1152d4]">{model.focusCourse.progress}%</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                className="student-course-primary-btn rounded-2xl bg-[#1152d4] text-white hover:bg-[#0f47b9]"
                onClick={() => onNavigate(`/courses/${model.focusCourse?.id}`)}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Resume Course
              </Button>
              <Button
                variant="outline"
                className="rounded-2xl"
                onClick={() => onNavigate('/student/live')}
              >
                <CalendarClock className="mr-2 h-4 w-4" />
                Check Live Schedule
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      {model.actionError || model.catalogError || model.sessionsError ? (
        <div className="rounded-[24px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
          {model.actionError ||
            getStudentSpaceErrorMessage(
              model.catalogError || model.sessionsError,
              'Some course enrichments could not be loaded.',
            )}
        </div>
      ) : null}

      <section className="student-courses-toolbar flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="student-courses-chip-row flex flex-wrap gap-2">
          <Badge variant="outline">{model.activeCourses.length} in progress</Badge>
          <Badge variant="outline">{model.completedCourses.length} completed</Badge>
          <Badge variant="outline">{model.abandonedCourses.length} abandoned</Badge>
        </div>

        <div className="student-courses-sort-wrap w-full max-w-xs">
          <select
            value={model.sortBy}
            onChange={(event) => model.setSortBy(event.target.value as CourseSort)}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm shadow-sm focus:border-[#1152d4] focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="recent">Sort by latest enrollment</option>
            <option value="progress">Sort by progress</option>
            <option value="title">Sort by title</option>
          </select>
        </div>
      </section>

      <section className="student-courses-block space-y-4">
        <div className="student-courses-block-title flex items-center gap-2">
          <PlayCircle className="h-5 w-5 text-[#1152d4]" />
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">In Progress</h2>
        </div>
        {model.activeCourses.length ? (
          model.activeCourses.map((course) => (
            <StudentCourseCard
              key={`${course.id}-${course.status}`}
              course={course}
              sessions={model.sessions || []}
              onNavigate={onNavigate}
            />
          ))
        ) : (
          <StudentCoursesEmptyState
            title="No in-progress course matches your search."
            description="Try another search or explore the recommendation panel below."
          />
        )}
      </section>

      <section className="student-courses-block space-y-4">
        <div className="student-courses-block-title flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-[#1152d4]" />
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Completed</h2>
        </div>
        {model.completedCourses.length ? (
          model.completedCourses.map((course) => (
            <StudentCourseCard
              key={`${course.id}-${course.status}`}
              course={course}
              sessions={model.sessions || []}
              onNavigate={onNavigate}
            />
          ))
        ) : (
          <StudentCoursesEmptyState
            title="No completed course yet."
            description="Completed courses will appear here automatically once the backend marks them as finished."
          />
        )}
      </section>

      <section className="student-courses-block space-y-4">
        <div className="student-courses-block-title flex items-center gap-2">
          <CircleOff className="h-5 w-5 text-[#1152d4]" />
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Abandoned</h2>
        </div>
        {model.abandonedCourses.length ? (
          model.abandonedCourses.map((course) => (
            <StudentCourseCard
              key={`${course.id}-${course.status}`}
              course={course}
              sessions={model.sessions || []}
              onNavigate={onNavigate}
            />
          ))
        ) : (
          <StudentCoursesEmptyState
            title="No abandoned course detected."
            description="If an enrollment is marked as abandoned by the backend, it will appear in this section."
          />
        )}
      </section>

      <section className="student-courses-reco rounded-[32px] border border-[#1152d4]/10 bg-[#1152d4]/5 p-6 dark:border-slate-800 dark:bg-slate-900/70">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">Recommended Next</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
              Fresh courses from the catalog, separated from your enrolled list.
            </p>
          </div>
          <Button variant="outline" className="rounded-2xl" onClick={() => onNavigate('/catalog')}>
            Browse catalog
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {model.recommendedCourses?.length ? (
            model.recommendedCourses.map((course) => {
              const categoryMeta = getStudentCategoryMeta(course.category);
              return (
                <div
                  key={course.id}
                  className="student-courses-reco-card rounded-[28px] border border-[#1152d4]/10 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${categoryMeta.pillClass}`}
                  >
                    {course.category}
                  </span>
                  <h3 className="mt-4 line-clamp-2 text-lg font-bold text-slate-950 dark:text-white">
                    {course.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500 dark:text-slate-300">
                    {course.description || 'Course description will appear here soon.'}
                  </p>
                  <div className="mt-6 flex flex-col gap-2">
                    <Button
                      className="rounded-2xl bg-[#1152d4] text-white hover:bg-[#0f47b9]"
                      disabled={model.isEnrolling && model.enrollingCourseId === course.id}
                      onClick={() => void model.handleEnroll(course.id, onNavigate)}
                    >
                      {model.isEnrolling && model.enrollingCourseId === course.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="mr-2 h-4 w-4" />
                      )}
                      Enroll now
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-2xl"
                      onClick={() => onNavigate(`/courses/${course.id}`)}
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      View details
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 lg:col-span-3">
              No catalog recommendation matches your current search.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
