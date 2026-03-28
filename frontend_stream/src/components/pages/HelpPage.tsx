import { HelpPageContent } from './help-page/components/HelpPageContent';
import type { HelpPageProps } from './help-page/help.types';
import { useHelpPageData } from './help-page/useHelpPageData';
import './HelpPage.css';

export function HelpPage({ onNavigate }: HelpPageProps) {
  const model = useHelpPageData({ onNavigate });

  return <HelpPageContent model={model} onNavigate={onNavigate} />;
}
