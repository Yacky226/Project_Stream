import {
  ArrowRight,
  BookOpen,
  Clock3,
  Grid2x2,
  List,
  Mail,
  TrendingUp,
} from 'lucide-react';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import { PublicFooterBar } from '../../../layout/PublicFooterBar';
import { PublicHeaderBar } from '../../../layout/PublicHeaderBar';
import type { BlogPageDataModel } from '../blog.types';

interface BlogPageContentProps {
  model: BlogPageDataModel;
  onNavigate: (path: string) => void;
}

export function BlogPageContent({ model, onNavigate }: BlogPageContentProps) {
  return (
    <div className="bl-page">
      <PublicHeaderBar currentPath="/blog" onNavigate={onNavigate} />

      <main className="bl-main">
        <section className="bl-hero-section">
          <div className="bl-shell">
            {model.heroPost ? (
              <div className="bl-hero-card">
                <div className="bl-hero-overlay" />
                <ImageWithFallback
                  src={model.heroPost.image}
                  alt={model.heroPost.title}
                  className="bl-hero-image"
                />
                <div className="bl-hero-content">
                  <div className="bl-hero-meta">
                    <span className="bl-hero-category">{model.heroPost.category}</span>
                    <span className="bl-hero-readtime">{model.heroPost.readTime}</span>
                  </div>
                  <h1 className="bl-hero-title">{model.heroPost.title}</h1>
                  <p className="bl-hero-excerpt">{model.heroPost.excerpt}</p>
                  <div className="bl-hero-actions">
                    <button
                      type="button"
                      className="bl-btn bl-btn-primary"
                      onClick={() => onNavigate(`/courses/${model.heroPost?.id}`)}
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
                value={model.searchTerm}
                onChange={(event) => model.onSearchChange(event.target.value)}
              />
              <select
                value={model.selectedCategory}
                onChange={(event) => model.onCategoryChange(event.target.value)}
                className="bl-control"
              >
                <option value="all">All categories</option>
                {model.categoryCounts.map((category) => (
                  <option key={category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="bl-view-toggle">
                <button
                  type="button"
                  className={`bl-view-btn${model.viewMode === 'grid' ? ' is-active' : ''}`}
                  onClick={() => model.onViewModeChange('grid')}
                  aria-label="Grid view"
                >
                  <Grid2x2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className={`bl-view-btn${model.viewMode === 'list' ? ' is-active' : ''}`}
                  onClick={() => model.onViewModeChange('list')}
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
                  <span>{model.filteredPosts.length} articles</span>
                </div>

                {model.filteredPosts.length > 0 ? (
                  <div className={`bl-posts${model.viewMode === 'list' ? ' is-list' : ''}`}>
                    {model.filteredPosts.map((post) => (
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
                      onClick={() => model.onCategoryChange('all')}
                      className={`bl-category-btn${model.selectedCategory === 'all' ? ' is-active' : ''}`}
                    >
                      <span>All categories</span>
                      <span className="bl-category-count">{model.dynamicPosts.length}</span>
                    </button>
                    {model.categoryCounts.map((category) => (
                      <button
                        key={category.name}
                        type="button"
                        onClick={() => model.onCategoryChange(category.name)}
                        className={`bl-category-btn${model.selectedCategory === category.name ? ' is-active' : ''}`}
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
                    {model.popularToday.length ? (
                      model.popularToday.map((item) => (
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

                  <form className="bl-newsletter-form" onSubmit={model.onNewsletterSubmit}>
                    <input
                      type="email"
                      value={model.newsletterEmail}
                      onChange={(event) => model.onNewsletterEmailChange(event.target.value)}
                      placeholder="Your email"
                      className="bl-newsletter-input"
                    />
                    <button type="submit" className="bl-btn bl-btn-light" disabled={model.isNewsletterSubmitting}>
                      {model.isNewsletterSubmitting ? 'Submitting...' : 'Subscribe'}
                    </button>
                  </form>

                  {model.newsletterFeedback && <p className="bl-newsletter-feedback">{model.newsletterFeedback}</p>}
                  {model.newsletterError && <p className="bl-newsletter-feedback is-error">{model.newsletterError}</p>}
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
