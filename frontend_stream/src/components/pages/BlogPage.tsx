import { type FormEvent, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Clock3,
  Grid2x2,
  List,
  Mail,
  TrendingUp,
} from 'lucide-react';
import { useGetCoursesQuery } from '../../store/api/liveApi';
import { useSubscribeToNewsletterMutation } from '../../store/api/publicSupportApi';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { PublicFooterBar } from '../layout/PublicFooterBar';
import { PublicHeaderBar } from '../layout/PublicHeaderBar';
import './BlogPage.css';

interface BlogPageProps {
  onNavigate: (path: string) => void;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
}

const DEFAULT_POST_IMAGE =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600&h=900&fit=crop';

function formatDate(value?: string) {
  if (!value) return 'Recently';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Recently';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(parsed);
}

function estimateReadTime(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(4, Math.min(20, Math.ceil(words / 35)));
  return `${minutes} min read`;
}

export function BlogPage({ onNavigate }: BlogPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterFeedback, setNewsletterFeedback] = useState<string | null>(null);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);

  const [subscribeToNewsletter, { isLoading: isNewsletterSubmitting }] =
    useSubscribeToNewsletterMutation();

  const { data: courses = [] } = useGetCoursesQuery();

  const dynamicPosts = useMemo<BlogPost[]>(() => {
    return courses.slice(0, 10).map((course) => ({
      id: course.id,
      title: course.title,
      excerpt:
        course.description?.trim() ||
        'Discover practical insights and concrete guidance to progress faster in this domain.',
      category: course.category || 'General',
      date: formatDate(course.scheduledAt),
      readTime: estimateReadTime(course.description || course.title),
      image: course.coverImage || DEFAULT_POST_IMAGE,
    }));
  }, [courses]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    dynamicPosts.forEach((post) => {
      counts.set(post.category, (counts.get(post.category) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [dynamicPosts]);

  const heroPost = dynamicPosts[0];
  const popularToday = dynamicPosts.slice(1, 4);

  const filteredPosts = useMemo(() => {
    return dynamicPosts.filter((post) => {
      const byCategory = selectedCategory === 'all' || post.category === selectedCategory;
      const bySearch =
        searchTerm.trim().length === 0 ||
        `${post.title} ${post.excerpt} ${post.category}`.toLowerCase().includes(searchTerm.toLowerCase());
      return byCategory && bySearch;
    });
  }, [dynamicPosts, searchTerm, selectedCategory]);

  const handleNewsletterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const email = newsletterEmail.trim();
    if (!email) {
      setNewsletterFeedback(null);
      setNewsletterError('Please enter a valid email address.');
      return;
    }

    try {
      const result = await subscribeToNewsletter({
        email,
        sourcePage: 'BLOG_PAGE',
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
    <div className="bl-page">
      <PublicHeaderBar currentPath="/blog" onNavigate={onNavigate} />

      <main className="bl-main">
        <section className="bl-hero-section">
          <div className="bl-shell">
            {heroPost ? (
              <div className="bl-hero-card">
                <div className="bl-hero-overlay" />
                <ImageWithFallback src={heroPost.image} alt={heroPost.title} className="bl-hero-image" />
                <div className="bl-hero-content">
                  <div className="bl-hero-meta">
                    <span className="bl-hero-category">{heroPost.category}</span>
                    <span className="bl-hero-readtime">{heroPost.readTime}</span>
                  </div>
                  <h1 className="bl-hero-title">{heroPost.title}</h1>
                  <p className="bl-hero-excerpt">{heroPost.excerpt}</p>
                  <div className="bl-hero-actions">
                    <button
                      type="button"
                      className="bl-btn bl-btn-primary"
                      onClick={() => onNavigate(`/courses/${heroPost.id}`)}
                    >
                      Read Full Article
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bl-empty-state">
                No backend articles available yet. Add courses to see blog content.
              </div>
            )}
          </div>
        </section>

        <section className="bl-content-section">
          <div className="bl-shell">
            <div className="bl-toolbar">
              <input
                className="bl-control"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="bl-control"
              >
                <option value="all">All categories</option>
                {categoryCounts.map((category) => (
                  <option key={category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="bl-view-toggle">
                <button
                  type="button"
                  className={`bl-view-btn${viewMode === 'grid' ? ' is-active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <Grid2x2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className={`bl-view-btn${viewMode === 'list' ? ' is-active' : ''}`}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="bl-content-grid">
              <div className="bl-feed">
                <div className="bl-feed-head">
                  <h3>Latest Insights</h3>
                  <span>{filteredPosts.length} articles</span>
                </div>

                {filteredPosts.length > 0 ? (
                  <div className={`bl-posts${viewMode === 'list' ? ' is-list' : ''}`}>
                    {filteredPosts.map((post) => (
                      <article key={post.id} className="bl-post-card">
                        <div className="bl-post-media">
                          <ImageWithFallback src={post.image} alt={post.title} className="bl-post-image" />
                        </div>
                        <div className="bl-post-body">
                          <div className="bl-post-meta">
                            <span className="bl-post-category">{post.category}</span>
                            <span className="bl-post-date">- {post.date}</span>
                          </div>
                          <h4 className="bl-post-title">{post.title}</h4>
                          <p className="bl-post-excerpt">{post.excerpt}</p>
                          <div className="bl-post-foot">
                            <span className="bl-post-readtime">
                              <Clock3 className="h-4 w-4" />
                              {post.readTime}
                            </span>
                            <button
                              type="button"
                              className="bl-post-link"
                              onClick={() => onNavigate(`/courses/${post.id}`)}
                            >
                              Read More
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="bl-empty-state">No article matches your filters.</div>
                )}
              </div>

              <aside className="bl-sidebar">
                <section>
                  <h5 className="bl-side-title">
                    <BookOpen className="h-5 w-5 text-[#1152d4]" />
                    Categories
                  </h5>
                  <div className="bl-category-list">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('all')}
                      className={`bl-category-btn${selectedCategory === 'all' ? ' is-active' : ''}`}
                    >
                      <span>All categories</span>
                      <span className="bl-category-count">{dynamicPosts.length}</span>
                    </button>
                    {categoryCounts.map((category) => (
                      <button
                        key={category.name}
                        type="button"
                        onClick={() => setSelectedCategory(category.name)}
                        className={`bl-category-btn${selectedCategory === category.name ? ' is-active' : ''}`}
                      >
                        <span>{category.name}</span>
                        <span className="bl-category-count">{category.count}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <h5 className="bl-side-title">
                    <TrendingUp className="h-5 w-5 text-[#1152d4]" />
                    Popular Today
                  </h5>
                  <div className="bl-popular-list">
                    {popularToday.length ? (
                      popularToday.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onNavigate(`/courses/${item.id}`)}
                          className="bl-popular-item"
                        >
                          <div className="bl-popular-media">
                            <ImageWithFallback src={item.image} alt={item.title} className="bl-popular-image" />
                          </div>
                          <div className="bl-popular-copy">
                            <p className="bl-popular-title">{item.title}</p>
                            <p className="bl-popular-meta">
                              {item.category} - {item.readTime}
                            </p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="bl-empty-text">No popular article yet.</p>
                    )}
                  </div>
                </section>

                <section className="bl-newsletter">
                  <div className="bl-newsletter-icon">
                    <Mail className="h-6 w-6" />
                  </div>
                  <h5>Join Our Newsletter</h5>
                  <p>Get weekly educational insights, new course releases, and practical learning tips.</p>

                  <form className="bl-newsletter-form" onSubmit={handleNewsletterSubmit}>
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(event) => setNewsletterEmail(event.target.value)}
                      placeholder="Your email"
                      className="bl-newsletter-input"
                    />
                    <button type="submit" className="bl-btn bl-btn-light" disabled={isNewsletterSubmitting}>
                      {isNewsletterSubmitting ? 'Submitting...' : 'Subscribe'}
                    </button>
                  </form>

                  {newsletterFeedback && <p className="bl-newsletter-feedback">{newsletterFeedback}</p>}
                  {newsletterError && <p className="bl-newsletter-feedback is-error">{newsletterError}</p>}
                </section>

                <section className="bl-cta-panel">
                  <div className="bl-cta-copy">
                    <h6>Build a custom learning roadmap</h6>
                    <p>Need enterprise alignment? Let our team design the right training stack for you.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('/business')}
                    className="bl-btn bl-btn-secondary"
                  >
                    Explore Business <ArrowRight className="h-4 w-4" />
                  </button>
                </section>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <PublicFooterBar onNavigate={onNavigate} />
    </div>
  );
}
