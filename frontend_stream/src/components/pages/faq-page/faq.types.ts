import type { Dispatch, SetStateAction } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface FAQPageProps {
  onNavigate: (path: string) => void;
}

export interface FAQCategory {
  id: string;
  name: string;
  icon: LucideIcon;
  count: number;
}

export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export interface FAQPageDataModel {
  searchTerm: string;
  selectedCategory: string;
  categories: FAQCategory[];
  filteredFaqs: FAQItem[];
  setSearchTerm: Dispatch<SetStateAction<string>>;
  setSelectedCategory: Dispatch<SetStateAction<string>>;
  resetFilters: () => void;
}
