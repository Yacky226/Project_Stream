import { FAQPageContent } from './faq-page/components/FAQPageContent';
import type { FAQPageProps } from './faq-page/faq.types';
import { useFAQPageData } from './faq-page/useFAQPageData';

export function FAQPage({ onNavigate }: FAQPageProps) {
  const model = useFAQPageData();

  return <FAQPageContent model={model} onNavigate={onNavigate} />;
}
