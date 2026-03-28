import type { FormEvent } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { ContactSubjectValue } from '../../../store/api/publicSupportApi';

export interface ContactPageProps {
  onNavigate: (path: string) => void;
}

export interface ContactFormState {
  email: string;
  fullName: string;
  message: string;
  subject: ContactSubjectValue;
}

export interface ContactSubjectOption {
  label: string;
  value: ContactSubjectValue;
}

export interface ContactSocialLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface ContactPageDataModel {
  formState: ContactFormState;
  feedback: string | null;
  error: string | null;
  isSubmitting: boolean;
  supportEmail: string;
  responseWindow: string;
  subjectOptions: ContactSubjectOption[];
  socialLinks: ContactSocialLink[];
  officeAddressLines: string[];
  mapImageUrl: string;
  onFieldChange: <K extends keyof ContactFormState>(key: K, value: ContactFormState[K]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}
