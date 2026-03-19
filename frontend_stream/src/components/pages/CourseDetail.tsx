import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Check,
  ChevronRight,
  Play,
  Star,
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useAppSelector } from '../../hooks/redux';
import { buildApiUrl } from '../../lib/api-base-url';
import { useEnrollCourseMutation } from '../../store/api/userApi';
import {
  useGetCourseDetailsQuery,
  useGetCourseLiveSessionQuery,
  useGetCourseSessionsQuery,
} from '../../store/api/liveApi';
import { parseNumericId } from '../live/liveSession.utils';
import { PublicFooterBar } from '../layout/PublicFooterBar';
import { PublicHeaderBar } from '../layout/PublicHeaderBar';
import './CourseDetail.css';

interface CourseDetailProps {
  courseId: string;
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

const DEFAULT_COVER_IMAGE =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600&h=900&fit=crop';

function formatMonthYear(dateValue: string | undefined): string {
  if (!dateValue) {
    return 'N/A';
  }
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return 'N/A';
  }
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(parsed);
}

function lessonTypeLabel(type: string): string {
  const normalized = (type || '').toUpperCase();
  if (normalized === 'VIDEO') {
    return 'Video';
  }
  if (normalized === 'QUIZ') {
    return 'Quiz';
  }
  if (normalized === 'DOCUMENT') {
    return 'Reading';
  }
  return 'Lesson';
}

