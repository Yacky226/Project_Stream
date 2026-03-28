import { ArrowRight, Clock3, Code2, Layers3, Star, Terminal, TrendingUp } from 'lucide-react';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import type { CategoryGeneralPageData } from '../categoryGeneral.types';

interface CategoryGeneralContentProps {
  data: CategoryGeneralPageData;
  onNavigate: (path: string) => void;
}

export function CategoryGeneralContent({ data, onNavigate }: CategoryGeneralContentProps) {
  return (
    <main className="cg-main">
      <section className="cg-hero">
        <div className="cg-shell cg-hero-grid">
          <div className="cg-hero-copy">
            <div className="cg-badge">
              <Code2 className="h-4 w-4" />
              Specialized Engineering Track
            </div>

            <h1 className="cg-hero-title">
              Master the <span>Art of Code</span>
            </h1>

            <p className="cg-hero-subtitle">
              Category pages are synced directly from backend courses so your learning tracks always
              match the latest catalog updates.
            </p>

            <div className="cg-hero-actions">
              <button
                type="button"
                className="cg-btn cg-btn-primary"
                onClick={() => onNavigate('/catalog')}
              >
                Explore Catalog
              </button>
              <button
                type="button"
                className="cg-btn cg-btn-secondary"
                onClick={() => onNavigate('/search')}
              >
                Find a Track
              </button>
            </div>
          </div>

          <div className="cg-stats-grid">
            <article className="cg-stat-card">
              <div className="cg-stat-head">
                <Layers3 className="h-5 w-5" />
                Categories
              </div>
              <p className="cg-stat-value">{data.isLoading ? '...' : data.totalCategories}</p>
              <p className="cg-stat-label">Live category groups</p>
            </article>

            <article className="cg-stat-card">
              <div className="cg-stat-head">
                <Terminal className="h-5 w-5" />
                Courses
              </div>
              <p className="cg-stat-value">{data.isLoading ? '...' : data.totalCourses}</p>
              <p className="cg-stat-label">Published in catalog</p>
            </article>

            <article className="cg-stat-card">
              <div className="cg-stat-head">
                <TrendingUp className="h-5 w-5" />
                Momentum
              </div>
              <p className="cg-stat-value">+24%</p>
              <p className="cg-stat-label">Average completion trend</p>
            </article>
          </div>
        </div>
      </section>

      <section className="cg-section cg-section-muted">
        <div className="cg-shell">
          <div className="cg-section-head">
            <h2>Trending Technologies</h2>
            <button className="cg-inline-link" onClick={() => onNavigate('/catalog')} type="button">
              View all <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {data.trending.length > 0 ? (
            <div className="cg-trending-grid">
              {data.trending.map((item) => {
                const Icon = item.Icon;
                return (
                  <article key={item.name} className="cg-trending-card">
                    <div className="cg-trending-icon">
                      <Icon className="h-7 w-7" />
                    </div>
                    <p className="cg-trending-title">{item.name}</p>
                    <p className="cg-trending-count">{item.count} course(s)</p>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="cg-empty-state">No categories yet. Add courses to generate trend cards.</div>
          )}
        </div>
      </section>

      <section className="cg-section">
        <div className="cg-shell">
          <div className="cg-section-head cg-section-head-stack">
            <h2>Curated Learning Paths</h2>
            <p>Sequenced modules generated from active course categories.</p>
          </div>

          {data.curatedPaths.length > 0 ? (
            <div className="cg-paths-grid">
              {data.curatedPaths.map((path) => (
                <article key={path.title} className="cg-path-card">
                  <div className="cg-path-media">
                    <ImageWithFallback alt={path.title} className="cg-path-image" src={path.image} />
                  </div>
                  <div className="cg-path-body">
                    <h3>{path.title}</h3>
                    <div className="cg-path-meta">
                      <span>
                        <Clock3 className="h-3.5 w-3.5" />
                        {path.duration}
                      </span>
                      <span>
                        <Layers3 className="h-3.5 w-3.5" />
                        {path.modules}
                      </span>
                    </div>
                    <p className="cg-path-learners">{path.learners}</p>
                    <div className="cg-progress-wrap">
                      <div className="cg-progress-meta">
                        <span>Progress</span>
                        <span>{path.progress}</span>
                      </div>
                      <div className="cg-progress-bar">
                        <div className="cg-progress-fill" style={{ width: path.progressWidth }} />
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="cg-empty-state">
              No category data yet. Add backend courses to generate learning paths.
            </div>
          )}
        </div>
      </section>

      <section className="cg-section cg-section-muted">
        <div className="cg-shell">
          <div className="cg-section-head cg-section-head-stack">
            <h2>Premium Programming Courses</h2>
            <p>Courses are loaded directly from backend catalog data.</p>
          </div>

          {data.premiumCourses.length > 0 ? (
            <div className="cg-courses-grid">
              {data.premiumCourses.map((course) => (
                <article key={course.id} className="cg-course-card">
                  <div className="cg-course-media">
                    <ImageWithFallback alt={course.title} className="cg-course-image" src={course.image} />
                  </div>
                  <div className="cg-course-body">
                    <span className="cg-course-category">{course.category}</span>
                    <h4>{course.title}</h4>
                    <div className="cg-course-foot">
                      <div className="cg-course-rating">
                        <Star className="h-4 w-4" />
                        Backend course
                      </div>
                      <button
                        type="button"
                        className="cg-post-link"
                        onClick={() => onNavigate(`/courses/${course.id}`)}
                      >
                        View
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="cg-empty-state">No courses available in catalog yet.</div>
          )}
        </div>
      </section>
    </main>
  );
}
