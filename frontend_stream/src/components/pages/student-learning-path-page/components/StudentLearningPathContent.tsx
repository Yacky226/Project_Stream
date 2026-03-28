import {
  ArrowRight,
  Award,
  BookOpen,
  Lock,
  PlayCircle,
  Route,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import { FALLBACK_COVER, formatDate, formatMinutes, MENTOR_AVATAR } from '../studentLearningPath.utils';
import type { StudentLearningPathDataModel } from '../useStudentLearningPathData';

interface StudentLearningPathContentProps {
  model: StudentLearningPathDataModel;
  onNavigate: (path: string | number) => void;
}

export function StudentLearningPathContent({
  model,
  onNavigate,
}: StudentLearningPathContentProps) {
  if (!model.course) {
    return null;
  }

  const course = model.course;

  return (
    <div className="student-learning-path-layout grid grid-cols-1 gap-8 lg:grid-cols-12">
      <div className="student-learning-path-main space-y-8 lg:col-span-8">
        <section className="student-learning-path-intro">
          <span className="rounded-full bg-[#1152d4]/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#1152d4]">
            {course.status === 'TERMINE' ? 'Completed Path' : 'Active Path'}
          </span>
          <h1 className="mt-4 mb-2 text-3xl font-bold">{course.title}</h1>
          <p className="max-w-2xl text-slate-500 dark:text-slate-400">
            {course.description ||
              'An advanced learning experience designed to move from foundations to scalable execution.'}
          </p>
        </section>

        <section className="student-learning-path-current overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 md:w-1/3">
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/40 to-transparent p-4 text-white">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <PlayCircle className="h-4 w-4" />
                  Active Lesson
                </div>
              </div>
              <ImageWithFallback
                src={model.details?.coverImage || FALLBACK_COVER}
                alt={model.currentModule?.title || course.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-1 flex-col justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs">
                  <span className="rounded bg-[#1152d4]/10 px-2 py-0.5 font-bold text-[#1152d4]">
                    MODULE {model.currentModule?.order || 1}
                  </span>
                  <span className="text-slate-400">/</span>
                  <span className="font-medium text-slate-500">
                    {formatMinutes(model.currentModule?.minutes || 0)} remaining
                  </span>
                </div>
                <h3 className="mb-2 text-xl font-bold">{model.currentModule?.title || course.title}</h3>
                <p className="mb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {model.currentModule?.description || course.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    onNavigate(
                      model.nextSession?.isLive
                        ? `/courses/${course.id}/live/${model.nextSession.id}`
                        : `/courses/${course.id}`,
                    )
                  }
                  className="flex items-center gap-2 rounded-xl bg-[#1152d4] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#0f47b9]"
                >
                  Continue Lesson
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate(`/courses/${course.id}`)}
                  className="text-sm font-semibold text-slate-600 hover:text-[#1152d4] dark:text-slate-400"
                >
                  View Resources
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="student-learning-path-roadmap py-5">
          <h2 className="mb-10 flex items-center gap-3 text-lg font-bold">
            <Route className="h-5 w-5 text-[#1152d4]" />
            Learning Roadmap
          </h2>

          <div className="student-learning-path-timeline relative space-y-12">
            <div className="absolute bottom-3 left-8 top-3 w-0.5 bg-slate-200 dark:bg-slate-800" />

            {model.modules.map((module, index) => (
              <div key={module.id} className="student-learning-path-step relative pl-20">
                <div
                  className={`student-learning-path-step-icon absolute left-2 top-0 z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#f6f6f8] dark:border-[#101622] ${
                    module.state === 'completed'
                      ? 'bg-green-500 text-white'
                      : module.state === 'current'
                        ? 'bg-[#1152d4] text-white shadow-[0_0_0_4px_rgba(17,82,212,0.2)]'
                        : 'bg-slate-200 text-slate-400 dark:bg-slate-800'
                  }`}
                >
                  {module.state === 'completed' ? (
                    <Award className="h-5 w-5" />
                  ) : module.state === 'current' ? (
                    <ArrowRight className="h-5 w-5" />
                  ) : (
                    <Lock className="h-5 w-5" />
                  )}
                </div>

                <div
                  className={`student-learning-path-module-card rounded-2xl border px-7 py-6 sm:px-8 ${
                    module.state === 'current'
                      ? 'border-[#1152d4]/30 bg-white shadow-lg shadow-[#1152d4]/5 dark:border-[#1152d4]/20 dark:bg-slate-900'
                      : module.state === 'completed'
                        ? 'border-slate-200 bg-white/80 opacity-70 dark:border-slate-800 dark:bg-slate-900'
                        : 'border-slate-200 bg-slate-100/50 dark:border-slate-800 dark:bg-slate-900/50'
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between gap-4">
                    <h4 className={`font-bold ${module.state === 'locked' ? 'text-slate-400' : ''}`}>
                      {module.title}
                    </h4>
                    <span
                      className={`rounded px-2 py-1 text-xs font-bold ${
                        module.state === 'completed'
                          ? 'bg-green-50 text-green-500'
                          : module.state === 'current'
                            ? 'bg-[#1152d4]/10 text-[#1152d4]'
                            : 'bg-slate-200/50 text-slate-400 dark:bg-slate-800'
                      }`}
                    >
                      {module.state === 'completed'
                        ? 'COMPLETED'
                        : module.state === 'current'
                          ? 'CURRENT MODULE'
                          : 'LOCKED'}
                    </span>
                  </div>

                  <p
                    className={`text-sm ${
                      module.state === 'locked'
                        ? 'text-slate-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                    style={{ lineHeight: 1.7 }}
                  >
                    {module.description}
                  </p>

                  {module.state === 'current' ? (
                    <div className="mt-5 grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2 dark:text-slate-400">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-4 w-4 text-[#1152d4]" />
                        {module.remainingLessons} Lessons Remaining
                      </div>
                      <div className="flex items-center gap-3">
                        <PlayCircle className="h-4 w-4 text-[#1152d4]" />
                        {formatMinutes(module.minutes)} Content
                      </div>
                    </div>
                  ) : null}
                </div>

                {index === 0 && model.completedModules.length > 0 ? (
                  <div className="relative pl-6">
                    <div className="student-learning-path-step-milestone-icon absolute left-2 top-1 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#f6f6f8] bg-[#1152d4]/20 text-[#1152d4] dark:border-[#101622]">
                      <Trophy className="h-4 w-4" />
                    </div>
                    <div className="text-sm font-medium text-slate-500">
                      Milestone unlocked: {model.completedModules[0].title} badge
                    </div>
                  </div>
                ) : null}
              </div>
            ))}

            <div className="student-learning-path-step relative pl-20">
              <div
                className={`student-learning-path-step-icon absolute left-2 top-0 z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#f6f6f8] dark:border-[#101622] ${
                  model.progress >= 100
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-200 text-slate-400 dark:bg-slate-800'
                }`}
              >
                <Trophy className="h-5 w-5" />
              </div>

              <div
                className={`student-learning-path-certificate flex h-28 items-center justify-center rounded-2xl border p-6 ${
                  model.progress >= 100
                    ? 'border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-900/10'
                    : 'border-dashed border-slate-300 bg-slate-100/50 dark:border-slate-700 dark:bg-slate-900/50'
                }`}
              >
                <div className="text-center">
                  <p
                    className={`text-sm font-bold ${
                      model.progress >= 100 ? 'text-amber-700 dark:text-amber-300' : 'text-slate-400'
                    }`}
                  >
                    Course Completion Certificate
                  </p>
                  <p className="text-xs text-slate-400">
                    {model.progress >= 100
                      ? 'Unlocked and ready to share'
                      : 'Unlock by finishing all modules'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <aside className="student-learning-path-side space-y-6 lg:col-span-4">
        <div className="student-learning-path-side-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 text-lg font-bold">Overall Progress</h3>
          <div className="space-y-6">
            <div className="relative mx-auto h-32 w-32">
              <svg className="h-full w-full" viewBox="0 0 100 100">
                <circle
                  className="stroke-current text-slate-200 dark:text-slate-800"
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="40"
                  strokeWidth="8"
                />
                <circle
                  className="stroke-current text-[#1152d4]"
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="40"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * model.progress) / 100}
                  strokeLinecap="round"
                  strokeWidth="8"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black">{Math.round(model.progress)}%</span>
                <span className="text-[10px] uppercase tracking-tighter text-slate-500">Done</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 dark:border-slate-800">
              <div>
                <p className="mb-1 text-xs text-slate-500">Estimated Finish</p>
                <p className="text-sm font-bold">
                  {formatDate(model.nextSession?.startAt || model.details?.scheduledAt || course.scheduledAt)}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs text-slate-500">Time Invested</p>
                <p className="text-sm font-bold">{model.investedHours.toFixed(1)} Hours</p>
              </div>
            </div>
          </div>
        </div>

        <div className="student-learning-path-side-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">Milestones</h3>
            <button
              type="button"
              onClick={() => onNavigate('/student/achievements')}
              className="text-xs font-bold text-[#1152d4]"
            >
              VIEW ALL
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  model.completedModules.length > 0
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold">
                  {model.completedModules.length > 0 ? 'Fast Learner' : 'Momentum Builder'}
                </p>
                <p className="text-xs text-slate-500">
                  {model.completedModules.length > 0
                    ? `Finished ${model.completedModules[0].title}.`
                    : 'Finish your first roadmap stage.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  model.progress >= 60
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold">
                  {model.progress >= 60 ? 'Insight Master' : 'Insight Loading'}
                </p>
                <p className="text-xs text-slate-500">
                  {model.progress >= 60
                    ? `You crossed ${Math.round(model.progress)}% of the path.`
                    : 'Reach 60% to unlock the next mastery badge.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="student-learning-path-mentor rounded-2xl border border-[#1152d4]/10 bg-[#1152d4]/5 p-6">
          <h3 className="mb-4 flex items-center gap-2 font-bold">
            <BookOpen className="h-5 w-5 text-[#1152d4]" />
            Your Mentor
          </h3>

          <div className="flex items-center gap-4">
            <ImageWithFallback
              src={MENTOR_AVATAR}
              alt={model.mentorName}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-bold">{model.mentorName}</p>
              <p className="text-xs text-slate-500">{model.mentorSpeciality}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate(model.teacherPath)}
            className="student-learning-path-mentor-btn mt-4 w-full rounded-xl border border-[#1152d4]/20 bg-white py-2 text-xs font-bold hover:bg-[#1152d4]/5 dark:bg-slate-800"
          >
            Ask a Question
          </button>
        </div>
      </aside>
    </div>
  );
}
