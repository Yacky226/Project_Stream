import type { FormEvent } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface CareersPageProps {
  onNavigate: (path: string) => void;
}

export type CareersDepartment = 'Engineering' | 'Design' | 'Marketing';
export type CareersLocation = 'Remote' | 'London' | 'San Francisco' | 'New York';

export interface JobRole {
  id: string;
  department: CareersDepartment;
  title: string;
  location: string;
  type: 'Full-time';
}

export interface CareersValueCard {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface CareersPageDataModel {
  selectedDepartment: 'All' | CareersDepartment;
  selectedLocation: 'All' | CareersLocation;
  newsletterEmail: string;
  newsletterFeedback: string | null;
  isSubscribing: boolean;
  valueCards: CareersValueCard[];
  filteredRoles: JobRole[];
  onDepartmentChange: (value: 'All' | CareersDepartment) => void;
  onLocationChange: (value: 'All' | CareersLocation) => void;
  onNewsletterEmailChange: (value: string) => void;
  onNewsletterSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}
