import { useEffect, useMemo, useState } from 'react';
import {
  editorialPosts,
  getEditorialCategories,
  getFeaturedEditorialPost,
  getPopularEditorialPosts,
  type EditorialPost,
} from '../../../lib/editorialContent';
import { copyToClipboard } from '../../../lib/utils';
import { useGetCoursesQuery } from '../../../store/api/liveApi';
import { useStudentSpaceData } from '../../student/StudentSpaceShared';
import type { StudentCommunityDataModel } from './studentCommunity.types';
import { buildShareUrl, filterEditorialPosts } from './studentCommunity.utils';

export function useStudentCommunityData(): StudentCommunityDataModel {
  const shared = useStudentSpaceData();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(4);
  const [selectedPost, setSelectedPost] = useState<EditorialPost | null>(null);

  const ready = shared.status === 'ready' && Boolean(shared.dashboard);
  const { data: catalogCourses = [] } = useGetCoursesQuery(undefined, {
    skip: !ready,
  });

  const categories = useMemo(() => getEditorialCategories(editorialPosts), []);
  const featuredPost = useMemo(
    () => getFeaturedEditorialPost(editorialPosts) || editorialPosts[0],
    [],
  );
  const popularPosts = useMemo(() => getPopularEditorialPosts(3, editorialPosts), []);
  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredPosts = useMemo(
    () => filterEditorialPosts(editorialPosts, activeCategory, normalizedSearch),
    [activeCategory, normalizedSearch],
  );

  const showHero = activeCategory === 'all' && !normalizedSearch;
  const listPosts = useMemo(
    () => (showHero ? filteredPosts.filter((post) => post.id !== featuredPost.id) : filteredPosts),
    [featuredPost.id, filteredPosts, showHero],
  );
  const visiblePosts = useMemo(() => listPosts.slice(0, visibleCount), [listPosts, visibleCount]);
  const hasMore = visibleCount < listPosts.length;

  useEffect(() => {
    setVisibleCount(4);
  }, [activeCategory, searchQuery]);

  const enrolledCourseIds = useMemo(
    () => new Set((shared.dashboard?.courses || []).map((course) => String(course.id))),
    [shared.dashboard?.courses],
  );

  const currentCategories = useMemo(
    () => new Set((shared.dashboard?.courses || []).map((course) => course.category.toLowerCase())),
    [shared.dashboard?.courses],
  );

  const learningPicks = useMemo(() => {
    return catalogCourses
      .filter((course) => !enrolledCourseIds.has(String(course.id)))
      .sort((left, right) => {
        const leftMatch = currentCategories.has(left.category.toLowerCase()) ? 1 : 0;
        const rightMatch = currentCategories.has(right.category.toLowerCase()) ? 1 : 0;
        if (leftMatch !== rightMatch) {
          return rightMatch - leftMatch;
        }
        return new Date(right.scheduledAt).getTime() - new Date(left.scheduledAt).getTime();
      })
      .slice(0, 3);
  }, [catalogCourses, currentCategories, enrolledCourseIds]);

  const handleShare = async (post: EditorialPost) => {
    const shareUrl = buildShareUrl(post.id);

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: post.title, text: post.excerpt, url: shareUrl });
        return;
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return;
        }
      }
    }

    await copyToClipboard(shareUrl);
  };

  const openPost = (post: EditorialPost) => {
    setSelectedPost(post);
  };

  const closePost = () => {
    setSelectedPost(null);
  };

  const loadMore = () => {
    setVisibleCount((current) => current + 4);
  };

  return {
    activeCategory,
    categories,
    featuredPost,
    handleShare,
    hasMore,
    learningPicks,
    loadMore,
    openPost,
    popularPosts,
    ready,
    searchQuery,
    selectedPost,
    setActiveCategory,
    setSearchQuery,
    shared,
    showHero,
    visibleCount,
    visiblePosts,
    closePost,
  };
}
