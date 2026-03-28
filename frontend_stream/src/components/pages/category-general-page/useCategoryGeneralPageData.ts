import { useMemo } from 'react';
import { useGetCoursesQuery } from '../../../store/api/liveApi';
import { CATEGORY_ICON_ROTATION, DEFAULT_CATEGORY_IMAGE } from './categoryGeneral.data';
import type { CategoryGeneralPageData, CategoryStat } from './categoryGeneral.types';

export function useCategoryGeneralPageData(): CategoryGeneralPageData {
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

  const trending = useMemo(() => {
    return categoryStats.slice(0, 6).map((item, index) => ({
      ...item,
      Icon: CATEGORY_ICON_ROTATION[index % CATEGORY_ICON_ROTATION.length],
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
    return categoryStats.slice(0, 3).map((item: CategoryStat, index) => ({
      title: item.name,
      duration: `${4 + index} Months`,
      modules: `${8 + index * 2} Modules`,
      progress: index === 0 ? '45%' : index === 1 ? '15%' : 'Not started',
      progressWidth: index === 0 ? '45%' : index === 1 ? '15%' : '0%',
      image: DEFAULT_CATEGORY_IMAGE,
      learners: `${(item.count * 240).toLocaleString()} learners`,
    }));
  }, [categoryStats]);

  return {
    isLoading,
    totalCourses: courses.length,
    totalCategories: categoryStats.length,
    trending,
    premiumCourses,
    curatedPaths,
  };
}
