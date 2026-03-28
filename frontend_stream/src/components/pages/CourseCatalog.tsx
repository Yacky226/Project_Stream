import { PublicFooterBar } from '../layout/PublicFooterBar';
import { PublicHeaderBar } from '../layout/PublicHeaderBar';
import { CourseCatalogContent } from './course-catalog-page/components/CourseCatalogContent';
import type { CourseCatalogProps } from './course-catalog-page/courseCatalog.types';
import { useCourseCatalogData } from './course-catalog-page/useCourseCatalogData';
import './CourseCatalog.css';

export function CourseCatalog({ currentPath = '/catalog', onNavigate }: CourseCatalogProps) {
  const model = useCourseCatalogData();

  return (
    <div className="ccp-page">
      <PublicHeaderBar currentPath={currentPath} onNavigate={onNavigate} />
      <CourseCatalogContent model={model} onNavigate={onNavigate} />
      <PublicFooterBar onNavigate={onNavigate} />
    </div>
  );
}
