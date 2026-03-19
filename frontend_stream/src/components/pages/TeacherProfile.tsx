import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  BookOpen,
  GraduationCap,
  Link as LinkIcon,
  Mail,
  MapPin,
  MessageSquare,
  Plus,
  Search,
  Share2,
  Star,
  UserPlus,
  Verified,
} from 'lucide-react';
import { useAppSelector } from '../../hooks/redux';
import { buildApiUrl } from '../../lib/api-base-url';
import { useGetCoursesQuery } from '../../store/api/liveApi';
import { useGetProfileQuery, useGetTeacherSpecialtyQuery } from '../../store/api/userApi';
import type { BackendCourseDetailsDTO, LiveCourse, LiveCourseDetails } from '../../types/live';
import { mapCourseDetails } from '../../types/live';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface TeacherProfileProps {
  teacherId: string;
  onNavigate: (path: string) => void;
}

interface BackendReview {
  commentaire?: string | null;
  coursId: number;
  dateCreation?: string | null;
  etudiantNom?: string | null;
  etudiantPhoto?: string | null;
  note?: number | null;
}

function formatDate(value?: string | null): string {
  if (!value) {
    return 'N/A';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'N/A';
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed);
}

function initialsFromName(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return 'IN';
  }
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
}

function categoryColor(category: string): string {
  const key = category.toLowerCase();
  if (key.includes('design')) {
    return 'from-indigo-500/25 to-sky-500/10';
  }
  if (key.includes('marketing')) {
    return 'from-emerald-500/25 to-teal-500/10';
  }
  if (key.includes('business')) {
    return 'from-amber-500/25 to-orange-500/10';
  }
  return 'from-[#1152d4]/25 to-cyan-500/10';
}

