import { PublicFooterBar } from '../layout/PublicFooterBar';
import { PublicHeaderBar } from '../layout/PublicHeaderBar';
import { CategoryGeneralContent } from './category-general-page/components/CategoryGeneralContent';
import type { CategoryGeneralPageProps } from './category-general-page/categoryGeneral.types';
import { useCategoryGeneralPageData } from './category-general-page/useCategoryGeneralPageData';
import './CategoryGeneralPage.css';

export function CategoryGeneralPage({ onNavigate }: CategoryGeneralPageProps) {
  const pageData = useCategoryGeneralPageData();

  return (
    <div className="cg-page">
      <PublicHeaderBar currentPath="/courses/categories" onNavigate={onNavigate} />
      <CategoryGeneralContent data={pageData} onNavigate={onNavigate} />
      <PublicFooterBar onNavigate={onNavigate} />
    </div>
  );
}
