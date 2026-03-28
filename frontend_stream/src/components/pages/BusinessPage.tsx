import { BusinessPageContent } from './business-page/components/BusinessPageContent';
import type { BusinessPageProps } from './business-page/business.types';
import { useBusinessPageData } from './business-page/useBusinessPageData';
import './BusinessPage.css';

export function BusinessPage({ onNavigate }: BusinessPageProps) {
  const model = useBusinessPageData();

  return <BusinessPageContent model={model} onNavigate={onNavigate} />;
}
