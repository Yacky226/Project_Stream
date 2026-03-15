import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  Compass,
  LayoutDashboard,
  Lock,
  PlayCircle,
  Route,
  Search,
  Sparkles,
  Trophy,
  User,
} from 'lucide-react';
import { useGetCourseDetailsQuery } from '../../store/api/liveApi';
import type { StudentDashboardCourse } from '../../types/dashboard';
import type { LiveCourseDetails } from '../../types/live';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { StudentSpaceStatus, useStudentSpaceData } from '../student/StudentSpaceShared';

interface StudentLearningPathPageProps {
  onNavigate: (path: string | number) => void;
}

type ModuleState = 'completed' | 'current' | 'locked';

interface PathModule {
  id: string;
  title: string;
  description: string;
  state: ModuleState;
  order: number;
  remainingLessons: number;
  minutes: number;
}

const FALLBACK_COVER =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDbMVny5GyEoropXhjpTCyYnfpNWUMhZb8N-IpGeSxwUs6WDbrXj2Mel6HpZAgwDfAD64BRopuOAQcmmH0KSBnxUcwTZsY_dWtDvAQLrxvi3-0IyWbTbQPWyg-H2NPBEmn8vBXcae9g0HGxjR4MVNVrQheR59VN9_LI0jAJXEI9cBx_2l08Y1zFAsImRxwPgc5AsIgczgUhPZD1j37ervSwW_n7fB87v3Ugg78shjloDW_jFy3ePslfVx8ZSfCnAYfayagpYhfHzUE';

const MENTOR_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC-Cl1tbQB8uzD0YdLql33JpTXghHD6Df_9uYkh7dRGORLhsMjFp9lpC_iy07AEDEK_9UIkiz4k8xWa26YIWNx6sLMMqLsy_pASb2ahtRZhh5s44VoRpMrdqN6mic66CQ8HLc9ub3opI3xChlJW0W3BIFVc0Y2XwF7CTCDCgUqGlNiOy0W0WG097NEwo7Z-oo_sQJuaH0LpPMtz_8_Uh7gDvvx4dAXB7cME2VpkqKOu1vDEiIrk7xbWqKerb9JcHOpEo0je2aiwNII';

function formatDate(value?: string | null) {
  if (!value) return 'Flexible schedule';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Flexible schedule';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function formatMinutes(value: number) {
  if (value < 60) return `${value} mins`;
  const hours = value / 60;
  return `${hours % 1 === 0 ? hours.toFixed(0) : hours.toFixed(1)} hours`;
}

function pickCourse(courses: StudentDashboardCourse[], search: string) {
  const q = search.trim().toLowerCase();
  return [...courses]
    .filter((course) => course.status !== 'ABANDONNE')
    .filter((course) =>
      q ? [course.title, course.description, course.category].join(' ').toLowerCase().includes(q) : true,
    )
    .sort((a, b) => {
      const aActive = a.status === 'ACTIF' ? 1 : 0;
      const bActive = b.status === 'ACTIF' ? 1 : 0;
      if (aActive !== bActive) return bActive - aActive;
      if (a.progress !== b.progress) return b.progress - a.progress;
      return new Date(b.enrolledAt || b.scheduledAt || 0).getTime() - new Date(a.enrolledAt || a.scheduledAt || 0).getTime();
    })[0] || null;
}

