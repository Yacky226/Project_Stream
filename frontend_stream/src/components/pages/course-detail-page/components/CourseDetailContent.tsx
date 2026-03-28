import {
  BookOpen,
  Check,
  ChevronRight,
  Play,
  Star,
} from 'lucide-react';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import { formatMonthYear, lessonTypeLabel, toMinutesText } from '../courseDetail.utils';
import type { CourseDetailDataModel } from '../useCourseDetailData';

interface CourseDetailContentProps {
  model: CourseDetailDataModel;
  onNavigate: (path: string) => void;
}

export function CourseDetailContent({ model, onNavigate }: CourseDetailContentProps) {
  if (!model.courseDetails) {
    return null;
  }

  const course = model.courseDetails;

  return (
    <main className="cdp-main">
      <section className="cdp-hero">
        <div className="cdp-hero-bg">
          <ImageWithFallback alt="Course hero background" src={model.coverImage} />
        </div>

        <div className="cdp-container cdp-hero-grid">
          <div className="cdp-hero-content">
            <nav className="cdp-breadcrumb">
              <span>{course.category || 'General'}</span>
              <span>/</span>
              <span>Masterclass</span>
            </nav>

            <h1>{course.title}</h1>
            <p>{course.description}</p>

            <div className="cdp-hero-metrics">
              <div>
                <span>
                  <Star size={14} />
                  {model.averageRating.toFixed(1)}
                </span>
                <small>({model.reviewCount.toLocaleString()} reviews)</small>
              </div>
              <div>Enrolled: {model.enrolledCount.toLocaleString()} students</div>
              <div>Last updated: {model.lastUpdated}</div>
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
                <strong>{course.teacherName || `Instructor #${course.teacherId}`}</strong>
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
              {model.sortedSections.flatMap((section) => section.lessons).slice(0, 6).map((lesson) => (
                <div key={lesson.id}>
                  <Check size={16} />
                  <p>{lesson.title}</p>
                </div>
              ))}
              {model.sortedSections.length === 0 && (
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
                {model.sortedSections.length} Sections - {model.totalLessons} Lessons -{' '}
                {toMinutesText(model.totalMinutes)} total
              </p>
            </div>

            <div className="cdp-section-list">
              {model.visibleSections.map((section) => {
                const isExpanded = model.expandedSectionIds.includes(section.id);
                const sectionMinutes = section.lessons.reduce((sum, lesson) => {
                  return sum + (lesson.durationMinutes || 0);
                }, 0);

                return (
                  <div className="cdp-section-card" key={section.id}>
                    <button
                      className="cdp-section-toggle"
                      onClick={() => model.toggleSection(section.id)}
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
                              {lesson.durationMinutes
                                ? toMinutesText(lesson.durationMinutes)
                                : lessonTypeLabel(lesson.type)}
                            </small>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {model.sortedSections.length > 3 && (
              <button
                className="cdp-show-all"
                onClick={() => model.setShowAllSections((previous) => !previous)}
                type="button"
              >
                {model.showAllSections
                  ? 'Show fewer sections'
                  : `Show all ${model.sortedSections.length} sections`}
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
                <h4>{course.teacherName || `Instructor #${course.teacherId}`}</h4>
                <p className="cdp-instructor-subtitle">
                  {course.teacherSpeciality || 'Senior mentor and industry expert'}
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
              <ImageWithFallback alt="Course preview" src={model.coverImage} />
              <button
                onClick={() => {
                  if (model.canAccessLiveSession) {
                    onNavigate(
                      model.activeLiveSession
                        ? `/courses/${model.courseId}/live/${model.activeLiveSession.id}`
                        : `/courses/${model.courseId}/live`,
                    );
                    return;
                  }
                  void model.handleEnroll();
                }}
                type="button"
              >
                <Play size={18} />
              </button>
              <p>{model.canAccessLiveSession ? 'Preview this course' : 'Enroll to access live'}</p>
            </div>

            <div className="cdp-enroll-body">
              <div className="cdp-pricing">
                <strong>Included</strong>
                <small>Enroll to start instantly</small>
              </div>

              <div className="cdp-enroll-actions">
                {course.isEnrolled ? (
                  <button onClick={() => onNavigate(`/courses/${model.courseId}/live`)} type="button">
                    Continue Learning
                  </button>
                ) : (
                  <button disabled={model.isEnrolling} onClick={() => void model.handleEnroll()} type="button">
                    {model.isEnrolling ? 'Processing...' : 'Buy Now'}
                  </button>
                )}

                <button
                  disabled={model.isEnrolling}
                  onClick={() => void model.handleEnroll()}
                  type="button"
                >
                  Add to Cart
                </button>
              </div>

              <p className="cdp-guarantee">30-Day Money-Back Guarantee</p>

              <div className="cdp-includes">
                <p>This course includes:</p>
                <ul>
                  <li>{toMinutesText(model.totalMinutes)} on-demand video</li>
                  <li>{model.totalLessons} lectures and resources</li>
                  <li>Full lifetime access</li>
                  <li>Access on mobile and desktop</li>
                  <li>Certificate of completion</li>
                  <li>{model.sessions.length} live session(s)</li>
                </ul>
              </div>

              {model.activeLiveSession && model.canAccessLiveSession && (
                <button
                  className="cdp-live-btn"
                  onClick={() => onNavigate(`/courses/${model.courseId}/live/${model.activeLiveSession.id}`)}
                  type="button"
                >
                  Join Live Session
                </button>
              )}

              {model.enrollError && <p className="cdp-error">{model.enrollError}</p>}
            </div>
          </div>
        </aside>
      </section>

      <section className="cdp-reviews" id="reviews">
        <div className="cdp-container cdp-reviews-grid">
          <div className="cdp-rating-summary">
            <h3>Student Feedback</h3>
            <strong>{model.averageRating.toFixed(1)}</strong>
            <div className="cdp-stars-row">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star className={index < Math.round(model.averageRating) ? 'is-fill' : ''} key={index} size={16} />
              ))}
            </div>
            <small>Course Rating</small>

            <div className="cdp-bars">
              <div><span style={{ width: `${model.ratingDistribution.top}%` }}></span><small>{model.ratingDistribution.top}%</small></div>
              <div><span style={{ width: `${model.ratingDistribution.middle}%` }}></span><small>{model.ratingDistribution.middle}%</small></div>
              <div><span style={{ width: `${model.ratingDistribution.low}%` }}></span><small>{model.ratingDistribution.low}%</small></div>
            </div>
          </div>

          <div className="cdp-review-cards">
            {model.reviewsLoading && <p className="cdp-state-inline">Loading reviews...</p>}
            {!model.reviewsLoading && model.previewReviews.length === 0 && (
              <p className="cdp-state-inline">No student feedback available yet.</p>
            )}
            {model.previewReviews.map((review) => (
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
  );
}
