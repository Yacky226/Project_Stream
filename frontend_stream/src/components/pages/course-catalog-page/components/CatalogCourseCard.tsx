import { Star } from 'lucide-react';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import type { CatalogCourse } from '../courseCatalog.types';
import { formatPrice } from '../courseCatalog.utils';

interface CatalogCourseCardProps {
  course: CatalogCourse;
  onOpenCourse: (courseId: string) => void;
}

export function CatalogCourseCard({ course, onOpenCourse }: CatalogCourseCardProps) {
  return (
    <article className="ccp-card">
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
          <button onClick={() => onOpenCourse(course.id)} type="button">
            View Details
          </button>
        </div>
      </div>
    </article>
  );
}
