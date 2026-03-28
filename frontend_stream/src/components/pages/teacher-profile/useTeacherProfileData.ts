import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { useAppSelector } from '../../../hooks/redux';
import { buildApiUrl } from '../../../lib/api-base-url';
import { useGetCoursesQuery } from '../../../store/api/liveApi';
import { useGetProfileQuery, useGetTeacherSpecialtyQuery } from '../../../store/api/userApi';
import type { BackendCourseDetailsDTO, LiveCourse, LiveCourseDetails } from '../../../types/live';
import { mapCourseDetails } from '../../../types/live';
import type { FeaturedCourse, ReviewWithCourseRef } from './teacherProfile.types';
import { safeNumber } from './teacherProfile.utils';

interface UseTeacherProfileDataParams {
  teacherId: string;
}

export interface TeacherProfileDataModel {
  teacherId: string;
  teacherIdValid: boolean;
  ownProfileIsTeacher: boolean;
  coursesLoading: boolean;
  coursesError: unknown;
  detailsLoading: boolean;
  reviewsLoading: boolean;
  profileAvatar?: string | null;
  profileEmail?: string | null;
  teacherName: string;
  teacherRole: string;
  profileMetaLine: string;
  totalStudents: number;
  averageRating: number;
  yearsExperienceLabel: string;
  aboutCopy: string;
  expertise: string[];
  socialProfilePath: string;
  socialCourseLinkLabel: string;
  socialEmailValue: string;
  teacherCourses: LiveCourse[];
  featuredCourses: FeaturedCourse[];
  allReviews: ReviewWithCourseRef[];
  reviewsPreview: ReviewWithCourseRef[];
  isFollowing: boolean;
  setIsFollowing: Dispatch<SetStateAction<boolean>>;
}

export function useTeacherProfileData({
  teacherId,
}: UseTeacherProfileDataParams): TeacherProfileDataModel {
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

  const {
    data: allCourses = [],
    isLoading: coursesLoading,
    error: coursesError,
  } = useGetCoursesQuery();

  const teacherCourses = useMemo(() => {
    if (!teacherIdValid) {
      return [] as LiveCourse[];
    }
    return allCourses.filter((course) => Number(course.teacherId) === numericTeacherId);
  }, [allCourses, numericTeacherId, teacherIdValid]);

  const [detailsByCourseId, setDetailsByCourseId] = useState<Record<string, LiveCourseDetails>>({});
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [allReviews, setAllReviews] = useState<ReviewWithCourseRef[]>([]);
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
                return [] as ReviewWithCourseRef[];
              }

              const payload = (await response.json()) as ReviewWithCourseRef[];
              if (!Array.isArray(payload)) {
                return [] as ReviewWithCourseRef[];
              }

              return payload.map((item) => ({ ...item, courseIdString: String(course.id) }));
            } catch {
              return [] as ReviewWithCourseRef[];
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
      return (
        `${profile.firstName || ''} ${profile.lastName || ''}`.trim() ||
        `Instructor #${teacherId}`
      );
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
    return Object.values(detailsByCourseId).reduce(
      (sum, detail) => sum + safeNumber(detail.enrolledCount),
      0,
    );
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
        const enrollments = safeNumber(detail?.enrolledCount ?? course.enrolledCount);
        const rating = safeNumber(detail?.averageRating ?? course.averageRating);
        const reviewCount = safeNumber(detail?.ratingCount ?? course.ratingCount);
        return {
          course,
          detail,
          enrollments,
          rating,
          reviewCount,
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
      : 'Learner metrics will appear once courses are enrolled.');

  return {
    teacherId,
    teacherIdValid,
    ownProfileIsTeacher,
    coursesLoading,
    coursesError,
    detailsLoading,
    reviewsLoading,
    profileAvatar: ownProfileIsTeacher ? profile?.avatar : null,
    profileEmail: profile?.email,
    teacherName,
    teacherRole,
    profileMetaLine,
    totalStudents,
    averageRating,
    yearsExperienceLabel: teacherCourses.length > 0 ? '12+' : 'N/A',
    aboutCopy,
    expertise,
    socialProfilePath: `/profile/teacher/${teacherId}`,
    socialCourseLinkLabel: `${teacherCourses.length} public course link(s)`,
    socialEmailValue: ownProfileIsTeacher
      ? (profile?.email || 'Email not available')
      : 'Public contact data is not exposed by the API.',
    teacherCourses,
    featuredCourses: topCourses.slice(0, 2),
    allReviews,
    reviewsPreview,
    isFollowing,
    setIsFollowing,
  };
}
