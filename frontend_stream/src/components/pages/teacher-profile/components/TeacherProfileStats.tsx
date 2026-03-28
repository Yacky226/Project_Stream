import { Star } from 'lucide-react';
import type { TeacherProfileDataModel } from '../useTeacherProfileData';

interface TeacherProfileStatsProps {
  model: TeacherProfileDataModel;
}

export function TeacherProfileStats({ model }: TeacherProfileStatsProps) {
  return (
    <section className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div className="rounded-2xl border border-[#1152d4]/15 bg-white/80 px-5 py-6 text-center shadow-sm backdrop-blur">
        <p className="text-5xl font-bold leading-none text-[#1152d4]">{model.totalStudents.toLocaleString()}+</p>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Total Students</p>
      </div>
      <div className="rounded-2xl border border-[#1152d4]/15 bg-white/80 px-5 py-6 text-center shadow-sm backdrop-blur">
        <p className="text-5xl font-bold leading-none text-[#1152d4]">{model.teacherCourses.length}</p>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Total Courses</p>
      </div>
      <div className="rounded-2xl border border-[#1152d4]/15 bg-white/80 px-5 py-6 text-center shadow-sm backdrop-blur">
        <p className="flex items-center justify-center gap-1 text-5xl font-bold leading-none text-[#1152d4]">
          {model.averageRating > 0 ? model.averageRating.toFixed(1) : 'N/A'}
          {model.averageRating > 0 ? <Star className="h-5 w-5 fill-amber-400 text-amber-400" /> : null}
        </p>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Average Rating</p>
      </div>
      <div className="rounded-2xl border border-[#1152d4]/15 bg-white/80 px-5 py-6 text-center shadow-sm backdrop-blur">
        <p className="text-5xl font-bold leading-none text-[#1152d4]">{model.yearsExperienceLabel}</p>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Years Exp.</p>
      </div>
    </section>
  );
}
