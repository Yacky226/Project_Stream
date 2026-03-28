import { MobileAppPageContent } from './mobile-app-page/components/MobileAppPageContent';
import type { MobileAppPageProps } from './mobile-app-page/mobileApp.types';
import { useMobileAppPageData } from './mobile-app-page/useMobileAppPageData';
import './MobileAppPage.css';

export function MobileAppPage({ onNavigate }: MobileAppPageProps) {
  const model = useMobileAppPageData();

  return <MobileAppPageContent model={model} onNavigate={onNavigate} />;
}
