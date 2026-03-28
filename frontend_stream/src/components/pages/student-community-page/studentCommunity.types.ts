import type { EditorialPost } from '../../../lib/editorialContent';
import type { LiveCourse } from '../../../types/live';
import type { StudentSpaceData } from '../../student/StudentSpaceShared';

export interface StudentCommunityPageProps {
  onNavigate: (path: string | number) => void;
  currentPath?: string;
}

export interface StudentCommunityDataModel {
  shared: StudentSpaceData;
  ready: boolean;
  searchQuery: string;
  activeCategory: string;
  visibleCount: number;
  selectedPost: EditorialPost | null;
  categories: ReturnType<
    typeof import('../../../lib/editorialContent').getEditorialCategories
  >;
  featuredPost: EditorialPost;
  popularPosts: EditorialPost[];
  showHero: boolean;
  visiblePosts: EditorialPost[];
  hasMore: boolean;
  learningPicks: LiveCourse[];
  setSearchQuery: (value: string) => void;
  setActiveCategory: (category: string) => void;
  openPost: (post: EditorialPost) => void;
  closePost: () => void;
  loadMore: () => void;
  handleShare: (post: EditorialPost) => Promise<void>;
}
