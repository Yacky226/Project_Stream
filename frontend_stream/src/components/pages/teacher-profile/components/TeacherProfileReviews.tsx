import { MessageSquare, Star } from 'lucide-react';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import type { TeacherProfileDataModel } from '../useTeacherProfileData';
import { formatDate, safeNumber } from '../teacherProfile.utils';

interface TeacherProfileReviewsProps {
  model: TeacherProfileDataModel;
  onNavigate: (path: string) => void;
}

export function TeacherProfileReviews({ model, onNavigate }: TeacherProfileReviewsProps) {
  return (
    <section>
      <h3 className="mb-4 flex items-center gap-2 text-4xl font-bold tracking-tight text-slate-900">
        <MessageSquare className="h-5 w-5 text-[#1152d4]" />
        What Students Are Saying
      </h3>

      {model.reviewsLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-base text-slate-500">
          Loading reviews...
        </div>
      ) : model.reviewsPreview.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-base text-slate-500">
          No student review available for this instructor yet.
        </div>
      ) : (
        <div className="space-y-4">
          {model.reviewsPreview.map((review, index) => {
            const relatedCourse = model.teacherCourses.find(
              (course) => course.id === review.courseIdString,
            );

            return (
              <article
                className="rounded-3xl border border-slate-200 bg-white p-6"
                key={`${review.courseIdString}-${review.dateCreation || index}`}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 overflow-hidden rounded-full bg-slate-200">
                      {review.etudiantPhoto ? (
                        <ImageWithFallback
                          alt={review.etudiantNom || 'Student'}
                          className="h-full w-full object-cover"
                          src={review.etudiantPhoto}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg font-bold text-[#1152d4]">
                          {(review.etudiantNom || 'S').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {review.etudiantNom || 'Learner'}
                      </p>
                      <p className="text-sm text-slate-400">{formatDate(review.dateCreation)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star
                        className={`h-5 w-5 ${starIndex < Math.round(safeNumber(review.note)) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                        key={starIndex}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-lg italic leading-relaxed text-slate-600">
                  "{review.commentaire || 'Great learning experience.'}"
                </p>
                <p className="mt-3 text-base text-slate-400">
                  Course: {relatedCourse?.title || `Course #${review.courseIdString}`}
                </p>
              </article>
            );
          })}
        </div>
      )}

      {model.allReviews.length > model.reviewsPreview.length ? (
        <button
          className="mt-6 w-full cursor-pointer rounded-3xl border-2 border-dashed border-slate-300 py-4 text-lg font-semibold text-slate-400 transition hover:border-[#1152d4] hover:text-[#1152d4]"
          onClick={() => onNavigate('/catalog')}
          type="button"
        >
          Load More Reviews
        </button>
      ) : null}
    </section>
  );
}
