import type { EditorialPost } from '../../../lib/editorialContent';

export function filterEditorialPosts(
  posts: EditorialPost[],
  activeCategory: string,
  normalizedSearch: string,
): EditorialPost[] {
  return posts.filter((post) => {
    const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
    const matchesQuery =
      !normalizedSearch
      || [post.title, post.excerpt, ...post.tags]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch);
    return matchesCategory && matchesQuery;
  });
}

export function buildShareUrl(postId: string): string {
  if (typeof window === 'undefined') {
    return `/student/community#${postId}`;
  }
  return `${window.location.origin}/student/community#${postId}`;
}
