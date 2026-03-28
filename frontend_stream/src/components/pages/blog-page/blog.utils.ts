import type { BlogCategoryCount, BlogPost } from './blog.types';

interface BlogCourseSource {
  id: string;
  title: string;
  description: string | null;
  category: string;
  scheduledAt: string | null;
  coverImage: string | null;
}

export function formatDate(value?: string | null): string {
  if (!value) return 'Recently';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Recently';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(parsed);
}

export function estimateReadTime(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(4, Math.min(20, Math.ceil(words / 35)));
  return `${minutes} min read`;
}

export function mapCoursesToBlogPosts(
  courses: BlogCourseSource[],
  defaultImage: string,
): BlogPost[] {
  return courses.slice(0, 10).map((course) => ({
    id: course.id,
    title: course.title,
    excerpt:
      course.description?.trim() ||
      'Discover practical insights and concrete guidance to progress faster in this domain.',
    category: course.category || 'General',
    date: formatDate(course.scheduledAt),
    readTime: estimateReadTime(course.description || course.title),
    image: course.coverImage || defaultImage,
  }));
}

export function buildCategoryCounts(posts: BlogPost[]): BlogCategoryCount[] {
  const counts = new Map<string, number>();
  posts.forEach((post) => {
    counts.set(post.category, (counts.get(post.category) || 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

export function filterBlogPosts(
  posts: BlogPost[],
  selectedCategory: string,
  searchTerm: string,
): BlogPost[] {
  return posts.filter((post) => {
    const byCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const bySearch =
      searchTerm.trim().length === 0 ||
      `${post.title} ${post.excerpt} ${post.category}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    return byCategory && bySearch;
  });
}
