import { CareersPageContent } from './careers-page/components/CareersPageContent';
import type { CareersPageProps } from './careers-page/careers.types';
import { useCareersPageData } from './careers-page/useCareersPageData';
import './CareersPage.css';

export function CareersPage({ onNavigate }: CareersPageProps) {
  const model = useCareersPageData();

  return <CareersPageContent model={model} onNavigate={onNavigate} />;
}
