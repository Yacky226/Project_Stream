import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Facebook,
  GraduationCap,
  Instagram,
  Linkedin,
  Search,
  ShoppingCart,
  Star,
  Twitter,
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
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

interface FooterColumn {
  links: Array<{ label: string; path: string }>;
  title: string;
}

const footerColumns: FooterColumn[] = [
  {
    links: [
      { label: 'Browse Courses', path: '/catalog' },
      { label: 'Mentorship', path: '/search' },
      { label: 'Roadmaps', path: '/catalog' },
      { label: 'Pricing', path: '/business' },
    ],
    title: 'Platform',
  },
  {
    links: [
      { label: 'About Us', path: '/business' },
      { label: 'Careers', path: '/careers' },
      { label: 'Partners', path: '/business' },
      { label: 'Blog', path: '/blog' },
    ],
    title: 'Company',
  },
  {
    links: [
      { label: 'Help Center', path: '/help' },
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Terms of Service', path: '/terms' },
      { label: 'Cookie Settings', path: '/privacy' },
    ],
    title: 'Support',
  },
  {
    links: [
      { label: 'iOS App', path: '/mobile-app' },
      { label: 'Android App', path: '/mobile-app' },
      { label: 'Web Player', path: '/mobile-app' },
    ],
    title: 'Apps',
  },
];

const NAV_ITEMS: Array<{ label: string; path: string }> = [
  { label: 'Courses', path: '/catalog' },
  { label: 'Mentors', path: '/search' },
  { label: 'Pricing', path: '/business' },
  { label: 'Enterprise', path: '/business' },
];

function toReviewStars(value: number | null | undefined): number {
  const normalized = Number.isFinite(value) ? Number(value) : 0;
  return Math.max(1, Math.min(5, Math.round(normalized || 0)));
}

function toRatingPercent(value: number | null | undefined): number {
  const normalized = Number.isFinite(value) ? Number(value) : 0;
  return Math.max(0, Math.min(100, Math.round((normalized / 5) * 100)));
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
  const currentYear = new Date().getFullYear();

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
      <header className="el-header">
        <div className="el-container">
          <div className="el-header-row">
            <div className="el-header-left">
              <button className="el-brand" onClick={() => onNavigate('/')} type="button">
                <span className="el-brand-icon">
                  <GraduationCap size={18} />
                </span>
                <span className="el-brand-text">EliteLearn</span>
              </button>

              <nav className="el-nav" aria-label="Main navigation">
                {NAV_ITEMS.map((item) => (
                  <button className="el-nav-link" key={item.label} onClick={() => onNavigate(item.path)} type="button">
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="el-header-actions">
              <div className="el-header-search" role="search">
                <Search className="el-search-icon" size={18} />
                <input className="el-header-search-input" placeholder="Search skills..." type="text" />
              </div>

              <button className="el-login-btn" onClick={() => onNavigate('/auth/signin')} type="button">
                Log in
              </button>

              <button className="el-primary-btn" onClick={() => onNavigate('/auth/signup')} type="button">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

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
                {featuredCourses.map((course) => {
                  const ratingPercent = toRatingPercent(course.averageRating);
                  const ratingLabel =
                    typeof course.averageRating === 'number' ? course.averageRating.toFixed(1) : 'No rating';
                  const instructorName = course.teacherName || 'Instructor';
                  const instructorInitial = instructorName.charAt(0).toUpperCase();

                  return (
                    <article className="el-course-card" key={course.id}>
                      <div className="el-course-image-wrap">
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
                            <span>{course.category || 'General'}</span>
                            <span>{course.reviewCount} reviews</span>
                          </div>
                          <div className="el-progress-bar">
                            <span className="el-progress-fill" style={{ width: `${ratingPercent}%` }}></span>
                          </div>
                        </div>

                        <div className="el-course-footer">
                          <p className="el-course-price">{course.enrolledCount} enrolled</p>
                          <button
                            className="el-cart-btn"
                            onClick={() => onNavigate(buildCourseUrl(course.id))}
                            type="button"
                          >
                            <ShoppingCart size={16} />
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

      <footer className="el-footer">
        <div className="el-container">
          <div className="el-footer-grid">
            <div className="el-footer-brand-col">
              <button className="el-footer-brand" onClick={() => onNavigate('/')} type="button">
                <span className="el-footer-brand-icon">
                  <GraduationCap size={18} />
                </span>
                <span className="el-footer-brand-text">EliteLearn</span>
              </button>

              <p className="el-footer-brand-copy">
                Empowering the next generation of digital leaders through premium education and global networking.
              </p>

              <div className="el-footer-socials">
                <button className="el-footer-social-btn" type="button"><Facebook size={18} /></button>
                <button className="el-footer-social-btn" type="button"><Twitter size={18} /></button>
                <button className="el-footer-social-btn" type="button"><Instagram size={18} /></button>
                <button className="el-footer-social-btn" type="button"><Linkedin size={18} /></button>
              </div>
            </div>

            {footerColumns.map((column) => (
              <div className="el-footer-links-col" key={column.title}>
                <h4>{column.title}</h4>
                <ul>
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <button onClick={() => onNavigate(link.path)} type="button">{link.label}</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="el-footer-bottom">
            <p>Copyright {currentYear} EliteLearn Inc. All rights reserved.</p>
            <div className="el-footer-meta-links">
              <button onClick={() => onNavigate('/privacy')} type="button">Security</button>
              <button onClick={() => onNavigate('/search')} type="button">Sitemap</button>
              <button onClick={() => onNavigate('/terms')} type="button">Legal</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
