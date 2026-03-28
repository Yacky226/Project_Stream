import { Cookie, Database, Info, Mail, ShieldCheck } from 'lucide-react';
import type { PrivacySection, PrivacySidebarItem } from './privacy.types';

export const PRIVACY_POLICY_SECTIONS: PrivacySection[] = [
  {
    id: 'introduction',
    title: '1. Introduction',
    paragraphs: [
      'Welcome to EduElevate. We are committed to protecting your personal information and your privacy rights.',
      'This notice explains what we collect, how we use it, and what rights you have in relation to your information.',
    ],
  },
  {
    id: 'data-collection',
    title: '2. Data Collection',
    paragraphs: [
      'We collect information you provide directly when creating an account, purchasing courses, or contacting support.',
      'We also collect technical and usage information to keep the service secure and improve your learning experience.',
      'Automatically collected data may include logs, device information, and approximate location based on IP.',
    ],
  },
  {
    id: 'cookie-policy',
    title: '3. Cookie Policy',
    paragraphs: [
      'We use cookies and similar technologies to maintain sessions, remember preferences, and improve product performance.',
      'You can configure your browser settings to refuse or remove cookies, but some features may not work properly.',
    ],
  },
  {
    id: 'your-rights',
    title: '4. Your Rights',
    paragraphs: [
      'Depending on your jurisdiction, you may request access, correction, deletion, or portability of your personal data.',
      'You may also object to certain processing activities and withdraw consent where processing relies on consent.',
    ],
  },
  {
    id: 'contact',
    title: '5. Contact Us',
    paragraphs: [
      'If you have any questions about this policy, contact us at privacy@eduelevate.com.',
      'You may also write to our legal team for formal requests related to privacy and compliance matters.',
    ],
  },
];

export const PRIVACY_SIDEBAR_ITEMS: PrivacySidebarItem[] = [
  { id: 'introduction', label: 'Introduction', icon: Info },
  { id: 'data-collection', label: 'Data Collection', icon: Database },
  { id: 'cookie-policy', label: 'Cookie Policy', icon: Cookie },
  { id: 'your-rights', label: 'Your Rights', icon: ShieldCheck },
  { id: 'contact', label: 'Contact Us', icon: Mail },
];

export const PRIVACY_DATA_COLLECTION_HIGHLIGHTS = [
  'Log and Usage Data: diagnostic and performance information.',
  'Device Data: browser, operating system, and client metadata.',
  'Location Data: approximate location based on network identifiers.',
];

export const PRIVACY_RIGHTS_HIGHLIGHTS = [
  'Request access to your data',
  'Request rectification',
  'Request erasure',
  'Object to processing',
];

export const PRIVACY_CONTACT_ADDRESS_LINES = [
  'EduElevate Legal Department',
  '123 Education Plaza, Suite 400',
  'San Francisco, CA 94103',
  'United States',
];
