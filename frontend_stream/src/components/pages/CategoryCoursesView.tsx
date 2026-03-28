import { CategoryCoursesViewContent } from './category-courses-view/components/CategoryCoursesViewContent';
import type { CategoryCoursesViewProps } from './category-courses-view/categoryCoursesView.types';
import { useCategoryCoursesViewData } from './category-courses-view/useCategoryCoursesViewData';

export function CategoryCoursesView({
  title,
  subtitle,
  badgeLabel,
  badgeClassName,
  icon,
  matchesCategory,
  onNavigate,
}: CategoryCoursesViewProps) {
  const pageData = useCategoryCoursesViewData({ matchesCategory });

  return (
    <CategoryCoursesViewContent
      header={{ title, subtitle, badgeLabel, badgeClassName, icon }}
      data={pageData}
      onNavigate={onNavigate}
    />
  );
}
