import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { buildApiUrl } from '../../../lib/api-base-url';
import { useGetCourseDetailsQuery, useGetCoursesQuery } from '../../../store/api/liveApi';
import { useSubscribeToNewsletterMutation } from '../../../store/api/publicSupportApi';
import type { LiveCourseDetails } from '../../../types/live';
import type {
  BackendReview,
  HomePageProps,
  RenderableTestimonial,
} from './homePage.types';
import { toReviewStars } from './homePage.utils';

export interface HomePageDataModel {
  newsletterEmail: string;
  setNewsletterEmail: (value: string) => void;
  newsletterFeedback: string | null;
  newsletterError: string | null;
  testimonials: RenderableTestimonial[];
  reviewsLoading: boolean;
  isNewsletterSubmitting: boolean;
  featuredCourses: LiveCourseDetails[];
  categoryTags: string[];
  liveAvatars: string[];
  heroImage: string | null;
  isFeaturedLoading: boolean;
  isCoursesError: boolean;
  handleNewsletterSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onNavigate: HomePageProps['onNavigate'];
}

export function useHomePageData({ onNavigate }: HomePageProps): HomePageDataModel {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterFeedback, setNewsletterFeedback] = useState<string | null>(null);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);
  const [testimonials, setTestimonials] = useState<RenderableTestimonial[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [subscribeToNewsletter, { isLoading: isNewsletterSubmitting }] =
    useSubscribeToNewsletterMutation();

  const {
    data: allCourses = [],
    isError: isCoursesError,
    isLoading: isCoursesLoading,
  } = useGetCoursesQuery();

  const featuredCourseIds = useMemo(
    () => allCourses.slice(0, 3).map((course) => course.id),
    [allCourses],
  );

  const firstCourseId = featuredCourseIds[0];
  const secondCourseId = featuredCourseIds[1];
  const thirdCourseId = featuredCourseIds[2];

  const firstCourseQuery = useGetCourseDetailsQuery(
    { courseId: firstCourseId ?? '' },
    { skip: !firstCourseId },
  );
  const secondCourseQuery = useGetCourseDetailsQuery(
    { courseId: secondCourseId ?? '' },
    { skip: !secondCourseId },
  );
  const thirdCourseQuery = useGetCourseDetailsQuery(
    { courseId: thirdCourseId ?? '' },
    { skip: !thirdCourseId },
  );

  const featuredCourses = useMemo<LiveCourseDetails[]>(() => {
    return [firstCourseQuery.data, secondCourseQuery.data, thirdCourseQuery.data].filter(
      (course): course is LiveCourseDetails => Boolean(course),
    );
  }, [firstCourseQuery.data, secondCourseQuery.data, thirdCourseQuery.data]);

  const featuredCourseIdsKey = useMemo(() => featuredCourseIds.join(','), [featuredCourseIds]);

  const courseTitleById = useMemo(() => {
    const map = new Map<string, string>();
    allCourses.forEach((course) => {
      map.set(course.id, course.title);
    });
    return map;
  }, [allCourses]);

  const categoryTags = useMemo(() => {
    const categories = featuredCourses
      .map((course) => course.category)
      .filter((category): category is string => Boolean(category && category.trim()));
    return Array.from(new Set(categories)).slice(0, 3);
  }, [featuredCourses]);

  const liveAvatars = useMemo(
    () =>
      testimonials
        .map((item) => item.avatar)
        .filter((avatar): avatar is string => Boolean(avatar))
        .slice(0, 3),
    [testimonials],
  );

  const heroImage = featuredCourses[0]?.coverImage || null;

  const isFeaturedLoading =
    isCoursesLoading ||
    firstCourseQuery.isLoading ||
    secondCourseQuery.isLoading ||
    thirdCourseQuery.isLoading;

  useEffect(() => {
    if (!featuredCourseIdsKey) {
      setTestimonials([]);
      return;
    }

    const controller = new AbortController();

    const loadReviews = async () => {
      setReviewsLoading(true);
      try {
        const responses = await Promise.all(
          featuredCourseIds.map((courseId) =>
            fetch(buildApiUrl(`/api/avis/cours/${courseId}`), {
              headers: { Accept: 'application/json' },
              signal: controller.signal,
            }),
          ),
        );

        const reviewGroups = await Promise.all(
          responses.map(async (response) => {
            if (!response.ok) {
              return [] as BackendReview[];
            }

            const payload = (await response.json()) as BackendReview[];
            return Array.isArray(payload) ? payload : [];
          }),
        );

        const latestReviews = reviewGroups
          .flat()
          .sort((a, b) => {
            const dateA = a.dateCreation ? new Date(a.dateCreation).getTime() : 0;
            const dateB = b.dateCreation ? new Date(b.dateCreation).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, 3);

        const normalizedTestimonials: RenderableTestimonial[] = latestReviews.map(
          (review, index) => {
            const note = review.note ?? null;
            const studentName = review.etudiantNom?.trim() || 'Learner';
            const courseTitle =
              courseTitleById.get(String(review.coursId)) || 'EliteLearn course';
            const quote =
              review.commentaire?.trim() ||
              (note
                ? `Shared a ${note}/5 rating for this course.`
                : 'Shared feedback about this course.');

            return {
              author: studentName,
              avatar: review.etudiantPhoto || undefined,
              highlight: index === 1,
              quote,
              role: courseTitle,
              stars: toReviewStars(note),
            };
          },
        );

        setTestimonials(normalizedTestimonials);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setTestimonials([]);
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
  }, [courseTitleById, featuredCourseIds, featuredCourseIdsKey]);

  const handleNewsletterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = newsletterEmail.trim();
    if (!normalizedEmail) {
      setNewsletterFeedback(null);
      setNewsletterError('Please enter a valid email address.');
      return;
    }

    try {
      const result = await subscribeToNewsletter({
        email: normalizedEmail,
        sourcePage: 'HOME_PAGE',
      }).unwrap();

      setNewsletterError(null);
      setNewsletterFeedback(result.message || 'Subscription completed successfully.');
      setNewsletterEmail('');
    } catch {
      setNewsletterFeedback(null);
      setNewsletterError('Unable to subscribe right now. Please try again.');
    }
  };

  return {
    newsletterEmail,
    setNewsletterEmail,
    newsletterFeedback,
    newsletterError,
    testimonials,
    reviewsLoading,
    isNewsletterSubmitting,
    featuredCourses,
    categoryTags,
    liveAvatars,
    heroImage,
    isFeaturedLoading,
    isCoursesError,
    handleNewsletterSubmit,
    onNavigate,
  };
}
