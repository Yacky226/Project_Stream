import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Search,
  ShoppingCart,
  Star,
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { PublicFooterBar } from '../layout/PublicFooterBar';
import { PublicHeaderBar } from '../layout/PublicHeaderBar';
import { buildApiUrl } from '../../lib/api-base-url';
import { useGetCourseDetailsQuery, useGetCoursesQuery } from '../../store/api/liveApi';
import { useSubscribeToNewsletterMutation } from '../../store/api/publicSupportApi';
import type { LiveCourseDetails } from '../../types/live';
import './HomePage.css';

interface HomePageProps {
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

interface RenderableTestimonial {
  author: string;
  avatar?: string;
  highlight?: boolean;
  quote: string;
  role: string;
  stars: number;
}

function toReviewStars(value: number | null | undefined): number {
  const normalized = Number.isFinite(value) ? Number(value) : 0;
  return Math.max(1, Math.min(5, Math.round(normalized || 0)));
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = Number(value.replace(',', '.').trim());
    if (Number.isFinite(normalized)) {
      return normalized;
    }
  }

  return null;
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function toCourseBadge(index: number): string | null {
  if (index === 0) return 'BEST SELLER';
  if (index === 1) return 'NEW';
  return null;
}

function toCourseLevelLabel(course: LiveCourseDetails, index: number): string {
  const rawLevel = course.metadata?.level?.trim().toLowerCase() || '';
  if (rawLevel.includes('expert') || rawLevel.includes('advanced') || rawLevel.includes('avance')) {
    return 'Expert Level';
  }
  if (rawLevel.includes('intermediate') || rawLevel.includes('intermediaire')) {
    return 'Intermediate Level';
  }
  if (rawLevel.includes('beginner') || rawLevel.includes('debutant')) {
    return 'Beginner Level';
  }
  if (rawLevel.includes('all')) {
    return 'All Levels';
  }

  const fallbackLevels = ['Expert Level', 'Intermediate Level', 'All Levels'];
  return fallbackLevels[index] || fallbackLevels[fallbackLevels.length - 1];
}

function toCourseCompletionRate(course: LiveCourseDetails, index: number): number {
  const metadata = (course.metadata || {}) as Record<string, unknown>;
  const metadataRate =
    toNumber(metadata.completionRate) ??
    toNumber(metadata.completionPercent) ??
    toNumber(metadata.completion) ??
    toNumber(metadata.completion_rate);

  if (metadataRate !== null) {
    return clampPercent(metadataRate);
  }

  if (course.reviewCount > 0 && course.enrolledCount > 0) {
    return clampPercent((course.reviewCount / course.enrolledCount) * 100);
  }

  if (typeof course.averageRating === 'number') {
    return clampPercent((course.averageRating / 5) * 100);
  }

  const fallbackRates = [85, 70, 92];
  return fallbackRates[index] || fallbackRates[fallbackRates.length - 1];
}

function toCoursePriceLabel(course: LiveCourseDetails, index: number): string {
  const metadata = (course.metadata || {}) as Record<string, unknown>;
  const discountedPrice = toNumber(metadata.discountedPrice);
  const regularPrice = toNumber(metadata.regularPrice);
  const selectedPrice = discountedPrice ?? regularPrice;

  if (selectedPrice !== null && selectedPrice >= 0) {
    const rawCurrency = typeof metadata.currency === 'string' ? metadata.currency.trim().toUpperCase() : '';
    const currency = rawCurrency || 'USD';

    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(selectedPrice);
    } catch {
      return `$${selectedPrice.toFixed(2)}`;
    }
  }

  const fallbackPrices = [199, 149, 179];
  const fallbackPrice = fallbackPrices[index] || fallbackPrices[fallbackPrices.length - 1];
  return `$${fallbackPrice.toFixed(2)}`;
}

function toCourseRatingLabel(course: LiveCourseDetails, index: number): string {
  if (typeof course.averageRating === 'number') {
    return course.averageRating.toFixed(1);
  }

  const fallbackRatings = ['4.9', '4.8', '5.0'];
  return fallbackRatings[index] || fallbackRatings[fallbackRatings.length - 1];
}

function buildCourseUrl(courseId: string): string {
  return `/courses/${courseId}`;
}

