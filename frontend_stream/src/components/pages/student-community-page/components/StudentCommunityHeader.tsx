interface StudentCommunityHeaderProps {
  totalArticles: number;
  upcomingSessions: number;
  activeCourses: number;
}

export function StudentCommunityHeader({
  totalArticles,
  upcomingSessions,
  activeCourses,
}: StudentCommunityHeaderProps) {
  return (
    <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">
          Community
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
          Editorial picks, mentor entry points, and live learning moments tailored for students.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="rounded-2xl border border-[#1152d4]/10 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Articles</p>
          <p className="mt-1 text-2xl font-bold text-[#1152d4]">{totalArticles}</p>
        </div>
        <div className="rounded-2xl border border-[#1152d4]/10 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Upcoming lives</p>
          <p className="mt-1 text-2xl font-bold text-[#1152d4]">{upcomingSessions}</p>
        </div>
        <div className="rounded-2xl border border-[#1152d4]/10 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Active courses</p>
          <p className="mt-1 text-2xl font-bold text-[#1152d4]">{activeCourses}</p>
        </div>
      </div>
    </section>
  );
}
