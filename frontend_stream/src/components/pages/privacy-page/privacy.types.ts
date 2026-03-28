import type { LucideIcon } from 'lucide-react';

export interface PrivacyPageProps {
  onNavigate: (path: string) => void;
}

export interface PrivacySection {
  id: string;
  title: string;
  paragraphs: string[];
}

export interface PrivacySidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface PrivacyPageDataModel {
  activeSection: string;
  lastUpdated: string;
  sections: PrivacySection[];
  sidebarItems: PrivacySidebarItem[];
  dataCollectionHighlights: string[];
  rightsHighlights: string[];
  contactAddressLines: string[];
  onJumpToSection: (sectionId: string) => void;
}
