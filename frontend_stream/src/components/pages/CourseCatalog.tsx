import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Star,
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useGetActiveSessionsQuery, useGetCoursesQuery } from '../../store/api/liveApi';
import { buildApiUrl } from '../../lib/api-base-url';
import type { BackendCourseDetailsDTO, LiveCourse, LiveCourseDetails, LiveSession } from '../../types/live';
import { mapCourseDetails } from '../../types/live';
import { PublicFooterBar } from '../layout/PublicFooterBar';
import { PublicHeaderBar } from '../layout/PublicHeaderBar';
import './CourseCatalog.css';

interface CourseCatalogProps {
  currentPath?: string;
  onNavigate: (path: string) => void;
}

interface CatalogCourse {
  category: string;
  description: string;
  durationHours: number;
  id: string;
  image: string;
  isLive: boolean;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  price: number;
  rating: number;
  reviews: number;
  scheduledAt: string;
  students: number;
  teacherName: string;
  title: string;
}

type SortBy = 'popular' | 'newest' | 'price-asc' | 'price-desc';
type PriceFilter = 'all' | 'free' | 'paid';

const coursesPerPage = 12;
const levelOptions: Array<CatalogCourse['level']> = ['Beginner', 'Intermediate', 'Advanced'];
const DEFAULT_COURSE_IMAGE =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600&h=900&fit=crop';

function inferLevel(title: string, category: string, durationMinutes: number | null): CatalogCourse['level'] {
  const text = `${title} ${category}`.toLowerCase();
  if (text.includes('advanced') || text.includes('expert') || text.includes('pro')) {
    return 'Advanced';
  }
  if (text.includes('beginner') || text.includes('starter') || text.includes('intro')) {
    return 'Beginner';
  }
  if ((durationMinutes ?? 0) >= 420) {
    return 'Advanced';
  }
  if ((durationMinutes ?? 0) <= 120 && durationMinutes !== null) {
    return 'Beginner';
  }
  return 'Intermediate';
}

function formatPrice(price: number): string {
  if (price <= 0) {
    return 'Free';
  }
  return `$${price.toFixed(2)}`;
}

function isLiveForCourse(courseId: string, sessions: LiveSession[]): boolean {
  return sessions.some(
    (session) =>
      String(session.courseId) === String(courseId) && (session.isLive || session.status === 'LIVE'),
  );
}

function toCatalogCourse(course: LiveCourse, details: LiveCourseDetails | undefined, sessions: LiveSession[]): CatalogCourse {
  const durationMinutes = details?.durationMinutes ?? null;
  return {
    category: course.category || 'General',
    description: course.description || 'Course description coming soon.',
    durationHours: Math.max(1, Math.round((durationMinutes ?? 150) / 60)),
    id: course.id,
    image: details?.coverImage || DEFAULT_COURSE_IMAGE,
    isLive: isLiveForCourse(course.id, sessions),
    level: inferLevel(course.title, course.category || '', durationMinutes),
    price: 0,
    rating: details?.averageRating ?? 0,
    reviews: details?.reviewCount ?? 0,
    scheduledAt: course.scheduledAt,
    students: details?.enrolledCount ?? 0,
    teacherName: details?.teacherName || `Instructor #${course.teacherId}`,
    title: course.title || `Course #${course.id}`,
  };
}

