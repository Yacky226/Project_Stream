import { ContactPageContent } from './contact-page/components/ContactPageContent';
import type { ContactPageProps } from './contact-page/contact.types';
import { useContactPageData } from './contact-page/useContactPageData';
import './ContactPage.css';

export function ContactPage({ onNavigate }: ContactPageProps) {
  const model = useContactPageData();

  return <ContactPageContent model={model} onNavigate={onNavigate} />;
}
