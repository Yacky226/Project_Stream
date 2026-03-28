import { BlogPageContent } from './blog-page/components/BlogPageContent';
import type { BlogPageProps } from './blog-page/blog.types';
import { useBlogPageData } from './blog-page/useBlogPageData';
import './BlogPage.css';

export function BlogPage({ onNavigate }: BlogPageProps) {
  const model = useBlogPageData();

  return <BlogPageContent model={model} onNavigate={onNavigate} />;
}
