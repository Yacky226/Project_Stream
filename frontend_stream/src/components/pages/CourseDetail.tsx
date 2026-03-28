import { PublicFooterBar } from '../layout/PublicFooterBar';
import { PublicHeaderBar } from '../layout/PublicHeaderBar';
import { CourseDetailContent } from './course-detail-page/components/CourseDetailContent';
import type { CourseDetailProps } from './course-detail-page/courseDetail.types';
import { useCourseDetailData } from './course-detail-page/useCourseDetailData';
import './CourseDetail.css';

export function CourseDetail({ courseId, onNavigate }: CourseDetailProps) {
  const model = useCourseDetailData({ courseId, onNavigate });

  if (!model.numericCourseId) {
    return (
      <div className="cdp-loading-page">
        <p>Invalid course identifier.</p>
      </div>
    );
  }

  if (model.isCourseLoading) {
    return (
      <div className="cdp-loading-page">
        <p>Loading course details...</p>
      </div>
    );
  }

  if (!model.courseDetails || model.courseError) {
    return (
      <div className="cdp-loading-page">
        <p>Course not found.</p>
        <button onClick={() => onNavigate('/catalog')} type="button">Back to catalog</button>
      </div>
    );
  }

  return (
    <div className="cdp-page">
      <PublicHeaderBar currentPath="/catalog" onNavigate={onNavigate} />
      <CourseDetailContent model={model} onNavigate={onNavigate} />
      <PublicFooterBar onNavigate={onNavigate} />
    </div>
  );
}