function toMinutesText(minutes: number): string {
  if (minutes <= 0) {
    return '0m';
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

export function CourseDetail({ courseId, onNavigate }: CourseDetailProps) {
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

  const totalLessons = useMemo(() => {
    return sortedSections.reduce((sum, section) => sum + section.lessons.length, 0);
  }, [sortedSections]);

  const totalMinutes = useMemo(() => {
    return sortedSections.reduce((sum, section) => {
      return (
        sum +
        section.lessons.reduce((sectionTotal, lesson) => {
          return sectionTotal + (typeof lesson.durationMinutes === 'number' ? lesson.durationMinutes : 0);
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

  const visibleSections = useMemo(() => {
    if (showAllSections) {
      return sortedSections;
    }
    return sortedSections.slice(0, 3);
  }, [showAllSections, sortedSections]);

  const coverImage = courseDetails?.coverImage || DEFAULT_COVER_IMAGE;
  const lastUpdated = formatMonthYear(courseDetails?.scheduledAt);
  const enrolledCount = courseDetails?.enrolledCount || 0;
  const canAccessLiveSession =
    courseDetails.isEnrolled || user?.role === 'teacher' || user?.role === 'admin';
  const activeLiveSession = liveSession && (liveSession.isLive || liveSession.status === 'LIVE') ? liveSession : null;

  const previewReviews = useMemo(() => {
    return reviews.slice(0, 2);
  }, [reviews]);

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

  if (!numericCourseId) {
    return (
      <div className="cdp-loading-page">
        <p>Invalid course identifier.</p>
      </div>
    );
  }

  if (isCourseLoading) {
    return (
      <div className="cdp-loading-page">
        <p>Loading course details...</p>
      </div>
    );
  }

  if (!courseDetails || courseError) {
    return (
      <div className="cdp-loading-page">
        <p>Course not found.</p>
        <button onClick={() => onNavigate('/catalog')} type="button">Back to catalog</button>
      </div>
    );
  }

  return (
    <div className="cdp-page">
      <PublicHeaderBar currentPath="/catalog" onNavigate={onNavigate} />

      <main className="cdp-main">
        <section className="cdp-hero">
          <div className="cdp-hero-bg">
            <ImageWithFallback alt="Course hero background" src={coverImage} />
          </div>

          <div className="cdp-container cdp-hero-grid">
            <div className="cdp-hero-content">
              <nav className="cdp-breadcrumb">
                <span>{courseDetails.category || 'General'}</span>
                <span>/</span>
                <span>Masterclass</span>
              </nav>

              <h1>{courseDetails.title}</h1>
              <p>{courseDetails.description}</p>

              <div className="cdp-hero-metrics">
                <div>
                  <span>
                    <Star size={14} />
                    {averageRating.toFixed(1)}
                  </span>
                  <small>({reviewCount.toLocaleString()} reviews)</small>
                </div>
                <div>Enrolled: {enrolledCount.toLocaleString()} students</div>
                <div>Last updated: {lastUpdated}</div>
              </div>

              <div className="cdp-instructor-chip">
                <div className="cdp-instructor-avatar">
                  <ImageWithFallback
                    alt="Instructor avatar"
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop"
                  />
                </div>
                <div>
                  <small>Created by</small>
                  <strong>{courseDetails.teacherName || `Instructor #${courseDetails.teacherId}`}</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="cdp-container cdp-layout">
          <div className="cdp-content-column">
            <nav className="cdp-tabs">
              <a href="#overview">Overview</a>
              <a href="#curriculum">Curriculum</a>
              <a href="#instructor">Instructor</a>
              <a href="#reviews">Reviews</a>
            </nav>

            <article className="cdp-learn-card" id="overview">
              <h3>What you will learn</h3>
              <div className="cdp-learn-grid">
                {(sortedSections.flatMap((section) => section.lessons).slice(0, 6)).map((lesson) => (
                  <div key={lesson.id}>
                    <Check size={16} />
                    <p>{lesson.title}</p>
                  </div>
                ))}
                {sortedSections.length === 0 && (
                  <>
                    <div><Check size={16} /><p>Advanced practical workflows</p></div>
                    <div><Check size={16} /><p>Production-ready project methods</p></div>
                    <div><Check size={16} /><p>Portfolio and career guidance</p></div>
                    <div><Check size={16} /><p>Real-world case studies</p></div>
                  </>
                )}
              </div>
            </article>

            <article className="cdp-curriculum" id="curriculum">
              <div className="cdp-curriculum-head">
                <h3>Course Content</h3>
                <p>
                  {sortedSections.length} Sections - {totalLessons} Lessons - {toMinutesText(totalMinutes)} total
                </p>
              </div>

              <div className="cdp-section-list">
                {visibleSections.map((section) => {
                  const isExpanded = expandedSectionIds.includes(section.id);
                  const sectionMinutes = section.lessons.reduce((sum, lesson) => {
                    return sum + (lesson.durationMinutes || 0);
                  }, 0);

                  return (
                    <div className="cdp-section-card" key={section.id}>
                      <button
                        className="cdp-section-toggle"
                        onClick={() => toggleSection(section.id)}
                        type="button"
                      >
                        <div>
                          <ChevronRight className={isExpanded ? 'is-open' : ''} size={16} />
                          <span>{section.title}</span>
                        </div>
                        <small>
                          {section.lessons.length} lessons - {toMinutesText(sectionMinutes)}
                        </small>
                      </button>

                      {isExpanded && (
                        <div className="cdp-section-lessons">
                          {section.lessons.map((lesson) => (
                            <div key={lesson.id}>
                              {lesson.type.toUpperCase() === 'VIDEO' ? <Play size={14} /> : <BookOpen size={14} />}
                              <span>{lesson.title}</span>
                              <small>
                                {lesson.durationMinutes ? toMinutesText(lesson.durationMinutes) : lessonTypeLabel(lesson.type)}
                              </small>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {sortedSections.length > 3 && (
                <button
                  className="cdp-show-all"
                  onClick={() => setShowAllSections((previous) => !previous)}
                  type="button"
                >
                  {showAllSections ? 'Show fewer sections' : `Show all ${sortedSections.length} sections`}
                </button>
              )}
            </article>

            <article className="cdp-instructor-card" id="instructor">
              <h3>About the Instructor</h3>
              <div className="cdp-instructor-layout">
                <div className="cdp-instructor-avatar-lg">
                  <ImageWithFallback
                    alt="Instructor portrait"
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&h=500&fit=crop"
                  />
                </div>
                <div>
                  <h4>{courseDetails.teacherName || `Instructor #${courseDetails.teacherId}`}</h4>
                  <p className="cdp-instructor-subtitle">
                    {courseDetails.teacherSpeciality || 'Senior mentor and industry expert'}
                  </p>
                  <p className="cdp-instructor-copy">
                    Experienced mentor with practical field expertise, focused on helping students
                    build production-level projects and real-world confidence.
                  </p>
                  <div className="cdp-instructor-actions">
                    <button onClick={() => onNavigate('/search')} type="button">Follow Mentor</button>
                    <button onClick={() => onNavigate('/catalog')} type="button">View All Courses</button>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <aside className="cdp-sidebar">
            <div className="cdp-enroll-card">
              <div className="cdp-preview">
                <ImageWithFallback alt="Course preview" src={coverImage} />
                <button
                  onClick={() => {
                    if (canAccessLiveSession) {
                      onNavigate(activeLiveSession ? `/courses/${courseId}/live/${activeLiveSession.id}` : `/courses/${courseId}/live`);
                      return;
                    }
                    void handleEnroll();
                  }}
                  type="button"
                >
                  <Play size={18} />
                </button>
                <p>{canAccessLiveSession ? 'Preview this course' : 'Enroll to access live'}</p>
              </div>

              <div className="cdp-enroll-body">
                <div className="cdp-pricing">
                  <strong>Included</strong>
                  <small>Enroll to start instantly</small>
                </div>

                <div className="cdp-enroll-actions">
                  {courseDetails.isEnrolled ? (
                    <button onClick={() => onNavigate(`/courses/${courseId}/live`)} type="button">
                      Continue Learning
                    </button>
                  ) : (
                    <button disabled={isEnrolling} onClick={handleEnroll} type="button">
                      {isEnrolling ? 'Processing...' : 'Buy Now'}
                    </button>
                  )}

                  <button disabled={isEnrolling} onClick={handleEnroll} type="button">
                    Add to Cart
                  </button>
                </div>

                <p className="cdp-guarantee">30-Day Money-Back Guarantee</p>

                <div className="cdp-includes">
                  <p>This course includes:</p>
                  <ul>
                    <li>{toMinutesText(totalMinutes)} on-demand video</li>
                    <li>{totalLessons} lectures and resources</li>
                    <li>Full lifetime access</li>
                    <li>Access on mobile and desktop</li>
                    <li>Certificate of completion</li>
                    <li>{sessions.length} live session(s)</li>
                  </ul>
                </div>

                {activeLiveSession && canAccessLiveSession && (
                  <button
                    className="cdp-live-btn"
                    onClick={() => onNavigate(`/courses/${courseId}/live/${activeLiveSession.id}`)}
                    type="button"
                  >
                    Join Live Session
                  </button>
                )}

                {enrollError && <p className="cdp-error">{enrollError}</p>}
              </div>
            </div>
          </aside>
        </section>

        <section className="cdp-reviews" id="reviews">
          <div className="cdp-container cdp-reviews-grid">
            <div className="cdp-rating-summary">
              <h3>Student Feedback</h3>
              <strong>{averageRating.toFixed(1)}</strong>
              <div className="cdp-stars-row">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star className={index < Math.round(averageRating) ? 'is-fill' : ''} key={index} size={16} />
                ))}
              </div>
              <small>Course Rating</small>

              <div className="cdp-bars">
                <div><span style={{ width: `${ratingDistribution.top}%` }}></span><small>{ratingDistribution.top}%</small></div>
                <div><span style={{ width: `${ratingDistribution.middle}%` }}></span><small>{ratingDistribution.middle}%</small></div>
                <div><span style={{ width: `${ratingDistribution.low}%` }}></span><small>{ratingDistribution.low}%</small></div>
              </div>
            </div>

            <div className="cdp-review-cards">
              {reviewsLoading && <p className="cdp-state-inline">Loading reviews...</p>}
              {!reviewsLoading && previewReviews.length === 0 && (
                <p className="cdp-state-inline">No student feedback available yet.</p>
              )}
              {previewReviews.map((review) => (
                <article key={`${review.etudiantNom}-${review.dateCreation}`} className="cdp-review-card">
                  <div>
                    <div className="cdp-review-avatar">
                      {review.etudiantPhoto ? (
                        <ImageWithFallback alt={review.etudiantNom || 'Student'} src={review.etudiantPhoto} />
                      ) : (
                        <span>{(review.etudiantNom || 'S').charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <p>{review.etudiantNom || 'Learner'}</p>
                      <small>{formatMonthYear(review.dateCreation || undefined)}</small>
                    </div>
                  </div>

                  <div className="cdp-stars-row">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star className={index < Math.round(review.note || 0) ? 'is-fill' : ''} key={index} size={14} />
                    ))}
                  </div>
                  <p>{review.commentaire || 'Great course experience with practical lessons.'}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooterBar onNavigate={onNavigate} />
    </div>
  );
}