function buildModules(course: StudentDashboardCourse, details?: LiveCourseDetails | null): PathModule[] {
  const sections = [...(details?.sections || [])].sort((a, b) => a.order - b.order);
  if (!sections.length) {
    const currentIndex = course.progress >= 67 ? 2 : course.progress >= 34 ? 1 : 0;
    return [
      {
        id: `${course.id}-1`,
        title: `Foundations of ${course.category}`,
        description: 'Build the principles and shared vocabulary for the path.',
        state: currentIndex > 0 ? 'completed' : 'current',
        order: 1,
        remainingLessons: currentIndex > 0 ? 0 : 4,
        minutes: 95,
      },
      {
        id: `${course.id}-2`,
        title: `${course.category} Research & Synthesis`,
        description: 'Turn analysis into structured decisions and practical outputs.',
        state: currentIndex > 1 ? 'completed' : currentIndex === 1 ? 'current' : 'locked',
        order: 2,
        remainingLessons: currentIndex > 1 ? 0 : currentIndex === 1 ? 8 : 8,
        minutes: 270,
      },
      {
        id: `${course.id}-3`,
        title: `${course.category} Architecture`,
        description: 'Move from isolated lessons to scalable execution and system thinking.',
        state: currentIndex === 2 ? 'current' : 'locked',
        order: 3,
        remainingLessons: 6,
        minutes: 180,
      },
    ];
  }

  const states = sections.map((section) => {
    const lessons = [...section.lessons].sort((a, b) => a.order - b.order);
    const completedLessons = lessons.filter((lesson) => lesson.completed).length;
    return { section, lessons, completedLessons, done: lessons.length > 0 && completedLessons === lessons.length };
  });
  const currentIndex = Math.max(states.findIndex((item) => !item.done), 0);

  return states.map((item, index) => {
    const remainingLessons = item.done ? 0 : Math.max(item.lessons.length - item.completedLessons, 1);
    const incompleteMinutes =
      item.lessons.filter((lesson) => !lesson.completed).reduce((sum, lesson) => sum + (lesson.durationMinutes || 0), 0) ||
      item.lessons.reduce((sum, lesson) => sum + (lesson.durationMinutes || 0), 0) ||
      Math.max(item.lessons.length, 1) * 20;
    return {
      id: item.section.id,
      title: item.section.title,
      description: item.section.description || `Continue through ${item.section.title.toLowerCase()} to unlock the next stage.`,
      state: index < currentIndex ? 'completed' : index === currentIndex ? 'current' : 'locked',
      order: index + 1,
      remainingLessons,
      minutes: incompleteMinutes,
    };
  });
}

