import type { LucideIcon } from 'lucide-react';

export interface MobileAppPageProps {
  onNavigate: (path: string) => void;
}

export interface MobileAppTestimonial {
  name: string;
  role: string;
  quote: string;
  avatar: string;
}

export interface MobileAppFeature {
  icon: LucideIcon;
  title: string;
  desc: string;
}

export interface MobileAppPageDataModel {
  heroMockup: string;
  testimonials: MobileAppTestimonial[];
  features: MobileAppFeature[];
}
