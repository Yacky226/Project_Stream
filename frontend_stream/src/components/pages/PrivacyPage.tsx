import { PrivacyPageContent } from './privacy-page/components/PrivacyPageContent';
import type { PrivacyPageProps } from './privacy-page/privacy.types';
import { usePrivacyPageData } from './privacy-page/usePrivacyPageData';
import './PrivacyPage.css';

export function PrivacyPage({ onNavigate }: PrivacyPageProps) {
  const model = usePrivacyPageData();

  return <PrivacyPageContent model={model} onNavigate={onNavigate} />;
}