function safeNumber(value: number | null | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export function TeacherProfile({ teacherId, onNavigate }: TeacherProfileProps) {
  const { token, isAuthenticated } = useAppSelector((state) => state.auth);
  const numericTeacherId = Number(teacherId);
  const teacherIdValid = Number.isFinite(numericTeacherId);

  const { data: profile } = useGetProfileQuery(undefined, { skip: !isAuthenticated });
  const ownProfileIsTeacher = profile?.id === teacherId;
  const { data: ownTeacherSpecialty } = useGetTeacherSpecialtyQuery(undefined, {
    skip: !ownProfileIsTeacher,
  });

  const { data: allCourses = [], isLoading: coursesLoading, error: coursesError } = useGetCoursesQuery();

  const teacherCourses = useMemo(() => {
    if (!teacherIdValid) {
      return [] as LiveCourse[];
    }
    return allCourses.filter((course) => Number(course.teacherId) === numericTeacherId);
  }, [allCourses, numericTeacherId, teacherIdValid]);

  const [detailsByCourseId, setDetailsByCourseId] = useState<Record<string, LiveCourseDetails>>({});
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [allReviews, setAllReviews] = useState<Array<BackendReview & { courseIdString: string }>>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (!teacherIdValid || teacherCourses.length === 0) {
      setDetailsByCourseId({});
      return;
    }

    const controller = new AbortController();

    const loadDetails = async () => {
      setDetailsLoading(true);
      try {
        const entries = await Promise.all(
          teacherCourses.map(async (course) => {
            try {
              const response = await fetch(buildApiUrl(`/api/cours/${course.id}/details`), {
                headers: {
                  Accept: 'application/json',
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                signal: controller.signal,
              });

              if (!response.ok) {
                return null;
              }

              const payload = (await response.json()) as BackendCourseDetailsDTO;
              return [course.id, mapCourseDetails(payload)] as const;
            } catch {
              return null;
            }
          }),
        );

        const validEntries = entries.filter(
          (entry): entry is readonly [string, LiveCourseDetails] => Boolean(entry),
        );

        setDetailsByCourseId(Object.fromEntries(validEntries));
      } finally {
        if (!controller.signal.aborted) {
          setDetailsLoading(false);
        }
      }
    };

    void loadDetails();

    return () => {
      controller.abort();
    };
  }, [teacherCourses, teacherIdValid, token]);

  useEffect(() => {
    if (!teacherIdValid || teacherCourses.length === 0) {
      setAllReviews([]);
      return;
    }

    const controller = new AbortController();

    const loadReviews = async () => {
      setReviewsLoading(true);
      try {
        const reviewEntries = await Promise.all(
          teacherCourses.map(async (course) => {
            try {
              const response = await fetch(buildApiUrl(`/api/avis/cours/${course.id}`), {
                headers: {
                  Accept: 'application/json',
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                signal: controller.signal,
              });

              if (!response.ok) {
                return [] as Array<BackendReview & { courseIdString: string }>;
              }

              const payload = (await response.json()) as BackendReview[];
              if (!Array.isArray(payload)) {
                return [] as Array<BackendReview & { courseIdString: string }>;
              }

              return payload.map((item) => ({ ...item, courseIdString: String(course.id) }));
            } catch {
              return [] as Array<BackendReview & { courseIdString: string }>;
            }
          }),
        );

        const flattened = reviewEntries.flat();
        flattened.sort((left, right) => {
          const leftDate = left.dateCreation ? new Date(left.dateCreation).getTime() : 0;
          const rightDate = right.dateCreation ? new Date(right.dateCreation).getTime() : 0;
          return rightDate - leftDate;
        });

        setAllReviews(flattened);
      } finally {
        if (!controller.signal.aborted) {
          setReviewsLoading(false);
        }
      }
    };

    void loadReviews();

    return () => {
      controller.abort();
    };
  }, [teacherCourses, teacherIdValid, token]);

  const preferredDetails = useMemo(() => {
    return teacherCourses.map((course) => detailsByCourseId[course.id]).find(Boolean) || null;
  }, [detailsByCourseId, teacherCourses]);

  const teacherName = useMemo(() => {
    if (ownProfileIsTeacher && profile) {
      return `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || `Instructor #${teacherId}`;
    }
    return preferredDetails?.teacherName || `Instructor #${teacherId}`;
  }, [ownProfileIsTeacher, preferredDetails?.teacherName, profile, teacherId]);

  const teacherRole = useMemo(() => {
    if (ownProfileIsTeacher) {
      return profile?.specialite || ownTeacherSpecialty || 'Instructor';
    }
    return preferredDetails?.teacherSpeciality || 'Instructor';
  }, [ownProfileIsTeacher, ownTeacherSpecialty, preferredDetails?.teacherSpeciality, profile?.specialite]);

  const totalStudents = useMemo(() => {
    if (Object.keys(detailsByCourseId).length === 0) {
      return 0;
    }
    return Object.values(detailsByCourseId).reduce((sum, detail) => sum + safeNumber(detail.enrolledCount), 0);
  }, [detailsByCourseId]);

  const averageRating = useMemo(() => {
    if (allReviews.length > 0) {
      const total = allReviews.reduce((sum, review) => sum + safeNumber(review.note), 0);
      return Number((total / allReviews.length).toFixed(1));
    }

    const ratings = Object.values(detailsByCourseId)
      .map((detail) => detail.averageRating)
      .filter((rating): rating is number => typeof rating === 'number');

    if (ratings.length === 0) {
      return 0;
    }

    const total = ratings.reduce((sum, rating) => sum + rating, 0);
    return Number((total / ratings.length).toFixed(1));
  }, [allReviews, detailsByCourseId]);

  const expertise = useMemo(() => {
    return Array.from(new Set(teacherCourses.map((course) => course.category).filter(Boolean))).slice(0, 8);
  }, [teacherCourses]);

  const topCourses = useMemo(() => {
    return teacherCourses
      .map((course) => {
        const detail = detailsByCourseId[course.id];
        return {
          course,
          detail,
          enrollments: safeNumber(detail?.enrolledCount),
          rating: safeNumber(detail?.averageRating),
          reviewCount: safeNumber(detail?.reviewCount),
        };
      })
      .sort((left, right) => right.enrollments - left.enrollments)
      .slice(0, 4);
  }, [detailsByCourseId, teacherCourses]);

  const reviewsPreview = useMemo(() => allReviews.slice(0, 2), [allReviews]);

  const aboutCopy = useMemo(() => {
    if (teacherCourses.length === 0) {
      return 'No published course yet for this instructor profile.';
    }

    const specialization = teacherRole && teacherRole !== 'Instructor' ? teacherRole : 'domain expertise';
    return `${teacherName} currently teaches ${teacherCourses.length} course(s) focused on ${specialization}. All metrics on this page come from the live course catalog and student feedback.`;
  }, [teacherCourses.length, teacherName, teacherRole]);

  if (!teacherIdValid) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="text-slate-600">Invalid instructor identifier.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f6f8] font-[Lexend,sans-serif] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md lg:px-20">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <div className="flex items-center gap-8">
            <button className="flex items-center gap-2 text-[#1152d4]" onClick={() => onNavigate('/')} type="button">
              <GraduationCap className="h-7 w-7" />
              <h2 className="text-xl font-bold tracking-tight text-slate-900">EduPremium</h2>
            </button>
            <nav className="hidden items-center gap-8 md:flex">
              <button className="text-sm font-medium text-slate-600 hover:text-[#1152d4]" onClick={() => onNavigate('/catalog')} type="button">Browse</button>
              <button className="text-sm font-medium text-slate-600 hover:text-[#1152d4]" onClick={() => onNavigate('/dashboard')} type="button">My Learning</button>
              <button className="text-sm font-medium text-slate-600 hover:text-[#1152d4]" onClick={() => onNavigate('/teacher/dashboard')} type="button">Teach</button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <label className="hidden w-64 items-center rounded-xl bg-slate-100 px-3 py-2 sm:flex">
              <Search className="h-4 w-4 text-slate-400" />
              <input className="w-full border-0 bg-transparent px-2 text-sm text-slate-700 outline-none" placeholder="Search courses..." type="text" />
            </label>
            <button className="rounded-xl p-2 text-slate-600 hover:bg-slate-100" type="button">
              <Bell className="h-5 w-5" />
            </button>
            <button className="h-10 w-10 overflow-hidden rounded-full border border-[#1152d4]/20 bg-[#1152d4]/10" onClick={() => onNavigate('/profile')} type="button">
              {profile?.avatar ? <ImageWithFallback alt="User avatar" className="h-full w-full object-cover" src={profile.avatar} /> : <span className="text-xs font-bold text-[#1152d4]">{initialsFromName(teacherName)}</span>}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex-1 w-full max-w-7xl px-6 py-10 lg:px-20">
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-white shadow-xl shadow-[#1152d4]/5">
          <div className="h-48 w-full bg-gradient-to-r from-[#1152d4]/80 to-sky-400/80 opacity-25" />
          <div className="-mt-16 flex flex-col gap-6 px-8 pb-8 md:flex-row md:items-end">
            <div className="relative">
              <div className="h-40 w-40 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg">
                {ownProfileIsTeacher && profile?.avatar ? (
                  <ImageWithFallback alt={teacherName} className="h-full w-full object-cover" src={profile.avatar} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#1152d4]/10 text-4xl font-bold text-[#1152d4]">
                    {initialsFromName(teacherName)}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full border-4 border-white bg-emerald-500" />
            </div>

            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-slate-900">{teacherName}</h1>
                <Verified className="h-5 w-5 text-[#1152d4]" />
              </div>
              <p className="text-lg text-slate-600">{teacherRole}</p>
              <div className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                <MapPin className="h-4 w-4" />
                <span>{totalStudents > 0 ? `${totalStudents.toLocaleString()} learners reached` : 'Learner metrics will appear once courses are enrolled.'}</span>
              </div>
            </div>

            <div className="flex w-full gap-3 pb-2 md:w-auto">
              <button
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-100 px-6 py-3 font-semibold text-slate-900 transition-all hover:bg-slate-200 md:flex-none"
                onClick={() => setIsFollowing((value) => !value)}
                type="button"
              >
                <UserPlus className="h-4 w-4" />
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1152d4] px-6 py-3 font-semibold text-white shadow-lg shadow-[#1152d4]/20 transition-all hover:bg-[#0f47b9] md:flex-none" type="button">
                <Mail className="h-4 w-4" />
                Message
              </button>
            </div>
          </div>
        </div>

        <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-[#1152d4]/10 bg-white/80 p-6 text-center backdrop-blur-sm">
            <span className="mb-1 block text-3xl font-bold text-[#1152d4]">{totalStudents.toLocaleString()}</span>
            <span className="text-sm font-medium uppercase tracking-wider text-slate-500">Total Students</span>
          </div>
          <div className="rounded-2xl border border-[#1152d4]/10 bg-white/80 p-6 text-center backdrop-blur-sm">
            <span className="mb-1 block text-3xl font-bold text-[#1152d4]">{teacherCourses.length}</span>
            <span className="text-sm font-medium uppercase tracking-wider text-slate-500">Total Courses</span>
          </div>
          <div className="rounded-2xl border border-[#1152d4]/10 bg-white/80 p-6 text-center backdrop-blur-sm">
            <span className="mb-1 block text-3xl font-bold text-[#1152d4]">{averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}</span>
            <span className="text-sm font-medium uppercase tracking-wider text-slate-500">Average Rating</span>
          </div>
          <div className="rounded-2xl border border-[#1152d4]/10 bg-white/80 p-6 text-center backdrop-blur-sm">
            <span className="mb-1 block text-3xl font-bold text-[#1152d4]">{allReviews.length}</span>
            <span className="text-sm font-medium uppercase tracking-wider text-slate-500">Total Reviews</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-1">
            <section>
              <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900">
                <UserPlus className="h-5 w-5 text-[#1152d4]" />
                About
              </h3>
              <p className="leading-relaxed text-slate-600">{aboutCopy}</p>
            </section>

            <section>
              <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900">
                <Star className="h-5 w-5 text-[#1152d4]" />
                Expertise
              </h3>
              <div className="flex flex-wrap gap-2">
                {expertise.length > 0 ? (
                  expertise.map((item) => (
                    <span className="cursor-default rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-[#1152d4] hover:text-[#1152d4]" key={item}>
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">No declared expertise yet.</span>
                )}
              </div>
            </section>

            <section>
              <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900">
                <Share2 className="h-5 w-5 text-[#1152d4]" />
                Social Presence
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-600">
                  <LinkIcon className="h-4 w-4" />
                  <span className="text-sm">Profile link: /profile/teacher/{teacherId}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm">Public contact data is not exposed by the API.</span>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-12 lg:col-span-2">
            <section>
              <div className="mb-6 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                  <BookOpen className="h-5 w-5 text-[#1152d4]" />
                  Popular Courses
                </h3>
                <button className="text-sm font-semibold text-[#1152d4] hover:underline" onClick={() => onNavigate('/catalog')} type="button">
                  View All
                </button>
              </div>

              {coursesLoading || detailsLoading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading courses...</div>
              ) : coursesError ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Unable to load instructor courses.</div>
              ) : topCourses.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                  This instructor does not have published courses yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {topCourses.map(({ course, detail, enrollments, rating, reviewCount }) => (
                    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" key={course.id}>
                      <div className={`relative h-44 overflow-hidden bg-gradient-to-br ${categoryColor(course.category)}`}>
                        {detail?.coverImage ? (
                          <ImageWithFallback alt={course.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" src={detail.coverImage} />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <div className="rounded-xl border border-white/50 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700">
                              {course.category}
                            </div>
                          </div>
                        )}
                        {enrollments > 0 && (
                          <span className="absolute right-3 top-3 rounded-lg bg-white/90 px-2 py-1 text-xs font-bold text-[#1152d4]">
                            {enrollments.toLocaleString()} enrolled
                          </span>
                        )}
                      </div>

                      <div className="p-5">
                        <h4 className="font-bold text-slate-900 transition-colors group-hover:text-[#1152d4]">{course.title}</h4>
                        <div className="mb-4 mt-2 flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 text-amber-400" />
                          <span className="font-bold text-slate-900">{rating > 0 ? rating.toFixed(1) : 'N/A'}</span>
                          <span className="text-slate-400">({reviewCount} reviews)</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                          <span className="text-sm font-semibold text-slate-500">Category: {course.category}</span>
                          <button
                            className="rounded-lg bg-[#1152d4]/10 p-2 text-[#1152d4] transition-colors hover:bg-[#1152d4] hover:text-white"
                            onClick={() => onNavigate(`/courses/${course.id}`)}
                            type="button"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-900">
                <MessageSquare className="h-5 w-5 text-[#1152d4]" />
                What Students Are Saying
              </h3>

              {reviewsLoading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading reviews...</div>
              ) : reviewsPreview.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                  No student review available for this instructor yet.
                </div>
              ) : (
                <div className="space-y-6">
                  {reviewsPreview.map((review, index) => {
                    const relatedCourse = teacherCourses.find((course) => course.id === review.courseIdString);
                    return (
                      <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm" key={`${review.courseIdString}-${review.dateCreation || index}`}>
                        <div className="mb-4 flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-200">
                              {review.etudiantPhoto ? (
                                <ImageWithFallback alt={review.etudiantNom || 'Student'} className="h-full w-full object-cover" src={review.etudiantPhoto} />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-[#1152d4]">
                                  {(review.etudiantNom || 'S').charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{review.etudiantNom || 'Learner'}</p>
                              <p className="text-xs text-slate-400">{formatDate(review.dateCreation)}</p>
                            </div>
                          </div>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, starIndex) => (
                              <Star
                                className={`h-4 w-4 ${starIndex < Math.round(safeNumber(review.note)) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                                key={starIndex}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="italic text-slate-600">
                          "{review.commentaire || 'Great learning experience.'}"
                        </p>
                        <p className="mt-3 text-xs text-slate-400">
                          Course: {relatedCourse?.title || `Course #${review.courseIdString}`}
                        </p>
                      </article>
                    );
                  })}
                </div>
              )}

              <button className="mt-6 w-full rounded-2xl border-2 border-dashed border-slate-200 py-4 font-semibold text-slate-400 transition-all hover:border-[#1152d4] hover:text-[#1152d4]" type="button">
                Load More Reviews
              </button>
            </section>
          </div>
        </div>
      </main>

      <footer className="mt-12 border-t border-slate-200 bg-white px-6 py-12 lg:px-20">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex items-center gap-2 text-[#1152d4] opacity-60">
            <GraduationCap className="h-6 w-6" />
            <span className="font-bold text-slate-900">EduPremium</span>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-slate-500">
            <button className="hover:text-[#1152d4]" onClick={() => onNavigate('/blog')} type="button">About Us</button>
            <button className="hover:text-[#1152d4]" onClick={() => onNavigate('/careers')} type="button">Careers</button>
            <button className="hover:text-[#1152d4]" onClick={() => onNavigate('/privacy')} type="button">Privacy Policy</button>
            <button className="hover:text-[#1152d4]" onClick={() => onNavigate('/terms')} type="button">Terms of Service</button>
          </div>
          <div className="flex gap-4">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all hover:bg-[#1152d4] hover:text-white" type="button">
              <Share2 className="h-4 w-4" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all hover:bg-[#1152d4] hover:text-white" type="button">
              <Mail className="h-4 w-4" />
            </button>
          </div>
        </div>
        <p className="mt-12 text-center text-xs text-slate-400">Copyright {new Date().getFullYear()} EduPremium E-Learning Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
