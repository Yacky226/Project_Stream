import { useMemo } from 'react';
import {
  ArrowRight,
  Clock3,
  Code2,
  Database,
  Layers3,
  Smartphone,
  Star,
  Terminal,
  TrendingUp,
} from 'lucide-react';
import { useGetCoursesQuery } from '../../store/api/liveApi';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { PublicFooterBar } from '../layout/PublicFooterBar';
import { PublicHeaderBar } from '../layout/PublicHeaderBar';
import './CategoryGeneralPage.css';

interface CategoryGeneralPageProps {
  onNavigate: (path: string) => void;
}

const DEFAULT_CATEGORY_IMAGE =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600&h=900&fit=crop';

const iconByIndex = [Code2, Terminal, Database, Smartphone, Layers3];

export function CategoryGeneralPage({ onNavigate }: CategoryGeneralPageProps) {
  const { data: courses = [], isLoading } = useGetCoursesQuery();

  const categoryStats = useMemo(() => {
    const stats = new Map<string, number>();
    courses.forEach((course) => {
      const key = course.category || 'General';
      stats.set(key, (stats.get(key) || 0) + 1);
    });
    return Array.from(stats.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [courses]);

  const totalCourses = courses.length;
  const totalCategories = categoryStats.length;

  const trending = useMemo(() => {
    return categoryStats.slice(0, 6).map((item, index) => ({
      ...item,
      Icon: iconByIndex[index % iconByIndex.length],
    }));
  }, [categoryStats]);

  const premiumCourses = useMemo(() => {
    return courses.slice(0, 6).map((course) => ({
      id: course.id,
      title: course.title,
      category: course.category || 'General',
      image: course.coverImage || DEFAULT_CATEGORY_IMAGE,
    }));
  }, [courses]);

  const curatedPaths = useMemo(() => {
    return categoryStats.slice(0, 3).map((item, index) => ({
      title: item.name,
      duration: `${4 + index} Months`,
      modules: `${8 + index * 2} Modules`,
      progress: index === 0 ? '45%' : index === 1 ? '15%' : 'Not started',
      progressWidth: index === 0 ? '45%' : index === 1 ? '15%' : '0%',
      image: DEFAULT_CATEGORY_IMAGE,
      learners: `${(item.count * 240).toLocaleString()} learners`,
    }));
  }, [categoryStats]);

  return (
    <div className="cg-page">
      <PublicHeaderBar currentPath="/courses/categories" onNavigate={onNavigate} />

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
                <p className="cg-stat-value">{isLoading ? '...' : totalCategories}</p>
                <p className="cg-stat-label">Live category groups</p>
              </article>

              <article className="cg-stat-card">
                <div className="cg-stat-head">
                  <Terminal className="h-5 w-5" />
                  Courses
                </div>
                <p className="cg-stat-value">{isLoading ? '...' : totalCourses}</p>
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

            {trending.length > 0 ? (
              <div className="cg-trending-grid">
                {trending.map((item) => {
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

            {curatedPaths.length > 0 ? (
              <div className="cg-paths-grid">
                {curatedPaths.map((path) => (
                  <article key={path.title} className="cg-path-card">
                    <div className="cg-path-media">
                      <ImageWithFallback alt={path.title} className="cg-path-image" src={path.image} />
                    </div>
                    <div className="cg-path-body">
                      <h3>{path.title}</h3>
                      <div className="cg-path-meta">
                        <span><Clock3 className="h-3.5 w-3.5" />{path.duration}</span>
                        <span><Layers3 className="h-3.5 w-3.5" />{path.modules}</span>
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
              <div className="cg-empty-state">No category data yet. Add backend courses to generate learning paths.</div>
            )}
          </div>
        </section>

        <section className="cg-section cg-section-muted">
          <div className="cg-shell">
            <div className="cg-section-head cg-section-head-stack">
              <h2>Premium Programming Courses</h2>
              <p>Courses are loaded directly from backend catalog data.</p>
            </div>

            {premiumCourses.length > 0 ? (
              <div className="cg-courses-grid">
                {premiumCourses.map((course) => (
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

      <PublicFooterBar onNavigate={onNavigate} />
    </div>
  );
}
