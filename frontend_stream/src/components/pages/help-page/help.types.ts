import type { FormEvent } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { HelpCenterCategory, HelpCenterFaq } from '../../../store/api/publicSupportApi';

export interface HelpPageProps {
  onNavigate: (path: string) => void;
}

export interface HelpPageDataModel {
  searchTerm: string;
  newsletterEmail: string;
  newsletterFeedback: string | null;
  newsletterError: string | null;
  isLoading: boolean;
  isError: boolean;
  isSubscribing: boolean;
  categories: HelpCenterCategory[];
  filteredCategories: HelpCenterCategory[];
  filteredFaqs: HelpCenterFaq[];
  supportEmail: string;
  responseWindow: string;
  resolutionRate: number;
  onSearchChange: (value: string) => void;
  onNewsletterEmailChange: (value: string) => void;
  onNewsletterSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onCategoryAction: (category: HelpCenterCategory) => void;
}

export type HelpCategoryIconMap = Record<string, LucideIcon>;
