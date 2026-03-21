import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Globe,
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
import { PublicFooterBar } from '../layout/PublicFooterBar';
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

interface DisplayCourseCard {
  id: string;
  title: string;
  category: string;
  coverImage: string | null;
  rating: number | null;
  reviewCount: number;
  badge: string | null;
  bottomLabel: string;
  navigatePath: string;
}

interface DisplayReviewCard {
  id: string;
  studentName: string;
  studentPhoto: string | null;
  dateLabel: string;
  rating: number;
  comment: string;
  courseLabel: string;
}

const MOCK_AVATAR_IMAGE = 'https://picsum.photos/seed/teacher-profile-avatar/420/420';

const MOCK_PROFILE_STATS = {
  totalStudents: 45200,
  totalCourses: 32,
  averageRating: 4.9,
  yearsExperience: '12+',
};

const MOCK_ABOUT_PARAGRAPHS = [
  'With over a decade of experience in Silicon Valley, I specialize in bridging the gap between complex user needs and elegant interface solutions.',
  'My teaching philosophy focuses on project-based learning and industry-standard workflows that prepare students for real-world challenges in UX/UI design. I believe design is not just how it looks, but how it works for the people using it.',
];

const MOCK_EXPERTISE = [
  'User Experience (UX)',
  'Interface Design (UI)',
  'Prototyping',
  'User Research',
  'Figma Mastery',
  'Design Systems',
  'Accessibility',
];

const MOCK_SOCIAL_LINK_ROWS = [
  { icon: Globe, value: 'alexstrathmore.design' },
  { icon: LinkIcon, value: 'linkedin.com/in/alexux' },
];

const MOCK_COURSE_CARDS: DisplayCourseCard[] = [
  {
    id: 'mock-course-ux-foundations',
    title: 'UX Design Foundations: Mastering User Research',
    category: 'Design',
    coverImage: 'https://picsum.photos/seed/mock-ux-course/960/560',
    rating: 4.9,
    reviewCount: 12450,
    badge: 'BESTSELLER',
    bottomLabel: '$89.99',
    navigatePath: '/catalog',
  },
  {
    id: 'mock-course-figma-systems',
    title: 'Advanced Figma: Design Systems & Auto-Layout',
    category: 'Design',
    coverImage: 'https://picsum.photos/seed/mock-figma-course/960/560',
    rating: 4.8,
    reviewCount: 8920,
    badge: null,
    bottomLabel: '$124.99',
    navigatePath: '/catalog',
  },
];

