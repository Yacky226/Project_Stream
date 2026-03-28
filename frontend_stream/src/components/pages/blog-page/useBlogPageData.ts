import { type FormEvent, useMemo, useState } from 'react';
import { useGetCoursesQuery } from '../../../store/api/liveApi';
import { useSubscribeToNewsletterMutation } from '../../../store/api/publicSupportApi';
import type { LiveCourse } from '../../../types/live';
import { DEFAULT_BLOG_POST_IMAGE } from './blog.data';
import type { BlogPageDataModel, BlogViewMode } from './blog.types';
import { buildCategoryCounts, filterBlogPosts, mapCoursesToBlogPosts } from './blog.utils';

export function useBlogPageData(): BlogPageDataModel {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<BlogViewMode>('grid');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterFeedback, setNewsletterFeedback] = useState<string | null>(null);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);

  const [subscribeToNewsletter, { isLoading: isNewsletterSubmitting }] =
    useSubscribeToNewsletterMutation();
  const { data: courses = [] } = useGetCoursesQuery();

  const dynamicPosts = useMemo(
    () =>
      mapCoursesToBlogPosts(
        courses.map((course: LiveCourse) => ({
          id: String(course.id),
          title: course.title,
          description: course.description,
          category: course.category,
          scheduledAt: course.scheduledAt,
          coverImage: course.coverImage,
        })),
        DEFAULT_BLOG_POST_IMAGE,
      ),
    [courses],
  );

  const categoryCounts = useMemo(() => buildCategoryCounts(dynamicPosts), [dynamicPosts]);

  const heroPost = dynamicPosts[0];
  const popularToday = dynamicPosts.slice(1, 4);

  const filteredPosts = useMemo(
    () => filterBlogPosts(dynamicPosts, selectedCategory, searchTerm),
    [dynamicPosts, searchTerm, selectedCategory],
  );

  const onNewsletterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = newsletterEmail.trim();
    if (!email) {
      setNewsletterFeedback(null);
      setNewsletterError('Please enter a valid email address.');
      return;
    }

    try {
      const result = await subscribeToNewsletter({
        email,
        sourcePage: 'BLOG_PAGE',
      }).unwrap();
      setNewsletterError(null);
      setNewsletterFeedback(result.message || 'Subscription completed successfully.');
      setNewsletterEmail('');
    } catch {
      setNewsletterFeedback(null);
      setNewsletterError('Unable to subscribe right now. Please try again.');
    }
  };

  return {
    searchTerm,
    selectedCategory,
    viewMode,
    newsletterEmail,
    newsletterFeedback,
    newsletterError,
    isNewsletterSubmitting,
    dynamicPosts,
    categoryCounts,
    heroPost,
    popularToday,
    filteredPosts,
    onSearchChange: setSearchTerm,
    onCategoryChange: setSelectedCategory,
    onViewModeChange: setViewMode,
    onNewsletterEmailChange: setNewsletterEmail,
    onNewsletterSubmit,
  };
}
