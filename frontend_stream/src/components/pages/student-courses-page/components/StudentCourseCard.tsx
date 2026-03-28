import { BookOpen, CalendarClock, Clock3, PlayCircle, Radio } from 'lucide-react';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import {
  formatStudentDate,
  getStudentCategoryMeta,
} from '../../../student/StudentSpaceShared';
import type { StudentCourseCardProps } from '../studentCourses.types';
import { matchStatusLabel, matchStatusVariant, nextSessionForCourse } from '../studentCourses.utils';

export function StudentCourseCard({ course, sessions, onNavigate }: StudentCourseCardProps) {
  const categoryMeta = getStudentCategoryMeta(course.category);
  const linkedSession = nextSessionForCourse(course.id, sessions);
  const isLive = Boolean(linkedSession && (linkedSession.isLive || linkedSession.status === 'LIVE'));

  return (
    <div
      className="student-course-card rounded-[28px] border border-[#1152d4]/10 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${categoryMeta.pillClass}`}
            >
              {course.category}
            </span>
            <Badge variant={matchStatusVariant(course.status)}>
              {matchStatusLabel(course.status)}
            </Badge>
            {isLive ? (
              <Badge variant="destructive">
                <Radio className="h-3 w-3" /> Live now
              </Badge>
            ) : null}
          </div>
          <h3 className="text-lg font-bold text-slate-950 dark:text-white">{course.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-300">
            {course.description || 'Course description will appear here as soon as it is available.'}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-4 w-4" />
              Progress {course.progress}%
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarClock className="h-4 w-4" />
              {linkedSession
                ? formatStudentDate(linkedSession.scheduledAt)
                : 'No session planned yet'}
            </span>
          </div>

          <div className="student-course-progress mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full rounded-full bg-[#1152d4]" style={{ width: `${course.progress}%` }} />
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 md:w-44">
          <Button
            className="student-course-primary-btn rounded-2xl bg-[#1152d4] text-white hover:bg-[#0f47b9]"
            onClick={() =>
              linkedSession && isLive
                ? onNavigate(`/courses/${course.id}/live/${linkedSession.id}`)
                : onNavigate(`/courses/${course.id}`)
            }
          >
            {linkedSession && isLive ? (
              <>
                <PlayCircle className="mr-2 h-4 w-4" />
                Join live
              </>
            ) : (
              <>
                <BookOpen className="mr-2 h-4 w-4" />
                Open course
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={() => onNavigate('/student/live')}
          >
            <CalendarClock className="mr-2 h-4 w-4" />
            All live plans
          </Button>
        </div>
      </div>
    </div>
  );
}
