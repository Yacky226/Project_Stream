export interface TermsPageProps {
  onNavigate: (path: string) => void;
}

export interface TermsSection {
  id: string;
  title: string;
  content: string;
}

export interface TermsPageDataModel {
  lastUpdated: string;
  version: string;
  sections: TermsSection[];
}
