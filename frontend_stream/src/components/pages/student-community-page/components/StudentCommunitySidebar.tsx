import type { ReactNode } from 'react';
import {
  BookOpen,
  CalendarClock,
  Flame,
  Radio,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { EditorialPost } from '../../../../lib/editorialContent';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import { Button } from '../../../ui/button';
import { formatStudentDate, getStudentCategoryMeta } from '../../../student/StudentSpaceShared';
import type { LiveCourse } from '../../../../types/live';
import type { StudentSpaceData } from '../../../student/StudentSpaceShared';

interface StudentCommunitySidebarProps {
  shared: StudentSpaceData;
  popularPosts: EditorialPost[];
  learningPicks: LiveCourse[];
  onNavigate: (path: string | number) => void;
  onOpenPost: (post: EditorialPost) => void;
}

interface SidebarCardProps {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}

function SidebarCard({ icon: Icon, title, children }: SidebarCardProps) {
  return (
    <div className="rounded-[28px] border border-[#1152d4]/10 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-[#1152d4]" />
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">{title}</h2>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </div>
  );
}

export function StudentCommunitySidebar({
  shared,
  popularPosts,
  learningPicks,
  onNavigate,
  onOpenPost,
}: StudentCommunitySidebarProps) {
  return (
    <aside className="w-full space-y-6 lg:w-80">
      <SidebarCard icon={Radio} title="Upcoming live for you">
        {shared.dashboard?.upcomingSessions.length ? (
          shared.dashboard.upcomingSessions.slice(0, 3).map((session) => (
            <button
              key={session.id}
              type="button"
              onClick={() =>
                session.isLive
                  ? onNavigate(`/courses/${session.courseId}/live/${session.id}`)
                  : onNavigate(`/courses/${session.courseId}`)
              }
              className="w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:border-[#1152d4]/30 dark:border-slate-800"
            >
              <p className="font-semibold text-slate-950 dark:text-white">{session.courseTitle}</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                {formatStudentDate(session.startAt)}
              </p>
            </button>
          ))
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-300">
            No upcoming session is linked to your current enrollments.
          </p>
        )}
      </SidebarCard>

      <SidebarCard icon={BookOpen} title="Recommended next">
        {learningPicks.length ? (
          learningPicks.map((course) => {
            const categoryMeta = getStudentCategoryMeta(course.category);
            return (
              <button
                key={course.id}
                type="button"
                onClick={() => onNavigate(`/courses/${course.id}`)}
                className="w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:border-[#1152d4]/30 dark:border-slate-800"
              >
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${categoryMeta.pillClass}`}>
                  {course.category}
                </span>
                <p className="mt-3 font-semibold text-slate-950 dark:text-white">{course.title}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                  Next scheduled touchpoint: {formatStudentDate(course.scheduledAt)}
                </p>
              </button>
            );
          })
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-300">
            The catalog has no extra recommendation to highlight right now.
          </p>
        )}
      </SidebarCard>

      <div className="rounded-[28px] bg-[#1152d4] p-6 text-white shadow-xl shadow-[#1152d4]/20">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h2 className="text-lg font-bold">Need mentor guidance?</h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-white/85">
          Browse mentors and extend what you read here into concrete next steps.
        </p>
        <Button
          className="mt-5 rounded-2xl bg-white text-[#1152d4] hover:bg-slate-100"
          onClick={() => onNavigate('/search')}
        >
          Browse mentors
        </Button>
      </div>

      <SidebarCard icon={Flame} title="Popular today">
        {popularPosts.map((post) => (
          <button
            key={post.id}
            type="button"
            onClick={() => onOpenPost(post)}
            className="flex w-full items-center gap-3 rounded-2xl text-left"
          >
            <div className="h-14 w-14 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
              <ImageWithFallback src={post.image} alt={post.title} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-semibold text-slate-950 dark:text-white">{post.title}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                {post.category} - {post.readTime}
              </p>
            </div>
          </button>
        ))}
      </SidebarCard>

      <div className="rounded-[28px] border border-[#1152d4]/10 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <Button
          variant="outline"
          className="w-full rounded-2xl"
          onClick={() => onNavigate('/student/live')}
        >
          <CalendarClock className="mr-2 h-4 w-4" />
          Browse all live sessions
        </Button>
      </div>
    </aside>
  );
}
