import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { useAppSelector } from '../../../hooks/redux';
import { buildApiUrl } from '../../../lib/api-base-url';
import { useEnrollCourseMutation } from '../../../store/api/userApi';
import {
  useGetCourseDetailsQuery,
  useGetCourseLiveSessionQuery,
  useGetCourseSessionsQuery,
} from '../../../store/api/liveApi';
import { parseNumericId } from '../../live/liveSession.utils';
import type { BackendReview } from './courseDetail.types';
import { DEFAULT_COVER_IMAGE, formatMonthYear, toMinutesText } from './courseDetail.utils';

interface UseCourseDetailDataParams {
  courseId: string;
  onNavigate: (path: string) => void;
}

export interface CourseDetailDataModel {
  courseId: string;
  numericCourseId: string;
  isCourseLoading: boolean;
  courseError: unknown;
  courseDetails: ReturnType<typeof useGetCourseDetailsQuery>['data'];
  sessions: ReturnType<typeof useGetCourseSessionsQuery>['data'];
  showAllSections: boolean;
  setShowAllSections: Dispatch<SetStateAction<boolean>>;
  expandedSectionIds: string[];
  visibleSections: Array<
    NonNullable<ReturnType<typeof useGetCourseDetailsQuery>['data']>['sections'][number]
  >;
  sortedSections: Array<
    NonNullable<ReturnType<typeof useGetCourseDetailsQuery>['data']>['sections'][number]
  >;
  totalLessons: number;
  totalMinutes: number;
  averageRating: number;
  reviewCount: number;
  ratingDistribution: { top: number; middle: number; low: number };
  coverImage: string;
  lastUpdated: string;
  enrolledCount: number;
  canAccessLiveSession: boolean;
  activeLiveSession:
    | (NonNullable<ReturnType<typeof useGetCourseLiveSessionQuery>['data']>)
    | null;
  previewReviews: BackendReview[];
  reviewsLoading: boolean;
  enrollError: string | null;
  isEnrolling: boolean;
  toggleSection: (sectionId: string) => void;
  handleEnroll: () => Promise<void>;
}

