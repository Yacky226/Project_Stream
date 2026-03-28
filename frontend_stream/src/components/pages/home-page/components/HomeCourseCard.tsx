import { ShoppingCart, Star } from 'lucide-react';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import type { LiveCourseDetails } from '../../../../types/live';
import {
  buildCourseUrl,
  toCourseBadge,
  toCourseCompletionRate,
  toCourseLevelLabel,
  toCoursePriceLabel,
  toCourseRatingLabel,
} from '../homePage.utils';

interface HomeCourseCardProps {
  course: LiveCourseDetails;
  index: number;
  onNavigate: (path: string) => void;
}

export function HomeCourseCard({ course, index, onNavigate }: HomeCourseCardProps) {
  const instructorName = course.teacherName || 'Instructor';
  const instructorInitial = instructorName.charAt(0).toUpperCase();
  const completionRate = toCourseCompletionRate(course, index);
  const ratingLabel = toCourseRatingLabel(course, index);
  const levelLabel = toCourseLevelLabel(course, index);
  const priceLabel = toCoursePriceLabel(course, index);
  const badgeLabel = toCourseBadge(index);

  return (
    <article className="el-course-card">
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
}
