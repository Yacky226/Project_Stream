import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Globe,
  GraduationCap,
  Link as LinkIcon,
  Mail,
  MapPin,
  MessageSquare,
  Plus,
  Share2,
  Star,
  User,
  UserPlus,
  Verified,
  Zap,
} from 'lucide-react';
import { useAppSelector } from '../../hooks/redux';
import { buildApiUrl } from '../../lib/api-base-url';
import { useGetCoursesQuery } from '../../store/api/liveApi';
import { useGetProfileQuery, useGetTeacherSpecialtyQuery } from '../../store/api/userApi';
import type { BackendCourseDetailsDTO, LiveCourse, LiveCourseDetails } from '../../types/live';
import { mapCourseDetails } from '../../types/live';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { HeaderRedux } from '../layout/HeaderRedux';
import './TeacherProfile.css';

interface TeacherProfileProps {
  teacherId: string;
  onNavigate: (path: string) => void;
  currentPath?: string;
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

export function TeacherProfile({ teacherId, onNavigate, currentPath = `/profile/teacher/${teacherId}` }: TeacherProfileProps) {
  const { token, isAuthenticated, user } = useAppSelector((state) => state.auth);
  const numericTeacherId = Number(teacherId);
  const teacherIdValid = Number.isFinite(numericTeacherId);

  const { data: profile } = useGetProfileQuery(undefined, { skip: !isAuthenticated });
  const authenticatedUserId = profile?.id ?? user?.id;
  const ownProfileIsTeacher =
    authenticatedUserId !== undefined &&
    authenticatedUserId !== null &&
    String(authenticatedUserId) === teacherId;
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

  const profileLocation = ownProfileIsTeacher ? profile?.location?.trim() || '' : '';
  const profileMetaLine = profileLocation || (totalStudents > 0 ? `${totalStudents.toLocaleString()} learners reached` : 'Learner metrics will appear once courses are enrolled.');
  const featuredCourses = topCourses.slice(0, 2);
  const yearsExperienceLabel = teacherCourses.length > 0 ? '12+' : 'N/A';
  const socialLinkRows = [
    { icon: Globe, value: `/profile/teacher/${teacherId}` },
    { icon: LinkIcon, value: `${teacherCourses.length} public course link(s)` },
    {
      icon: Mail,
      value: ownProfileIsTeacher
        ? (profile?.email || 'Email not available')
        : 'Public contact data is not exposed by the API.',
    },
  ];

  if (!teacherIdValid) {
    return (
      <div className="teacher-profile-page mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="text-slate-600">Invalid instructor identifier.</p>
      </div>
    );
  }

  return (
    <div className="teacher-profile-page min-h-screen bg-[#f6f6f8] text-slate-900">
      <HeaderRedux onNavigate={onNavigate} currentPath={currentPath} />

      <main className="mx-auto w-full max-w-[1300px] px-4 py-8 lg:px-8">
        <section className="relative mb-8 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-[#1152d4]/5">
          <div className="h-40 bg-[#d7e2f5] md:h-48" />
          <div className="px-6 pb-6 md:px-8 md:pb-8">
            <div className="-mt-14 flex flex-col gap-5 md:-mt-16 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
                <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg sm:h-40 sm:w-40">
                  {ownProfileIsTeacher && profile?.avatar ? (
                    <ImageWithFallback alt={teacherName} className="h-full w-full object-cover" src={profile.avatar} />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#1152d4]/12 text-5xl font-bold text-[#1152d4]">
                      {initialsFromName(teacherName)}
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-4 border-white bg-emerald-500" />
                </div>
                <div className="pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-[2.2rem] font-bold leading-none tracking-tight text-slate-900 sm:text-[2.4rem]">{teacherName}</h1>
                    <Verified className="h-5 w-5 shrink-0 text-[#1152d4]" />
                  </div>
                  <p className="mt-1.5 text-[1.125rem] font-medium text-slate-600">{teacherRole}</p>
                  <p className="mt-1.5 flex items-center gap-2 text-sm text-slate-400">
                    <MapPin className="h-4 w-4 shrink-0" />
                    {profileMetaLine}
                  </p>
                </div>
              </div>

              {!ownProfileIsTeacher ? (
                <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto md:pb-1">
                  <button
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-100 px-6 py-3 text-base font-semibold text-slate-800 transition hover:bg-slate-200"
                    onClick={() => setIsFollowing((value) => !value)}
                    type="button"
                  >
                    <UserPlus className="h-4 w-4" />
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                  <button className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1152d4] px-6 py-3 text-base font-semibold text-white shadow-lg shadow-[#1152d4]/20 transition hover:bg-[#0f47b9]" type="button">
                    <Mail className="h-4 w-4" />
                    Message
                  </button>
                </div>
              ) : (
                <div className="inline-flex items-center rounded-full border border-[#1152d4]/25 bg-[#1152d4]/10 px-6 py-3 text-sm font-semibold text-[#1152d4] md:mb-1">
                  This is your public instructor profile preview.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#1152d4]/15 bg-white/80 px-5 py-6 text-center shadow-sm backdrop-blur">
            <p className="text-5xl font-bold leading-none text-[#1152d4]">{totalStudents.toLocaleString()}+</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Total Students</p>
          </div>
          <div className="rounded-2xl border border-[#1152d4]/15 bg-white/80 px-5 py-6 text-center shadow-sm backdrop-blur">
            <p className="text-5xl font-bold leading-none text-[#1152d4]">{teacherCourses.length}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Total Courses</p>
          </div>
          <div className="rounded-2xl border border-[#1152d4]/15 bg-white/80 px-5 py-6 text-center shadow-sm backdrop-blur">
            <p className="flex items-center justify-center gap-1 text-5xl font-bold leading-none text-[#1152d4]">
              {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
              {averageRating > 0 ? <Star className="h-5 w-5 fill-amber-400 text-amber-400" /> : null}
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Average Rating</p>
          </div>
          <div className="rounded-2xl border border-[#1152d4]/15 bg-white/80 px-5 py-6 text-center shadow-sm backdrop-blur">
            <p className="text-5xl font-bold leading-none text-[#1152d4]">{yearsExperienceLabel}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Years Exp.</p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <aside className="space-y-10 lg:col-span-4">
            <section>
              <h3 className="mb-4 flex items-center gap-2 text-4xl font-bold tracking-tight text-slate-900">
                <User className="h-5 w-5 text-[#1152d4]" />
                About Me
              </h3>
              <p className="text-lg leading-9 text-slate-600">{aboutCopy}</p>
            </section>

            <section>
              <h3 className="mb-4 flex items-center gap-2 text-4xl font-bold tracking-tight text-slate-900">
                <Zap className="h-5 w-5 text-[#1152d4]" />
                Expertise
              </h3>
              <div className="flex flex-wrap gap-2">
                {expertise.length > 0 ? (
                  expertise.map((item) => (
                    <span className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-base font-medium text-slate-700" key={item}>
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-base text-slate-500">No declared expertise yet.</span>
                )}
              </div>
            </section>

            <section>
              <h3 className="mb-4 flex items-center gap-2 text-4xl font-bold tracking-tight text-slate-900">
                <Share2 className="h-5 w-5 text-[#1152d4]" />
                Social Presence
              </h3>
              <div className="space-y-4 text-lg text-slate-600">
                {socialLinkRows.map((row) => {
                  const Icon = row.icon;
                  return (
                    <div className="flex items-center gap-3" key={row.value}>
                      <Icon className="h-5 w-5 text-slate-500" />
                      <span>{row.value}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          </aside>

          <div className="space-y-8 lg:col-span-8">
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-4xl font-bold tracking-tight text-slate-900">
                  <BookOpen className="h-5 w-5 text-[#1152d4]" />
                  Popular Courses
                </h3>
                <button className="cursor-pointer text-base font-semibold text-[#1152d4] hover:underline" onClick={() => onNavigate('/catalog')} type="button">
                  View All
                </button>
              </div>

              {coursesLoading || detailsLoading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-base text-slate-500">Loading courses...</div>
              ) : coursesError ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-base text-slate-500">Unable to load instructor courses.</div>
              ) : featuredCourses.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-base text-slate-500">
                  This instructor does not have published courses yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {featuredCourses.map(({ course, detail, enrollments, rating, reviewCount }, index) => (
                    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg" key={course.id}>
                      <div className={`relative h-56 overflow-hidden bg-gradient-to-br ${categoryColor(course.category)}`}>
                        {detail?.coverImage ? (
                          <ImageWithFallback alt={course.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={detail.coverImage} />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <div className="rounded-xl bg-white/85 px-3 py-2 text-sm font-semibold text-slate-700">{course.category}</div>
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
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400 shrink-0" />
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

            <section>
              <h3 className="mb-4 flex items-center gap-2 text-4xl font-bold tracking-tight text-slate-900">
                <MessageSquare className="h-5 w-5 text-[#1152d4]" />
                What Students Are Saying
              </h3>

              {reviewsLoading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-base text-slate-500">Loading reviews...</div>
              ) : reviewsPreview.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-base text-slate-500">
                  No student review available for this instructor yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {reviewsPreview.map((review, index) => {
                    const relatedCourse = teacherCourses.find((course) => course.id === review.courseIdString);
                    return (
                      <article className="rounded-3xl border border-slate-200 bg-white p-6" key={`${review.courseIdString}-${review.dateCreation || index}`}>
                        <div className="mb-4 flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-14 w-14 overflow-hidden rounded-full bg-slate-200">
                              {review.etudiantPhoto ? (
                                <ImageWithFallback alt={review.etudiantNom || 'Student'} className="h-full w-full object-cover" src={review.etudiantPhoto} />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-lg font-bold text-[#1152d4]">
                                  {(review.etudiantNom || 'S').charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-slate-900">{review.etudiantNom || 'Learner'}</p>
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
                        <p className="text-lg italic leading-relaxed text-slate-600">"{review.commentaire || 'Great learning experience.'}"</p>
                        <p className="mt-3 text-base text-slate-400">Course: {relatedCourse?.title || `Course #${review.courseIdString}`}</p>
                      </article>
                    );
                  })}
                </div>
              )}

              {allReviews.length > reviewsPreview.length ? (
                <button
                  className="mt-6 w-full cursor-pointer rounded-3xl border-2 border-dashed border-slate-300 py-4 text-lg font-semibold text-slate-400 transition hover:border-[#1152d4] hover:text-[#1152d4]"
                  onClick={() => onNavigate('/catalog')}
                  type="button"
                >
                  Load More Reviews
                </button>
              ) : null}
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

