import type { FormEvent } from 'react';

export interface BlogPageProps {
  onNavigate: (path: string) => void;
}

export type BlogViewMode = 'grid' | 'list';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
}

export interface BlogCategoryCount {
  name: string;
  count: number;
}

export interface BlogPageDataModel {
  searchTerm: string;
  selectedCategory: string;
  viewMode: BlogViewMode;
  newsletterEmail: string;
  newsletterFeedback: string | null;
  newsletterError: string | null;
  isNewsletterSubmitting: boolean;
  dynamicPosts: BlogPost[];
  categoryCounts: BlogCategoryCount[];
  heroPost: BlogPost | undefined;
  popularToday: BlogPost[];
  filteredPosts: BlogPost[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onViewModeChange: (value: BlogViewMode) => void;
  onNewsletterEmailChange: (value: string) => void;
  onNewsletterSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}
