import { CourseCatalog } from './CourseCatalog';

interface SearchPageProps {
  onNavigate: (path: string) => void;
}

export function SearchPage({ onNavigate }: SearchPageProps) {
  return <CourseCatalog currentPath="/search" onNavigate={onNavigate} />;
}
