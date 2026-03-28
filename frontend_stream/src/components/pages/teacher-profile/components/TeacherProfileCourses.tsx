import { BookOpen, Plus, Star } from 'lucide-react';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import type { TeacherProfileDataModel } from '../useTeacherProfileData';
import { categoryColor } from '../teacherProfile.utils';

interface TeacherProfileCoursesProps {
  model: TeacherProfileDataModel;
  onNavigate: (path: string) => void;
}

export function TeacherProfileCourses({ model, onNavigate }: TeacherProfileCoursesProps) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-4xl font-bold tracking-tight text-slate-900">
          <BookOpen className="h-5 w-5 text-[#1152d4]" />
          Popular Courses
        </h3>
        <button
          className="cursor-pointer text-base font-semibold text-[#1152d4] hover:underline"
          onClick={() => onNavigate('/catalog')}
          type="button"
        >
          View All
        </button>
      </div>

      {model.coursesLoading || model.detailsLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-base text-slate-500">
          Loading courses...
        </div>
      ) : model.coursesError ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-base text-slate-500">
          Unable to load instructor courses.
        </div>
      ) : model.featuredCourses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-base text-slate-500">
          This instructor does not have published courses yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {model.featuredCourses.map(({ course, detail, enrollments, rating, reviewCount }, index) => (
            <article
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              key={course.id}
            >
              <div className={`relative h-56 overflow-hidden bg-gradient-to-br ${categoryColor(course.category)}`}>
                {detail?.coverImage ? (
                  <ImageWithFallback
                    alt={course.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    src={detail.coverImage}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="rounded-xl bg-white/85 px-3 py-2 text-sm font-semibold text-slate-700">
                      {course.category}
                    </div>
                  </div>
                )}
                {index === 0 ? (
                  <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#1152d4]">
                    Bestseller
                  </span>
                ) : null}
              </div>
              <div className="p-6">
                <h4 className="line-clamp-2 text-2xl font-bold leading-tight text-slate-900">{course.title}</h4>
                <p className="mt-2 flex items-center gap-1 text-base text-slate-500">
                  <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-slate-700">{rating > 0 ? rating.toFixed(1) : 'N/A'}</span>
                  <span>({reviewCount.toLocaleString()})</span>
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <p className="text-xl font-bold text-slate-900">{enrollments.toLocaleString()} enrolled</p>
                  <button
                    className="cursor-pointer rounded-2xl bg-[#1152d4]/10 p-3 text-[#1152d4] transition hover:bg-[#1152d4] hover:text-white"
                    onClick={() => onNavigate(`/courses/${course.id}`)}
                    type="button"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