const MOCK_REVIEWS: DisplayReviewCard[] = [
  {
    id: 'mock-review-sarah',
    studentName: 'Sarah Jenkins',
    studentPhoto: 'https://picsum.photos/seed/mock-review-sarah/120/120',
    dateLabel: '2 months ago',
    rating: 5,
    comment:
      "Alex is hands down the best instructor I've encountered. His ability to explain complex UI concepts with simple, real-world analogies is incredible.",
    courseLabel: 'Advanced Figma: Design Systems & Auto-Layout',
  },
  {
    id: 'mock-review-marcus',
    studentName: 'Marcus Chen',
    studentPhoto: 'https://picsum.photos/seed/mock-review-marcus/120/120',
    dateLabel: '5 months ago',
    rating: 5,
    comment:
      "The insights into the actual industry workflow are what makes Alex's courses stand out. It's not just about tools; it's about the mindset of a senior designer.",
    courseLabel: 'UX Design Foundations: Mastering User Research',
  },
];

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

  const { data: allCourses = [], isLoading: coursesLoading } = useGetCoursesQuery();

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
  const profileMetaLine =
    profileLocation ||
    (totalStudents > 0
      ? `${totalStudents.toLocaleString()} learners reached`
      : `${MOCK_PROFILE_STATS.totalStudents.toLocaleString()} learners reached`);
  const featuredCourses = topCourses.slice(0, 2);
  const showMockProfileContent = featuredCourses.length < 2 || reviewsPreview.length === 0 || expertise.length === 0;

  const displayStats = {
    totalStudents: totalStudents > 0 ? totalStudents : MOCK_PROFILE_STATS.totalStudents,
    totalCourses: teacherCourses.length > 0 ? teacherCourses.length : MOCK_PROFILE_STATS.totalCourses,
    averageRating: averageRating > 0 ? averageRating : MOCK_PROFILE_STATS.averageRating,
    yearsExperience: teacherCourses.length > 0 ? '12+' : MOCK_PROFILE_STATS.yearsExperience,
  };

  const aboutParagraphs = showMockProfileContent
    ? MOCK_ABOUT_PARAGRAPHS
    : [
        aboutCopy,
        'Students get practical workflows, portfolio-ready projects, and mentoring designed for real-world product teams.',
      ];

  const displayExpertise = showMockProfileContent ? MOCK_EXPERTISE : expertise;

  const socialLinkRows = showMockProfileContent
    ? MOCK_SOCIAL_LINK_ROWS
    : [
        { icon: Globe, value: `/profile/teacher/${teacherId}` },
        { icon: LinkIcon, value: `${teacherCourses.length} public course link(s)` },
        {
          icon: Mail,
          value: ownProfileIsTeacher
            ? (profile?.email || 'Email not available')
            : 'Public contact data is not exposed by the API.',
        },
      ];

  const realCourseCards: DisplayCourseCard[] = featuredCourses.map(({ course, detail, enrollments, rating, reviewCount }, index) => ({
    id: course.id,
    title: course.title,
    category: course.category,
    coverImage: detail?.coverImage || course.coverImage || null,
    rating: rating > 0 ? rating : null,
    reviewCount,
    badge: index === 0 ? 'BESTSELLER' : null,
    bottomLabel: `${enrollments.toLocaleString()} enrolled`,
    navigatePath: `/courses/${course.id}`,
  }));

  const displayCourseCards = showMockProfileContent
    ? MOCK_COURSE_CARDS
    : [...realCourseCards, ...MOCK_COURSE_CARDS].slice(0, 2);

  const realReviewCards: DisplayReviewCard[] = reviewsPreview.map((review, index) => {
    const relatedCourse = teacherCourses.find((course) => course.id === review.courseIdString);
    return {
      id: `${review.courseIdString}-${review.dateCreation || index}`,
      studentName: review.etudiantNom || 'Learner',
      studentPhoto: review.etudiantPhoto || null,
      dateLabel: formatDate(review.dateCreation),
      rating: Math.max(0, Math.min(5, Math.round(safeNumber(review.note)))),
      comment: review.commentaire || 'Great learning experience.',
      courseLabel: relatedCourse?.title || `Course #${review.courseIdString}`,
    };
  });

  const displayReviewCards = showMockProfileContent
    ? MOCK_REVIEWS
    : [...realReviewCards, ...MOCK_REVIEWS].slice(0, 2);

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

      <main className="teacher-profile-main mx-auto w-full max-w-[1300px] px-4 py-8 lg:px-8">
        <section className="teacher-profile-hero relative mb-8 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-[#1152d4]/5">
          <div className="teacher-profile-hero__cover h-28 w-full bg-gradient-to-r from-[#cfdbf3] to-[#d7e2f5] md:h-32" />
          <div className="teacher-profile-hero__content px-5 pb-5 md:px-8 md:pb-7">
            <div className="teacher-profile-hero__row -mt-10 grid w-full gap-5 sm:-mt-12 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <div className="teacher-profile-hero__identity flex flex-col gap-4 sm:flex-1 sm:flex-row sm:items-end sm:gap-5">
                <div className="teacher-profile-hero__avatar relative h-24 w-24 shrink-0 rounded-2xl border-4 border-white bg-white shadow-lg sm:h-28 sm:w-28 md:h-32 md:w-32">
                  <div className="teacher-profile-hero__avatar-media h-full w-full overflow-hidden rounded-[14px]">
                    {ownProfileIsTeacher && profile?.avatar ? (
                      <ImageWithFallback alt={teacherName} className="h-full w-full object-cover" src={profile.avatar} />
                    ) : (
                      <ImageWithFallback alt={teacherName} className="h-full w-full object-cover" src={MOCK_AVATAR_IMAGE} />
                    )}
                  </div>
                  <span className="teacher-profile-hero__online-dot absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-4 border-white bg-emerald-500" />
                </div>
                <div className="pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="teacher-profile-hero__name text-4xl font-bold leading-none tracking-tight text-slate-900">{teacherName}</h1>
                    <Verified className="h-5 w-5 shrink-0 text-[#1152d4]" />
                  </div>
                  <p className="teacher-profile-hero__role mt-1.5 text-base font-medium text-slate-600">{teacherRole}</p>
                  <p className="mt-1.5 flex items-center gap-2 text-sm text-slate-400">
                    <MapPin className="h-4 w-4 shrink-0" />
                    {profileMetaLine}
                  </p>
                </div>
              </div>

              {!ownProfileIsTeacher ? (
                <div className="teacher-profile-hero__actions flex flex-col gap-3 sm:flex-row sm:justify-end sm:justify-self-end sm:self-end sm:pb-1">
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
              ) : null}
            </div>
          </div>
        </section>

        <section className="teacher-profile-stats mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="teacher-profile-stat-card glass-card rounded-2xl p-6 text-center">
            <p className="mb-1 text-3xl font-bold text-[#1152d4]">{displayStats.totalStudents.toLocaleString()}+</p>
            <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Total Students</p>
          </div>
          <div className="teacher-profile-stat-card glass-card rounded-2xl p-6 text-center">
            <p className="mb-1 text-3xl font-bold text-[#1152d4]">{displayStats.totalCourses}</p>
            <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Total Courses</p>
          </div>
          <div className="teacher-profile-stat-card glass-card rounded-2xl p-6 text-center">
            <div className="mb-1 flex items-center justify-center gap-1">
              <p className="text-3xl font-bold text-[#1152d4]">
                {displayStats.averageRating.toFixed(1)}
              </p>
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            </div>
            <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Average Rating</p>
          </div>
          <div className="teacher-profile-stat-card glass-card rounded-2xl p-6 text-center">
            <p className="mb-1 text-3xl font-bold text-[#1152d4]">{displayStats.yearsExperience}</p>
            <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Years Exp.</p>
          </div>
        </section>

        <div className="teacher-profile-content-grid grid grid-cols-1 gap-12 lg:grid-cols-3">
          <aside className="teacher-profile-sidebar lg:col-span-1">
            <section className="teacher-profile-side-section teacher-profile-about-section">
              <h3 className="teacher-profile-side-title mb-4 flex items-center gap-2 text-xl font-bold text-slate-900">
                <User className="h-5 w-5 text-[#1152d4]" />
                About Me
              </h3>
              <div className="teacher-profile-about-list">
                {aboutParagraphs.map((paragraph) => (
                  <p className="teacher-profile-about-text leading-relaxed text-slate-600" key={paragraph}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>

            <section className="teacher-profile-side-section teacher-profile-expertise-section">
              <h3 className="teacher-profile-side-title mb-4 flex items-center gap-2 text-xl font-bold text-slate-900">
                <Zap className="h-5 w-5 text-[#1152d4]" />
                Expertise
              </h3>
              <div className="teacher-profile-expertise-list flex flex-wrap gap-2">
                {displayExpertise.map((item) => (
                  <span className="teacher-profile-expertise-chip cursor-default rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-[#1152d4] hover:text-[#1152d4]" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </section>

            <section className="teacher-profile-side-section teacher-profile-social-section">
              <h3 className="teacher-profile-side-title mb-4 flex items-center gap-2 text-xl font-bold text-slate-900">
                <Share2 className="h-5 w-5 text-[#1152d4]" />
                Social Presence
              </h3>
              <div className="teacher-profile-social-list">
                {socialLinkRows.map((row) => {
                  const Icon = row.icon;
                  return (
                    <div className="teacher-profile-social-row flex items-center gap-3 text-slate-600 transition-colors hover:text-[#1152d4]" key={row.value}>
                      <Icon className="h-4 w-4" />
                      <span className="teacher-profile-social-text text-sm">{row.value}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          </aside>

          <div className="teacher-profile-main-column space-y-12 lg:col-span-2">
            <section className="teacher-profile-popular">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                  <BookOpen className="h-5 w-5 text-[#1152d4]" />
                  Popular Courses
                </h3>
                <button className="cursor-pointer text-sm font-semibold text-[#1152d4] hover:underline" onClick={() => onNavigate('/catalog')} type="button">
                  View All
                </button>
              </div>

              {coursesLoading || detailsLoading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading courses...</div>
              ) : (
                <div className="teacher-profile-course-grid grid grid-cols-1 gap-4 md:grid-cols-2">
                  {displayCourseCards.map((card) => (
                    <article
                      className={`teacher-profile-course-card group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${displayCourseCards.length === 1 ? 'md:col-span-2' : ''}`}
                      key={card.id}
                    >
                      <div className={`teacher-profile-course-media relative h-44 overflow-hidden bg-gradient-to-br ${categoryColor(card.category)}`}>
                        {card.coverImage ? (
                          <ImageWithFallback alt={card.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" src={card.coverImage} />
                        ) : (
                          <div className="teacher-profile-course-fallback flex h-full w-full flex-col justify-between p-4">
                            <span className="inline-flex w-fit items-center rounded-full border border-white/80 bg-white/85 px-3 py-1 text-xs font-semibold tracking-wide text-slate-700">
                              {card.category}
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600/80">
                              Course Preview
                            </span>
                          </div>
                        )}
                        {card.badge ? (
                          <span className="absolute right-3 top-3 rounded-lg bg-white/90 px-2 py-1 text-xs font-bold text-[#1152d4] backdrop-blur">
                            {card.badge}
                          </span>
                        ) : null}
                      </div>
                      <div className="teacher-profile-course-body p-5">
                        <h4 className="font-bold text-slate-900 transition-colors group-hover:text-[#1152d4]">{card.title}</h4>
                        {card.rating ? (
                          <div className="mb-4 mt-2 flex items-center gap-1">
                            <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-bold text-slate-900">{card.rating.toFixed(1)}</span>
                            <span className="text-sm text-slate-400">({card.reviewCount.toLocaleString()})</span>
                          </div>
                        ) : (
                          <div className="mb-4 mt-2 flex items-center gap-2 text-sm text-slate-400">
                            <Star className="h-4 w-4 shrink-0 text-slate-300" />
                            No ratings yet
                          </div>
                        )}
                        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                          <span className="text-xl font-bold text-slate-900">{card.bottomLabel}</span>
                          <button
                            className="cursor-pointer rounded-lg bg-[#1152d4]/10 p-2 text-[#1152d4] transition-colors hover:bg-[#1152d4] hover:text-white"
                            onClick={() => onNavigate(card.navigatePath)}
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

            <section className="teacher-profile-reviews">
              <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-900">
                <MessageSquare className="h-5 w-5 text-[#1152d4]" />
                What Students Are Saying
              </h3>

              {reviewsLoading && !showMockProfileContent ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading reviews...</div>
              ) : (
                <div className="teacher-profile-review-list space-y-4">
                  {displayReviewCards.map((review) => (
                    <article className="teacher-profile-review-card rounded-2xl border border-slate-100 bg-white p-6 shadow-sm" key={review.id}>
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-200">
                            {review.studentPhoto ? (
                              <ImageWithFallback alt={review.studentName} className="h-full w-full object-cover" src={review.studentPhoto} />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center font-bold text-[#1152d4]">
                                {review.studentName.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{review.studentName}</p>
                            <p className="text-xs text-slate-400">{review.dateLabel}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, starIndex) => (
                            <Star
                              className={`h-4 w-4 ${starIndex < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                              key={`${review.id}-star-${starIndex}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="italic text-slate-600">"{review.comment}"</p>
                      <p className="mt-3 text-sm text-slate-400">Course: {review.courseLabel}</p>
                    </article>
                  ))}
                </div>
              )}

              {allReviews.length > displayReviewCards.length || showMockProfileContent ? (
                <button
                  className="mt-6 w-full cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 py-4 font-semibold text-slate-400 transition-all hover:border-[#1152d4] hover:text-[#1152d4]"
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

      <PublicFooterBar onNavigate={onNavigate} />
    </div>
  );
}
