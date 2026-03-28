import { Camera, Globe, Users } from 'lucide-react';
import type {
  ContactSocialLink,
  ContactSubjectOption,
} from './contact.types';

export const CONTACT_SUBJECT_OPTIONS: ContactSubjectOption[] = [
  { label: 'General Inquiry', value: 'GENERAL_INQUIRY' },
  { label: 'Course Admissions', value: 'COURSE_ADMISSIONS' },
  { label: 'Technical Support', value: 'TECHNICAL_SUPPORT' },
  { label: 'Partnership Opportunities', value: 'PARTNERSHIP_OPPORTUNITIES' },
  { label: 'Other', value: 'OTHER' },
];

export const CONTACT_SOCIAL_LINKS: ContactSocialLink[] = [
  { label: 'Website', href: '#', icon: Globe },
  { label: 'Community', href: '#', icon: Users },
  { label: 'Gallery', href: '#', icon: Camera },
];

export const CONTACT_OFFICE_ADDRESS_LINES = [
  'University Innovation Hub',
  '42 Learning Way, Ste 300',
  'Palo Alto, CA 94301',
];

export const CONTACT_MAP_IMAGE_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDzEPVwO8c3mPoi7ZuTYJff5MSKrS7eTcGkYSbUzSZ4WcwZlet-_b8h6yTYe-BmXHnL0Fz2ghbCWb3hzExSSUNHz8pd0mJLfC2n9mnzobND5aY_0uLHMXFqmjf9FuXGa157TklIJPatDcEMosQOPRwFNmqx11bsI77vS2VVgrILZHonFMY-aZGllv2sBW9ODBqFn5Tvh9DmUgOcP7n4cqjKUE3HePsh6b7ybJs1dqqsoqVpAEeLU3R6M1PQhSMxabgILiWU0RsZJ6s';