export function HomePage({ onNavigate }: HomePageProps) {
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
    () => testimonials.map((item) => item.avatar).filter((avatar): avatar is string => Boolean(avatar)).slice(0, 3),
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

        const normalizedTestimonials: RenderableTestimonial[] = latestReviews.map((review, index) => {
          const note = review.note ?? null;
          const studentName = review.etudiantNom?.trim() || 'Learner';
          const courseTitle = courseTitleById.get(String(review.coursId)) || 'EliteLearn course';
          const quote =
            review.commentaire?.trim() ||
            (note ? `Shared a ${note}/5 rating for this course.` : 'Shared feedback about this course.');

          return {
            author: studentName,
            avatar: review.etudiantPhoto || undefined,
            highlight: index === 1,
            quote,
            role: courseTitle,
            stars: toReviewStars(note),
          };
        });

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
  }, [featuredCourseIdsKey, featuredCourseIds, courseTitleById]);

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

  return (
    <div className="el-home">
      <PublicHeaderBar currentPath="/" onNavigate={onNavigate} />
      <main className="el-main">
        <section className="el-hero-section">
          <div className="el-container">
            <div className="el-hero-grid">
              <div className="el-hero-content">
                <div className="el-hero-badge">
                  <span className="el-hero-badge-dot-wrap">
                    <span className="el-hero-badge-dot-ping"></span>
                    <span className="el-hero-badge-dot"></span>
                  </span>
                  Join active students
                </div>

                <h1 className="el-hero-title">
                  Master the Skills of <span className="el-primary-text">Tomorrow</span>
                </h1>

                <p className="el-hero-subtitle">
                  Unlock your potential with expert-led courses designed for the future of work.
                  Learn faster with real learner feedback and updated course content.
                </p>

                <div className="el-hero-search-wrap">
                  <Search className="el-hero-search-icon" size={20} />
                  <input className="el-hero-search-input" placeholder="What do you want to learn?" type="text" />
                  <button className="el-hero-search-btn" onClick={() => onNavigate('/catalog')} type="button">
                    Explore
                  </button>
                </div>

                <div className="el-category-tags">
                  {categoryTags.length > 0 ? (
                    categoryTags.map((category) => (
                      <span className="el-category-tag" key={category}>{category}</span>
                    ))
                  ) : (
                    <span className="el-category-tag">Backend synced</span>
                  )}
                </div>
              </div>

              <div className="el-hero-visual-wrap">
                <div className="el-hero-visual-card">
                  {heroImage ? (
                    <ImageWithFallback
                      alt="Featured learning experience"
                      className="el-hero-image"
                      src={heroImage}
                    />
                  ) : (
                    <div className="el-hero-image-fallback">No featured image yet</div>
                  )}
                  <div className="el-hero-image-overlay"></div>
                  <div className="el-live-pill">
                    <div className="el-live-avatars">
                      {liveAvatars.map((avatar) => (
                        <img alt="Learner avatar" className="el-live-avatar" key={avatar} src={avatar} />
                      ))}
                    </div>
                    <p className="el-live-text">Latest learner reviews</p>
                  </div>
                </div>
                <div className="el-hero-blur el-hero-blur-top"></div>
                <div className="el-hero-blur el-hero-blur-bottom"></div>
              </div>
            </div>
          </div>
        </section>

        <section className="el-courses-section">
          <div className="el-container">
            <div className="el-section-header">
              <div>
                <h2 className="el-section-title">Featured Courses</h2>
                <p className="el-section-subtitle">Live data loaded from the backend catalog.</p>
              </div>
              <button className="el-view-all" onClick={() => onNavigate('/catalog')} type="button">
                View all courses <ArrowRight size={16} />
              </button>
            </div>

            {isFeaturedLoading && <p className="el-data-state">Loading featured courses...</p>}
            {!isFeaturedLoading && isCoursesError && (
              <p className="el-data-state">Unable to load featured courses.</p>
            )}
            {!isFeaturedLoading && !isCoursesError && featuredCourses.length === 0 && (
              <p className="el-data-state">No featured course available right now.</p>
            )}

            {!isFeaturedLoading && featuredCourses.length > 0 && (
              <div className="el-course-grid">
                {featuredCourses.map((course, index) => {
                  const instructorName = course.teacherName || 'Instructor';
                  const instructorInitial = instructorName.charAt(0).toUpperCase();
                  const completionRate = toCourseCompletionRate(course, index);
                  const ratingLabel = toCourseRatingLabel(course, index);
                  const levelLabel = toCourseLevelLabel(course, index);
                  const priceLabel = toCoursePriceLabel(course, index);
                  const badgeLabel = toCourseBadge(index);

                  return (
                    <article className="el-course-card" key={course.id}>
                      <div className="el-course-image-wrap">
                        {badgeLabel ? <span className="el-course-badge">{badgeLabel}</span> : null}
                        {course.coverImage ? (
                          <ImageWithFallback alt={course.title} className="el-course-image" src={course.coverImage} />
                        ) : (
                          <div className="el-course-image-placeholder">{course.category}</div>
                        )}
                      </div>

                      <div className="el-course-body">
                        <div className="el-course-head">
                          <h3 className="el-course-title">{course.title}</h3>
                          <div className="el-course-rating">
                            <Star className="el-rating-star" size={16} />
                            <span>{ratingLabel}</span>
                          </div>
                        </div>

                        <div className="el-course-instructor-row">
                          <div className="el-course-instructor-avatar el-course-instructor-avatar-fallback">
                            {instructorInitial}
                          </div>
                          <p className="el-course-instructor-name">{instructorName}</p>
                        </div>

                        <div className="el-progress-wrap">
                          <div className="el-progress-meta">
                            <span>{levelLabel}</span>
                            <span>{completionRate}% completion rate</span>
                          </div>
                          <div className="el-progress-bar">
                            <span className="el-progress-fill" style={{ width: `${completionRate}%` }}></span>
                          </div>
                        </div>

                        <div className="el-course-footer">
                          <p className="el-course-price">{priceLabel}</p>
                          <button
                            className="el-cart-btn"
                            onClick={() => onNavigate(buildCourseUrl(course.id))}
                            aria-label={`Open ${course.title}`}
                            type="button"
                          >
                            <ShoppingCart size={18} />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="el-testimonials-section">
          <div className="el-container">
            <div className="el-testimonial-header">
              <h2 className="el-section-title">What learners are saying</h2>
              <p className="el-section-subtitle">Latest reviews loaded from the backend.</p>
            </div>

            {reviewsLoading && <p className="el-data-state">Loading reviews...</p>}
            {!reviewsLoading && testimonials.length === 0 && (
              <p className="el-data-state">No learner review available yet.</p>
            )}

            {!reviewsLoading && testimonials.length > 0 && (
              <div className="el-testimonial-grid">
                {testimonials.map((testimonial) => (
                  <article className={`el-testimonial-card${testimonial.highlight ? ' is-highlighted' : ''}`} key={`${testimonial.author}-${testimonial.role}`}>
                    <div className="el-testimonial-stars">
                      {Array.from({ length: testimonial.stars }).map((_, index) => (
                        <Star className="el-rating-star" key={`${testimonial.author}-star-${index + 1}`} size={16} />
                      ))}
                    </div>

                    <blockquote className="el-testimonial-quote">&quot;{testimonial.quote}&quot;</blockquote>

                    <div className="el-testimonial-author">
                      {testimonial.avatar ? (
                        <img alt={testimonial.author} className="el-testimonial-avatar" src={testimonial.avatar} />
                      ) : (
                        <div className="el-testimonial-avatar-fallback">
                          {testimonial.author.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="el-testimonial-name">{testimonial.author}</p>
                        <p className="el-testimonial-role">{testimonial.role}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="el-newsletter-section">
          <div className="el-container">
            <div className="el-newsletter-card">
              <div className="el-newsletter-content">
                <h2 className="el-newsletter-title">Ready to take the next step?</h2>
                <p className="el-newsletter-subtitle">
                  Join our weekly newsletter for exclusive early access to new courses and free learning resources.
                </p>

                <form className="el-newsletter-form" onSubmit={handleNewsletterSubmit}>
                  <input
                    className="el-newsletter-input"
                    onChange={(event) => setNewsletterEmail(event.target.value)}
                    placeholder="Enter your email"
                    type="email"
                    value={newsletterEmail}
                  />
                  <button className="el-newsletter-btn" disabled={isNewsletterSubmitting} type="submit">
                    {isNewsletterSubmitting ? 'Submitting...' : 'Subscribe'}
                  </button>
                </form>

                {newsletterFeedback && (
                  <p className="el-newsletter-feedback">{newsletterFeedback}</p>
                )}
                {newsletterError && (
                  <p className="el-newsletter-feedback is-error">{newsletterError}</p>
                )}
              </div>

              <div className="el-newsletter-glow el-newsletter-glow-right"></div>
              <div className="el-newsletter-glow el-newsletter-glow-left"></div>
            </div>
          </div>
        </section>
      </main>
      <PublicFooterBar onNavigate={onNavigate} />
    </div>
  );
}

