import { AccessibilityContent } from './accessibility-page/components/AccessibilityContent';
import type { AccessibilityPageProps } from './accessibility-page/accessibility.types';
import { useAccessibilityPageData } from './accessibility-page/useAccessibilityPageData';

export function AccessibilityPage({ onNavigate }: AccessibilityPageProps) {
  const model = useAccessibilityPageData();

  return <AccessibilityContent model={model} onNavigate={onNavigate} />;
}