export function CourseCatalog({ currentPath = '/catalog', onNavigate }: CourseCatalogProps) {
  const [searchText, setSearchText] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [selectedLevels, setSelectedLevels] = useState<Array<CatalogCourse['level']>>([]);
  const [minRating, setMinRating] = useState(0);
  const [maxDuration, setMaxDuration] = useState(40);
  const [sortBy, setSortBy] = useState<SortBy>('popular');
  const [page, setPage] = useState(1);

  const { data: courses = [], isError, isLoading } = useGetCoursesQuery();
  const { data: activeSessions = [] } = useGetActiveSessionsQuery();

  const [detailsById, setDetailsById] = useState<Record<string, LiveCourseDetails>>({});
  const pendingDetails = useRef<Set<string>>(new Set());

  const categories = useMemo(() => {
    return Array.from(new Set(courses.map((course) => course.category).filter(Boolean))).sort();
  }, [courses]);

  const normalizedCourses = useMemo(() => {
    return courses.map((course) => toCatalogCourse(course, detailsById[course.id], activeSessions));
  }, [courses, detailsById, activeSessions]);

  const filteredCourses = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    const filtered = normalizedCourses.filter((course) => {
      if (query) {
        const matchesQuery =
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          course.teacherName.toLowerCase().includes(query) ||
          course.category.toLowerCase().includes(query);
        if (!matchesQuery) {
          return false;
        }
      }

      if (selectedCategories.length > 0 && !selectedCategories.includes(course.category)) {
        return false;
      }

      if (priceFilter === 'free' && course.price > 0) {
        return false;
      }

      if (priceFilter === 'paid' && course.price <= 0) {
        return false;
      }

      if (selectedLevels.length > 0 && !selectedLevels.includes(course.level)) {
        return false;
      }

      if (minRating > 0 && course.rating < minRating) {
        return false;
      }

      if (course.durationHours > maxDuration) {
        return false;
      }

      return true;
    });

    filtered.sort((left, right) => {
      if (sortBy === 'newest') {
        return new Date(right.scheduledAt).getTime() - new Date(left.scheduledAt).getTime();
      }
      if (sortBy === 'price-asc') {
        return left.price - right.price;
      }
      if (sortBy === 'price-desc') {
        return right.price - left.price;
      }
      return right.students - left.students;
    });

    return filtered;
  }, [
    maxDuration,
    minRating,
    normalizedCourses,
    priceFilter,
    searchText,
    selectedCategories,
    selectedLevels,
    sortBy,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / coursesPerPage));
  const paginatedCourses = useMemo(() => {
    const start = (page - 1) * coursesPerPage;
    return filteredCourses.slice(start, start + coursesPerPage);
  }, [filteredCourses, page]);

  useEffect(() => {
    setPage(1);
  }, [searchText, selectedCategories, priceFilter, selectedLevels, minRating, maxDuration, sortBy]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    const missingIds = paginatedCourses
      .map((course) => course.id)
      .filter((id) => !detailsById[id] && !pendingDetails.current.has(id));

    if (missingIds.length === 0) {
      return;
    }

    const controller = new AbortController();
    missingIds.forEach((id) => pendingDetails.current.add(id));

    const load = async () => {
      try {
        const entries = await Promise.all(
          missingIds.map(async (id) => {
            const response = await fetch(buildApiUrl(`/api/cours/${id}/details`), {
              headers: { Accept: 'application/json' },
              signal: controller.signal,
            });

            if (!response.ok) {
              return null;
            }

            const payload = (await response.json()) as BackendCourseDetailsDTO;
            const mapped = mapCourseDetails(payload);
            return [id, mapped] as const;
          }),
        );

        const validEntries = entries.filter((entry): entry is readonly [string, LiveCourseDetails] => Boolean(entry));
        if (validEntries.length > 0) {
          setDetailsById((previous) => {
            const next = { ...previous };
            validEntries.forEach(([id, details]) => {
              next[id] = details;
            });
            return next;
          });
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          // noop
        }
      } finally {
        missingIds.forEach((id) => pendingDetails.current.delete(id));
      }
    };

    void load();

    return () => {
      controller.abort();
      missingIds.forEach((id) => pendingDetails.current.delete(id));
    };
  }, [detailsById, paginatedCourses]);

  const clearFilters = () => {
    setSearchText('');
    setSelectedCategories([]);
    setPriceFilter('all');
    setSelectedLevels([]);
    setMinRating(0);
    setMaxDuration(40);
    setSortBy('popular');
  };

  return (
    <div className="ccp-page">
      <PublicHeaderBar currentPath={currentPath} onNavigate={onNavigate} />

      <main className="ccp-main ccp-container">
        <aside className="ccp-sidebar">
          <div className="ccp-sidebar-card">
            <div className="ccp-sidebar-head">
              <h3>Filters</h3>
              <button onClick={clearFilters} type="button">Clear all</button>
            </div>

            <section>
              <h4>Category</h4>
              <div className="ccp-filter-list">
                {categories.map((category) => (
                  <label key={category}>
                    <input
                      checked={selectedCategories.includes(category)}
                      onChange={(event) => {
                        setSelectedCategories((previous) => {
                          if (event.target.checked) {
                            return [...previous, category];
                          }
                          return previous.filter((item) => item !== category);
                        });
                      }}
                      type="checkbox"
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            </section>

            <section>
              <h4>Price</h4>
              <div className="ccp-filter-list">
                <label>
                  <input
                    checked={priceFilter === 'all'}
                    name="price"
                    onChange={() => setPriceFilter('all')}
                    type="radio"
                  />
                  <span>Any</span>
                </label>
                <label>
                  <input
                    checked={priceFilter === 'free'}
                    name="price"
                    onChange={() => setPriceFilter('free')}
                    type="radio"
                  />
                  <span>Free</span>
                </label>
                <label>
                  <input
                    checked={priceFilter === 'paid'}
                    name="price"
                    onChange={() => setPriceFilter('paid')}
                    type="radio"
                  />
                  <span>Paid</span>
                </label>
              </div>
            </section>

            <section>
              <h4>Level</h4>
              <div className="ccp-filter-list">
                {levelOptions.map((level) => (
                  <label key={level}>
                    <input
                      checked={selectedLevels.includes(level)}
                      onChange={(event) => {
                        setSelectedLevels((previous) => {
                          if (event.target.checked) {
                            return [...previous, level];
                          }
                          return previous.filter((item) => item !== level);
                        });
                      }}
                      type="checkbox"
                    />
                    <span>{level}</span>
                  </label>
                ))}
              </div>
            </section>

            <section>
              <h4>Rating</h4>
              <div className="ccp-filter-list">
                <label>
                  <input
                    checked={minRating === 0}
                    name="rating"
                    onChange={() => setMinRating(0)}
                    type="radio"
                  />
                  <span>All ratings</span>
                </label>
                <label>
                  <input
                    checked={minRating === 4}
                    name="rating"
                    onChange={() => setMinRating(4)}
                    type="radio"
                  />
                  <span>4.0 and up</span>
                </label>
                <label>
                  <input
                    checked={minRating === 4.5}
                    name="rating"
                    onChange={() => setMinRating(4.5)}
                    type="radio"
                  />
                  <span>4.5 and up</span>
                </label>
              </div>
            </section>

            <section>
              <h4>Duration (max)</h4>
              <input
                max={40}
                min={1}
                onChange={(event) => setMaxDuration(Number(event.target.value))}
                type="range"
                value={maxDuration}
              />
              <div className="ccp-duration-range">
                <span>1h</span>
                <span>{maxDuration}h</span>
              </div>
            </section>
          </div>
        </aside>

        <section className="ccp-content">
          <div className="ccp-content-head">
            <div>
              <h1>Course Catalog</h1>
              <p>Showing {filteredCourses.length} of {courses.length} courses</p>
            </div>

            <div className="ccp-sort">
              <span>Sort by:</span>
              <select
                onChange={(event) => setSortBy(event.target.value as SortBy)}
                value={sortBy}
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {isLoading && <p className="ccp-state">Loading courses...</p>}
          {isError && <p className="ccp-state">Unable to load courses right now.</p>}
          {!isLoading && !isError && paginatedCourses.length === 0 && (
            <p className="ccp-state">No course matches your filters.</p>
          )}

          {!isLoading && paginatedCourses.length > 0 && (
            <div className="ccp-grid">
              {paginatedCourses.map((course) => (
                <article className="ccp-card" key={course.id}>
                  <div className="ccp-card-media">
                    <ImageWithFallback alt={course.title} className="ccp-card-image" src={course.image} />
                    <span className="ccp-card-category">{course.category}</span>
                    {course.isLive && <span className="ccp-card-live">Live</span>}
                  </div>

                  <div className="ccp-card-body">
                    <h3>{course.title}</h3>

                    <div className="ccp-card-rating">
                      <Star size={14} />
                      {course.reviews > 0 ? (
                        <>
                          <span>{course.rating.toFixed(1)}</span>
                          <small>({course.reviews.toLocaleString()} reviews)</small>
                        </>
                      ) : (
                        <small>No reviews yet</small>
                      )}
                    </div>

                    <p className="ccp-card-meta">{course.teacherName}</p>
                    <p className="ccp-card-meta">
                      {course.level} - {course.durationHours}h - {course.students.toLocaleString()} students
                    </p>

                    <div className="ccp-card-footer">
                      <strong>{formatPrice(course.price)}</strong>
                      <button onClick={() => onNavigate(`/courses/${course.id}`)} type="button">
                        View Details
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="ccp-pagination">
            <button
              disabled={page <= 1}
              onClick={() => setPage((previous) => Math.max(1, previous - 1))}
              type="button"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages })
              .slice(Math.max(0, page - 3), Math.max(0, page - 3) + 5)
              .map((_, index) => {
                const pageNumber = Math.max(1, page - 2) + index;
                if (pageNumber > totalPages) {
                  return null;
                }
                return (
                  <button
                    className={pageNumber === page ? 'is-active' : ''}
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    type="button"
                  >
                    {pageNumber}
                  </button>
                );
              })}

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((previous) => Math.min(totalPages, previous + 1))}
              type="button"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </section>
      </main>

      <PublicFooterBar onNavigate={onNavigate} />
    </div>
  );
}

