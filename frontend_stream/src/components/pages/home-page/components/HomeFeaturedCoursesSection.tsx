import { ArrowRight } from 'lucide-react';
import type { HomePageDataModel } from '../useHomePageData';
import { HomeCourseCard } from './HomeCourseCard';

interface HomeFeaturedCoursesSectionProps {
  model: HomePageDataModel;
}

export function HomeFeaturedCoursesSection({ model }: HomeFeaturedCoursesSectionProps) {
  return (
    <section className="el-courses-section">
      <div className="el-container">
        <div className="el-section-header">
          <div>
            <h2 className="el-section-title">Featured Courses</h2>
            <p className="el-section-subtitle">Live data loaded from the backend catalog.</p>
          </div>
          <button className="el-view-all" onClick={() => model.onNavigate('/catalog')} type="button">
            View all courses <ArrowRight size={16} />
          </button>
        </div>

        {model.isFeaturedLoading && <p className="el-data-state">Loading featured courses...</p>}
        {!model.isFeaturedLoading && model.isCoursesError && (
          <p className="el-data-state">Unable to load featured courses.</p>
        )}
        {!model.isFeaturedLoading && !model.isCoursesError && model.featuredCourses.length === 0 && (
          <p className="el-data-state">No featured course available right now.</p>
        )}

        {!model.isFeaturedLoading && model.featuredCourses.length > 0 && (
          <div className="el-course-grid">
            {model.featuredCourses.map((course, index) => (
              <HomeCourseCard
                key={course.id}
                course={course}
                index={index}
                onNavigate={model.onNavigate}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