export function useCourseDetailData({
  courseId,
  onNavigate,
}: UseCourseDetailDataParams): CourseDetailDataModel {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const numericCourseId = parseNumericId(courseId);
  const studentId = user?.role === 'student' ? user.id : undefined;

  const [expandedSectionIds, setExpandedSectionIds] = useState<string[]>([]);
  const [showAllSections, setShowAllSections] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<BackendReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [enrollCourse, { isLoading: isEnrolling }] = useEnrollCourseMutation();

  const {
    data: courseDetails,
    error: courseError,
    isLoading: isCourseLoading,
    refetch: refetchCourse,
  } = useGetCourseDetailsQuery(
    { courseId: numericCourseId || '', studentId },
    { skip: !numericCourseId },
  );

  const { data: sessions = [] } = useGetCourseSessionsQuery(numericCourseId || '', {
    skip: !numericCourseId || !isAuthenticated,
  });

  const { data: liveSession } = useGetCourseLiveSessionQuery(numericCourseId || '', {
    skip: !numericCourseId || !isAuthenticated,
  });

  useEffect(() => {
    if (!courseDetails?.sections?.length) {
      setExpandedSectionIds([]);
      return;
    }
    setExpandedSectionIds([courseDetails.sections[0].id]);
  }, [courseDetails?.sections]);

  useEffect(() => {
    if (!numericCourseId) {
      setReviews([]);
      return;
    }

    const controller = new AbortController();

    const loadReviews = async () => {
      setReviewsLoading(true);
      try {
        const response = await fetch(buildApiUrl(`/api/avis/cours/${numericCourseId}`), {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });

        if (!response.ok) {
          setReviews([]);
          return;
        }

        const payload = (await response.json()) as BackendReview[];
        const normalized = Array.isArray(payload) ? payload : [];
        normalized.sort((left, right) => {
          const leftDate = left.dateCreation ? new Date(left.dateCreation).getTime() : 0;
          const rightDate = right.dateCreation ? new Date(right.dateCreation).getTime() : 0;
          return rightDate - leftDate;
        });
        setReviews(normalized);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setReviews([]);
        }
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
  }, [numericCourseId]);

  const sortedSections = useMemo(() => {
    return (courseDetails?.sections || [])
      .slice()
      .sort((left, right) => left.order - right.order)
      .map((section) => ({
        ...section,
        lessons: section.lessons.slice().sort((left, right) => left.order - right.order),
      }));
  }, [courseDetails?.sections]);

  const totalLessons = useMemo(
    () => sortedSections.reduce((sum, section) => sum + section.lessons.length, 0),
    [sortedSections],
  );

  const totalMinutes = useMemo(() => {
    return sortedSections.reduce((sum, section) => {
      return (
        sum +
        section.lessons.reduce((sectionTotal, lesson) => {
          return (
            sectionTotal +
            (typeof lesson.durationMinutes === 'number' ? lesson.durationMinutes : 0)
          );
        }, 0)
      );
    }, 0);
  }, [sortedSections]);

  const averageRating = useMemo(() => {
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, review) => acc + (review.note || 0), 0);
      return Number((sum / reviews.length).toFixed(1));
    }
    return courseDetails?.averageRating ? Number(courseDetails.averageRating.toFixed(1)) : 0;
  }, [courseDetails?.averageRating, reviews]);

  const reviewCount = reviews.length || courseDetails?.reviewCount || 0;

  const ratingDistribution = useMemo(() => {
    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0 };
    if (reviews.length > 0) {
      reviews.forEach((review) => {
        const rounded = Math.round(review.note || 0);
        if (rounded >= 5) distribution[5] += 1;
        else if (rounded === 4) distribution[4] += 1;
        else if (rounded <= 3) distribution[3] += 1;
      });
      return {
        top: Math.round((distribution[5] / reviews.length) * 100),
        middle: Math.round((distribution[4] / reviews.length) * 100),
        low: Math.round((distribution[3] / reviews.length) * 100),
      };
    }
    if (averageRating >= 4.5) {
      return { top: 82, middle: 14, low: 4 };
    }
    if (averageRating >= 4) {
      return { top: 64, middle: 25, low: 11 };
    }
    return { top: 40, middle: 35, low: 25 };
  }, [averageRating, reviews]);

  const visibleSections = useMemo(
    () => (showAllSections ? sortedSections : sortedSections.slice(0, 3)),
    [showAllSections, sortedSections],
  );

  const coverImage = courseDetails?.coverImage || DEFAULT_COVER_IMAGE;
  const lastUpdated = formatMonthYear(courseDetails?.scheduledAt);
  const enrolledCount = courseDetails?.enrolledCount || 0;
  const canAccessLiveSession =
    Boolean(courseDetails?.isEnrolled) || user?.role === 'teacher' || user?.role === 'admin';
  const activeLiveSession =
    liveSession && (liveSession.isLive || liveSession.status === 'LIVE') ? liveSession : null;
  const previewReviews = useMemo(() => reviews.slice(0, 2), [reviews]);

  const toggleSection = (sectionId: string) => {
    setExpandedSectionIds((previous) => {
      if (previous.includes(sectionId)) {
        return previous.filter((id) => id !== sectionId);
      }
      return [...previous, sectionId];
    });
  };

  const handleEnroll = async () => {
    if (!numericCourseId) {
      setEnrollError('Invalid course identifier.');
      return;
    }
    if (!isAuthenticated || !user?.id) {
      onNavigate('/auth/signin');
      return;
    }
    if (user.role !== 'student') {
      setEnrollError('Only students can enroll in a course.');
      return;
    }

    setEnrollError(null);
    try {
      await enrollCourse({ coursId: numericCourseId }).unwrap();
      await refetchCourse();
    } catch (error) {
      const payload = error as { data?: string | { error?: string; message?: string } };
      const backendMessage =
        typeof payload?.data === 'string'
          ? payload.data
          : payload?.data?.message || payload?.data?.error;
      setEnrollError(backendMessage || 'Unable to enroll right now.');
    }
  };

  return {
    courseId,
    numericCourseId,
    isCourseLoading,
    courseError,
    courseDetails,
    sessions,
    showAllSections,
    setShowAllSections,
    expandedSectionIds,
    visibleSections,
    sortedSections,
    totalLessons,
    totalMinutes,
    averageRating,
    reviewCount,
    ratingDistribution,
    coverImage,
    lastUpdated,
    enrolledCount,
    canAccessLiveSession,
    activeLiveSession,
    previewReviews,
    reviewsLoading,
    enrollError,
    isEnrolling,
    toggleSection,
    handleEnroll,
  };
}