export function StudentLearningPathPage({ onNavigate }: StudentLearningPathPageProps) {
  const shared = useStudentSpaceData();
  const [searchQuery, setSearchQuery] = useState('');

  if (shared.status !== 'ready' || !shared.dashboard) {
    return <StudentSpaceStatus shared={shared} />;
  }

  const course = useMemo(() => pickCourse(shared.dashboard.courses, searchQuery), [shared.dashboard.courses, searchQuery]);
  const { data: details } = useGetCourseDetailsQuery(
    { courseId: course?.id || '', studentId: shared.profile?.id || shared.user?.id || undefined },
    { skip: !course },
  );

  const modules = useMemo(() => (course ? buildModules(course, details) : []), [course, details]);
  const currentModule = modules.find((module) => module.state === 'current') || modules[0] || null;
  const completedModules = modules.filter((module) => module.state === 'completed');
  const progress = Math.min(course?.status === 'TERMINE' ? 100 : course?.progress || shared.goalProgress || 0, 100);
  const totalMinutes = Math.max(modules.reduce((sum, module) => sum + module.minutes, 0), 120);
  const investedHours = ((totalMinutes * progress) / 100) / 60;
  const nextSession =
    course
      ? [...shared.dashboard.upcomingSessions]
          .filter((session) => session.courseId === course.id)
          .sort((a, b) => new Date(a.startAt || 0).getTime() - new Date(b.startAt || 0).getTime())[0]
      : null;

  if (!course) {
    return (
      <div className="min-h-screen bg-[#f6f6f8] px-6 py-16 dark:bg-[#101622]">
        <div className="mx-auto max-w-3xl rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1152d4]/10 text-[#1152d4]">
            <Route className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">No learning path found</h1>
          <p className="mt-4 text-sm leading-7 text-slate-500">Try another search or open your enrolled courses to keep building your roadmap.</p>
          <div className="mt-8 flex justify-center gap-4">
            <button type="button" onClick={() => onNavigate('/student/courses')} className="rounded-2xl bg-[#1152d4] px-6 py-3 text-sm font-bold text-white hover:bg-[#0f47b9]">Open My Courses</button>
            <button type="button" onClick={() => onNavigate('/catalog')} className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800">Browse Catalog</button>
          </div>
        </div>
      </div>
    );
  }

  const mentorName = details?.teacherName || 'Sarah Drasner';
  const mentorSpeciality = details?.teacherSpeciality || `${course.category} Mentor`;
  const teacherPath = details?.teacherId ? `/profile/teacher/${details.teacherId}` : '/student/community';

  return (
    <div className="min-h-screen bg-[#f6f6f8] text-slate-900 dark:bg-[#101622] dark:text-slate-100" style={{ fontFamily: 'Lexend, system-ui, sans-serif' }}>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 px-6 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 md:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-8">
            <button type="button" onClick={() => onNavigate('/dashboard')} className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1152d4] text-white"><BookOpen className="h-4 w-4" /></div>
              <h2 className="text-xl font-bold tracking-tight">EduPremium</h2>
            </button>
            <nav className="hidden items-center gap-8 md:flex">
              <button type="button" onClick={() => onNavigate('/student/courses')} className="text-sm font-medium text-slate-600 hover:text-[#1152d4] dark:text-slate-400">Courses</button>
              <button type="button" onClick={() => onNavigate('/student/learning-path')} className="border-b-2 border-[#1152d4] pb-1 text-sm font-semibold text-[#1152d4]">Learning Path</button>
              <button type="button" onClick={() => onNavigate('/student/community')} className="text-sm font-medium text-slate-600 hover:text-[#1152d4] dark:text-slate-400">Mentors</button>
              <button type="button" onClick={() => onNavigate('/help')} className="text-sm font-medium text-slate-600 hover:text-[#1152d4] dark:text-slate-400">Resources</button>
            </nav>
          </div>
          <div className="flex items-center gap-6">
            <label className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="w-64 rounded-xl border-none bg-slate-100 py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#1152d4]/50 dark:bg-slate-800" placeholder="Search my courses..." type="text" />
            </label>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-6 dark:border-slate-800">
              <button type="button" onClick={() => onNavigate('/notifications')} className="rounded-full p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"><Bell className="h-5 w-5" /></button>
              <button type="button" onClick={() => onNavigate('/profile')} className="h-9 w-9 overflow-hidden rounded-full bg-slate-200">{shared.avatarUrl ? <ImageWithFallback src={shared.avatarUrl} alt={shared.displayName} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-xs font-bold text-[#1152d4]">{shared.initials}</div>}</button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 p-6 md:grid-cols-12 md:p-10">
        <div className="space-y-8 md:col-span-8">
          <section>
            <span className="rounded-full bg-[#1152d4]/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#1152d4]">{course.status === 'TERMINE' ? 'Completed Path' : 'Active Path'}</span>
            <h1 className="mt-4 mb-2 text-3xl font-bold">{course.title}</h1>
            <p className="max-w-2xl text-slate-500 dark:text-slate-400">{course.description || 'An advanced learning experience designed to move from foundations to scalable execution.'}</p>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-6 md:flex-row">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 md:w-1/3">
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/40 to-transparent p-4 text-white"><div className="flex items-center gap-2 text-xs font-medium"><PlayCircle className="h-4 w-4" />Active Lesson</div></div>
                <ImageWithFallback src={details?.coverImage || FALLBACK_COVER} alt={currentModule?.title || course.title} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs"><span className="rounded bg-[#1152d4]/10 px-2 py-0.5 font-bold text-[#1152d4]">MODULE {currentModule?.order || 1}</span><span className="text-slate-400">/</span><span className="font-medium text-slate-500">{formatMinutes(currentModule?.minutes || 0)} remaining</span></div>
                  <h3 className="mb-2 text-xl font-bold">{currentModule?.title || course.title}</h3>
                  <p className="mb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{currentModule?.description || course.description}</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <button type="button" onClick={() => onNavigate(nextSession?.isLive ? `/courses/${course.id}/live/${nextSession.id}` : `/courses/${course.id}`)} className="flex items-center gap-2 rounded-xl bg-[#1152d4] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#0f47b9]">Continue Lesson <ArrowRight className="h-4 w-4" /></button>
                  <button type="button" onClick={() => onNavigate(`/courses/${course.id}`)} className="text-sm font-semibold text-slate-600 hover:text-[#1152d4] dark:text-slate-400">View Resources</button>
                </div>
              </div>
            </div>
          </section>

          <section className="py-4">
            <h2 className="mb-8 flex items-center gap-3 text-lg font-bold"><Route className="h-5 w-5 text-[#1152d4]" />Learning Roadmap</h2>
            <div className="relative space-y-10 pl-12">
              <div className="absolute bottom-2 left-6 top-2 w-0.5 bg-slate-200 dark:bg-slate-800" />
              {modules.map((module, index) => (
                <div key={module.id} className="relative">
                  <div className={`absolute -left-12 top-0 z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#f6f6f8] dark:border-[#101622] ${module.state === 'completed' ? 'bg-green-500 text-white' : module.state === 'current' ? 'bg-[#1152d4] text-white shadow-[0_0_0_4px_rgba(17,82,212,0.2)]' : 'bg-slate-200 text-slate-400 dark:bg-slate-800'}`}>{module.state === 'completed' ? <Award className="h-5 w-5" /> : module.state === 'current' ? <ArrowRight className="h-5 w-5" /> : <Lock className="h-5 w-5" />}</div>
                  <div className={`rounded-2xl border p-5 ${module.state === 'current' ? 'border-[#1152d4]/30 bg-white shadow-lg shadow-[#1152d4]/5 dark:border-[#1152d4]/20 dark:bg-slate-900' : module.state === 'completed' ? 'border-slate-200 bg-white/80 opacity-70 dark:border-slate-800 dark:bg-slate-900' : 'border-slate-200 bg-slate-100/50 dark:border-slate-800 dark:bg-slate-900/50'}`}>
                    <div className="mb-2 flex items-start justify-between gap-4">
                      <h4 className={`font-bold ${module.state === 'locked' ? 'text-slate-400' : ''}`}>{module.title}</h4>
                      <span className={`rounded px-2 py-1 text-xs font-bold ${module.state === 'completed' ? 'bg-green-50 text-green-500' : module.state === 'current' ? 'bg-[#1152d4]/10 text-[#1152d4]' : 'bg-slate-200/50 text-slate-400 dark:bg-slate-800'}`}>{module.state === 'completed' ? 'COMPLETED' : module.state === 'current' ? 'CURRENT MODULE' : 'LOCKED'}</span>
                    </div>
                    <p className={`text-sm ${module.state === 'locked' ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>{module.description}</p>
                    {module.state === 'current' ? <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400"><div className="flex items-center gap-3"><BookOpen className="h-4 w-4 text-[#1152d4]" />{module.remainingLessons} Lessons Remaining</div><div className="flex items-center gap-3"><PlayCircle className="h-4 w-4 text-[#1152d4]" />{formatMinutes(module.minutes)} Content</div></div> : null}
                  </div>
                  {index === 0 && completedModules.length > 0 ? <div className="relative pl-4"><div className="absolute -left-[3.25rem] top-1 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#f6f6f8] bg-[#1152d4]/20 text-[#1152d4] dark:border-[#101622]"><Trophy className="h-4 w-4" /></div><div className="text-sm font-medium text-slate-500">Milestone unlocked: {completedModules[0].title} badge</div></div> : null}
                </div>
              ))}
              <div className="relative">
                <div className={`absolute -left-12 top-0 z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#f6f6f8] dark:border-[#101622] ${progress >= 100 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-400 dark:bg-slate-800'}`}><Trophy className="h-5 w-5" /></div>
                <div className={`flex h-24 items-center justify-center rounded-2xl border p-5 ${progress >= 100 ? 'border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-900/10' : 'border-dashed border-slate-300 bg-slate-100/50 dark:border-slate-700 dark:bg-slate-900/50'}`}><div className="text-center"><p className={`text-sm font-bold ${progress >= 100 ? 'text-amber-700 dark:text-amber-300' : 'text-slate-400'}`}>Course Completion Certificate</p><p className="text-xs text-slate-400">{progress >= 100 ? 'Unlocked and ready to share' : 'Unlock by finishing all modules'}</p></div></div>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6 md:col-span-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-bold">Overall Progress</h3>
            <div className="space-y-6">
              <div className="relative mx-auto h-32 w-32">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle className="stroke-current text-slate-200 dark:text-slate-800" cx="50" cy="50" fill="transparent" r="40" strokeWidth="8" />
                  <circle className="stroke-current text-[#1152d4]" cx="50" cy="50" fill="transparent" r="40" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * progress) / 100} strokeLinecap="round" strokeWidth="8" transform="rotate(-90 50 50)" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-2xl font-black">{Math.round(progress)}%</span><span className="text-[10px] uppercase tracking-tighter text-slate-500">Done</span></div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 dark:border-slate-800">
                <div><p className="mb-1 text-xs text-slate-500">Estimated Finish</p><p className="text-sm font-bold">{formatDate(nextSession?.startAt || details?.scheduledAt || course.scheduledAt)}</p></div>
                <div><p className="mb-1 text-xs text-slate-500">Time Invested</p><p className="text-sm font-bold">{investedHours.toFixed(1)} Hours</p></div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Milestones</h3>
              <button type="button" onClick={() => onNavigate('/student/achievements')} className="text-xs font-bold text-[#1152d4]">VIEW ALL</button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4"><div className={`flex h-10 w-10 items-center justify-center rounded-lg ${completedModules.length > 0 ? 'bg-yellow-100 text-yellow-600' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'}`}><Sparkles className="h-5 w-5" /></div><div><p className="text-sm font-bold">{completedModules.length > 0 ? 'Fast Learner' : 'Momentum Builder'}</p><p className="text-xs text-slate-500">{completedModules.length > 0 ? `Finished ${completedModules[0].title}.` : 'Finish your first roadmap stage.'}</p></div></div>
              <div className="flex items-center gap-4"><div className={`flex h-10 w-10 items-center justify-center rounded-lg ${progress >= 60 ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'}`}><Award className="h-5 w-5" /></div><div><p className="text-sm font-bold">{progress >= 60 ? 'Insight Master' : 'Insight Loading'}</p><p className="text-xs text-slate-500">{progress >= 60 ? `You crossed ${Math.round(progress)}% of the path.` : 'Reach 60% to unlock the next mastery badge.'}</p></div></div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#1152d4]/10 bg-[#1152d4]/5 p-6">
            <h3 className="mb-4 flex items-center gap-2 font-bold"><BookOpen className="h-5 w-5 text-[#1152d4]" />Your Mentor</h3>
            <div className="flex items-center gap-4">
              <ImageWithFallback src={MENTOR_AVATAR} alt={mentorName} className="h-12 w-12 rounded-full object-cover" />
              <div><p className="text-sm font-bold">{mentorName}</p><p className="text-xs text-slate-500">{mentorSpeciality}</p></div>
            </div>
            <button type="button" onClick={() => onNavigate(teacherPath)} className="mt-4 w-full rounded-xl border border-[#1152d4]/20 bg-white py-2 text-xs font-bold hover:bg-[#1152d4]/5 dark:bg-slate-800">Ask a Question</button>
          </div>
        </aside>
      </main>

      <div className="fixed bottom-6 left-1/2 z-50 flex h-16 w-[90%] -translate-x-1/2 items-center justify-around rounded-full border border-slate-200 bg-white/90 px-6 shadow-2xl backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/90 md:hidden">
        <button type="button" onClick={() => onNavigate('/dashboard')} className="text-slate-400"><LayoutDashboard className="h-6 w-6" /></button>
        <button type="button" onClick={() => onNavigate('/student/learning-path')} className="text-[#1152d4]"><Compass className="h-6 w-6" /></button>
        <button type="button" onClick={() => onNavigate('/student/achievements')} className="text-slate-400"><Trophy className="h-6 w-6" /></button>
        <button type="button" onClick={() => onNavigate('/profile')} className="text-slate-400"><User className="h-6 w-6" /></button>
      </div>
    </div>
  );
}
