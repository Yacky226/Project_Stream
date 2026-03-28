import { TermsPageContent } from './terms-page/components/TermsPageContent';
import type { TermsPageProps } from './terms-page/terms.types';
import { useTermsPageData } from './terms-page/useTermsPageData';

export function TermsPage({ onNavigate }: TermsPageProps) {
  const model = useTermsPageData();

  return <TermsPageContent model={model} onNavigate={onNavigate} />;
}
