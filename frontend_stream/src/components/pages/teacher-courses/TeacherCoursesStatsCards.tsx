interface TeacherCoursesStatsCardsProps {
  totalCourses: number;
  totalStudents: number;
  liveSessions: number;
}

export function TeacherCoursesStatsCards({
  totalCourses,
  totalStudents,
  liveSessions,
}: TeacherCoursesStatsCardsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Total Courses</p>
        <p className="mt-2 text-3xl font-bold text-slate-950">{totalCourses}</p>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Total Students</p>
        <p className="mt-2 text-3xl font-bold text-slate-950">{totalStudents}</p>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Live Sessions</p>
        <p className="mt-2 text-3xl font-bold text-slate-950">{liveSessions}</p>
      </article>
    </section>
  );
}
